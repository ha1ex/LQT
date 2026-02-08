import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { WeeklyRating, WeeklyRatingData, WeeklyRatingAnalytics } from '@/types/weeklyRating';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { loadAllUserData } from '@/utils/realUserData';

const STORAGE_KEY = 'lqt_weekly_ratings';

export interface WeeklyRatingsContextType {
  ratings: WeeklyRatingData;
  currentWeek: Date;
  isLoading: boolean;
  getCurrentWeekRating: () => WeeklyRating | null;
  updateWeekRating: (
    date: Date,
    updates: Partial<Omit<WeeklyRating, 'id' | 'weekNumber' | 'startDate' | 'endDate' | 'createdAt'>>
  ) => void;
  updateMetricRating: (date: Date, metricId: string, rating: number, note?: string) => void;
  deleteWeekRating: (weekId: string) => void;
  getAnalytics: () => WeeklyRatingAnalytics;
  goToNextWeek: () => void;
  goToPreviousWeek: () => void;
  goToCurrentWeek: () => void;
  goToWeek: (date: Date) => void;
  generateTestData: () => void;
  getWeekId: (date: Date) => string;
}

export const WeeklyRatingsContext = createContext<WeeklyRatingsContextType | undefined>(undefined);

export const WeeklyRatingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ratings, setRatings] = useState<WeeklyRatingData>({});
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount (once)
  useEffect(() => {
    try {
      // Seed data only on first launch (idempotent)
      loadAllUserData();

      // Read data from localStorage
      const rawStored = localStorage.getItem(STORAGE_KEY);
      if (rawStored) {
        const stored = JSON.parse(rawStored);
        const converted: WeeklyRatingData = {};
        Object.keys(stored).forEach(key => {
          converted[key] = {
            ...stored[key],
            startDate: parseISO(stored[key].startDate),
            endDate: parseISO(stored[key].endDate),
            createdAt: parseISO(stored[key].createdAt),
            updatedAt: parseISO(stored[key].updatedAt),
          };
        });
        setRatings(converted);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error loading weekly ratings:', error);
      setRatings({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((newRatings: WeeklyRatingData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRatings));
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error saving weekly ratings:', error);
    }
  }, []);

  // Get week ID from date
  const getWeekId = useCallback((date: Date): string => {
    return format(startOfWeek(date, { locale: ru }), 'yyyy-MM-dd');
  }, []);

  // Get current week's rating
  const getCurrentWeekRating = useCallback((): WeeklyRating | null => {
    const weekId = getWeekId(currentWeek);
    return ratings[weekId] || null;
  }, [ratings, currentWeek, getWeekId]);

  // Create or update week rating
  const updateWeekRating = useCallback((
    date: Date,
    updates: Partial<Omit<WeeklyRating, 'id' | 'weekNumber' | 'startDate' | 'endDate' | 'createdAt'>>
  ) => {
    const weekStart = startOfWeek(date, { locale: ru });
    const weekEnd = endOfWeek(date, { locale: ru });
    const weekId = getWeekId(date);

    setRatings(prev => {
      const existing = prev[weekId];
      const now = new Date();

      const ratingsValues = Object.values(updates.ratings || existing?.ratings || {})
        .filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v) && v >= 0);
      const overallScore = ratingsValues.length > 0
        ? Math.round((ratingsValues.reduce((sum, rating) => sum + rating, 0) / ratingsValues.length) * 10) / 10
        : 0;

      const newRating: WeeklyRating = {
        id: weekId,
        weekNumber: parseInt(format(weekStart, 'w')),
        startDate: weekStart,
        endDate: weekEnd,
        ratings: {},
        notes: {},
        mood: 'neutral',
        keyEvents: [],
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        ...existing,
        ...updates,
        overallScore,
      };

      const newRatings = {
        ...prev,
        [weekId]: newRating
      };

      saveToStorage(newRatings);
      return newRatings;
    });
  }, [getWeekId, saveToStorage]);

  // Delete week rating
  const deleteWeekRating = useCallback((weekId: string) => {
    setRatings(prev => {
      const newRatings = { ...prev };
      delete newRatings[weekId];
      saveToStorage(newRatings);
      return newRatings;
    });
  }, [saveToStorage]);

  // Update single metric rating
  const updateMetricRating = useCallback((
    date: Date,
    metricId: string,
    rating: number,
    note?: string
  ) => {
    const weekId = getWeekId(date);
    const existing = ratings[weekId];

    updateWeekRating(date, {
      ratings: {
        ...existing?.ratings,
        [metricId]: rating
      },
      notes: {
        ...existing?.notes,
        ...(note ? { [metricId]: note } : {})
      }
    });
  }, [ratings, getWeekId, updateWeekRating]);

  // Get analytics data
  const getAnalytics = useCallback((): WeeklyRatingAnalytics => {
    const allRatings = Object.values(ratings);

    if (allRatings.length === 0) {
      return {
        averageByMetric: {},
        trendsOverTime: [],
        bestWeek: null,
        worstWeek: null,
        moodDistribution: {
          excellent: 0,
          good: 0,
          neutral: 0,
          poor: 0,
          terrible: 0
        },
        seasonalTrends: {}
      };
    }

    // Calculate averages by metric
    const averageByMetric: Record<string, number> = {};
    const metricCounts: Record<string, number> = {};

    allRatings.forEach(week => {
      Object.entries(week.ratings).forEach(([metricId, rating]) => {
        averageByMetric[metricId] = (averageByMetric[metricId] || 0) + rating;
        metricCounts[metricId] = (metricCounts[metricId] || 0) + 1;
      });
    });

    Object.keys(averageByMetric).forEach(metricId => {
      averageByMetric[metricId] = averageByMetric[metricId] / metricCounts[metricId];
    });

    // Trends over time with gaps
    const sortedRatings = allRatings.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const trendsOverTime = [];
    if (sortedRatings.length > 0) {
      const firstWeek = sortedRatings[0];
      const lastWeek = sortedRatings[sortedRatings.length - 1];

      const existingWeeksByDate = new Map<string, typeof sortedRatings[0]>();
      sortedRatings.forEach(week => {
        const weekId = format(startOfWeek(week.startDate, { locale: ru }), 'yyyy-MM-dd');
        existingWeeksByDate.set(weekId, week);
      });

      let currentDate = startOfWeek(firstWeek.startDate, { locale: ru });
      const lastDate = startOfWeek(lastWeek.startDate, { locale: ru });

      while (currentDate.getTime() <= lastDate.getTime()) {
        const weekId = format(currentDate, 'yyyy-MM-dd');
        const weekNum = parseInt(format(currentDate, 'w'));
        const existingWeek = existingWeeksByDate.get(weekId);

        if (existingWeek) {
          trendsOverTime.push({
            weekNumber: weekNum,
            averageScore: typeof existingWeek.overallScore === 'number' && !isNaN(existingWeek.overallScore) ? existingWeek.overallScore : 0,
            date: existingWeek.startDate.toISOString(),
            hasData: true
          });
        } else {
          trendsOverTime.push({
            weekNumber: weekNum,
            averageScore: null,
            date: currentDate.toISOString(),
            hasData: false
          });
        }

        currentDate = addWeeks(currentDate, 1);
      }
    }

    // Best and worst weeks
    const sortedByScore = [...allRatings].sort((a, b) => b.overallScore - a.overallScore);
    const bestWeek = sortedByScore[0] || null;
    const worstWeek = sortedByScore[sortedByScore.length - 1] || null;

    // Mood distribution
    const moodDistribution = allRatings.reduce((acc, week) => {
      acc[week.mood] = (acc[week.mood] || 0) + 1;
      return acc;
    }, {} as Record<WeeklyRating['mood'], number>);

    // Seasonal trends (by month)
    const seasonalTrends = allRatings.reduce((acc, week) => {
      const month = format(week.startDate, 'MMMM', { locale: ru });
      acc[month] = (acc[month] || 0) + week.overallScore;
      return acc;
    }, {} as Record<string, number>);

    return {
      averageByMetric,
      trendsOverTime,
      bestWeek,
      worstWeek,
      moodDistribution,
      seasonalTrends
    };
  }, [ratings]);

  // Navigate weeks
  const goToNextWeek = useCallback(() => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  }, []);

  const goToPreviousWeek = useCallback(() => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setCurrentWeek(new Date());
  }, []);

  const goToWeek = useCallback((date: Date) => {
    setCurrentWeek(date);
  }, []);

  // Generate test data
  const generateTestData = useCallback(() => {
    const testMetrics = [
      'peace_of_mind', 'financial_cushion', 'income', 'wife_communication',
      'family_communication', 'physical_activity', 'socialization',
      'manifestation', 'travel', 'mental_health', 'anxiety_level',
      'health_condition', 'happiness', 'self_esteem'
    ];

    const events = [
      'Важная встреча', 'Отпуск', 'Проект завершен', 'Болезнь', 'Семейное событие',
      'Новое достижение', 'Стрессовая неделя', 'Праздники', 'Командировка'
    ];

    const newRatings: WeeklyRatingData = {};

    for (let i = 0; i < 20; i++) {
      const weekDate = subWeeks(new Date(), i);
      const weekStart = startOfWeek(weekDate, { locale: ru });
      const weekEnd = endOfWeek(weekDate, { locale: ru });
      const weekId = getWeekId(weekDate);

      const testRatings: Record<string, number> = {};
      testMetrics.forEach(metric => {
        const baseScore = 5 + Math.sin((i / 20) * Math.PI * 2) * 2;
        const randomVariation = (Math.random() - 0.5) * 4;
        testRatings[metric] = Math.max(1, Math.min(10, Math.round(baseScore + randomVariation)));
      });

      const ratingsValues = Object.values(testRatings);
      const overallScore = ratingsValues.reduce((sum, rating) => sum + rating, 0) / ratingsValues.length;

      let mood: WeeklyRating['mood'] = 'neutral';
      if (overallScore >= 8) mood = 'excellent';
      else if (overallScore >= 6.5) mood = 'good';
      else if (overallScore >= 4) mood = 'neutral';
      else if (overallScore >= 2.5) mood = 'poor';
      else mood = 'terrible';

      newRatings[weekId] = {
        id: weekId,
        weekNumber: parseInt(format(weekStart, 'w')),
        startDate: weekStart,
        endDate: weekEnd,
        ratings: testRatings,
        notes: {
          [testMetrics[0]]: `Заметка для недели ${format(weekStart, 'dd.MM', { locale: ru })}`
        },
        mood,
        keyEvents: Math.random() > 0.7 ? [events[Math.floor(Math.random() * events.length)]] : [],
        overallScore,
        createdAt: weekStart,
        updatedAt: weekStart
      };
    }

    setRatings(prev => {
      const combined = { ...prev, ...newRatings };
      saveToStorage(combined);
      return combined;
    });
  }, [getWeekId, saveToStorage]);

  const value = useMemo<WeeklyRatingsContextType>(() => ({
    ratings,
    currentWeek,
    isLoading,
    getCurrentWeekRating,
    updateWeekRating,
    updateMetricRating,
    deleteWeekRating,
    getAnalytics,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    goToWeek,
    generateTestData,
    getWeekId,
  }), [
    ratings,
    currentWeek,
    isLoading,
    getCurrentWeekRating,
    updateWeekRating,
    updateMetricRating,
    deleteWeekRating,
    getAnalytics,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    goToWeek,
    generateTestData,
    getWeekId,
  ]);

  return (
    <WeeklyRatingsContext.Provider value={value}>
      {children}
    </WeeklyRatingsContext.Provider>
  );
};

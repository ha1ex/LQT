import { useState, useEffect, useCallback } from 'react';
import { WeeklyRating, WeeklyRatingData, WeeklyRatingAnalytics } from '@/types/weeklyRating';
import { startOfWeek, endOfWeek, format, addWeeks, subWeeks, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const STORAGE_KEY = 'weekly_ratings_data';

export const useWeeklyRatings = () => {
  const [ratings, setRatings] = useState<WeeklyRatingData>({});
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const converted: WeeklyRatingData = {};
        Object.keys(parsed).forEach(key => {
          converted[key] = {
            ...parsed[key],
            startDate: parseISO(parsed[key].startDate),
            endDate: parseISO(parsed[key].endDate),
            createdAt: parseISO(parsed[key].createdAt),
            updatedAt: parseISO(parsed[key].updatedAt),
          };
        });
        setRatings(converted);
      }
    } catch (error) {
      console.error('Error loading weekly ratings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever ratings change
  const saveToStorage = useCallback((newRatings: WeeklyRatingData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRatings));
    } catch (error) {
      console.error('Error saving weekly ratings:', error);
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
      
      // Calculate overall score from ratings with enhanced validation
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

    // Trends over time with data validation
    const trendsOverTime = allRatings
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map(week => ({
        weekNumber: week.weekNumber,
        averageScore: typeof week.overallScore === 'number' && !isNaN(week.overallScore) ? week.overallScore : 0,
        date: format(week.startDate, 'dd.MM', { locale: ru })
      }))
      .filter(week => typeof week.averageScore === 'number' && !isNaN(week.averageScore));

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
      'peace_of_mind', 'financial_cushion', 'income', 'physical_health', 
      'relationships', 'career_satisfaction', 'personal_growth'
    ];
    
    const moods: WeeklyRating['mood'][] = ['excellent', 'good', 'neutral', 'poor', 'terrible'];
    const events = [
      'Важная встреча', 'Отпуск', 'Проект завершен', 'Болезнь', 'Семейное событие',
      'Новое достижение', 'Стрессовая неделя', 'Праздники', 'Командировка'
    ];

    const newRatings: WeeklyRatingData = {};
    
    // Generate 20 weeks of data
    for (let i = 0; i < 20; i++) {
      const weekDate = subWeeks(new Date(), i);
      const weekStart = startOfWeek(weekDate, { locale: ru });
      const weekEnd = endOfWeek(weekDate, { locale: ru });
      const weekId = getWeekId(weekDate);
      
      const ratings: Record<string, number> = {};
      testMetrics.forEach(metric => {
        // Add some seasonal variation and randomness
        const baseScore = 5 + Math.sin((i / 20) * Math.PI * 2) * 2; // Seasonal wave
        const randomVariation = (Math.random() - 0.5) * 4; // Random ±2
        ratings[metric] = Math.max(1, Math.min(10, Math.round(baseScore + randomVariation)));
      });

      const ratingsValues = Object.values(ratings);
      const overallScore = ratingsValues.reduce((sum, rating) => sum + rating, 0) / ratingsValues.length;
      
      // Determine mood based on overall score
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
        ratings,
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

  return {
    ratings,
    currentWeek,
    isLoading,
    getCurrentWeekRating,
    updateWeekRating,
    updateMetricRating,
    getAnalytics,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    goToWeek,
    generateTestData,
    getWeekId
  };
};
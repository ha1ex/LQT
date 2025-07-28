import { useState, useEffect, useCallback } from 'react';
import { 
  EnhancedHypothesis, 
  HypothesisFormData, 
  StrategyMetrics,
  ValidationStatus,
  ExperimentStatus 
} from '@/types/strategy';
import { 
  calculatePriority, 
  calculateHypothesisProgress, 
  validateHypothesis, 
  generateId,
  sortHypothesesByPriority,
  createDefaultWeeklyProgress
} from '@/utils/strategy';

const STORAGE_KEY = 'lqt_hypotheses';

export const useEnhancedHypotheses = () => {
  const [hypotheses, setHypotheses] = useState<EnhancedHypothesis[]>([]);
  const [loading, setLoading] = useState(true);

  // Load hypotheses from localStorage on mount
  useEffect(() => {
    console.log('useEnhancedHypotheses: Starting to load from localStorage');
    try {
      const isDemoMode = localStorage.getItem('lqt_demo_mode') === 'true';
      console.log('useEnhancedHypotheses: Demo mode active:', isDemoMode);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('useEnhancedHypotheses: Stored data:', stored ? 'exists' : 'none');
      
      if (stored && (isDemoMode || stored !== 'null')) {
        const parsed = JSON.parse(stored);
        console.log('useEnhancedHypotheses: Parsed data length:', parsed.length);
        
        // Convert date strings back to Date objects and migrate old data
        const converted = parsed.map((h: any) => {
          // Migration: convert old tasks to weeklyProgress if needed
          if (h.tasks && !h.weeklyProgress) {
            const { createDefaultWeeklyProgress } = require('@/utils/strategy');
            h.weeklyProgress = createDefaultWeeklyProgress(h.timeframe || 6, new Date(h.experimentStartDate));
            delete h.tasks; // Remove old tasks property
          }
          
          return {
            ...h,
            experimentStartDate: new Date(h.experimentStartDate),
            createdAt: new Date(h.createdAt),
            updatedAt: new Date(h.updatedAt),
            journal: h.journal.map((entry: any) => ({
              ...entry,
              date: new Date(entry.date)
            })),
            // Ensure weeklyProgress exists
            weeklyProgress: h.weeklyProgress || createDefaultWeeklyProgress(h.timeframe || 6, new Date(h.experimentStartDate))
          };
        });
        setHypotheses(converted);
        console.log('useEnhancedHypotheses: Set hypotheses:', converted.length + ' items');
      } else {
        console.log('useEnhancedHypotheses: No stored data or not in demo mode, setting empty array');
        setHypotheses([]);
      }
    } catch (error) {
      console.error('Error loading hypotheses:', error);
      setHypotheses([]);
    } finally {
      console.log('useEnhancedHypotheses: Setting loading to false');
      setLoading(false);
    }
  }, []);

  // Save hypotheses to localStorage whenever they change
  const saveToStorage = useCallback((hypothesesData: EnhancedHypothesis[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hypothesesData));
    } catch (error) {
      console.error('Error saving hypotheses:', error);
    }
  }, []);

  // Create new hypothesis
  const createHypothesis = useCallback((formData: HypothesisFormData): string => {
    // Создаем стандартный еженедельный прогресс если не предоставлен
    const defaultWeeklyProgress = formData.weeklyProgress || createDefaultWeeklyProgress(formData.timeframe || 6);

    // Создаем временный объект для валидации и приоритизации
    const tempHypothesis = {
      ...formData,
      weeklyProgress: defaultWeeklyProgress
    };

    const validation = validateHypothesis(tempHypothesis);
    const priority = calculatePriority(tempHypothesis);
    
    const newHypothesis: EnhancedHypothesis = {
      id: generateId(),
      goal: formData.goal,
      subjects: formData.subjects,
      conditions: formData.conditions,
      expectedOutcome: formData.expectedOutcome,
      reasoning: formData.reasoning,
      impact: formData.impact,
      effort: formData.effort,
      confidence: formData.confidence,
      risk: formData.risk,
      timeframe: formData.timeframe,
      calculatedPriority: priority,
      validationStatus: validation.status,
      validationErrors: validation.errors,
      experimentStartDate: new Date(),
      experimentStatus: ExperimentStatus.NOT_STARTED,
      experimentResults: [],
      successCriteria: [],
      weeklyProgress: defaultWeeklyProgress,
      status: 'active',
      progress: calculateHypothesisProgress(defaultWeeklyProgress),
      journal: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedHypotheses = [...hypotheses, newHypothesis];
    setHypotheses(updatedHypotheses);
    saveToStorage(updatedHypotheses);
    
    return newHypothesis.id;
  }, [hypotheses, saveToStorage]);

  // Update existing hypothesis
  const updateHypothesis = useCallback((id: string, updates: Partial<EnhancedHypothesis>) => {
    const updatedHypotheses = hypotheses.map(h => {
      if (h.id === id) {
        const updated = { ...h, ...updates, updatedAt: new Date() };
        
        // Recalculate priority if relevant fields changed
        if ('impact' in updates || 'effort' in updates || 'confidence' in updates || 
            'risk' in updates || 'timeframe' in updates) {
          updated.calculatedPriority = calculatePriority(updated);
        }
        
        // Recalculate progress if weekly progress changed
        if ('weeklyProgress' in updates && updates.weeklyProgress) {
          updated.progress = calculateHypothesisProgress(updates.weeklyProgress);
        }
        
        // Revalidate if content changed
        if ('conditions' in updates || 'expectedOutcome' in updates || 
            'reasoning' in updates || 'subjects' in updates || 'goal' in updates) {
          const validation = validateHypothesis(updated);
          updated.validationStatus = validation.status;
          updated.validationErrors = validation.errors;
        }
        
        return updated;
      }
      return h;
    });
    
    setHypotheses(updatedHypotheses);
    saveToStorage(updatedHypotheses);
  }, [hypotheses, saveToStorage]);

  // Delete hypothesis
  const deleteHypothesis = useCallback((id: string) => {
    const updatedHypotheses = hypotheses.filter(h => h.id !== id);
    setHypotheses(updatedHypotheses);
    saveToStorage(updatedHypotheses);
  }, [hypotheses, saveToStorage]);

  // Update weekly rating
  const updateWeeklyRating = useCallback((hypothesisId: string, weekIndex: number, rating: number, note?: string) => {
    const hypothesis = hypotheses.find(h => h.id === hypothesisId);
    if (!hypothesis) return;

    const updatedWeeklyProgress = hypothesis.weeklyProgress.map(week => {
      if (week.week === weekIndex + 1) {
        return { 
          ...week, 
          rating: rating as 0 | 1 | 2 | 3 | 4, 
          note,
          lastModified: new Date()
        };
      }
      return week;
    });

    const newProgress = calculateHypothesisProgress(updatedWeeklyProgress);
    updateHypothesis(hypothesisId, { 
      weeklyProgress: updatedWeeklyProgress, 
      progress: newProgress,
      experimentStatus: newProgress === 100 ? ExperimentStatus.COMPLETED : ExperimentStatus.IN_PROGRESS
    });
  }, [hypotheses, updateHypothesis]);

  // Add journal entry
  const addJournalEntry = useCallback((hypothesisId: string, entry: string, mood: 'positive' | 'negative' | 'neutral') => {
    const hypothesis = hypotheses.find(h => h.id === hypothesisId);
    if (!hypothesis) return;

    const newEntry = {
      id: generateId(),
      date: new Date(),
      entry,
      mood
    };

    const updatedJournal = [...hypothesis.journal, newEntry];
    updateHypothesis(hypothesisId, { journal: updatedJournal });
  }, [hypotheses, updateHypothesis]);

  // Get hypothesis by ID
  const getHypothesis = useCallback((id: string): EnhancedHypothesis | undefined => {
    return hypotheses.find(h => h.id === id);
  }, [hypotheses]);

  // Get active hypotheses sorted by priority
  const getActiveHypotheses = useCallback((): EnhancedHypothesis[] => {
    const active = hypotheses.filter(h => h.status === 'active');
    return sortHypothesesByPriority(active);
  }, [hypotheses]);

  // Get strategy metrics
  const getStrategyMetrics = useCallback((): StrategyMetrics => {
    const active = hypotheses.filter(h => h.status === 'active');
    const validated = active.filter(h => h.validationStatus === ValidationStatus.VALIDATED);
    const allSubjects = new Set(active.flatMap(h => h.subjects));
    const avgProgress = active.length > 0 
      ? active.reduce((sum, h) => sum + h.progress, 0) / active.length 
      : 0;

    return {
      activeHypotheses: active.length,
      validatedHypotheses: validated.length,
      totalSubjects: allSubjects.size,
      averageProgress: Math.round(avgProgress)
    };
  }, [hypotheses]);

  return {
    hypotheses,
    loading,
    createHypothesis,
    updateHypothesis,
    deleteHypothesis,
    updateWeeklyRating,
    addJournalEntry,
    getHypothesis,
    getActiveHypotheses,
    getStrategyMetrics
  };
};
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserState, AppDataState, DataSyncStatus } from '@/types/app';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useSubjects } from '@/hooks/strategy/useSubjects';
import { clearAllDemoData, logCurrentLocalStorageState } from '@/utils/clearDemoData';

interface GlobalDataContextType {
  appState: AppDataState;
  syncStatus: DataSyncStatus;
  clearAllData: () => void;
  clearCache: () => void;
  generateDemoData: () => void;
  refreshData: () => void;
  isNewUser: boolean;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    // More detailed error with component stack trace
    if (import.meta.env.DEV) console.error('useGlobalData called outside of GlobalDataProvider context');
    if (import.meta.env.DEV) console.error('Component stack:', new Error().stack);
    throw new Error('useGlobalData must be used within GlobalDataProvider');
  }
  return context;
};

export const GlobalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Log current state on mount for debugging
  useEffect(() => {
    logCurrentLocalStorageState();
  }, []);

  const [appState, setAppState] = useState<AppDataState>({
    userState: 'empty',
    hasData: false,
    lastDataSync: null,
  });

  const [syncStatus, setSyncStatus] = useState<DataSyncStatus>({
    isLoading: false,
    lastSync: null,
    sections: {
      hypotheses: false,
      weeklyRatings: false,
      subjects: false,
      aiInsights: false,
      goals: false,
    }
  });

  const { hypotheses } = useEnhancedHypotheses();
  const { ratings } = useWeeklyRatings();
  const { subjects } = useSubjects();

  // Determine user state based on available data
  const determineUserState = useCallback((): UserState => {
    // Check for real user data (not default system data)
    const hasRealHypotheses = hypotheses && hypotheses.length > 0;
    const hasRealRatings = ratings && Object.keys(ratings).length > 0;
    const hasUserSubjects = subjects && subjects.some(s => s.type === 'custom');

    if (hasRealHypotheses || hasRealRatings || hasUserSubjects) return 'real_data';
    return 'empty';
  }, [hypotheses, ratings, subjects]);

  // Update app state when data changes
  useEffect(() => {
    const userState = determineUserState();
    const hasData = userState !== 'empty';

    setAppState(prev => ({
      ...prev,
      userState,
      hasData,
      lastDataSync: new Date(),
    }));

    setSyncStatus(prev => ({
      ...prev,
      lastSync: new Date(),
      sections: {
        hypotheses: hypotheses && hypotheses.length > 0,
        weeklyRatings: ratings && Object.keys(ratings).length > 0,
        subjects: subjects && subjects.length > 0,
        aiInsights: false, // TODO: implement AI insights checking
        goals: false, // TODO: implement goals checking
      }
    }));
  }, [hypotheses, ratings, subjects, determineUserState]);

  const clearAllData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {
      clearAllDemoData();

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));

      // Force re-render
      window.location.reload();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error clearing data:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const generateDemoData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const { createExactUserData } = await import('@/utils/exactUserData');
      await createExactUserData();

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));

      // Force re-render to show new data
      window.location.reload();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to generate demo data:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const refreshData = useCallback(() => {
    setSyncStatus(prev => ({
      ...prev,
      isLoading: true,
    }));

    setTimeout(() => {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
    }, 1000);
  }, []);

  const clearCache = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {

      // Очищаем только кэш, но сохраняем данные пользователя
      const weeklyRatings = localStorage.getItem('lqt_weekly_ratings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');

      // Очищаем все localStorage
      localStorage.clear();

      // Восстанавливаем данные пользователя
      if (weeklyRatings) {
        localStorage.setItem('lqt_weekly_ratings', weeklyRatings);
      }
      if (hasDataFlag) {
        localStorage.setItem('lqt_has_data', hasDataFlag);
      }

      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));

      window.location.reload();
    } catch (error) {
      if (import.meta.env.DEV) console.error('Ошибка очистки кэша:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const isNewUser = appState.userState === 'empty';

  return (
    <GlobalDataContext.Provider value={{
      appState,
      syncStatus,
      clearAllData,
      clearCache,
      generateDemoData,
      refreshData,
      isNewUser,
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};

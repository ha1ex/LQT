import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserState, AppDataState, DataSyncStatus } from '@/types/app';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useSubjects } from '@/hooks/strategy/useSubjects';

interface GlobalDataContextType {
  appState: AppDataState;
  syncStatus: DataSyncStatus;
  toggleDemoMode: () => void;
  clearAllData: () => void;
  generateDemoData: () => void;
  refreshData: () => void;
  isNewUser: boolean;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within GlobalDataProvider');
  }
  return context;
};

export const GlobalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppDataState>({
    userState: 'empty',
    isDemoMode: false,
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
    const hasHypotheses = hypotheses && hypotheses.length > 0;
    const hasRatings = ratings && Object.keys(ratings).length > 0;
    const hasCustomSubjects = subjects && subjects.some(s => s.type === 'custom');
    
    const demoModeFlag = localStorage.getItem('lqt_demo_mode');
    const isDemoActive = demoModeFlag === 'true';
    
    if (isDemoActive) return 'demo';
    if (hasHypotheses || hasRatings || hasCustomSubjects) return 'real_data';
    return 'empty';
  }, [hypotheses, ratings, subjects]);

  // Update app state when data changes
  useEffect(() => {
    const userState = determineUserState();
    const hasData = userState !== 'empty';
    const isDemoMode = userState === 'demo';

    setAppState(prev => ({
      ...prev,
      userState,
      isDemoMode,
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

  const toggleDemoMode = useCallback(() => {
    const currentDemoMode = localStorage.getItem('lqt_demo_mode') === 'true';
    
    if (currentDemoMode) {
      // Turning off demo mode - clear demo data
      localStorage.removeItem('lqt_demo_mode');
      clearAllData();
    } else {
      // Turning on demo mode - generate demo data
      localStorage.setItem('lqt_demo_mode', 'true');
      generateDemoData();
    }
  }, []);

  const clearAllData = useCallback(() => {
    localStorage.removeItem('lqt_hypotheses');
    localStorage.removeItem('lqt_weekly_ratings');
    localStorage.removeItem('lqt_subjects');
    localStorage.removeItem('lqt_ai_insights');
    localStorage.removeItem('lqt_ai_chat_history');
    localStorage.removeItem('lqt_demo_mode');
    
    setSyncStatus(prev => ({
      ...prev,
      isLoading: true,
    }));
    
    // Trigger data refresh
    setTimeout(() => {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
      window.location.reload(); // Force component re-initialization
    }, 500);
  }, []);

  const generateDemoData = useCallback(async () => {
    setSyncStatus(prev => ({
      ...prev,
      isLoading: true,
    }));

    try {
      // Import demo data generation functions
      const { createComprehensiveDemoData } = await import('@/utils/comprehensiveDemoData');
      await createComprehensiveDemoData();
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
      
      // Force re-render to show new demo data
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate demo data:', error);
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
      }));
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

  const isNewUser = appState.userState === 'empty';

  return (
    <GlobalDataContext.Provider value={{
      appState,
      syncStatus,
      toggleDemoMode,
      clearAllData,
      generateDemoData,
      refreshData,
      isNewUser,
    }}>
      {children}
    </GlobalDataContext.Provider>
  );
};
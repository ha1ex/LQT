import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserState, AppDataState, DataSyncStatus } from '@/types/app';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useSubjects } from '@/hooks/strategy/useSubjects';
import { clearAllDemoData, logCurrentLocalStorageState } from '@/utils/clearDemoData';

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
    // More detailed error with component stack trace
    console.error('useGlobalData called outside of GlobalDataProvider context');
    console.error('Component stack:', new Error().stack);
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
    const demoModeFlag = localStorage.getItem('lqt_demo_mode');
    const isDemoActive = demoModeFlag === 'true';
    
    if (isDemoActive) return 'demo';
    
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

  const toggleDemoMode = useCallback(async () => {
    const currentDemoMode = localStorage.getItem('lqt_demo_mode') === 'true';
    
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    console.log(`🔄 Toggling demo mode from ${currentDemoMode} to ${!currentDemoMode}`);

    try {
      if (currentDemoMode) {
        // Turning off demo mode - clear demo data and return to empty state
        console.log('📤 Exiting demo mode, clearing demo data...');
        clearAllDemoData();
        window.location.reload();
      } else {
        // Turning on demo mode - clear existing data first, then generate demo data
        console.log('📥 Entering demo mode, generating comprehensive demo data...');
        clearAllDemoData(); // Clear any existing data first
        localStorage.setItem('lqt_demo_mode', 'true');
        const { createComprehensiveDemoData } = await import('@/utils/comprehensiveDemoData');
        await createComprehensiveDemoData();
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ Error toggling demo mode:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const clearAllData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log('🧹 Clearing all data...');
      clearAllDemoData();
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        lastSync: new Date(),
      }));
      
      console.log('✅ All data cleared, reloading page...');
      // Force re-render
      window.location.reload();
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      setSyncStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const generateDemoData = useCallback(async () => {
    setSyncStatus(prev => ({ ...prev, isLoading: true }));

    try {
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
/**
 * Utility function to completely clear all demo data from localStorage
 * This helps ensure a clean slate for new users
 */

export const clearAllDemoData = () => {
  console.log('🧹 Clearing all demo data from localStorage...');
  
  const keysToRemove = [
    'lqt_demo_mode',
    'lqt_hypotheses', 
    'lqt_weekly_ratings',
    'lqt_subjects',
    'lqt_ai_insights',
    'lqt_ai_chat_history',
    'weekly_ratings_data', // Old key from useWeeklyRatings
    'lqt_journal',
    'lqt_goals',
    'lqt_user_preferences'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing: ${key}`);
      localStorage.removeItem(key);
    }
  });
  
  console.log('✅ All demo data cleared');
};

export const isDemoModeActive = (): boolean => {
  return localStorage.getItem('lqt_demo_mode') === 'true';
};

export const logCurrentLocalStorageState = () => {
  console.log('📊 Current localStorage state:');
  
  const relevantKeys = [
    'lqt_demo_mode',
    'lqt_hypotheses', 
    'lqt_weekly_ratings',
    'lqt_subjects',
    'lqt_ai_insights',
    'lqt_ai_chat_history'
  ];
  
  relevantKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        console.log(`${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : typeof parsed);
      } catch {
        console.log(`${key}:`, value);
      }
    } else {
      console.log(`${key}:`, 'null');
    }
  });
};
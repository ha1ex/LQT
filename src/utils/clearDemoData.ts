/**
 * Utility function to completely clear all data from localStorage
 * This helps ensure a clean slate for new users
 */

export const clearAllDemoData = () => {
  const keysToRemove = [
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
      localStorage.removeItem(key);
    }
  });

};

export const logCurrentLocalStorageState = () => {

  const relevantKeys = [
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
        JSON.parse(value);
      } catch {
      }
    } else {
      // key not in localStorage — nothing to clear
    }
  });
};

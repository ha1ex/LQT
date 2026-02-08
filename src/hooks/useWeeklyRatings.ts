import { useContext } from 'react';
import { WeeklyRatingsContext, WeeklyRatingsContextType } from '@/contexts/WeeklyRatingsProvider';

/**
 * Hook to access weekly ratings data.
 * All state is centralized in WeeklyRatingsProvider —
 * every consumer shares the same instance.
 */
export const useWeeklyRatings = (): WeeklyRatingsContextType => {
  const context = useContext(WeeklyRatingsContext);
  if (!context) {
    throw new Error('useWeeklyRatings must be used within WeeklyRatingsProvider');
  }
  return context;
};

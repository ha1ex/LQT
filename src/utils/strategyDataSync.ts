import type { WeeklyRating } from '@/types/weeklyRating';
import type { EnhancedHypothesis, WeeklyProgress } from '@/types/strategy';

/**
 * Utility functions for synchronizing data between weekly ratings and strategy hypotheses
 */

/**
 * Convert weekly rating metric score (1-10) to hypothesis progress rating (0-4)
 */
export const convertRatingToProgress = (rating: number): 0 | 1 | 2 | 3 | 4 => {
  if (rating <= 0) return 0; // Not rated
  if (rating <= 2) return 1; // Poor
  if (rating <= 4) return 2; // Below average
  if (rating <= 6) return 2; // Average
  if (rating <= 8) return 3; // Good
  return 4; // Excellent
};

/**
 * Convert hypothesis progress rating (0-4) back to weekly rating scale (1-10)
 */
export const convertProgressToRating = (progress: 0 | 1 | 2 | 3 | 4): number => {
  switch (progress) {
    case 0: return 0; // Not rated
    case 1: return 2; // Poor
    case 2: return 5; // Average
    case 3: return 7; // Good
    case 4: return 9; // Excellent
    default: return 0;
  }
};

/**
 * Update hypothesis weekly progress based on weekly rating data
 */
export const syncWeeklyRatingToHypothesis = (
  hypothesis: EnhancedHypothesis,
  weeklyRating: WeeklyRating
): WeeklyProgress | null => {
  const metricRating = weeklyRating.ratings[hypothesis.goal.metricId];
  
  if (!metricRating || metricRating <= 0) {
    return null; // No rating for this metric
  }

  // Find the corresponding week in hypothesis progress
  const weekIndex = hypothesis.weeklyProgress.findIndex(w => {
    const weekStart = new Date(w.startDate);
    const weekEnd = new Date(w.endDate);
    const ratingStart = new Date(weeklyRating.startDate);
    const ratingEnd = new Date(weeklyRating.endDate);
    
    // Check if weeks overlap
    return (ratingStart <= weekEnd && ratingEnd >= weekStart);
  });

  if (weekIndex === -1) {
    return null; // No matching week found
  }

  const weekProgress = hypothesis.weeklyProgress[weekIndex];
  const progressRating = convertRatingToProgress(metricRating);
  const note = weeklyRating.notes[hypothesis.goal.metricId] || '';
  
  // Create updated weekly progress
  const updatedProgress: WeeklyProgress = {
    ...weekProgress,
    rating: progressRating,
    note,
    mood: weeklyRating.mood === 'excellent' ? 'positive' :
          weeklyRating.mood === 'poor' || weeklyRating.mood === 'terrible' ? 'negative' :
          'neutral',
    keyEvents: weeklyRating.keyEvents || [],
    lastModified: new Date()
  };

  return updatedProgress;
};

/**
 * Generate weekly rating suggestions based on hypothesis progress
 */
export const generateRatingSuggestions = (
  hypotheses: EnhancedHypothesis[],
  currentWeekRating: WeeklyRating
): Array<{
  metricId: string;
  suggestedRating: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}> => {
  const suggestions = [];

  for (const hypothesis of hypotheses) {
    const metricId = hypothesis.goal.metricId;
    const currentRating = currentWeekRating.ratings[metricId];
    
    if (currentRating && currentRating > 0) {
      continue; // Already rated
    }

    // Find most recent progress
    const recentProgress = hypothesis.weeklyProgress
      .filter(p => p.rating > 0)
      .sort((a, b) => new Date(b.lastModified || 0).getTime() - new Date(a.lastModified || 0).getTime())[0];

    if (recentProgress) {
      const suggestedRating = convertProgressToRating(recentProgress.rating);
      const trend = calculateProgressTrend(hypothesis);
      
      let reason = `Основано на прогрессе эксперимента "${hypothesis.conditions}"`;
      let confidence: 'high' | 'medium' | 'low' = 'medium';
      
      if (trend === 'improving') {
        reason += '. Тренд улучшается.';
        confidence = 'high';
      } else if (trend === 'declining') {
        reason += '. Тренд ухудшается.';
        confidence = 'low';
      }

      suggestions.push({
        metricId,
        suggestedRating: Math.max(1, suggestedRating),
        reason,
        confidence
      });
    }
  }

  return suggestions;
};

/**
 * Calculate progress trend for a hypothesis
 */
export const calculateProgressTrend = (hypothesis: EnhancedHypothesis): 'improving' | 'declining' | 'stable' => {
  const recentProgress = hypothesis.weeklyProgress
    .filter(p => p.rating > 0)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(-4); // Last 4 weeks

  if (recentProgress.length < 2) return 'stable';

  const firstHalf = recentProgress.slice(0, Math.floor(recentProgress.length / 2));
  const secondHalf = recentProgress.slice(Math.floor(recentProgress.length / 2));

  const firstAvg = firstHalf.reduce((sum, p) => sum + p.rating, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.rating, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 0.5) return 'improving';
  if (difference < -0.5) return 'declining';
  return 'stable';
};

/**
 * Find correlations between metric ratings and hypothesis success
 */
export const findMetricHypothesisCorrelations = (
  weeklyRatings: Record<string, WeeklyRating>,
  hypotheses: EnhancedHypothesis[]
): Array<{
  metricId: string;
  hypothesisId: string;
  correlation: number;
  description: string;
}> => {
  const correlations = [];

  for (const hypothesis of hypotheses) {
    const metricId = hypothesis.goal.metricId;
    
    // Get all ratings for this metric
    const ratings = Object.values(weeklyRatings)
      .map(wr => ({
        date: new Date(wr.startDate),
        rating: wr.ratings[metricId] || 0,
        progress: syncWeeklyRatingToHypothesis(hypothesis, wr)?.rating || 0
      }))
      .filter(r => r.rating > 0 && r.progress > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (ratings.length < 3) continue;

    // Calculate correlation coefficient
    const correlation = calculateCorrelation(
      ratings.map(r => r.rating),
      ratings.map(r => r.progress)
    );

    if (Math.abs(correlation) > 0.3) {
      let description = '';
      if (correlation > 0.6) {
        description = 'Сильная положительная связь между оценкой метрики и прогрессом эксперимента';
      } else if (correlation > 0.3) {
        description = 'Умеренная положительная связь между оценкой метрики и прогрессом эксперимента';
      } else if (correlation < -0.6) {
        description = 'Сильная отрицательная связь - возможно, эксперимент имеет побочные эффекты';
      } else {
        description = 'Слабая связь между оценкой метрики и прогрессом эксперимента';
      }

      correlations.push({
        metricId,
        hypothesisId: hypothesis.id,
        correlation,
        description
      });
    }
  }

  return correlations;
};

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Auto-sync weekly ratings to hypothesis progress
 */
export const autoSyncRatingsToHypotheses = (
  weeklyRating: WeeklyRating,
  hypotheses: EnhancedHypothesis[],
  updateHypothesisProgress: (hypothesisId: string, weekIndex: number, rating: 0 | 1 | 2 | 3 | 4, note?: string) => void
) => {
  for (const hypothesis of hypotheses) {
    const updatedProgress = syncWeeklyRatingToHypothesis(hypothesis, weeklyRating);
    
    if (updatedProgress) {
      const weekIndex = hypothesis.weeklyProgress.findIndex(w => 
        w.week === updatedProgress.week
      );
      
      if (weekIndex >= 0) {
        updateHypothesisProgress(
          hypothesis.id,
          weekIndex,
          updatedProgress.rating,
          updatedProgress.note
        );
      }
    }
  }
};
import { useMemo } from 'react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { BASE_METRICS } from '@/utils/dataAdapter';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { WeeklyRating } from '@/types/weeklyRating';

export interface IntegratedMetric {
  id: string;
  name: string;
  icon: string;
  category: string;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  relatedHypotheses: string[];
  hasActiveExperiment: boolean;
}

export interface DashboardStrategyLink {
  metricId: string;
  hypothesesIds: string[];
  recommendations: string[];
  nextActions: string[];
}

/**
 * Unified hook for integrating Dashboard and Strategy data
 * Uses real user metrics from BASE_METRICS instead of hardcoded generic ones
 */
export const useIntegratedData = () => {
  const { appState } = useGlobalData();
  const { getActiveHypotheses, getStrategyMetrics } = useEnhancedHypotheses();
  const { ratings, getAnalytics } = useWeeklyRatings();

  const analytics = getAnalytics();
  const activeHypotheses = getActiveHypotheses();
  const strategyMetrics = getStrategyMetrics();

  // Get latest week rating from actual data (sorted by date)
  const latestWeekRating = useMemo(() => {
    const sorted = Object.values(ratings).sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
    return sorted[0] || null;
  }, [ratings]);

  // Get previous week rating for trend calculation
  const previousWeekRating = useMemo(() => {
    const sorted = Object.values(ratings).sort(
      (a, b) => b.startDate.getTime() - a.startDate.getTime()
    );
    return sorted[1] || null;
  }, [ratings]);

  // Period label for dashboard — shows which week the data is from
  const periodLabel = useMemo(() => {
    if (!latestWeekRating) return '';
    const wNum = latestWeekRating.weekNumber;
    const start = format(latestWeekRating.startDate, 'd MMM', { locale: ru });
    const end = format(latestWeekRating.endDate, 'd MMM', { locale: ru });
    return `W${String(wNum).padStart(2, '0')}, ${start} — ${end}`;
  }, [latestWeekRating]);

  // Create integrated metrics from real BASE_METRICS, using actual weekly rating data
  const integratedMetrics = useMemo((): IntegratedMetric[] => {
    if (!latestWeekRating) return [];

    // Only include metrics that have data in the latest week
    const activeMetricIds = Object.keys(latestWeekRating.ratings);

    return BASE_METRICS
      .filter(metric => activeMetricIds.includes(metric.id))
      .map(metric => {
        const currentValue = latestWeekRating.ratings[metric.id] || 0;
        const previousValue = previousWeekRating?.ratings?.[metric.id] || currentValue;

        // Find related hypotheses based on goal metric
        const relatedHypotheses = activeHypotheses
          .filter(hyp => hyp.goal.metricId === metric.id)
          .map(hyp => hyp.id);

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (currentValue > previousValue + 0.5) trend = 'up';
        else if (currentValue < previousValue - 0.5) trend = 'down';

        return {
          id: metric.id,
          name: metric.name,
          icon: metric.icon,
          category: metric.category,
          currentValue,
          previousValue,
          trend,
          relatedHypotheses,
          hasActiveExperiment: relatedHypotheses.length > 0,
        };
      });
  }, [latestWeekRating, previousWeekRating, activeHypotheses]);

  // Create strategy-dashboard links
  const strategyDashboardLinks = useMemo((): DashboardStrategyLink[] => {
    return integratedMetrics
      .filter(metric => metric.currentValue > 0)
      .map(metric => {
        const relatedHypotheses = activeHypotheses
          .filter(hyp => hyp.goal.metricId === metric.id);

        const recommendations: string[] = [];
        const nextActions: string[] = [];

        if (metric.currentValue <= 4) {
          if (relatedHypotheses.length === 0) {
            recommendations.push(`Создать гипотезу для улучшения ${metric.name.toLowerCase()}`);
            nextActions.push('create-hypothesis');
          } else {
            recommendations.push(`Пересмотреть стратегию для ${metric.name.toLowerCase()}`);
            nextActions.push('review-hypothesis');
          }
        } else if (metric.currentValue >= 8) {
          recommendations.push(`Использовать силу в ${metric.name.toLowerCase()} для других целей`);
          nextActions.push('leverage-strength');
        }

        return {
          metricId: metric.id,
          hypothesesIds: relatedHypotheses.map(h => h.id),
          recommendations,
          nextActions,
        };
      });
  }, [integratedMetrics, activeHypotheses]);

  // Update hypothesis progress based on weekly ratings
  const syncRatingsToHypotheses = (weekRating: WeeklyRating) => {
    activeHypotheses.forEach(hypothesis => {
      const metricRating = weekRating.ratings[hypothesis.goal.metricId];
      if (metricRating && metricRating > 0) {
        const weekIndex = hypothesis.weeklyProgress.findIndex(w =>
          w.startDate <= weekRating.startDate && w.endDate >= weekRating.endDate
        );

        if (weekIndex >= 0) {
          // Placeholder for future implementation
        }
      }
    });
  };

  // Generate smart recommendations based on both data sources
  const generateSmartRecommendations = () => {
    const recommendations: Array<{
      type: string;
      title: string;
      description: string;
      action: () => Record<string, unknown>;
      priority: 'high' | 'medium' | 'low';
    }> = [];

    // Problem areas without active hypotheses
    const problemAreas = integratedMetrics.filter(m => m.currentValue > 0 && m.currentValue <= 4 && !m.hasActiveExperiment);
    problemAreas.forEach(area => {
      recommendations.push({
        type: 'create-hypothesis',
        title: `Создать эксперимент для «${area.name}»`,
        description: `Низкая оценка (${area.currentValue}/10) требует системного подхода`,
        action: () => ({ type: 'CREATE_HYPOTHESIS', metricId: area.id }),
        priority: 'high'
      });
    });

    // Declining metrics
    const decliningMetrics = integratedMetrics.filter(m => m.trend === 'down' && m.currentValue > 0);
    decliningMetrics.forEach(metric => {
      recommendations.push({
        type: 'attention-needed',
        title: `Обратите внимание на «${metric.name}»`,
        description: `Снижение с ${metric.previousValue} до ${metric.currentValue} за неделю`,
        action: () => ({ type: 'VIEW_METRIC', metricId: metric.id }),
        priority: 'medium'
      });
    });

    // Stagnating hypotheses
    const stagnatingHypotheses = activeHypotheses.filter(h => {
      const recentProgress = h.weeklyProgress.slice(-3);
      return recentProgress.every(p => p.rating <= 2);
    });

    stagnatingHypotheses.forEach(hyp => {
      recommendations.push({
        type: 'revise-hypothesis',
        title: `Пересмотреть «${hyp.conditions}»`,
        description: 'Эксперимент не показывает результатов',
        action: () => ({ type: 'VIEW_HYPOTHESIS', id: hyp.id }),
        priority: 'medium'
      });
    });

    // Successful patterns to replicate
    const successfulHypotheses = activeHypotheses.filter(h => h.progress >= 70);
    if (successfulHypotheses.length > 0) {
      recommendations.push({
        type: 'replicate-success',
        title: 'Применить успешную стратегию',
        description: 'У вас есть работающие подходы для других целей',
        action: () => ({ type: 'REPLICATE_SUCCESS', hypotheses: successfulHypotheses }),
        priority: 'low'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  return {
    // Core data
    integratedMetrics,
    strategyDashboardLinks,
    activeHypotheses,
    currentWeekData: latestWeekRating,
    analytics,
    strategyMetrics,
    periodLabel,

    // Derived insights
    smartRecommendations: generateSmartRecommendations(),

    // Actions
    syncRatingsToHypotheses,

    // State
    hasData: appState.hasData,
    isLoading: Object.keys(ratings).length === 0 && !activeHypotheses.length,
  };
};

import { useMemo } from 'react';
import { useEnhancedHypotheses } from '@/hooks/strategy';
import { useWeeklyRatings } from '@/hooks/useWeeklyRatings';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import type { WeeklyRating } from '@/types/weeklyRating';
import type { EnhancedHypothesis } from '@/types/strategy';

export interface IntegratedMetric {
  id: string;
  name: string;
  icon: string;
  category: string;
  currentValue: number;
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
 */
export const useIntegratedData = () => {
  const { appState } = useGlobalData();
  const { hypotheses, getActiveHypotheses, getStrategyMetrics } = useEnhancedHypotheses();
  const { ratings, getCurrentWeekRating, getAnalytics } = useWeeklyRatings();

  // Get current week data and analytics
  const currentWeekData = getCurrentWeekRating();
  const analytics = getAnalytics();
  const activeHypotheses = getActiveHypotheses();
  const strategyMetrics = getStrategyMetrics();

  // Create integrated metrics that combine ratings with hypothesis data
  const integratedMetrics = useMemo((): IntegratedMetric[] => {
    const baseMetrics = [
      { id: 'health', name: 'Здоровье', icon: '💪', category: 'health' },
      { id: 'relationships', name: 'Отношения', icon: '❤️', category: 'relationships' },
      { id: 'career', name: 'Карьера', icon: '💼', category: 'career' },
      { id: 'finance', name: 'Финансы', icon: '💰', category: 'finance' },
      { id: 'education', name: 'Обучение', icon: '📚', category: 'education' },
      { id: 'hobbies', name: 'Хобби', icon: '🎨', category: 'hobbies' },
    ];

    return baseMetrics.map(metric => {
      const currentValue = currentWeekData?.ratings?.[metric.id] || 0;
      
      // Find related hypotheses based on goal metric
      const relatedHypotheses = activeHypotheses
        .filter(hyp => hyp.goal.metricId === metric.id)
        .map(hyp => hyp.id);

      // Calculate trend based on last few weeks
      const previousValue = analytics.trendsOverTime
        .slice(-2, -1)[0]?.averageScore || currentValue;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (currentValue > previousValue + 0.5) trend = 'up';
      else if (currentValue < previousValue - 0.5) trend = 'down';

      return {
        id: metric.id,
        name: metric.name,
        icon: metric.icon,
        category: metric.category,
        currentValue,
        trend,
        relatedHypotheses,
        hasActiveExperiment: relatedHypotheses.length > 0,
      };
    });
  }, [currentWeekData, analytics, activeHypotheses]);

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
        // Find current week in hypothesis progress
        const weekIndex = hypothesis.weeklyProgress.findIndex(w => 
          w.startDate <= weekRating.startDate && w.endDate >= weekRating.endDate
        );
        
        if (weekIndex >= 0) {
          // Convert 1-10 rating to 0-4 progress rating
          const progressRating = Math.min(4, Math.max(0, Math.floor((metricRating - 1) / 2.25))) as 0 | 1 | 2 | 3 | 4;
          
          // This would need to be implemented in the hypothesis hook
          // updateWeeklyRating(hypothesis.id, weekIndex, progressRating, weekRating.notes[hypothesis.goal.metricId]);
        }
      }
    });
  };

  // Generate smart recommendations based on both data sources
  const generateSmartRecommendations = () => {
    const recommendations = [];

    // Problem areas without active hypotheses
    const problemAreas = integratedMetrics.filter(m => m.currentValue <= 4 && !m.hasActiveExperiment);
    problemAreas.forEach(area => {
      recommendations.push({
        type: 'create-hypothesis',
        title: `🎯 Создать эксперимент для ${area.name}`,
        description: `Низкая оценка (${area.currentValue}/10) требует системного подхода`,
        action: () => ({ type: 'CREATE_HYPOTHESIS', metricId: area.id }),
        priority: 'high'
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
        title: `🔄 Пересмотреть "${hyp.conditions}"`,
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
        title: '🚀 Применить успешную стратегию',
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
    currentWeekData,
    analytics,
    strategyMetrics,
    
    // Derived insights
    smartRecommendations: generateSmartRecommendations(),
    
    // Actions
    syncRatingsToHypotheses,
    
    // State
    hasData: appState.hasData,
    isLoading: !currentWeekData && !activeHypotheses.length,
  };
};
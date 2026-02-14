import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIntegratedData } from './useIntegratedData';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { useEnhancedHypotheses } from './strategy';
import { useWeeklyRatings } from './useWeeklyRatings';
import { useAIInsights } from './useAIInsights';
import type { WeeklyRating } from '@/types/weeklyRating';

export interface SystemConnection {
  id: string;
  type: 'metric-hypothesis' | 'metric-rating' | 'hypothesis-insight' | 'rating-insight';
  source: string;
  target: string;
  strength: number; // 0-1
  description: string;
}

export interface UnifiedMetric {
  id: string;
  name: string;
  icon: string;
  category: string;
  currentValue: number;
  targetValue?: number;
  trend: 'up' | 'down' | 'stable';
  ratingHistory: Array<{ date: Date; value: number }>;
  relatedHypotheses: string[];
  relatedInsights: string[];
  correlations: Array<{ metricId: string; correlation: number }>;
  lastUpdated: Date;
}

export interface CrossSectionAnalytics {
  hypothesesEffectiveness: Array<{
    hypothesisId: string;
    metricImpact: Record<string, number>;
    overallSuccess: number;
    timeToEffect: number;
  }>;
  metricCorrelations: Array<{
    metric1: string;
    metric2: string;
    correlation: number;
    significance: number;
  }>;
  aiAccuracy: {
    predictionsCorrect: number;
    recommendationsFollowed: number;
    insightsValidated: number;
  };
  systemSynergies: Array<{
    combination: string[];
    effect: number;
    confidence: number;
  }>;
}

export interface UnifiedRecommendation {
  id: string;
  type: 'immediate' | 'strategic' | 'investigative';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  affectedSections: ('dashboard' | 'strategy' | 'ratings' | 'ai' | 'analytics')[];
  actions: Array<{
    section: string;
    action: string;
    params?: Record<string, unknown>;
  }>;
  expectedOutcome: string;
  timeframe: string;
  confidence: number;
}

/**
 * Unified System Hook - создает единую экосистему всех разделов
 */
export const useUnifiedSystem = () => {
  const { appState } = useGlobalData();
  const {
    integratedMetrics,
    activeHypotheses,
    currentWeekData
  } = useIntegratedData();

  const { hypotheses } = useEnhancedHypotheses();
  const { ratings } = useWeeklyRatings();
  const { insights } = useAIInsights();

  // Состояние системных связей
  const [systemConnections, setSystemConnections] = useState<SystemConnection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Создание унифицированных метрик
  const unifiedMetrics = useMemo((): UnifiedMetric[] => {
    return integratedMetrics.map(metric => {
      // История рейтингов
      const ratingHistory = Object.values(ratings)
        .filter(rating => rating.ratings[metric.id])
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .map(rating => ({
          date: rating.startDate,
          value: rating.ratings[metric.id]
        }));

      // Связанные инсайты
      const relatedInsights = insights
        .filter(insight => insight.description?.includes(metric.name))
        .map(insight => insight.id);

      // Корреляции с другими метриками
      const correlations = integratedMetrics
        .filter(m => m.id !== metric.id)
        .map(otherMetric => {
          const correlation = calculateMetricCorrelation(metric.id, otherMetric.id, ratings);
          return {
            metricId: otherMetric.id,
            correlation
          };
        })
        .filter(c => Math.abs(c.correlation) > 0.3)
        .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

      // Целевое значение из активных гипотез
      const targetHypothesis = activeHypotheses.find(h => h.goal.metricId === metric.id);
      const targetValue = targetHypothesis?.goal.targetValue;

      return {
        id: metric.id,
        name: metric.name,
        icon: metric.icon,
        category: metric.category,
        currentValue: metric.currentValue,
        targetValue,
        trend: metric.trend,
        ratingHistory,
        relatedHypotheses: metric.relatedHypotheses,
        relatedInsights,
        correlations,
        lastUpdated: currentWeekData?.updatedAt || new Date()
      };
    });
  }, [integratedMetrics, ratings, insights, activeHypotheses, currentWeekData]);

  // Кросс-секционная аналитика
  const crossSectionAnalytics = useMemo((): CrossSectionAnalytics => {
    // Эффективность гипотез
    const hypothesesEffectiveness = hypotheses
      .filter(h => h.status === 'active' || h.status === 'completed')
      .map(hypothesis => {
        const metricId = hypothesis.goal.metricId;
        const beforeRatings = Object.values(ratings)
          .filter(r => r.startDate < hypothesis.experimentStartDate && r.ratings[metricId])
          .slice(-4); // Последние 4 недели до начала
        
        const afterRatings = Object.values(ratings)
          .filter(r => r.startDate >= hypothesis.experimentStartDate && r.ratings[metricId])
          .slice(0, hypothesis.weeklyProgress.length);

        const beforeAvg = beforeRatings.length > 0 
          ? beforeRatings.reduce((sum, r) => sum + r.ratings[metricId], 0) / beforeRatings.length 
          : 0;
        
        const afterAvg = afterRatings.length > 0 
          ? afterRatings.reduce((sum, r) => sum + r.ratings[metricId], 0) / afterRatings.length 
          : 0;

        const impact = afterAvg - beforeAvg;
        const overallSuccess = Math.max(0, Math.min(100, ((impact + 5) / 10) * 100));

        return {
          hypothesisId: hypothesis.id,
          metricImpact: { [metricId]: impact },
          overallSuccess,
          timeToEffect: afterRatings.length
        };
      });

    // Корреляции между метриками
    const metricCorrelations = [];
    for (let i = 0; i < unifiedMetrics.length; i++) {
      for (let j = i + 1; j < unifiedMetrics.length; j++) {
        const metric1 = unifiedMetrics[i];
        const metric2 = unifiedMetrics[j];
        const correlation = calculateMetricCorrelation(metric1.id, metric2.id, ratings);
        
        if (Math.abs(correlation) > 0.3) {
          metricCorrelations.push({
            metric1: metric1.id,
            metric2: metric2.id,
            correlation,
            significance: Math.abs(correlation)
          });
        }
      }
    }

    // Точность ИИ (заглушка для демонстрации)
    const aiAccuracy = {
      predictionsCorrect: 85,
      recommendationsFollowed: 70,
      insightsValidated: 92
    };

    // Системные синергии (заглушка для демонстрации)
    const systemSynergies = [
      {
        combination: ['health', 'sleep_quality'],
        effect: 0.85,
        confidence: 0.9
      },
      {
        combination: ['work_satisfaction', 'stress_level'],
        effect: -0.72,
        confidence: 0.88
      }
    ];

    return {
      hypothesesEffectiveness,
      metricCorrelations,
      aiAccuracy,
      systemSynergies
    };
  }, [unifiedMetrics, hypotheses, ratings]);

  // Генерация унифицированных рекомендаций
  const generateUnifiedRecommendations = useCallback((): UnifiedRecommendation[] => {
    const recommendations: UnifiedRecommendation[] = [];

    // Рекомендации на основе низких метрик без активных гипотез
    unifiedMetrics
      .filter(m => m.currentValue <= 4 && m.relatedHypotheses.length === 0)
      .forEach(metric => {
        recommendations.push({
          id: `create-hypothesis-${metric.id}`,
          type: 'strategic',
          priority: 'high',
          title: `Создать эксперимент для улучшения ${metric.name}`,
          description: `Низкая оценка (${metric.currentValue}/10) требует системного подхода`,
          reasoning: 'Отсутствие активных экспериментов для проблемной метрики',
          affectedSections: ['strategy', 'dashboard'],
          actions: [
            {
              section: 'strategy',
              action: 'CREATE_HYPOTHESIS',
              params: { metricId: metric.id, currentValue: metric.currentValue }
            }
          ],
          expectedOutcome: `Улучшение ${metric.name} на 2-3 пункта за 4-6 недель`,
          timeframe: '4-6 недель',
          confidence: 80
        });
      });

    // Рекомендации на основе сильных корреляций
    crossSectionAnalytics.metricCorrelations
      .filter(c => Math.abs(c.correlation) > 0.7)
      .forEach(correlation => {
        const metric1 = unifiedMetrics.find(m => m.id === correlation.metric1);
        const metric2 = unifiedMetrics.find(m => m.id === correlation.metric2);
        
        if (metric1 && metric2) {
          const strongerMetric = metric1.currentValue > metric2.currentValue ? metric1 : metric2;
          const weakerMetric = metric1.currentValue <= metric2.currentValue ? metric1 : metric2;

          recommendations.push({
            id: `leverage-correlation-${correlation.metric1}-${correlation.metric2}`,
            type: 'strategic',
            priority: 'medium',
            title: `Использовать связь между ${strongerMetric.name} и ${weakerMetric.name}`,
            description: `Сильная корреляция (${(correlation.correlation * 100).toFixed(0)}%) может помочь улучшить ${weakerMetric.name}`,
            reasoning: `Обнаружена значимая корреляция между метриками`,
            affectedSections: ['strategy', 'analytics', 'dashboard'],
            actions: [
              {
                section: 'strategy',
                action: 'CREATE_CORRELATION_HYPOTHESIS',
                params: { 
                  sourceMetric: strongerMetric.id, 
                  targetMetric: weakerMetric.id,
                  correlation: correlation.correlation 
                }
              }
            ],
            expectedOutcome: `Улучшение ${weakerMetric.name} через фокус на ${strongerMetric.name}`,
            timeframe: '2-4 недели',
            confidence: Math.round(Math.abs(correlation.correlation) * 100)
          });
        }
      });

    // Рекомендации по завершенным гипотезам
    hypotheses
      .filter(h => h.status === 'completed' && h.progress >= 80)
      .forEach(hypothesis => {
        recommendations.push({
          id: `replicate-success-${hypothesis.id}`,
          type: 'strategic',
          priority: 'low',
          title: 'Применить успешную стратегию к другим метрикам',
          description: `Гипотеза "${hypothesis.conditions}" показала высокую эффективность`,
          reasoning: `Успешный эксперимент может быть адаптирован для других целей`,
          affectedSections: ['strategy', 'ai'],
          actions: [
            {
              section: 'strategy',
              action: 'REPLICATE_HYPOTHESIS',
              params: { sourceHypothesisId: hypothesis.id }
            }
          ],
          expectedOutcome: 'Распространение успешного подхода на другие области',
          timeframe: '1-2 недели на адаптацию',
          confidence: 75
        });
      });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] - priorityOrder[a.priority]) ||
             (b.confidence - a.confidence);
    });
  }, [unifiedMetrics, crossSectionAnalytics, hypotheses]);

  // Создание системных связей
  const createSystemConnections = useCallback(() => {
    const connections: SystemConnection[] = [];

    // Связи метрика-гипотеза
    unifiedMetrics.forEach(metric => {
      metric.relatedHypotheses.forEach(hypothesisId => {
        const hypothesis = hypotheses.find(h => h.id === hypothesisId);
        if (hypothesis) {
          connections.push({
            id: `metric-hypothesis-${metric.id}-${hypothesisId}`,
            type: 'metric-hypothesis',
            source: metric.id,
            target: hypothesisId,
            strength: hypothesis.progress / 100,
            description: `Гипотеза "${hypothesis.conditions}" направлена на улучшение ${metric.name}`
          });
        }
      });
    });

    // Связи метрика-инсайт (упрощенная версия)
    insights.forEach(insight => {
      unifiedMetrics.forEach(metric => {
        if (insight.description.includes(metric.name)) {
          connections.push({
            id: `metric-insight-${metric.id}-${insight.id}`,
            type: 'metric-rating',
            source: metric.id,
            target: insight.id,
            strength: 0.7,
            description: `Инсайт связан с ${metric.name}`
          });
        }
      });
    });

    setSystemConnections(connections);
  }, [unifiedMetrics, hypotheses, insights]);

  // Синхронизация данных между системами
  const syncSystemData = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // Синхронизация рейтингов с прогрессом гипотез
      for (const hypothesis of activeHypotheses) {
        const metricId = hypothesis.goal.metricId;
        const currentRating = currentWeekData?.ratings?.[metricId];
        
        if (currentRating && currentRating > 0) {
          // Обновляем прогресс гипотезы на основе текущего рейтинга
          const weekIndex = hypothesis.weeklyProgress.findIndex(w => 
            w.startDate <= new Date() && w.endDate >= new Date()
          );
          
          if (weekIndex >= 0) {
            // Конвертируем рейтинг 1-10 в прогресс 0-4
            // const progressRating = Math.min(4, Math.max(0, Math.floor((currentRating - 1) / 2.25))) as 0 | 1 | 2 | 3 | 4;
            // Здесь должно быть обновление через useEnhancedHypotheses
          }
        }
      }

      // Создание системных связей
      createSystemConnections();
      
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error syncing system data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeHypotheses, currentWeekData, createSystemConnections]);

  // Автоматическая синхронизация при изменении данных
  useEffect(() => {
    if (appState.hasData) {
      syncSystemData();
    }
  }, [appState.hasData, currentWeekData, hypotheses.length, syncSystemData]);

  // Вычисление общего здоровья системы
  const systemHealth = useMemo(() => {
    const totalMetrics = unifiedMetrics.length;
    const healthyMetrics = unifiedMetrics.filter(m => m.currentValue >= 7).length;
    const activeExperiments = activeHypotheses.length;
    const successfulExperiments = hypotheses.filter(h => h.progress >= 70).length;
    
    const metricsScore = totalMetrics > 0 ? (healthyMetrics / totalMetrics) * 100 : 0;
    const experimentsScore = hypotheses.length > 0 ? (successfulExperiments / hypotheses.length) * 100 : 0;
    
    return {
      overall: Math.round((metricsScore + experimentsScore) / 2),
      metrics: Math.round(metricsScore),
      experiments: Math.round(experimentsScore),
      activeExperiments,
      totalConnections: systemConnections.length
    };
  }, [unifiedMetrics, activeHypotheses, hypotheses, systemConnections]);

  return {
    // Унифицированные данные
    unifiedMetrics,
    systemConnections,
    crossSectionAnalytics,
    systemHealth,
    
    // Рекомендации
    unifiedRecommendations: generateUnifiedRecommendations(),
    
    // Состояние
    isAnalyzing,
    hasData: appState.hasData,
    
    // Действия
    syncSystemData,
    createSystemConnections,
  };
};

// Вспомогательная функция для расчета корреляции между метриками
const calculateMetricCorrelation = (
  metric1Id: string, 
  metric2Id: string, 
  ratings: Record<string, WeeklyRating>
): number => {
  const ratingsList = Object.values(ratings)
    .filter(r => r.ratings[metric1Id] && r.ratings[metric2Id])
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (ratingsList.length < 3) return 0;

  const values1 = ratingsList.map(r => r.ratings[metric1Id]);
  const values2 = ratingsList.map(r => r.ratings[metric2Id]);

  return calculatePearsonCorrelation(values1, values2);
};

// Функция расчета корреляции Пирсона
const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n !== y.length || n < 3) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};
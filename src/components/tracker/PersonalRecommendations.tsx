import React, { useMemo, useEffect, useState } from 'react';
import { useAIInsights } from '@/hooks/useAIInsights';

interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface RecommendationData {
  week: string;
  [key: string]: any;
}

interface Recommendation {
  metric: string;
  icon: string;
  currentValue: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
  type: 'low_metric' | 'trend_decline' | 'ai_insight';
}

interface PersonalRecommendationsProps {
  metrics: Metric[];
  data: RecommendationData[];
  className?: string;
}

const PersonalRecommendations: React.FC<PersonalRecommendationsProps> = ({
  metrics,
  data,
  className = ""
}) => {
  const { insights, loading: aiLoading, generateInsights, hasApiKey } = useAIInsights();
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);
  const [showAI, setShowAI] = useState(false);

  const recommendationTemplates: Record<string, { low: string[]; medium: string[] }> = {
    'Спокойствие ума': { low: ['Попробуйте медитацию 10 минут в день', 'Ведите дневник благодарности'], medium: ['Добавьте прогулки на свежем воздухе'] },
    'Финансовая подушка': { low: ['Составьте план накоплений', 'Пересмотрите расходы'], medium: ['Увеличьте процент откладываемых средств'] },
    'Доход': { low: ['Развивайте профессиональные навыки', 'Ищите карьерный рост'], medium: ['Обсудите повышение с руководством'] },
    'Качество общения с женой': { low: ['Запланируйте время вдвоем', 'Выражайте благодарность чаще'], medium: ['Организуйте романтическое свидание'] },
    'Физическое здоровье': { low: ['Начните с 15-минутной зарядки', 'Пейте больше воды'], medium: ['Увеличьте интенсивность тренировок'] },
    'Социализация': { low: ['Свяжитесь со старыми друзьями', 'Посетите мероприятия'], medium: ['Организуйте встречу с друзьями'] },
    'Проявленность': { low: ['Поставьте 3 цели на месяц', 'Найдите ментора'], medium: ['Увеличьте видимость достижений'] },
    'Ментальное здоровье': { low: ['Практикуйте техники релаксации', 'Улучшите качество сна'], medium: ['Добавьте физическую активность'] },
  };

  useEffect(() => {
    if (insights.length > 0) {
      const aiRecs: Recommendation[] = insights.map(insight => ({
        metric: insight.metricId ? insight.title : 'AI Инсайт',
        icon: '🤖',
        currentValue: 0,
        priority: insight.confidence > 0.8 ? 'high' : insight.confidence > 0.6 ? 'medium' : 'low',
        action: insight.description + (insight.action ? ` ${insight.action}` : ''),
        type: 'ai_insight' as const
      }));
      setAiRecommendations(aiRecs);
    }
  }, [insights]);

  const handleGenerateAI = async () => {
    if (!hasApiKey) { setShowAI(true); return; }
    try {
      await generateInsights('dashboard', { weekData: data as any, goals: [], hypotheses: [], correlations: [] });
      setShowAI(true);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to generate AI insights:', error);
    }
  };

  const staticRecommendations = useMemo(() => {
    if (!data || data.length === 0) return [];
    const lastWeek = data[data.length - 1];
    const prevWeek = data.length > 1 ? data[data.length - 2] : null;
    const recs: Recommendation[] = [];

    metrics.forEach(metric => {
      const currentValue = lastWeek[metric.name];
      if (currentValue !== undefined && currentValue < 5) {
        const priority = currentValue < 3 ? 'high' : 'medium';
        const templates = recommendationTemplates[metric.name];
        if (templates) {
          const actionList = priority === 'high' ? templates.low : templates.medium || templates.low;
          recs.push({ metric: metric.name, icon: metric.icon, currentValue, priority, action: actionList[0], type: 'low_metric' });
        }
      }
    });

    if (prevWeek && lastWeek.overall && prevWeek.overall) {
      const drop = prevWeek.overall - lastWeek.overall;
      if (drop > 0.5) {
        recs.push({ metric: 'Общий индекс', icon: '📊', currentValue: lastWeek.overall, priority: 'high', action: 'Проанализируйте, что изменилось, и скорректируйте приоритеты', type: 'trend_decline' });
      }
    }

    return recs.sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.priority] - { high: 3, medium: 2, low: 1 }[a.priority])).slice(0, 3);
  }, [metrics, data]);

  const allRecommendations = useMemo(() => {
    const combined = [...staticRecommendations];
    if (showAI) combined.push(...aiRecommendations);
    return combined.slice(0, 3);
  }, [staticRecommendations, aiRecommendations, showAI]);

  // Empty state
  if (allRecommendations.length === 0 && !showAI) {
    return (
      <div className={`bg-card border border-border rounded-[10px] p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2.5">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            ✨ Персональные рекомендации
          </h4>
          {hasApiKey && (
            <button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
            >
              ✨ {aiLoading ? 'Анализ...' : 'AI Анализ'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 py-2">
          <span className="text-[28px]">🎉</span>
          <p className="text-[11px] text-muted-foreground">
            Отличная работа! У вас нет критичных областей для улучшения.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-[10px] p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          ✨ Персональные рекомендации
        </h4>
        {hasApiKey && !showAI && (
          <button
            onClick={handleGenerateAI}
            disabled={aiLoading}
            className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            ✨ {aiLoading ? 'Анализ...' : 'AI Анализ'}
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {allRecommendations.map((rec, index) => (
          <div
            key={`${rec.metric}-${index}`}
            className="flex items-start gap-2 p-2 rounded-md bg-muted/30"
          >
            <span className="text-sm shrink-0 mt-0.5">{rec.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-medium text-foreground truncate">{rec.metric}</span>
                {rec.type !== 'ai_insight' && (
                  <span className="text-[9px] font-semibold text-foreground/70">{rec.currentValue}/10</span>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">{rec.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalRecommendations;

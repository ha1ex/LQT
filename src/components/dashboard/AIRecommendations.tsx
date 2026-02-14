import React, { useState, useEffect } from 'react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface Recommendation {
  title: string;
  description: string;
  action: string;
  type: string;
  metricId?: string;
  tag?: string;
}

interface AIRecommendationsProps {
  allMetrics: Array<{ id: string; name: string; icon: string; category: string }>;
  currentWeekData: Record<string, unknown> | null;
  onOpenAIChat: () => void;
  onCreateHypothesis?: (metricId?: string) => void;
  onViewHypothesis?: (id: string) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  allMetrics,
  currentWeekData,
  onOpenAIChat,
  onCreateHypothesis,
  onViewHypothesis
}) => {
  const { smartRecommendations: _smartRecommendations, integratedMetrics, periodLabel } = useIntegratedData();
  const [currentIdx, setCurrentIdx] = useState(0);

  const weekNum = periodLabel?.match(/W\d+/)?.[0] || '';

  const generateRecommendations = (): Recommendation[] => {
    const recs: Recommendation[] = [];

    const problemMetrics = integratedMetrics
      .filter(metric => metric.currentValue > 0 && metric.currentValue <= 4)
      .sort((a, b) => a.currentValue - b.currentValue);

    const strongMetrics = integratedMetrics
      .filter(metric => metric.currentValue >= 8)
      .sort((a, b) => b.currentValue - a.currentValue);

    if (problemMetrics.length > 0) {
      const worst = problemMetrics[0];
      recs.push({
        title: worst.category === 'health'
          ? '🏃 Забота о здоровье'
          : worst.category === 'finance'
            ? '💰 Финансовая стабильность'
            : `🎯 Развитие: ${worst.name}`,
        description: worst.category === 'health'
          ? `${worst.name} можно улучшить. Начните с 15 минут в день.`
          : `Низкая оценка (${worst.currentValue}/10) требует системного подхода`,
        action: 'Начать сегодня →',
        type: 'create',
        metricId: worst.id,
        tag: '🎯 Стратегия',
      });
    }

    if (problemMetrics.length > 1) {
      const second = problemMetrics[1];
      recs.push({
        title: `📉 ${second.name}`,
        description: `Оценка ${second.currentValue}/10. Создайте эксперимент для улучшения этой области.`,
        action: 'Создать эксперимент →',
        type: 'create',
        metricId: second.id,
        tag: '🎯 Стратегия',
      });
    }

    if (strongMetrics.length > 0) {
      const best = strongMetrics[0];
      recs.push({
        title: '⭐ Используйте силу',
        description: `Ваша сила в ${best.name.toLowerCase()}. Как это поможет в других сферах?`,
        action: 'Исследовать →',
        type: 'leverage',
        metricId: best.id,
      });
    }

    if (recs.length === 0) {
      recs.push({
        title: '🤖 ИИ готов помочь',
        description: 'Расскажите о своих целях, и я дам персональные рекомендации.',
        action: 'Начать чат →',
        type: 'chat',
      });
    }

    return recs;
  };

  const recommendations = generateRecommendations();

  useEffect(() => {
    if (recommendations.length > 1) {
      const interval = setInterval(() => {
        setCurrentIdx(prev => (prev + 1) % recommendations.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [recommendations.length]);

  const rec = recommendations[currentIdx % recommendations.length];

  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      {/* Header */}
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          💡 Рекомендации ИИ
        </div>
        <div className="flex items-center gap-1.5">
          {weekNum && <span className="text-[9px] text-muted-foreground">{weekNum}</span>}
          {recommendations.length > 1 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
              {currentIdx + 1}/{recommendations.length}
            </span>
          )}
        </div>
      </div>

      {/* Recommendation card */}
      <div className="bg-muted/40 rounded-md p-2.5">
        <div className="flex justify-between items-start mb-1.5">
          <span className="text-[11px] font-medium text-foreground">{rec.title}</span>
          {rec.tag && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 shrink-0 ml-2">
              {rec.tag}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">
          {rec.description}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (rec.type === 'create' && onCreateHypothesis) {
                onCreateHypothesis(rec.metricId);
              } else {
                onOpenAIChat();
              }
            }}
            className="px-2 py-1 rounded text-[10px] bg-card border border-border text-foreground hover:bg-muted/50 transition-colors"
          >
            {rec.action}
          </button>
          {recommendations.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIdx(prev => (prev + 1) % recommendations.length);
              }}
              className="px-1.5 py-1 rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              🔄
            </button>
          )}
        </div>
      </div>

      {/* Footer link */}
      <button
        onClick={onOpenAIChat}
        className="text-primary text-[10px] mt-2 cursor-pointer hover:underline block"
      >
        Открыть ИИ чат
      </button>
    </div>
  );
};

export default AIRecommendations;

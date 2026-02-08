import React from 'react';

interface Insight {
  type: 'improvement' | 'decline' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  metric?: string;
  change?: number;
}

interface InsightsOfWeekProps {
  insights: Insight[];
  periodLabel: string;
  onViewAll: () => void;
}

const InsightsOfWeek: React.FC<InsightsOfWeekProps> = ({ insights, periodLabel, onViewAll }) => {
  const weekNum = periodLabel?.match(/W\d+/)?.[0] || '';

  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          💡 Инсайты недели
        </h4>
        {weekNum && (
          <span className="text-[9px] text-muted-foreground">{weekNum}</span>
        )}
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-xl mb-2 opacity-50">💡</div>
          <p className="text-[10px] text-muted-foreground">Недостаточно данных для инсайтов</p>
        </div>
      ) : (
        <div className="space-y-0">
          {insights.slice(0, 3).map((insight, index) => {
            const ins = typeof insight === 'string' ? { description: insight } : insight;
            return (
              <div
                key={index}
                className="py-1.5 border-b border-border last:border-b-0 text-[10px] text-muted-foreground leading-relaxed"
              >
                {ins.metric && (
                  <span className="text-foreground font-medium">{ins.metric}: </span>
                )}
                {ins.description || ins.title || ''}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={onViewAll}
        className="w-full mt-2 py-1.5 text-[10px] text-muted-foreground border border-border rounded-[5px] hover:bg-muted/50 transition-colors"
      >
        Все инсайты →
      </button>
    </div>
  );
};

export default InsightsOfWeek;

import React from 'react';

interface TrendItem {
  name: string;
  icon: string;
  category: string;
  change: number;
}

interface TrendsPanelProps {
  trends: TrendItem[];
}

const TrendsPanel: React.FC<TrendsPanelProps> = ({ trends }) => {
  // Show top significant changes (both positive and negative)
  const sorted = [...trends]
    .filter(t => t.change !== 0)
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 5);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold flex items-center gap-2">
          📈 Тренды недели
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {sorted.map(t => {
          const isUp = t.change >= 0;
          return (
            <div
              key={t.name}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-[10px]"
            >
              <span className="text-lg shrink-0">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{t.name}</div>
                <div className="text-[11px] text-muted-foreground">{t.category}</div>
              </div>
              <span
                className={`text-base font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                  isUp
                    ? 'text-emerald-500 bg-emerald-500/15'
                    : 'text-red-500 bg-red-500/15'
                }`}
              >
                {isUp ? '+' : ''}{t.change.toFixed(1)}
              </span>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">
            Нет изменений за неделю
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsPanel;

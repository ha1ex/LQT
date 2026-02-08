import React, { useState } from 'react';

interface RankingMetric {
  name: string;
  icon: string;
  value: number;
  change: number;
}

interface RankingPanelProps {
  metrics: RankingMetric[];
}

const getBarColor = (v: number) => {
  if (v >= 7) return '#10b981';
  if (v >= 4) return '#f59e0b';
  return '#ef4444';
};

const getValueColorClass = (v: number) => {
  if (v >= 7) return 'text-emerald-500';
  if (v >= 4) return 'text-yellow-500';
  return 'text-red-500';
};

type TabType = 'best' | 'worst' | 'growth';

const RankingPanel: React.FC<RankingPanelProps> = ({ metrics }) => {
  const [tab, setTab] = useState<TabType>('best');

  const sorted = [...metrics];
  if (tab === 'best') sorted.sort((a, b) => b.value - a.value);
  else if (tab === 'worst') sorted.sort((a, b) => a.value - b.value);
  else sorted.sort((a, b) => b.change - a.change);

  const top5 = sorted.slice(0, 5);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'best', label: 'Лучшие' },
    { id: 'worst', label: 'Худшие' },
    { id: 'growth', label: 'Рост' },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold flex items-center gap-2">
          🏅 Рейтинг критериев
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-background p-1 rounded-[10px]">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
              tab === t.id
                ? 'bg-muted/80 text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-2">
        {top5.map((m, idx) => {
          const barColor = getBarColor(m.value);
          const displayValue = tab === 'growth'
            ? `${m.change >= 0 ? '+' : ''}${m.change.toFixed(1)}`
            : m.value.toFixed(1);
          const valueClass = tab === 'growth'
            ? m.change >= 0 ? 'text-emerald-500' : 'text-red-500'
            : getValueColorClass(m.value);

          return (
            <div
              key={m.name}
              className="flex items-center gap-3 p-3 bg-muted/50 rounded-[10px] transition-transform duration-200 hover:translate-x-1"
            >
              <span className="w-6 h-6 bg-background rounded-md flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0">
                {idx + 1}
              </span>
              <span className="text-lg shrink-0">{m.icon}</span>
              <span className="text-[13px] font-medium flex-1 truncate">{m.name}</span>
              <div className="w-20 h-1.5 bg-background rounded-full overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(Math.max(0, m.value) / 10) * 100}%`,
                    background: barColor,
                  }}
                />
              </div>
              <span className={`text-sm font-bold min-w-[36px] text-right ${valueClass}`}>
                {displayValue}
              </span>
            </div>
          );
        })}
        {top5.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">
            Нет данных
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPanel;

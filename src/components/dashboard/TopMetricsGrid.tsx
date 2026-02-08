import React from 'react';

interface TopMetric {
  id: string;
  name: string;
  icon: string;
  category: string;
  value: number;
  change: number;
}

interface TopMetricsGridProps {
  topMetrics: TopMetric[];
  onMetricClick: (metricName: string) => void;
}

const categoryLabels: Record<string, string> = {
  mental: '◎ Ментальное',
  health: '💪 Здоровье',
  finance: '↗ Финансы',
  relationships: '◇ Отношения',
  social: '👥 Социальное',
  personal: '◎ Развитие',
  lifestyle: '✦ Стиль жизни',
};

const TopMetricsGrid: React.FC<TopMetricsGridProps> = ({ topMetrics, onMetricClick }) => {
  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <h4 className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
        📈 Лучшие метрики
      </h4>
      <div className="grid grid-cols-2 gap-1.5">
        {topMetrics.slice(0, 6).map(metric => (
          <div
            key={metric.id}
            onClick={() => onMetricClick(metric.name)}
            className="flex items-center gap-1.5 py-1.5 px-2 rounded-md bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
          >
            <span className="text-sm shrink-0">{metric.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-medium text-foreground truncate">{metric.name}</div>
              <div className="text-[9px] text-muted-foreground">
                {categoryLabels[metric.category] || metric.category}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[13px] font-bold text-foreground">{metric.value.toFixed(1)}</div>
              <div
                className={`text-[9px] font-semibold ${
                  metric.change > 0
                    ? 'text-green-500'
                    : metric.change < 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                }`}
              >
                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMetricsGrid;

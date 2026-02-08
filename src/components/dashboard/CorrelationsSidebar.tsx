import React from 'react';

interface CorrelationItem {
  metric: string;
  correlation: number;
  strength: 'strong' | 'moderate' | 'weak';
}

interface MetricInfo {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface CorrelationsSidebarProps {
  correlations: CorrelationItem[];
  allMetrics: MetricInfo[];
  title?: string;
}

const CorrelationsSidebar: React.FC<CorrelationsSidebarProps> = ({
  correlations,
  allMetrics,
  title = '🔗 Ваши инсайты',
}) => {
  const getIcon = (name: string): string => {
    const m = allMetrics.find(
      metric => metric.name === name || name.includes(metric.name),
    );
    return m?.icon || '📊';
  };

  const parsePair = (metricStr: string) => {
    const parts = metricStr.split(' ↔ ');
    if (parts.length === 2) {
      return { name1: parts[0], name2: parts[1], icon1: getIcon(parts[0]), icon2: getIcon(parts[1]) };
    }
    return { name1: metricStr, name2: '', icon1: '📊', icon2: '📊' };
  };

  if (!correlations || correlations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-[10px] p-3 h-full">
        <h4 className="text-xs font-semibold text-foreground mb-2.5">{title}</h4>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-2xl mb-2 opacity-50">🔍</div>
          <p className="text-[10px] text-muted-foreground">Недостаточно данных для анализа</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[10px] p-3 h-full">
      <h4 className="text-xs font-semibold text-foreground mb-2.5">{title}</h4>
      <div className="space-y-1.5">
        {correlations.slice(0, 3).map((corr, i) => {
          const { name1, name2, icon1, icon2 } = parsePair(corr.metric);
          const pct = Math.round(Math.abs(corr.correlation) * 100);
          const isPositive = corr.correlation > 0;

          return (
            <div key={i} className="bg-muted/30 rounded-md p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1 text-xs">
                  <span>{icon1}</span>
                  <span className="text-[9px] text-muted-foreground">⇄</span>
                  <span>{icon2}</span>
                </div>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    isPositive
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'bg-red-500/10 text-red-500 dark:text-red-400'
                  }`}
                >
                  {isPositive ? '↗' : '↘'} {pct}%
                </span>
              </div>
              <div className="text-[10px] text-foreground/80 truncate">
                {name1} ↔ {name2}
              </div>
              <div className="text-[9px] text-muted-foreground">
                {isPositive ? 'Взаимосвязаны' : 'Обратная связь'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CorrelationsSidebar;

import React, { useMemo } from 'react';

interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface InsightData {
  week: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic metric keys
  [key: string]: any;
}

interface Correlation {
  metric1: string;
  metric2: string;
  icon1: string;
  icon2: string;
  correlation: number;
  percentage: number;
  type: 'positive' | 'negative';
  description: string;
}

interface PersonalInsightsProps {
  metrics: Metric[];
  data: InsightData[];
  className?: string;
}

const PersonalInsights: React.FC<PersonalInsightsProps> = ({
  metrics,
  data,
  className = ""
}) => {
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
    const sumYY = y.reduce((total, yi) => total + yi * yi, 0);
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    return denominator === 0 ? 0 : Math.max(-1, Math.min(1, numerator / denominator));
  };

  const correlations = useMemo(() => {
    if (!data || data.length < 4) return [];
    const pairs: Correlation[] = [];

    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const m1 = metrics[i], m2 = metrics[j];
        const v1 = data.map(w => w[m1.name]).filter(v => v !== undefined);
        const v2 = data.map(w => w[m2.name]).filter(v => v !== undefined);

        if (v1.length >= 4 && v2.length >= 4) {
          const corr = calculatePearsonCorrelation(v1, v2);
          if (Math.abs(corr) > 0.6) {
            pairs.push({
              metric1: m1.name, metric2: m2.name,
              icon1: m1.icon, icon2: m2.icon,
              correlation: corr, percentage: Math.round(Math.abs(corr) * 100),
              type: corr > 0 ? 'positive' : 'negative',
              description: corr > 0 ? 'Взаимосвязаны' : 'Обратная связь'
            });
          }
        }
      }
    }

    return pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)).slice(0, 3);
  }, [metrics, data]);

  // Empty / not enough data
  if (data.length < 4 || correlations.length === 0) {
    return (
      <div className={`bg-card border border-border rounded-[10px] p-3 ${className}`}>
        <h4 className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
          🔗 Ваши инсайты
        </h4>
        <div className="text-center py-4">
          <div className="text-xl mb-1.5 opacity-50">{data.length < 4 ? '🔍' : '📊'}</div>
          <p className="text-[10px] text-muted-foreground">
            {data.length < 4
              ? 'Требуется минимум 4 недели данных'
              : 'Пока нет значимых взаимосвязей'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-[10px] p-3 ${className}`}>
      <h4 className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
        🔗 Ваши инсайты
      </h4>

      <div className="space-y-1.5">
        {correlations.map((corr, _index) => (
          <div
            key={`${corr.metric1}-${corr.metric2}`}
            className="bg-muted/30 rounded-md p-2"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1 text-xs">
                <span>{corr.icon1}</span>
                <span className="text-[9px] text-muted-foreground">⇄</span>
                <span>{corr.icon2}</span>
              </div>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                corr.type === 'positive'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {corr.type === 'positive' ? '↗' : '↘'} {corr.percentage}%
              </span>
            </div>
            <div className="text-[10px] text-foreground/80 truncate">
              {corr.metric1} ↔ {corr.metric2}
            </div>
            <div className="text-[9px] text-muted-foreground">
              {corr.description}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 p-1.5 bg-muted/20 rounded text-center">
        <p className="text-[9px] text-muted-foreground">
          💡 Ключевые инсайты:
          {correlations.length > 0 && ` Самая сильная связь: ${correlations[0].metric1} ↔ ${correlations[0].metric2} (${correlations[0].percentage}%)`}
        </p>
      </div>
    </div>
  );
};

export default PersonalInsights;

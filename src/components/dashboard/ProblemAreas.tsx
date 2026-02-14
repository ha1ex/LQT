import React from 'react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface ProblemAreasProps {
  allMetrics: Array<{ id: string; name: string; icon: string; category: string }>;
  currentWeekData: Record<string, unknown> | null;
  onMetricClick: (metricId: string) => void;
  onCreateHypothesis?: (metricId?: string) => void;
}

const ProblemAreas: React.FC<ProblemAreasProps> = ({
  allMetrics: _allMetrics,
  currentWeekData: _currentWeekData,
  onMetricClick,
  onCreateHypothesis: _onCreateHypothesis
}) => {
  const { integratedMetrics, periodLabel } = useIntegratedData();

  const problemMetrics = integratedMetrics
    .filter(metric => metric.currentValue > 0 && metric.currentValue <= 4)
    .sort((a, b) => a.currentValue - b.currentValue)
    .slice(0, 2);

  const weekNum = periodLabel?.match(/W\d+/)?.[0] || '';

  const getScoreColor = (val: number) => {
    if (val <= 2) return 'bg-red-500/15 text-red-500';
    if (val <= 4) return 'bg-orange-500/15 text-orange-500';
    return 'bg-yellow-500/15 text-yellow-500';
  };

  if (problemMetrics.length === 0) {
    return (
      <div className="bg-card border border-border rounded-[10px] p-3">
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            ⚠️ Проблемные зоны
          </div>
          {weekNum && <span className="text-[9px] text-muted-foreground">{weekNum}</span>}
        </div>
        <div className="text-center py-5">
          <p className="text-[11px] text-muted-foreground">🎉 Все метрики выше 4 баллов</p>
          <p className="text-[10px] text-muted-foreground mt-1">Отличная работа!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          ⚠️ Проблемные зоны
        </div>
        {weekNum && <span className="text-[9px] text-muted-foreground">{weekNum}</span>}
      </div>

      <div className="space-y-1.5">
        {problemMetrics.map((metric) => (
          <div
            key={metric.id}
            onClick={() => onMetricClick(metric.id)}
            className="flex items-center gap-2 px-2 py-2 bg-muted/40 rounded-md text-[11px] cursor-pointer hover:bg-muted/60 transition-colors"
          >
            <span className="text-xs shrink-0">📉</span>
            <span className="flex-1 text-foreground truncate">{metric.name}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getScoreColor(metric.currentValue)}`}>
              {metric.currentValue}/10
            </span>
            <span className="text-primary text-[10px]">→</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onMetricClick('analytics')}
        className="w-full mt-2 py-1.5 text-[10px] text-muted-foreground border border-border rounded-[5px] hover:bg-muted/50 transition-colors"
      >
        Подробный анализ
      </button>
    </div>
  );
};

export default ProblemAreas;

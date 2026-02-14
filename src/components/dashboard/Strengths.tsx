import React from 'react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface StrengthsProps {
  allMetrics: Array<{ id: string; name: string; icon: string; category: string }>;
  currentWeekData: Record<string, unknown> | null;
  onMetricClick: (metricId: string) => void;
  onCreateHypothesis?: (metricId?: string) => void;
}

const Strengths: React.FC<StrengthsProps> = ({
  allMetrics: _allMetrics,
  currentWeekData: _currentWeekData,
  onMetricClick,
  onCreateHypothesis: _onCreateHypothesis
}) => {
  const { integratedMetrics, periodLabel } = useIntegratedData();

  const strongMetrics = integratedMetrics
    .filter(metric => metric.currentValue >= 8)
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  const weekNum = periodLabel?.match(/W\d+/)?.[0] || '';

  if (strongMetrics.length === 0) {
    return (
      <div className="bg-card border border-border rounded-[10px] p-3">
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            ⭐ Сильные стороны
          </div>
          {weekNum && <span className="text-[9px] text-muted-foreground">{weekNum}</span>}
        </div>
        <div className="text-center py-5 px-2.5">
          <p className="text-[11px] text-muted-foreground">
            Пока нет метрик с оценкой 8+
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            Продолжайте работать над улучшением!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          ⭐ Сильные стороны
        </div>
        {weekNum && <span className="text-[9px] text-muted-foreground">{weekNum}</span>}
      </div>

      <div className="space-y-1.5">
        {strongMetrics.map((metric) => (
          <div
            key={metric.id}
            onClick={() => onMetricClick(metric.id)}
            className="flex items-center gap-2 px-2 py-2 bg-green-500/10 rounded-md text-[11px] cursor-pointer hover:bg-green-500/20 transition-colors"
          >
            <span className="text-xs shrink-0">{metric.icon}</span>
            <span className="flex-1 text-foreground truncate">{metric.name}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-500/15 text-green-500">
              {metric.currentValue}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Strengths;

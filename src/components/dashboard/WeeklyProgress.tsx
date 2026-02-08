import React from 'react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface WeeklyProgressProps {
  mockData: any[];
  onViewHistory: () => void;
  onCreateHypothesis?: (metricId?: string) => void;
  onViewStrategy?: () => void;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  mockData,
  onViewHistory,
}) => {
  const { activeHypotheses, periodLabel } = useIntegratedData();

  const lastFourWeeks = mockData.slice(-4);
  const currentWeek = lastFourWeeks[lastFourWeeks.length - 1];
  const previousWeek = lastFourWeeks[lastFourWeeks.length - 2];
  const weekNum = periodLabel?.match(/W\d+/)?.[0] || '';

  if (!currentWeek || !previousWeek) {
    return (
      <div className="bg-card border border-border rounded-[10px] p-3">
        <div className="flex justify-between items-start mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            📊 Еженедельный прогресс
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">Недостаточно данных</p>
      </div>
    );
  }

  const currentScore = currentWeek.overall || 0;
  const previousScore = previousWeek.overall || 0;
  const change = currentScore - previousScore;
  const changePercent = previousScore !== 0 ? (change / previousScore * 100) : 0;
  const progressWidth = Math.min(100, Math.max(0, currentScore * 10));

  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          📊 Еженедельный прогресс
        </div>
        {weekNum && <span className="text-[9px] text-muted-foreground">{weekNum}</span>}
      </div>

      {/* Score row */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[28px] font-bold text-foreground leading-none">
          {currentScore.toFixed(1)}
        </span>
        <span className="text-[10px] text-muted-foreground">Текущий балл</span>
        <span className={`text-[11px] font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)} {change >= 0 ? '↑' : '↓'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-300"
          style={{ width: `${progressWidth}%` }}
        />
      </div>

      {/* Meta row */}
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>
          {change >= 0 ? '📈' : '📉'} {Math.abs(changePercent).toFixed(0)}% за неделю
        </span>
        <span>◉ {activeHypotheses.length} активных</span>
      </div>

      {/* Link */}
      <button
        onClick={onViewHistory}
        className="text-primary text-[10px] mt-1.5 cursor-pointer hover:underline block"
      >
        История оценок
      </button>
    </div>
  );
};

export default WeeklyProgress;

import React from 'react';

interface CorrelationItem {
  metric1: string;
  icon1: string;
  metric2: string;
  icon2: string;
  text: string;
  percentage: number;
}

interface CorrelationsPanelProps {
  correlations: CorrelationItem[];
}

const CorrelationsPanel: React.FC<CorrelationsPanelProps> = ({ correlations }) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold flex items-center gap-2">
          🔗 Корреляции
        </h3>
      </div>

      <div className="flex flex-col gap-2">
        {correlations.map((c, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 bg-muted/50 rounded-[10px]"
          >
            <div className="flex items-center gap-1.5 text-base shrink-0">
              <span>{c.icon1}</span>
              <span className="text-xs text-muted-foreground">⇄</span>
              <span>{c.icon2}</span>
            </div>
            <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
              {c.text}
            </span>
            <span className="px-2.5 py-1.5 rounded-lg text-[13px] font-semibold bg-emerald-500/15 text-emerald-500 shrink-0">
              {c.percentage}%
            </span>
          </div>
        ))}
        {correlations.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-6">
            Недостаточно данных для корреляций
          </div>
        )}
      </div>
    </div>
  );
};

export default CorrelationsPanel;

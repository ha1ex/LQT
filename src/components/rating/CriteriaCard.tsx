import React from "react";

interface CriteriaCardProps {
  metricId: string;
  name: string;
  icon: string;
  category: string;
  value: number | undefined;
  onRate: (metricId: string, value: number) => void;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({
  metricId,
  name,
  icon,
  category,
  value,
  onRate,
}) => {
  const isRated = value !== undefined;

  const getValueColor = () => {
    if (!isRated) return "text-muted-foreground";
    if (value >= 7) return "text-emerald-500";
    if (value >= 4) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div
      className={`rounded-lg p-2 sm:p-3 border transition-colors ${
        isRated
          ? "border-blue-500/30 bg-gradient-to-br from-card to-blue-500/5"
          : "bg-card border-border"
      } hover:border-muted-foreground/50`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0">{icon}</span>
          <span className="text-[13px] font-medium truncate">{name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            {category}
          </span>
          <span className={`text-[13px] font-semibold ${getValueColor()}`}>
            {isRated ? `${value}/10` : "—"}
          </span>
        </div>
      </div>

      {/* Rating scale */}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const isSelected = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onRate(metricId, n)}
              className={`w-full aspect-square min-h-[28px] rounded-md text-[11px] font-medium border transition-colors ${
                isSelected
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-secondary border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CriteriaCard;

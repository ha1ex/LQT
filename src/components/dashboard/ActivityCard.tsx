import React from 'react';

interface ActivityCardProps {
  monthlyCount: number;
  currentStreak: number;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ monthlyCount, currentStreak }) => {
  return (
    <div className="bg-card border border-border rounded-[10px] p-3">
      <h4 className="text-xs font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
        📊 Активность
      </h4>
      <div className="space-y-1.5 text-[11px] text-muted-foreground">
        <div>
          Оценок за месяц:{' '}
          <strong className="text-foreground">{monthlyCount}</strong>
        </div>
        <div>
          Стрик:{' '}
          <strong className="text-green-500">
            {currentStreak} {currentStreak === 1 ? 'неделя' : currentStreak < 5 ? 'недели' : 'недель'}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;

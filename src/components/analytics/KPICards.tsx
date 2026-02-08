import React from 'react';

interface KPICardsProps {
  currentIndex: number;
  bestWeekScore: number;
  bestWeekDate: string;
  totalMetrics: number;
  totalWeeks: number;
}

const KPICards: React.FC<KPICardsProps> = ({
  currentIndex,
  bestWeekScore,
  bestWeekDate,
  totalMetrics,
  totalWeeks,
}) => {
  const cards = [
    {
      icon: '📊',
      colorClass: 'bg-blue-500/15',
      label: 'Общий индекс',
      value: currentIndex > 0 ? currentIndex.toFixed(1) : '—',
      sub: 'текущая неделя',
    },
    {
      icon: '🏆',
      colorClass: 'bg-emerald-500/15',
      label: 'Лучшая неделя',
      value: bestWeekScore > 0 ? bestWeekScore.toFixed(1) : '—',
      sub: bestWeekDate || '',
    },
    {
      icon: '📋',
      colorClass: 'bg-yellow-500/15',
      label: 'Оценено метрик',
      value: String(totalMetrics),
      sub: 'активных',
    },
    {
      icon: '📅',
      colorClass: 'bg-purple-500/15',
      label: 'Всего недель',
      value: String(totalWeeks),
      sub: 'с данными',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:border-blue-500 hover:-translate-y-0.5 cursor-default"
        >
          <div
            className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-2xl shrink-0 ${card.colorClass}`}
          >
            {card.icon}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] text-muted-foreground">{card.label}</div>
            <div className="text-[28px] font-bold leading-tight">{card.value}</div>
            <div className="text-xs text-muted-foreground/70">{card.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;

import React from 'react';

interface CategoryData {
  key: string;
  name: string;
  icon: string;
  score: number;
  count: number;
}

interface CategoriesSectionProps {
  categories: CategoryData[];
  activeCategory: string;
  onCategoryClick: (key: string) => void;
}

const getScoreColorClass = (score: number) => {
  if (score >= 7) return 'text-emerald-500';
  if (score >= 4) return 'text-yellow-500';
  return 'text-red-500';
};

const CategoriesSection: React.FC<CategoriesSectionProps> = ({
  categories,
  activeCategory,
  onCategoryClick,
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Области жизни</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:overflow-visible">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => onCategoryClick(isActive ? 'all' : cat.key)}
              className={`flex flex-col items-center p-3 sm:p-4 rounded-[14px] text-center cursor-pointer transition-all duration-200 border-2 min-w-[100px] shrink-0 sm:min-w-0 sm:shrink ${
                isActive
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-transparent bg-muted/50 hover:border-border hover:-translate-y-0.5'
              }`}
            >
              <div className="text-[28px] mb-2">{cat.icon}</div>
              <div className={`text-[22px] font-bold mb-1 ${getScoreColorClass(cat.score)}`}>
                {cat.score > 0 ? cat.score.toFixed(1) : '—'}
              </div>
              <div className="text-xs text-muted-foreground">{cat.name}</div>
              <div className="text-[11px] text-muted-foreground/70">{cat.count} метрик</div>
            </button>
          );
        })}
      </div>
      {/* Active filter indicator */}
      {activeCategory !== 'all' && (
        <div className="mt-3 flex items-center justify-between p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/20">
          <span className="text-xs font-medium text-blue-500">
            Фильтр: {categories.find(c => c.key === activeCategory)?.name}
          </span>
          <button
            onClick={() => onCategoryClick('all')}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;

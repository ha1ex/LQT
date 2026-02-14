import React from 'react';
import { Heart, Brain, TrendingUp, Users, Target, Sparkles } from 'lucide-react';

const categoryConfig = {
  health: { icon: Heart, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Здоровье' },
  mental: { icon: Brain, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Ментальное' },
  finance: { icon: TrendingUp, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Финансы' },
  relationships: { icon: Heart, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Отношения' },
  social: { icon: Users, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Социальное' },
  personal: { icon: Target, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Развитие' },
  lifestyle: { icon: Sparkles, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Lifestyle' },
  custom: { icon: Target, color: 'text-muted-foreground', bg: 'bg-muted border-border', name: 'Пользовательское' }
};

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'sm' }) => {
  const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.custom;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${config.bg} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${config.color}`} />
      <span className={`font-medium ${config.color}`}>{config.name}</span>
    </div>
  );
};

export default CategoryBadge;
import React from 'react';
import { Heart, Brain, TrendingUp, Users, Target, Sparkles } from 'lucide-react';

const categoryConfig = {
  health: { icon: Heart, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Здоровье' },
  mental: { icon: Brain, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Ментальное' },
  finance: { icon: TrendingUp, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Финансы' },
  relationships: { icon: Heart, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Отношения' },
  social: { icon: Users, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Социальное' },
  personal: { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Развитие' },
  lifestyle: { icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Lifestyle' },
  custom: { icon: Target, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200', name: 'Пользовательское' }
};

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'sm' }) => {
  const config = categoryConfig[category] || categoryConfig.custom;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${config.bg} ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${config.color}`} />
      <span className={`font-medium ${config.color}`}>{config.name}</span>
    </div>
  );
};

export default CategoryBadge;
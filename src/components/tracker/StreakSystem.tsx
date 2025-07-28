import React from 'react';
import { Flame, Calendar, Trophy, Target } from 'lucide-react';

interface StreakSystemProps {
  currentStreak: number;
  bestStreak: number;
  weeklyGoal: number;
  completedThisWeek: number;
}

const StreakSystem: React.FC<StreakSystemProps> = ({ 
  currentStreak, 
  bestStreak, 
  weeklyGoal, 
  completedThisWeek 
}) => {
  const weeklyProgress = (completedThisWeek / weeklyGoal) * 100;
  
  return (
    <div className="bg-card rounded-3xl p-6 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold">Активность</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-200">
          <div className="text-2xl font-bold text-orange-600 mb-1">{currentStreak}</div>
          <div className="text-sm text-orange-600 font-medium">Текущий стрик</div>
        </div>
        <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div className="text-2xl font-bold text-amber-600 mb-1">{bestStreak}</div>
          <div className="text-sm text-amber-600 font-medium">Лучший стрик</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Цель на неделю</span>
          <span className="font-bold text-primary">{completedThisWeek}/{weeklyGoal}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
          />
        </div>
        {weeklyProgress >= 100 && (
          <div className="flex items-center gap-2 text-sm text-success font-medium">
            <Trophy className="w-4 h-4" />
            Недельная цель достигнута!
          </div>
        )}
      </div>
    </div>
  );
};

export default StreakSystem;
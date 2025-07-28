import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Zap, Calendar, BookOpen, Target, TrendingUp } from 'lucide-react';
import { EnhancedHypothesis } from '@/types/strategy';

interface QuickActionsProps {
  hypothesis: EnhancedHypothesis;
  onRateWeek?: () => void;
  onAddJournal?: () => void;
  onViewAnalytics?: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  hypothesis, 
  onRateWeek, 
  onAddJournal, 
  onViewAnalytics 
}) => {
  // Определяем следующие действия на основе состояния гипотезы
  const getNextActions = () => {
    const actions = [];
    
    // Проверяем, есть ли неоцененные недели
    const unratedWeeks = hypothesis.weeklyProgress?.filter(w => w.rating === 0) || [];
    
    if (unratedWeeks.length > 0) {
      actions.push({
        icon: Calendar,
        label: 'Оценить неделю',
        description: `${unratedWeeks.length} недель не оценены`,
        onClick: onRateWeek,
        variant: 'default' as const,
        urgent: true
      });
    }
    
    // Проверяем журнал записей
    const recentEntries = hypothesis.journal?.filter(entry => {
      const daysSinceEntry = (Date.now() - entry.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceEntry <= 7;
    }) || [];
    
    if (recentEntries.length === 0) {
      actions.push({
        icon: BookOpen,
        label: 'Добавить запись',
        description: 'Нет записей за последнюю неделю',
        onClick: onAddJournal,
        variant: 'outline' as const,
        urgent: false
      });
    }
    
    // Предлагаем аналитику если есть данные
    const ratedWeeks = hypothesis.weeklyProgress?.filter(w => w.rating > 0) || [];
    if (ratedWeeks.length >= 3) {
      actions.push({
        icon: TrendingUp,
        label: 'Посмотреть тренды',
        description: 'Доступна аналитика',
        onClick: onViewAnalytics,
        variant: 'outline' as const,
        urgent: false
      });
    }
    
    return actions;
  };

  const nextActions = getNextActions();

  return (
    <Card className="border-dashed border-primary/30">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">Быстрые действия</h3>
        </div>
        
        {nextActions.length > 0 ? (
          <div className="space-y-3">
            {nextActions.map((action, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  action.urgent ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.urgent ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">{action.label}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </div>
                
                <Button 
                  variant={action.variant} 
                  size="sm"
                  onClick={action.onClick}
                  className="hover:scale-105 transition-transform"
                >
                  {action.urgent && <Plus className="h-3 w-3 mr-1" />}
                  Действие
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Всё в порядке!</p>
            <p className="text-sm">Нет срочных действий для выполнения</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Target, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface GoalData {
  week: string;
  [key: string]: any;
}

interface Goal {
  id: string;
  metricName: string;
  metricIcon: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}

interface PersonalGoalsProps {
  metrics: Metric[];
  data: GoalData[];
  className?: string;
}

const PersonalGoals: React.FC<PersonalGoalsProps> = ({ 
  metrics, 
  data,
  className = "" 
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('');

  // Загрузка целей из localStorage при монтировании
  useEffect(() => {
    const savedGoals = localStorage.getItem('lqt_goals');
    if (savedGoals) {
      try {
        setGoals(JSON.parse(savedGoals));
      } catch (error) {
        if (import.meta.env.DEV) console.error('Error loading goals:', error);
      }
    }
  }, []);

  // Сохранение целей в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('lqt_goals', JSON.stringify(goals));
  }, [goals]);

  // Обновление текущих значений целей при изменении данных
  useEffect(() => {
    if (data.length > 0) {
      const lastWeek = data[data.length - 1];
      
      setGoals(prevGoals => 
        prevGoals.map(goal => {
          const currentValue = lastWeek[goal.metricName] || goal.currentValue;
          const progress = Math.min(100, Math.round((currentValue / goal.targetValue) * 100));
          const isCompleted = currentValue >= goal.targetValue;
          
          return {
            ...goal,
            currentValue,
            progress,
            isCompleted
          };
        })
      );
    }
  }, [data]);

  const addGoal = () => {
    if (!selectedMetric || !targetValue) return;

    const metric = metrics.find(m => m.name === selectedMetric);
    if (!metric) return;

    const target = parseInt(targetValue);
    if (target < 1 || target > 10) return;

    // Получаем текущее значение из последних данных
    const currentValue = data.length > 0 ? (data[data.length - 1][selectedMetric] || 0) : 0;
    const progress = Math.min(100, Math.round((currentValue / target) * 100));

    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      metricName: selectedMetric,
      metricIcon: metric.icon,
      targetValue: target,
      currentValue,
      progress,
      isCompleted: currentValue >= target,
      createdAt: new Date().toISOString()
    };

    setGoals(prev => [...prev, newGoal]);
    setSelectedMetric('');
    setTargetValue('');
    setIsAdding(false);
  };

  const removeGoal = (goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const getProgressTextColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600';
    if (progress >= 75) return 'text-blue-600';
    if (progress >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Фильтруем метрики, для которых уже нет активных целей
  const availableMetrics = metrics.filter(metric => 
    !goals.some(goal => goal.metricName === metric.name)
  );

  return (
    <Card className={`card-modern animate-fade-in ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-gray-600" />
            Ваши цели
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding || availableMetrics.length === 0}
            className="btn-modern text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Форма добавления цели */}
        {isAdding && (
          <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Метрика</label>
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите метрику" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMetrics.map(metric => (
                      <SelectItem key={metric.id} value={metric.name}>
                        <div className="flex items-center gap-2">
                          <span>{metric.icon}</span>
                          <span>{metric.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Цель (1-10)</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="Целевое значение"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addGoal} size="sm" disabled={!selectedMetric || !targetValue}>
                Создать цель
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)} size="sm">
                Отмена
              </Button>
            </div>
          </div>
        )}

        {/* Список целей */}
        {goals.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-muted-foreground mb-2">
              У вас пока нет активных целей
            </p>
            <p className="text-sm text-muted-foreground">
              Поставьте первую цель, чтобы отслеживать прогресс
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div
                key={goal.id}
                className="p-4 border rounded-lg bg-background hover:shadow-md transition-all duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{goal.metricIcon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{goal.metricName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Прогресс:</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getProgressTextColor(goal.progress)}`}
                        >
                          {goal.isCompleted ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Circle className="w-3 h-3 mr-1" />
                          )}
                          {goal.progress}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {goal.currentValue}/{goal.targetValue}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress 
                    value={goal.progress} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Начальное: 0</span>
                    <span className={getProgressTextColor(goal.progress)}>
                      {goal.isCompleted ? '✅ Цель достигнута!' : `Осталось: ${goal.targetValue - goal.currentValue}`}
                    </span>
                    <span>Цель: {goal.targetValue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Кнопка управления целями */}
        {goals.length > 0 && (
          <div className="mt-4 p-3 bg-muted/20 rounded-lg text-center">
            <p className="text-xs text-muted-foreground mb-2">
              💡 Цели автоматически обновляются при каждой новой оценке недели
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>🎯 Активных целей: {goals.length}</span>
              <span>✅ Достигнуто: {goals.filter(g => g.isCompleted).length}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalGoals;
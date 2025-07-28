import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, Zap } from 'lucide-react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface WeeklyProgressProps {
  mockData: any[];
  onViewHistory: () => void;
  onCreateHypothesis?: (metricId?: string) => void;
  onViewStrategy?: () => void;
}

const WeeklyProgress: React.FC<WeeklyProgressProps> = ({ 
  mockData, 
  onViewHistory,
  onCreateHypothesis,
  onViewStrategy
}) => {
  // Get integrated strategy data
  const { activeHypotheses, strategyMetrics, integratedMetrics } = useIntegratedData();
  // Берем последние 4 недели для анализа тренда
  const lastFourWeeks = mockData.slice(-4);
  const currentWeek = lastFourWeeks[lastFourWeeks.length - 1];
  const previousWeek = lastFourWeeks[lastFourWeeks.length - 2];
  
  if (!currentWeek || !previousWeek) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Еженедельный прогресс
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Недостаточно данных</p>
        </CardContent>
      </Card>
    );
  }

  const currentScore = currentWeek.overall || 0;
  const previousScore = previousWeek.overall || 0;
  const change = currentScore - previousScore;
  const changePercent = previousScore !== 0 ? (change / previousScore * 100) : 0;

  const getTrendIcon = () => {
    if (change > 0.5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -0.5) return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-yellow-500" />;
  };

  const getTrendColor = () => {
    if (change > 0.5) return 'text-green-600';
    if (change < -0.5) return 'text-destructive';
    return 'text-yellow-600';
  };

  const getTrendText = () => {
    if (change > 0.5) return 'Растёт';
    if (change < -0.5) return 'Снижается';
    return 'Стабильно';
  };

  return (
    <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={onViewHistory}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {getTrendIcon()}
          Еженедельный прогресс
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {currentScore.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              Текущий балл
            </p>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${getTrendColor()}`}>
              {change > 0 ? '+' : ''}{change.toFixed(1)}
            </p>
            <p className="text-xs text-muted-foreground">
              {getTrendText()}
            </p>
          </div>
        </div>

        {Math.abs(changePercent) > 5 && (
          <div className={`text-xs p-2 rounded-md ${
            change > 0 ? 'bg-green-500/10 text-green-600 dark:bg-green-400/10 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:bg-red-400/10 dark:text-red-400'
          }`}>
            {change > 0 ? '📈' : '📉'} {Math.abs(changePercent).toFixed(1)}% за неделю
          </div>
        )}

        {/* Strategy integration */}
        {activeHypotheses.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Badge variant="outline" className="text-xs">
              <Target className="w-3 h-3 mr-1" />
              {activeHypotheses.length} активных
            </Badge>
            {onViewStrategy && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewStrategy();
                }}
              >
                <Zap className="w-3 h-3 mr-1" />
                К стратегии
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button variant="ghost" size="sm" className="text-xs">
            История оценок
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyProgress;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Sparkles, Target, Zap } from 'lucide-react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface StrengthsProps {
  allMetrics: any[];
  currentWeekData: any;
  onMetricClick: (metricId: string) => void;
  onCreateHypothesis?: (metricId?: string) => void;
}

const Strengths: React.FC<StrengthsProps> = ({ 
  allMetrics, 
  currentWeekData, 
  onMetricClick,
  onCreateHypothesis
}) => {
  // Get integrated data to show strategy context
  const { integratedMetrics } = useIntegratedData();
  // Находим метрики с высокими оценками (8 и выше) из интегрированных данных
  const strongMetrics = integratedMetrics
    .filter(metric => metric.currentValue >= 8)
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  if (strongMetrics.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Сильные стороны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">
              Пока нет метрик с оценкой 8+
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Продолжайте работать над улучшением!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMotivationalMessage = (count: number) => {
    if (count >= 3) return "🔥 Вы в огне!";
    if (count >= 2) return "💪 Отличная работа!";
    return "⭐ Хорошее начало!";
  };

  return (
    <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          Сильные стороны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">
            {getMotivationalMessage(strongMetrics.length)}
          </p>
          <p className="text-xs text-muted-foreground">
            {strongMetrics.length} {strongMetrics.length === 1 ? 'метрика' : 'метрики'} с оценкой 8+
          </p>
        </div>

        <div className="space-y-2">
          {strongMetrics.map((metric) => (
            <div 
              key={metric.id}
              className="p-2 rounded-md bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{metric.icon}</span>
                  <span className="text-sm font-medium text-green-800">
                    {metric.name}
                  </span>
                  {metric.hasActiveExperiment && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="w-2 h-2 mr-1" />
                      {metric.relatedHypotheses.length}
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                  {metric.currentValue}/10
                </Badge>
              </div>
              
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onMetricClick(metric.id)}
                  className="h-6 px-2 text-xs"
                >
                  Посмотреть
                </Button>
                {onCreateHypothesis && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateHypothesis(metric.id);
                    }}
                    className="h-6 px-2 text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Использовать
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {strongMetrics.length > 0 && (
          <div className="text-center pt-2 border-t border-border">
            <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Продолжайте в том же духе!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Strengths;
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Sparkles } from 'lucide-react';

interface StrengthsProps {
  allMetrics: any[];
  currentWeekData: any;
  onMetricClick: (metricId: string) => void;
}

const Strengths: React.FC<StrengthsProps> = ({ 
  allMetrics, 
  currentWeekData, 
  onMetricClick 
}) => {
  // Находим метрики с высокими оценками (8 и выше)
  const strongMetrics = allMetrics
    .map(metric => ({
      ...metric,
      value: currentWeekData?.[metric.name] || 0
    }))
    .filter(metric => metric.value >= 8)
    .sort((a, b) => b.value - a.value)
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
              className="flex items-center justify-between p-2 rounded-md bg-green-50 border border-green-200 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => onMetricClick(metric.id)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{metric.icon}</span>
                <span className="text-sm font-medium text-green-800">
                  {metric.name}
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                {metric.value}/10
              </Badge>
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
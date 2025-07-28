import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, TrendingDown } from 'lucide-react';

interface ProblemAreasProps {
  allMetrics: any[];
  currentWeekData: any;
  onMetricClick: (metricId: string) => void;
}

const ProblemAreas: React.FC<ProblemAreasProps> = ({ 
  allMetrics, 
  currentWeekData, 
  onMetricClick 
}) => {
  // Находим метрики с низкими оценками (4 и ниже)
  const problemMetrics = allMetrics
    .map(metric => ({
      ...metric,
      value: currentWeekData?.[metric.name] || 0
    }))
    .filter(metric => metric.value > 0 && metric.value <= 4)
    .sort((a, b) => a.value - b.value)
    .slice(0, 2);

  if (problemMetrics.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-green-500" />
            Проблемные зоны
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-2">
            <p className="text-sm text-green-600 font-medium">🎉 Отлично!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Все метрики выше 4 баллов
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          Проблемные зоны
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {problemMetrics.map((metric) => (
          <Alert key={metric.id} className="border-destructive/20 bg-destructive/10">
            <TrendingDown className="h-4 w-4 text-destructive" />
            <AlertDescription className="ml-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{metric.name}</span>
                  <span className="text-destructive font-bold ml-2">{metric.value}/10</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onMetricClick(metric.id)}
                  className="h-6 px-2 text-xs"
                >
                  Улучшить
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}
        
        <div className="text-center pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => onMetricClick('analytics')}
          >
            Подробный анализ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProblemAreas;
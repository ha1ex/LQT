import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, TrendingDown, Target, Plus } from 'lucide-react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface ProblemAreasProps {
  allMetrics: any[];
  currentWeekData: any;
  onMetricClick: (metricId: string) => void;
  onCreateHypothesis?: (metricId?: string) => void;
}

const ProblemAreas: React.FC<ProblemAreasProps> = ({ 
  allMetrics, 
  currentWeekData, 
  onMetricClick,
  onCreateHypothesis
}) => {
  // Get integrated data to show strategy context
  const { integratedMetrics, strategyDashboardLinks } = useIntegratedData();
  // Находим метрики с низкими оценками (4 и ниже) из интегрированных данных
  const problemMetrics = integratedMetrics
    .filter(metric => metric.currentValue > 0 && metric.currentValue <= 4)
    .sort((a, b) => a.currentValue - b.currentValue)
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{metric.name}</span>
                    <span className="text-destructive font-bold">{metric.currentValue}/10</span>
                    {metric.hasActiveExperiment && (
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-2 h-2 mr-1" />
                        Активный
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {!metric.hasActiveExperiment && onCreateHypothesis && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateHypothesis(metric.id);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Эксперимент
                      </Button>
                    )}
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
                </div>
                {metric.hasActiveExperiment && (
                  <p className="text-xs text-muted-foreground">
                    {metric.relatedHypotheses.length} активных эксперимента
                  </p>
                )}
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
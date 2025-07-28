import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface InsightData {
  week: string;
  [key: string]: any;
}

interface Correlation {
  metric1: string;
  metric2: string;
  icon1: string;
  icon2: string;
  correlation: number;
  percentage: number;
  type: 'positive' | 'negative';
  description: string;
}

interface PersonalInsightsProps {
  metrics: Metric[];
  data: InsightData[];
  className?: string;
}

const PersonalInsights: React.FC<PersonalInsightsProps> = ({ 
  metrics, 
  data,
  className = "" 
}) => {
  // Функция для расчета корреляции Пирсона
  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
    const sumYY = y.reduce((total, yi) => total + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator === 0 ? 0 : Math.max(-1, Math.min(1, numerator / denominator));
  };

  // Генерация корреляций
  const correlations = useMemo(() => {
    if (!data || data.length < 4) return []; // Минимум 4 недели для анализа

    const correlationPairs: Correlation[] = [];
    
    // Анализируем все возможные пары метрик
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i];
        const metric2 = metrics[j];
        
        const values1 = data.map(week => week[metric1.name]).filter(v => v !== undefined);
        const values2 = data.map(week => week[metric2.name]).filter(v => v !== undefined);
        
        if (values1.length >= 4 && values2.length >= 4) {
          const correlation = calculatePearsonCorrelation(values1, values2);
          
          // Отбираем только сильные корреляции (|r| > 0.6)
          if (Math.abs(correlation) > 0.6) {
            const percentage = Math.round(Math.abs(correlation) * 100);
            const type = correlation > 0 ? 'positive' : 'negative';
            
            let description = '';
            if (type === 'positive') {
              description = 'Взаимосвязаны';
            } else {
              description = 'Обратная связь';
            }

            correlationPairs.push({
              metric1: metric1.name,
              metric2: metric2.name,
              icon1: metric1.icon,
              icon2: metric2.icon,
              correlation,
              percentage,
              type,
              description
            });
          }
        }
      }
    }

    // Сортируем по силе корреляции и берем топ-3
    return correlationPairs
      .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
      .slice(0, 3);
  }, [metrics, data]);

  const getCorrelationColor = (type: 'positive' | 'negative', percentage: number) => {
    if (type === 'positive') {
      return 'text-green-600 bg-green-50 border-green-200';
    } else {
      return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getCorrelationIcon = (type: 'positive' | 'negative') => {
    return type === 'positive' ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    );
  };

  if (data.length < 4) {
    return (
      <Card className={`card-modern animate-fade-in ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Ваши инсайты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-muted-foreground mb-2">
              Анализ взаимосвязей недоступен
            </p>
            <p className="text-sm text-muted-foreground">
              Требуется минимум 4 недели данных для выявления корреляций
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (correlations.length === 0) {
    return (
      <Card className={`card-modern animate-fade-in ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Ваши инсайты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-muted-foreground">
              Пока нет значимых взаимосвязей между метриками.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-modern animate-fade-in ${className}`}>
      <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            Ваши инсайты
          </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {correlations.map((corr, index) => (
          <div
            key={`${corr.metric1}-${corr.metric2}`}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getCorrelationColor(corr.type, corr.percentage)}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{corr.icon1}</span>
                  <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xl">{corr.icon2}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${getCorrelationColor(corr.type, corr.percentage)}`}>
                  {getCorrelationIcon(corr.type)}
                  <span className="ml-1">{corr.percentage}%</span>
                </Badge>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground/90">
                  {corr.metric1}
                </span>
                <span className="text-muted-foreground">↔</span>
                <span className="font-medium text-foreground/90">
                  {corr.metric2}
                </span>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {corr.description}
              </p>
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            💡 Корреляции показывают взаимосвязи между аспектами жизни. 
            Используйте их для понимания влияния одних областей на другие.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInsights;
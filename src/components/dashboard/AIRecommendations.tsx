import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ArrowRight, RefreshCw, Target, Lightbulb } from 'lucide-react';
import { useIntegratedData } from '@/hooks/useIntegratedData';

interface AIRecommendationsProps {
  allMetrics: any[];
  currentWeekData: any;
  onOpenAIChat: () => void;
  onCreateHypothesis?: (metricId?: string) => void;
  onViewHypothesis?: (id: string) => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ 
  allMetrics, 
  currentWeekData, 
  onOpenAIChat,
  onCreateHypothesis,
  onViewHypothesis
}) => {
  // Get integrated data for smart recommendations
  const { smartRecommendations, strategyDashboardLinks, integratedMetrics } = useIntegratedData();
  const [currentRecommendation, setCurrentRecommendation] = useState(0);

  // Enhanced recommendations combining traditional analysis with strategy data
  const generateRecommendations = () => {
    // Start with smart recommendations from integrated data
    const strategyRecommendations = smartRecommendations.slice(0, 2).map(rec => ({
      title: rec.title,
      description: rec.description,
      action: rec.type === 'create-hypothesis' ? "Создать эксперимент" : 
              rec.type === 'revise-hypothesis' ? "Пересмотреть" : 
              "Применить опыт",
      type: rec.type,
      data: rec.action(),
      isStrategy: true
    }));

    // Traditional metric-based recommendations  
    const recommendations = [];
    
    // Анализируем проблемные области
    const problemMetrics = integratedMetrics
      .filter(metric => metric.currentValue > 0 && metric.currentValue <= 4)
      .sort((a, b) => a.currentValue - b.currentValue);

    // Анализируем сильные стороны
    const strongMetrics = integratedMetrics
      .filter(metric => metric.currentValue >= 8)
      .sort((a, b) => b.currentValue - a.currentValue);

    // Рекомендации для проблемных зон
    if (problemMetrics.length > 0) {
      const worstMetric = problemMetrics[0];
      if (worstMetric.category === 'finance') {
        recommendations.push({
          title: "💰 Финансовая стабильность",
          description: `${worstMetric.name} требует внимания. ${worstMetric.hasActiveExperiment ? 'Пересмотрите подход' : 'Создайте план эксперимента'}.`,
          action: worstMetric.hasActiveExperiment ? "Пересмотреть" : "Создать план",
          type: worstMetric.hasActiveExperiment ? 'revise' : 'create',
          metricId: worstMetric.id
        });
      } else if (worstMetric.category === 'health') {
        recommendations.push({
          title: "🏃‍♂️ Забота о здоровье",
          description: `${worstMetric.name} можно улучшить. ${worstMetric.hasActiveExperiment ? 'Корректируйте стратегию' : 'Начните с 15 минут в день'}.`,
          action: worstMetric.hasActiveExperiment ? "Корректировать" : "Начать сегодня",
          type: worstMetric.hasActiveExperiment ? 'revise' : 'create',
          metricId: worstMetric.id
        });
      } else {
        recommendations.push({
          title: "🎯 Развитие",
          description: `Сфокусируйтесь на ${worstMetric.name.toLowerCase()} - это принесёт наибольший эффект.`,
          action: worstMetric.hasActiveExperiment ? "Пересмотреть" : "Начать работу",
          type: worstMetric.hasActiveExperiment ? 'revise' : 'create',
          metricId: worstMetric.id
        });
      }
    }

    // Рекомендации для усиления сильных сторон
    if (strongMetrics.length > 0) {
      const strongestMetric = strongMetrics[0];
      recommendations.push({
        title: "⭐ Используйте силу",
        description: `Ваша сила в ${strongestMetric.name.toLowerCase()}. Как это поможет в других сферах?`,
        action: "Исследовать",
        type: 'leverage',
        metricId: strongestMetric.id
      });
    }

    // Общие рекомендации
    const averageScore = integratedMetrics.reduce((sum, metric) => {
      return sum + metric.currentValue;
    }, 0) / integratedMetrics.length;

    if (averageScore < 5) {
      recommendations.push({
        title: "🌱 Начните с малого",
        description: "Выберите одну сферу для улучшения. Маленькие шаги ведут к большим изменениям.",
        action: "Выбрать цель",
        type: 'general'
      });
    } else if (averageScore >= 7) {
      recommendations.push({
        title: "🚀 Время роста",
        description: "У вас отличная база! Время ставить амбициозные цели и выходить из зоны комфорта.",
        action: "Поставить цель",
        type: 'general'
      });
    }

    // Combine strategy and traditional recommendations
    const allRecommendations = [...strategyRecommendations, ...recommendations];
    
    return allRecommendations.length > 0 ? allRecommendations : [
      {
        title: "🤖 ИИ готов помочь",
        description: "Расскажите о своих целях, и я дам персональные рекомендации.",
        action: "Начать чат",
        type: 'chat'
      }
    ];
  };

  const recommendations = generateRecommendations();

  // Автоматическая ротация рекомендаций каждые 10 секунд
  useEffect(() => {
    if (recommendations.length > 1) {
      const interval = setInterval(() => {
        setCurrentRecommendation(prev => (prev + 1) % recommendations.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [recommendations.length]);

  const currentRec = recommendations[currentRecommendation];

  return (
    <Card className="border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={onOpenAIChat}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Рекомендации ИИ
          {recommendations.length > 1 && (
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {currentRecommendation + 1}/{recommendations.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-foreground">
              {currentRec.title}
            </h4>
            {currentRec.isStrategy && (
              <Badge variant="outline" className="text-xs">
                <Lightbulb className="w-2 h-2 mr-1" />
                Стратегия
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {currentRec.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={(e) => {
              e.stopPropagation();
              
              if (currentRec.type === 'create-hypothesis' || currentRec.type === 'create') {
                onCreateHypothesis?.(currentRec.metricId);
              } else if (currentRec.type === 'revise-hypothesis' && currentRec.data?.id) {
                onViewHypothesis?.(currentRec.data.id);
              } else {
                onOpenAIChat();
              }
            }}
          >
            {currentRec.isStrategy && <Target className="w-3 h-3 mr-1" />}
            {currentRec.action}
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          
          {recommendations.length > 1 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRecommendation(prev => (prev + 1) % recommendations.length);
              }}
              className="p-1.5"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>

        <div className="text-center pt-2 border-t border-border">
          <Button variant="ghost" size="sm" className="text-xs text-primary">
            Открыть ИИ чат
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIRecommendations;
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, RefreshCw } from 'lucide-react';

interface AIRecommendationsProps {
  allMetrics: any[];
  currentWeekData: any;
  onOpenAIChat: () => void;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ 
  allMetrics, 
  currentWeekData, 
  onOpenAIChat 
}) => {
  const [currentRecommendation, setCurrentRecommendation] = useState(0);

  // Генерируем персонализированные рекомендации на основе данных
  const generateRecommendations = () => {
    const recommendations = [];
    
    // Анализируем проблемные области
    const problemMetrics = allMetrics
      .map(metric => ({
        ...metric,
        value: currentWeekData?.[metric.name] || 0
      }))
      .filter(metric => metric.value > 0 && metric.value <= 4)
      .sort((a, b) => a.value - b.value);

    // Анализируем сильные стороны
    const strongMetrics = allMetrics
      .map(metric => ({
        ...metric,
        value: currentWeekData?.[metric.name] || 0
      }))
      .filter(metric => metric.value >= 8)
      .sort((a, b) => b.value - a.value);

    // Рекомендации для проблемных зон
    if (problemMetrics.length > 0) {
      const worstMetric = problemMetrics[0];
      if (worstMetric.category === 'finance') {
        recommendations.push({
          title: "💰 Финансовая стабильность",
          description: `${worstMetric.name} требует внимания. Начните с планирования бюджета на неделю.`,
          action: "Создать план"
        });
      } else if (worstMetric.category === 'health') {
        recommendations.push({
          title: "🏃‍♂️ Забота о здоровье",
          description: `Уделите больше внимания ${worstMetric.name.toLowerCase()}. Начните с 15 минут в день.`,
          action: "Начать сегодня"
        });
      } else if (worstMetric.category === 'relationships') {
        recommendations.push({
          title: "❤️ Отношения",
          description: `${worstMetric.name} можно улучшить через качественное время вместе.`,
          action: "Запланировать"
        });
      } else {
        recommendations.push({
          title: "🎯 Развитие",
          description: `Сфокусируйтесь на ${worstMetric.name.toLowerCase()} - это принесёт наибольший эффект.`,
          action: "Начать работу"
        });
      }
    }

    // Рекомендации для усиления сильных сторон
    if (strongMetrics.length > 0) {
      const strongestMetric = strongMetrics[0];
      recommendations.push({
        title: "⭐ Используйте силу",
        description: `Ваша сила в ${strongestMetric.name.toLowerCase()}. Как это поможет в других сферах?`,
        action: "Исследовать"
      });
    }

    // Общие рекомендации
    const averageScore = allMetrics.reduce((sum, metric) => {
      const value = currentWeekData?.[metric.name] || 0;
      return sum + value;
    }, 0) / allMetrics.length;

    if (averageScore < 5) {
      recommendations.push({
        title: "🌱 Начните с малого",
        description: "Выберите одну сферу для улучшения. Маленькие шаги ведут к большим изменениям.",
        action: "Выбрать цель"
      });
    } else if (averageScore >= 7) {
      recommendations.push({
        title: "🚀 Время роста",
        description: "У вас отличная база! Время ставить амбициозные цели и выходить из зоны комфорта.",
        action: "Поставить цель"
      });
    }

    // Сезонные рекомендации
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 11 || currentMonth <= 1) { // Зима
      recommendations.push({
        title: "❄️ Зимняя поддержка",
        description: "Зимой важно поддерживать ментальное здоровье. Добавьте витамин D и свет.",
        action: "Узнать больше"
      });
    } else if (currentMonth >= 2 && currentMonth <= 4) { // Весна
      recommendations.push({
        title: "🌸 Весеннее обновление",
        description: "Идеальное время для новых привычек и целей. Энергия природы поможет!",
        action: "Начать привычку"
      });
    }

    return recommendations.length > 0 ? recommendations : [
      {
        title: "🤖 ИИ готов помочь",
        description: "Расскажите о своих целях, и я дам персональные рекомендации.",
        action: "Начать чат"
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
          <h4 className="font-medium text-sm text-foreground">
            {currentRec.title}
          </h4>
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
              onOpenAIChat();
            }}
          >
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
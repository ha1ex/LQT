import React, { useMemo, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingDown, AlertTriangle, Target, Sparkles } from 'lucide-react';
import { useAIInsights } from '@/hooks/useAIInsights';
import { useDemoMode } from '@/hooks/useDemoMode';

interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}

interface RecommendationData {
  week: string;
  [key: string]: any;
}

interface Recommendation {
  metric: string;
  icon: string;
  currentValue: number;
  priority: 'high' | 'medium' | 'low';
  action: string;
  type: 'low_metric' | 'trend_decline' | 'ai_insight';
}

interface PersonalRecommendationsProps {
  metrics: Metric[];
  data: RecommendationData[];
  className?: string;
}

const PersonalRecommendations: React.FC<PersonalRecommendationsProps> = ({ 
  metrics, 
  data,
  className = "" 
}) => {
  const { isDemoMode } = useDemoMode();
  const { insights, loading: aiLoading, error: aiError, generateInsights, hasApiKey } = useAIInsights();
  const [aiRecommendations, setAiRecommendations] = useState<Recommendation[]>([]);
  const [showAI, setShowAI] = useState(false);
  
  console.log('🎯 PersonalRecommendations:', { 
    isDemoMode, 
    hasApiKey, 
    aiLoading, 
    aiError, 
    insightsCount: insights.length,
    showAI 
  });
  // Словарь рекомендаций для каждой метрики
  const recommendationTemplates = {
    'Спокойствие ума': {
      low: [
        'Попробуйте медитацию 10 минут в день',
        'Ведите дневник благодарности',
        'Ограничьте потребление новостей',
        'Практикуйте дыхательные упражнения'
      ],
      medium: [
        'Добавьте больше прогулок на свежем воздухе',
        'Установите границы в работе',
        'Найдите время для хобби'
      ]
    },
    'Финансовая подушка': {
      low: [
        'Составьте план накоплений на месяц',
        'Пересмотрите расходы на развлечения',
        'Найдите дополнительные источники дохода',
        'Автоматизируйте сбережения'
      ],
      medium: [
        'Увеличьте процент откладываемых средств',
        'Изучите варианты инвестирования'
      ]
    },
    'Доход': {
      low: [
        'Развивайте новые профессиональные навыки',
        'Ищите возможности карьерного роста',
        'Рассмотрите подработку или фриланс',
        'Обновите резюме и профиль в LinkedIn'
      ],
      medium: [
        'Обсудите повышение с руководством',
        'Изучите рынок зарплат в вашей сфере'
      ]
    },
    'Качество общения с женой': {
      low: [
        'Запланируйте качественное время вдвоем',
        'Практикуйте активное слушание',
        'Выражайте благодарность чаще',
        'Обсуждайте чувства открыто'
      ],
      medium: [
        'Организуйте романтическое свидание',
        'Найдите новое совместное хобби'
      ]
    },
    'Качество общения с семьей': {
      low: [
        'Организуйте семейный ужин без гаджетов',
        'Звоните родителям чаще',
        'Планируйте семейные мероприятия',
        'Создайте семейные традиции'
      ],
      medium: [
        'Организуйте семейную поездку',
        'Создайте семейный чат для общения'
      ]
    },
    'Физическое здоровье': {
      low: [
        'Начните с 15-минутной зарядки',
        'Добавьте больше овощей в рацион',
        'Пейте больше воды в течение дня',
        'Записывайтесь к врачу для проверки'
      ],
      medium: [
        'Увеличьте интенсивность тренировок',
        'Попробуйте новый вид спорта'
      ]
    },
    'Социализация': {
      low: [
        'Свяжитесь со старыми друзьями',
        'Присоединитесь к местному сообществу',
        'Посетите социальные мероприятия',
        'Инициируйте встречи с коллегами'
      ],
      medium: [
        'Организуйте встречу с друзьями',
        'Попробуйте новые социальные активности'
      ]
    },
    'Проявленность': {
      low: [
        'Поставьте 3 конкретные цели на месяц',
        'Разработайте план действий',
        'Найдите ментора в вашей области',
        'Начните работать над проектом мечты'
      ],
      medium: [
        'Увеличьте видимость ваших достижений',
        'Подайте заявку на интересную позицию'
      ]
    },
    'Путешествия': {
      low: [
        'Запланируйте поездку на выходные',
        'Исследуйте новые места в вашем городе',
        'Составьте wishlist мест для посещения',
        'Начните копить на отпуск мечты'
      ],
      medium: [
        'Забронируйте отпуск заранее',
        'Попробуйте новый вид путешествий'
      ]
    },
    'Ментальное здоровье': {
      low: [
        'Рассмотрите консультацию с психологом',
        'Практикуйте техники релаксации',
        'Ограничьте стрессовые факторы',
        'Улучшите качество сна'
      ],
      medium: [
        'Добавьте физическую активность',
        'Найдите новые способы самовыражения'
      ]
    }
  };

  // Преобразование AI инсайтов в рекомендации
  useEffect(() => {
    if (insights.length > 0) {
      const aiRecs: Recommendation[] = insights.map(insight => ({
        metric: insight.metricId ? insight.title : 'AI Инсайт',
        icon: '🤖',
        currentValue: 0, // AI инсайты не имеют текущего значения
        priority: insight.confidence > 0.8 ? 'high' : insight.confidence > 0.6 ? 'medium' : 'low',
        action: insight.description + (insight.action ? ` ${insight.action}` : ''),
        type: 'ai_insight'
      }));
      setAiRecommendations(aiRecs);
    }
  }, [insights]);

  // Генерация AI рекомендаций
  const handleGenerateAI = async () => {
    if (!hasApiKey && !isDemoMode) {
      setShowAI(true);
      return;
    }

    try {
      console.log('🚀 Generating AI insights...');
      await generateInsights('dashboard', {
        weekData: data,
        goals: [],
        hypotheses: [],
        correlations: []
      });
      setShowAI(true);
    } catch (error) {
      console.error('❌ Failed to generate AI insights:', error);
    }
  };

  // Генерация статических рекомендаций (как fallback)
  const staticRecommendations = useMemo(() => {
    if (!data || data.length === 0) return [];

    const lastWeek = data[data.length - 1];
    const prevWeek = data.length > 1 ? data[data.length - 2] : null;
    const generatedRecommendations: Recommendation[] = [];

    // Анализ низких метрик
    metrics.forEach(metric => {
      const currentValue = lastWeek[metric.name];
      if (currentValue !== undefined && currentValue < 5) {
        const priority = currentValue < 3 ? 'high' : 'medium';
        const templates = recommendationTemplates[metric.name];
        
        if (templates) {
          const actionList = priority === 'high' ? templates.low : templates.medium || templates.low;
          const randomAction = actionList[Math.floor(Math.random() * actionList.length)];
          
          generatedRecommendations.push({
            metric: metric.name,
            icon: metric.icon,
            currentValue,
            priority,
            action: randomAction,
            type: 'low_metric'
          });
        }
      }
    });

    // Анализ трендов (падение общего индекса)
    if (prevWeek && lastWeek.overall && prevWeek.overall) {
      const overallDrop = prevWeek.overall - lastWeek.overall;
      if (overallDrop > 0.5) {
        generatedRecommendations.push({
          metric: 'Общий индекс',
          icon: '📊',
          currentValue: lastWeek.overall,
          priority: 'high',
          action: 'Проанализируйте, что изменилось на этой неделе, и скорректируйте приоритеты',
          type: 'trend_decline'
        });
      }
    }

    return generatedRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3); // Оставляем место для AI рекомендаций
  }, [metrics, data]);

  // Объединяем статические и AI рекомендации
  const allRecommendations = useMemo(() => {
    const combined = [...staticRecommendations];
    if (showAI) {
      combined.push(...aiRecommendations);
    }
    return combined.slice(0, 4);
  }, [staticRecommendations, aiRecommendations, showAI]);

  const getPriorityColor = (priority: string, type?: string) => {
    if (type === 'ai_insight') {
      return 'bg-purple-50 text-purple-600 border-purple-200';
    }
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string, type?: string) => {
    if (type === 'ai_insight') {
      return <Sparkles className="w-4 h-4" />;
    }
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingDown className="w-4 h-4" />;
      case 'low': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityText = (priority: string, type?: string) => {
    if (type === 'ai_insight') {
      return 'AI Инсайт';
    }
    switch (priority) {
      case 'high': return 'Критично';
      case 'medium': return 'Важно';
      case 'low': return 'Рекомендуется';
      default: return 'Инсайт';
    }
  };

  if (allRecommendations.length === 0 && !showAI) {
    return (
      <Card className={`card-modern animate-fade-in ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-gray-600" />
              Персональные рекомендации
            </CardTitle>
            {(hasApiKey || isDemoMode) && (
              <Button 
                onClick={handleGenerateAI} 
                size="sm" 
                variant="outline"
                disabled={aiLoading}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? 'Анализ...' : 'AI Анализ'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-muted-foreground mb-4">
              Отличная работа! У вас нет критичных областей для улучшения.
            </p>
            {!hasApiKey && !isDemoMode && (
              <p className="text-sm text-muted-foreground">
                Настройте AI для получения персонализированных рекомендаций
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`card-modern animate-fade-in ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-gray-600" />
            Персональные рекомендации
            {showAI && aiRecommendations.length > 0 && (
              <Badge variant="outline" className="ml-2">
                <Sparkles className="w-3 h-3 mr-1" />
                AI
              </Badge>
            )}
          </CardTitle>
          {(hasApiKey || isDemoMode) && !showAI && (
            <Button 
              onClick={handleGenerateAI} 
              size="sm" 
              variant="outline"
              disabled={aiLoading}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? 'Анализ...' : 'AI Анализ'}
            </Button>
          )}
        </div>
        {aiError && (
          <p className="text-sm text-red-600 mt-2">
            Ошибка AI: {aiError}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {allRecommendations.map((rec, index) => (
          <div
            key={`${rec.metric}-${rec.type}-${index}`}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getPriorityColor(rec.priority, rec.type)}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{rec.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{rec.metric}</h4>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority, rec.type)}`}>
                    {getPriorityIcon(rec.priority, rec.type)}
                    <span className="ml-1">{getPriorityText(rec.priority, rec.type)}</span>
                  </Badge>
                </div>
                {rec.type !== 'ai_insight' && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-muted-foreground">Текущее значение:</span>
                    <span className="text-lg font-bold text-foreground">
                      {rec.currentValue}/10
                    </span>
                  </div>
                )}
                <p className="text-sm text-foreground/80">{rec.action}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PersonalRecommendations;
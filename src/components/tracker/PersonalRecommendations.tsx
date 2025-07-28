import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingDown, AlertTriangle, Target } from 'lucide-react';

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
  type: 'low_metric' | 'trend_decline';
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

  // Генерация рекомендаций на основе данных
  const recommendations = useMemo(() => {
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

    // Сортировка по приоритету и ограничение до 4 рекомендаций
    return generatedRecommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 4);
  }, [metrics, data]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-600 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'low': return 'bg-gray-50 text-gray-600 border-gray-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingDown className="w-4 h-4" />;
      case 'low': return <Target className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Критично';
      case 'medium': return 'Важно';
      case 'low': return 'Рекомендуется';
      default: return 'Инсайт';
    }
  };

  if (recommendations.length === 0) {
    return (
      <Card className={`card-modern animate-fade-in ${className}`}>
        <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="w-5 h-5 text-gray-600" />
          Персональные рекомендации
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-muted-foreground">
              Отличная работа! У вас нет критичных областей для улучшения.
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
          <Lightbulb className="w-5 h-5 text-gray-600" />
          Персональные рекомендации
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={`${rec.metric}-${index}`}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getPriorityColor(rec.priority)}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">{rec.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{rec.metric}</h4>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(rec.priority)}`}>
                    {getPriorityIcon(rec.priority)}
                    <span className="ml-1">{getPriorityText(rec.priority)}</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">Текущее значение:</span>
                  <span className="text-lg font-bold text-foreground">
                    {rec.currentValue}/10
                  </span>
                </div>
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
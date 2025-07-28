# ИИ система и интеллектуальный анализ

## Обзор

ИИ система предоставляет интеллектуальный анализ данных пользователя, персональные рекомендации и помощь в формулировании гипотез для улучшения качества жизни.

## Архитектура ИИ системы

### 1. Основные компоненты

#### AIFloatingAssistant (`src/components/ai/AIFloatingAssistant.tsx`)
**Назначение**: Плавающий ИИ-помощник для быстрого доступа

**Функциональность**:
- Компактный интерфейс в углу экрана
- Быстрые вопросы и ответы
- Контекстные подсказки
- Уведомления о важных инсайтах

**Поведение**:
- Автоматическое появление при обнаружении паттернов
- Ненавязчивые предложения
- Адаптация под привычки пользователя

#### AIChat (`src/components/ai/AIChat.tsx`)
**Назначение**: Полноценный чат-интерфейс с ИИ

**Возможности**:
- Естественные диалоги о данных
- Объяснение инсайтов и трендов
- Помощь в формулировании гипотез
- Персональные рекомендации

**Типы сообщений**:
- Текстовые ответы с анализом
- Графики и визуализации
- Предложения действий
- Ссылки на релевантные разделы

#### AIDashboard (`src/components/ai/AIDashboard.tsx`)
**Назначение**: Центральная панель ИИ-аналитики

**Секции**:
- **Ключевые инсайты** - самые важные находки
- **Рекомендации** - действия для улучшения
- **Прогнозы** - предсказания трендов
- **Аномалии** - необычные паттерны

#### AIWelcomeWizard (`src/components/ai/AIWelcomeWizard.tsx`)
**Назначение**: Первичная настройка ИИ-помощника

**Этапы настройки**:
1. Знакомство с возможностями ИИ
2. Настройка предпочтений анализа
3. Выбор типов уведомлений
4. Определение целей и приоритетов

### 2. Аналитические компоненты

#### AIInsightsCard (`src/components/ai/AIInsightsCard.tsx`)
**Назначение**: Отображение индивидуальных инсайтов

**Типы инсайтов**:
- **Корреляции** - взаимосвязи между метриками
- **Тренды** - изменения во времени
- **Паттерны** - повторяющиеся особенности
- **Аномалии** - необычные значения

**Структура карточки**:
```typescript
interface AIInsight {
  id: string;
  type: 'correlation' | 'trend' | 'pattern' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100%
  importance: 'low' | 'medium' | 'high' | 'critical';
  data: any; // Данные для визуализации
  actionable: boolean;
  actions?: Array<{
    label: string;
    action: string;
    params?: any;
  }>;
  createdAt: Date;
  expiresAt?: Date;
}
```

#### AIGoalSuggestions (`src/components/ai/AIGoalSuggestions.tsx`)
**Назначение**: ИИ-предложения целей и гипотез

**Алгоритм предложений**:
1. Анализ текущих данных пользователя
2. Выявление областей для улучшения
3. Сопоставление с успешными паттернами
4. Формирование SMART-целей

**Типы предложений**:
- Краткосрочные улучшения (1-4 недели)
- Среднесрочные цели (1-3 месяца)
- Долгосрочные стратегии (3+ месяца)

#### AIHypothesisHelper (`src/components/ai/AIHypothesisHelper.tsx`)
**Назначение**: Помощь в создании научно-обоснованных гипотез

**Функции**:
- Анализ корреляций для выявления потенциальных связей
- Предложение формулировок гипотез
- Проверка научной обоснованности
- Рекомендации по метрикам успеха

### 3. Адаптивные компоненты

#### AdaptiveDashboard (`src/components/ai/AdaptiveDashboard.tsx`)
**Назначение**: Персонализированный дашборд на основе ИИ

**Адаптивные элементы**:
- Приоритизация виджетов по важности
- Персональные KPI метрики
- Контекстные рекомендации
- Динамическая компоновка

**Алгоритм адаптации**:
1. Анализ поведения пользователя
2. Выявление предпочтений и паттернов
3. Корректировка интерфейса
4. A/B тестирование изменений

#### AIKeySetup (`src/components/ai/AIKeySetup.tsx`)
**Назначение**: Настройка API ключей для ИИ сервисов

**Поддерживаемые провайдеры**:
- OpenAI GPT
- Anthropic Claude
- Google AI
- Локальные модели

## Типы данных ИИ системы

### AIMessage
```typescript
interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'insight' | 'recommendation' | 'analysis' | 'question';
    confidence?: number;
    sources?: string[];
    visualization?: any;
  };
}
```

### AIInsight
```typescript
interface AIInsight {
  id: string;
  type: 'correlation' | 'trend' | 'pattern' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  importance: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  actionable: boolean;
  actions?: AIAction[];
  createdAt: Date;
  expiresAt?: Date;
}
```

### AIRecommendation
```typescript
interface AIRecommendation {
  id: string;
  category: 'health' | 'work' | 'relationships' | 'lifestyle' | 'goals';
  title: string;
  description: string;
  rationale: string;
  expectedImpact: {
    metrics: string[];
    timeframe: string;
    confidence: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  actions: AIAction[];
  priority: number;
}
```

## Алгоритмы ИИ анализа

### 1. Корреляционный анализ
```typescript
const findCorrelations = (data: WeeklyRating[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const metrics = Object.keys(data[0]?.ratings || {});
  
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const metric1 = metrics[i];
      const metric2 = metrics[j];
      
      const values1 = data.map(week => week.ratings[metric1]).filter(v => v);
      const values2 = data.map(week => week.ratings[metric2]).filter(v => v);
      
      const correlation = calculatePearsonCorrelation(values1, values2);
      
      if (Math.abs(correlation) > 0.6) { // Сильная корреляция
        insights.push({
          id: generateId(),
          type: 'correlation',
          title: `Связь между ${metric1} и ${metric2}`,
          description: `Обнаружена ${correlation > 0 ? 'положительная' : 'отрицательная'} корреляция (${(correlation * 100).toFixed(0)}%)`,
          confidence: Math.abs(correlation) * 100,
          importance: Math.abs(correlation) > 0.8 ? 'high' : 'medium',
          data: { metric1, metric2, correlation, values1, values2 },
          actionable: true,
          createdAt: new Date()
        });
      }
    }
  }
  
  return insights;
};
```

### 2. Анализ трендов
```typescript
const analyzeTrends = (data: WeeklyRating[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const metrics = Object.keys(data[0]?.ratings || {});
  
  metrics.forEach(metric => {
    const values = data.map(week => week.ratings[metric]).filter(v => v);
    const trend = calculateTrend(values);
    const changeRate = calculateChangeRate(values);
    
    if (Math.abs(changeRate) > 0.5) { // Значительное изменение
      insights.push({
        id: generateId(),
        type: 'trend',
        title: `Тренд по метрике ${metric}`,
        description: `${trend === 'up' ? 'Улучшение' : 'Ухудшение'} на ${Math.abs(changeRate * 100).toFixed(1)}% за период`,
        confidence: 85,
        importance: Math.abs(changeRate) > 1 ? 'high' : 'medium',
        data: { metric, trend, changeRate, values },
        actionable: trend === 'down',
        createdAt: new Date()
      });
    }
  });
  
  return insights;
};
```

### 3. Детекция аномалий
```typescript
const detectAnomalies = (data: WeeklyRating[]): AIInsight[] => {
  const insights: AIInsight[] = [];
  const metrics = Object.keys(data[0]?.ratings || {});
  
  metrics.forEach(metric => {
    const values = data.map(week => week.ratings[metric]).filter(v => v);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    
    const anomalies = data.filter(week => {
      const value = week.ratings[metric];
      return value && Math.abs(value - mean) > stdDev * 2; // 2 стандартных отклонения
    });
    
    if (anomalies.length > 0) {
      insights.push({
        id: generateId(),
        type: 'anomaly',
        title: `Аномальные значения в ${metric}`,
        description: `Обнаружено ${anomalies.length} необычных значений`,
        confidence: 90,
        importance: 'medium',
        data: { metric, anomalies, mean, stdDev },
        actionable: true,
        createdAt: new Date()
      });
    }
  });
  
  return insights;
};
```

### 4. Генерация рекомендаций
```typescript
const generateRecommendations = (insights: AIInsight[], userData: any): AIRecommendation[] => {
  const recommendations: AIRecommendation[] = [];
  
  insights.forEach(insight => {
    switch (insight.type) {
      case 'correlation':
        if (insight.data.correlation > 0.7) {
          recommendations.push({
            id: generateId(),
            category: 'lifestyle',
            title: `Используйте связь между ${insight.data.metric1} и ${insight.data.metric2}`,
            description: `Улучшение ${insight.data.metric1} положительно влияет на ${insight.data.metric2}`,
            rationale: `Обнаружена сильная положительная корреляция (${(insight.data.correlation * 100).toFixed(0)}%)`,
            expectedImpact: {
              metrics: [insight.data.metric2],
              timeframe: '2-4 недели',
              confidence: insight.confidence
            },
            difficulty: 'medium',
            actions: [
              {
                type: 'create_hypothesis',
                title: 'Создать гипотезу',
                description: `Проверить влияние ${insight.data.metric1} на ${insight.data.metric2}`
              }
            ],
            priority: insight.confidence
          });
        }
        break;
        
      case 'trend':
        if (insight.data.trend === 'down') {
          recommendations.push({
            id: generateId(),
            category: 'health',
            title: `Остановить ухудшение в ${insight.data.metric}`,
            description: 'Необходимо принять меры для улучшения показателя',
            rationale: `Показатель снижается на ${Math.abs(insight.data.changeRate * 100).toFixed(1)}% за период`,
            expectedImpact: {
              metrics: [insight.data.metric],
              timeframe: '1-2 недели',
              confidence: 80
            },
            difficulty: 'medium',
            actions: [
              {
                type: 'focus_attention',
                title: 'Уделить внимание',
                description: `Сосредоточиться на улучшении ${insight.data.metric}`
              }
            ],
            priority: insight.importance === 'high' ? 90 : 70
          });
        }
        break;
    }
  });
  
  return recommendations.sort((a, b) => b.priority - a.priority);
};
```

## Хуки и утилиты

### useAIChat
**Назначение**: Управление чат-интерфейсом с ИИ

**Основные методы**:
- `sendMessage(content: string)` - отправка сообщения
- `clearChat()` - очистка истории
- `regenerateResponse()` - повторная генерация ответа
- `exportChat()` - экспорт истории чата

**Состояние**:
```typescript
interface AIChatState {
  messages: AIMessage[];
  isLoading: boolean;
  error: string | null;
  context: any; // Контекст данных пользователя
}
```

### useAIInsights
**Назначение**: Управление ИИ-инсайтами

**Основные методы**:
- `generateInsights()` - генерация новых инсайтов
- `dismissInsight(id: string)` - отклонение инсайта
- `markAsActionable(id: string)` - пометка как действенный
- `executeAction(insightId: string, actionId: string)` - выполнение действия

**Автоматическая генерация**:
- При добавлении новых данных
- По расписанию (еженедельно)
- При достижении пороговых значений

## Интеграция с внешними ИИ сервисами

### OpenAI GPT интеграция
```typescript
const generateAIResponse = async (prompt: string, context: any): Promise<string> => {
  const systemPrompt = `
    Ты - персональный аналитик качества жизни. 
    Анализируй данные пользователя и предоставляй полезные инсайты.
    Будь конкретным, действенным и поддерживающим.
    
    Контекст пользователя: ${JSON.stringify(context)}
  `;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('AI API Error:', error);
    return 'Извините, произошла ошибка при генерации ответа.';
  }
};
```

### Промпт-инжиниринг
```typescript
const createAnalysisPrompt = (userData: any, analysisType: string): string => {
  const basePrompt = `
    Проанализируй данные пользователя по отслеживанию качества жизни.
    
    Данные: ${JSON.stringify(userData)}
    
    Тип анализа: ${analysisType}
  `;
  
  switch (analysisType) {
    case 'correlations':
      return basePrompt + `
        Найди интересные корреляции между метриками.
        Объясни их практическое значение.
        Предложи действия на основе найденных связей.
      `;
      
    case 'trends':
      return basePrompt + `
        Проанализируй тренды по каждой метрике.
        Выдели положительные и отрицательные изменения.
        Предложи способы улучшения проблемных областей.
      `;
      
    case 'recommendations':
      return basePrompt + `
        Предложи конкретные действия для улучшения качества жизни.
        Основывайся на данных пользователя и научных исследованиях.
        Приоритизируй рекомендации по важности и простоте реализации.
      `;
      
    default:
      return basePrompt + `
        Предоставь общий анализ данных и полезные инсайты.
      `;
  }
};
```

## Персонализация и обучение

### Модель пользователя
```typescript
interface UserProfile {
  preferences: {
    analysisDepth: 'basic' | 'detailed' | 'advanced';
    notificationFrequency: 'daily' | 'weekly' | 'monthly';
    focusAreas: string[];
    communicationStyle: 'formal' | 'casual' | 'motivational';
  };
  behavior: {
    activeHours: number[];
    preferredChartTypes: string[];
    actionTakeRate: number;
    engagementPatterns: any;
  };
  goals: {
    primary: string[];
    secondary: string[];
    timeHorizons: Record<string, string>;
  };
}
```

### Адаптивные алгоритмы
```typescript
const adaptToUser = (userProfile: UserProfile, insights: AIInsight[]): AIInsight[] => {
  return insights
    .filter(insight => {
      // Фильтрация по предпочтениям пользователя
      return userProfile.preferences.focusAreas.includes(insight.type) ||
             insight.importance === 'critical';
    })
    .map(insight => {
      // Адаптация стиля коммуникации
      if (userProfile.preferences.communicationStyle === 'motivational') {
        insight.description = addMotivationalTone(insight.description);
      }
      return insight;
    })
    .sort((a, b) => {
      // Персонализированная приоритизация
      const aScore = calculatePersonalizedScore(a, userProfile);
      const bScore = calculatePersonalizedScore(b, userProfile);
      return bScore - aScore;
    });
};
```

## Этика и конфиденциальность

### Принципы работы с данными
1. **Прозрачность** - пользователь понимает, как анализируются его данные
2. **Контроль** - возможность отключить ИИ-анализ
3. **Локальность** - обработка данных на устройстве пользователя
4. **Минимизация** - использование только необходимых данных

### Защита конфиденциальности
```typescript
const anonymizeData = (userData: any): any => {
  // Удаление личной информации перед отправкой в ИИ
  const anonymized = {
    ...userData,
    notes: userData.notes?.map(note => anonymizeText(note)),
    events: userData.events?.map(event => anonymizeText(event))
  };
  
  delete anonymized.personalInfo;
  return anonymized;
};

const anonymizeText = (text: string): string => {
  // Замена личных данных на общие категории
  return text
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
    .replace(/\b[А-Я][а-я]+\s[А-Я][а-я]+\b/g, '[NAME]');
};
```

## Производительность и оптимизация

### Кеширование результатов
```typescript
interface AICache {
  insights: Map<string, { data: AIInsight[], timestamp: number }>;
  recommendations: Map<string, { data: AIRecommendation[], timestamp: number }>;
  responses: Map<string, { data: string, timestamp: number }>;
}

const getCachedInsights = (dataHash: string): AIInsight[] | null => {
  const cached = aiCache.insights.get(dataHash);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};
```

### Оптимизация вычислений
- Дебаунсинг для частых обновлений данных
- Инкрементальный анализ новых данных
- Приоритизация критичных инсайтов
- Ленивая загрузка детальной аналитики

## Мониторинг и метрики

### Метрики эффективности ИИ
```typescript
interface AIMetrics {
  accuracy: {
    predictionAccuracy: number;
    recommendationSuccess: number;
    correlationValidation: number;
  };
  engagement: {
    insightClickRate: number;
    actionTakeRate: number;
    chatSessionDuration: number;
  };
  performance: {
    responseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}
```

### A/B тестирование
- Различные алгоритмы генерации рекомендаций
- Вариации интерфейса ИИ-помощника
- Тестирование стилей коммуникации
- Оптимизация частоты уведомлений

## Будущее развитие

### Планируемые функции
1. **Предиктивная аналитика** - прогнозы будущих состояний
2. **Мультимодальный анализ** - работа с изображениями и голосом
3. **Коллаборативная фильтрация** - рекомендации на основе похожих пользователей
4. **Интеграция с IoT** - анализ данных с умных устройств

### Технические улучшения
- Локальные ИИ-модели для оффлайн работы
- Федеративное обучение для улучшения моделей
- Расширенная обработка естественного языка
- Интеграция с календарями и внешними сервисами
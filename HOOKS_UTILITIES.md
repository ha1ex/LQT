# Хуки и утилиты

## Обзор

Система хуков и утилит обеспечивает переиспользуемую логику, управление состоянием и вспомогательные функции для всего приложения.

## Пользовательские хуки

### 1. Хуки управления данными

#### useEnhancedHypotheses (`src/hooks/strategy/useEnhancedHypotheses.ts`)
**Назначение**: Управление гипотезами и экспериментами

**Состояние**:
```typescript
interface HypothesesState {
  hypotheses: EnhancedHypothesis[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
```

**Основные методы**:
```typescript
const useEnhancedHypotheses = () => {
  // Создание новой гипотезы
  const createHypothesis = async (data: HypothesisFormData): Promise<EnhancedHypothesis> => {
    const hypothesis: EnhancedHypothesis = {
      id: generateId(),
      ...data,
      calculatedPriority: calculatePriority(data),
      validationStatus: ValidationStatus.PENDING,
      validationErrors: [],
      experimentStatus: ExperimentStatus.NOT_STARTED,
      status: 'active',
      progress: 0,
      journal: [],
      experimentResults: [],
      weeklyProgress: createDefaultWeeklyProgress(data.timeframe),
      experimentStartDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Валидация гипотезы
    const validation = validateHypothesis(hypothesis);
    hypothesis.validationStatus = validation.status;
    hypothesis.validationErrors = validation.errors;
    
    const newHypotheses = [...hypotheses, hypothesis];
    setHypotheses(newHypotheses);
    saveToStorage(newHypotheses);
    
    return hypothesis;
  };
  
  // Обновление гипотезы
  const updateHypothesis = (id: string, updates: Partial<EnhancedHypothesis>) => {
    const newHypotheses = hypotheses.map(h => 
      h.id === id 
        ? { 
            ...h, 
            ...updates, 
            updatedAt: new Date(),
            calculatedPriority: calculatePriority({ ...h, ...updates })
          }
        : h
    );
    setHypotheses(newHypotheses);
    saveToStorage(newHypotheses);
  };
  
  // Обновление еженедельного рейтинга
  const updateWeeklyRating = (id: string, week: number, rating: number, note?: string) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;
    
    const updatedProgress = hypothesis.weeklyProgress.map(w => 
      w.week === week 
        ? { ...w, rating: rating as 0 | 1 | 2 | 3 | 4, note, lastModified: new Date() }
        : w
    );
    
    const newProgress = calculateHypothesisProgress(updatedProgress);
    
    updateHypothesis(id, { 
      weeklyProgress: updatedProgress,
      progress: newProgress 
    });
  };
  
  // Добавление записи в журнал
  const addJournalEntry = (id: string, entry: Omit<JournalEntry, 'id'>) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;
    
    const newEntry: JournalEntry = {
      id: generateId(),
      ...entry
    };
    
    updateHypothesis(id, {
      journal: [...hypothesis.journal, newEntry]
    });
  };
  
  // Удаление гипотезы
  const deleteHypothesis = (id: string) => {
    const newHypotheses = hypotheses.filter(h => h.id !== id);
    setHypotheses(newHypotheses);
    saveToStorage(newHypotheses);
  };
  
  return {
    hypotheses,
    isLoading,
    error,
    createHypothesis,
    updateHypothesis,
    updateWeeklyRating,
    addJournalEntry,
    deleteHypothesis,
    refreshData,
    generateTestData
  };
};
```

#### useSubjects (`src/hooks/strategy/useSubjects.ts`)
**Назначение**: Управление субъектами (людьми и группами)

**Основные методы**:
```typescript
const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const createSubject = (data: Omit<Subject, 'id'>) => {
    const subject: Subject = {
      id: generateId(),
      ...data
    };
    
    const newSubjects = [...subjects, subject];
    setSubjects(newSubjects);
    saveSubjectsToStorage(newSubjects);
    
    return subject;
  };
  
  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const newSubjects = subjects.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setSubjects(newSubjects);
    saveSubjectsToStorage(newSubjects);
  };
  
  const deleteSubject = (id: string) => {
    const newSubjects = subjects.filter(s => s.id !== id);
    setSubjects(newSubjects);
    saveSubjectsToStorage(newSubjects);
  };
  
  const getSubjectsByType = (type: SubjectType) => {
    return subjects.filter(s => s.type === type);
  };
  
  return {
    subjects,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectsByType
  };
};
```

#### useWeeklyRatings (`src/hooks/useWeeklyRatings.ts`)
**Назначение**: Управление еженедельными рейтингами

**Основные методы**:
```typescript
const useWeeklyRatings = () => {
  const [ratings, setRatings] = useState<WeeklyRatingData>({});
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  
  // Обновление рейтинга недели
  const updateWeekRating = (
    date: Date, 
    updates: Partial<Omit<WeeklyRating, 'id' | 'weekNumber' | 'startDate' | 'endDate' | 'createdAt'>>
  ) => {
    const weekId = getWeekId(date);
    const startDate = startOfWeek(date, { weekStartsOn: 1 });
    const endDate = endOfWeek(date, { weekStartsOn: 1 });
    const weekNumber = getWeek(date);
    
    const existingRating = ratings[weekId];
    const now = new Date();
    
    // Расчет общего балла
    const newRatings = { ...existingRating?.ratings, ...updates.ratings };
    const overallScore = calculateOverallScore(newRatings);
    
    const updatedRating: WeeklyRating = {
      id: weekId,
      weekNumber,
      startDate,
      endDate,
      ratings: newRatings,
      notes: { ...existingRating?.notes, ...updates.notes },
      mood: updates.mood || existingRating?.mood || 'neutral',
      keyEvents: updates.keyEvents || existingRating?.keyEvents || [],
      weather: updates.weather || existingRating?.weather,
      overallScore,
      createdAt: existingRating?.createdAt || now,
      updatedAt: now,
      ...updates
    };
    
    const newRatings = { ...ratings, [weekId]: updatedRating };
    setRatings(newRatings);
    saveToStorage(newRatings);
  };
  
  // Обновление конкретной метрики
  const updateMetricRating = (date: Date, metricId: string, rating: number, note?: string) => {
    updateWeekRating(date, {
      ratings: { [metricId]: rating },
      ...(note && { notes: { [metricId]: note } })
    });
  };
  
  // Получение аналитики
  const getAnalytics = (): WeeklyRatingAnalytics => {
    const allRatings = Object.values(ratings);
    
    // Средние значения по метрикам
    const averageByMetric: Record<string, number> = {};
    BASE_METRICS.forEach(metric => {
      const metricValues = allRatings
        .map(r => r.ratings[metric.id])
        .filter(v => v !== undefined);
      
      averageByMetric[metric.name] = metricValues.length > 0
        ? metricValues.reduce((sum, val) => sum + val, 0) / metricValues.length
        : 0;
    });
    
    // Тренды во времени
    const trendsOverTime = allRatings
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map(rating => ({
        weekNumber: rating.weekNumber,
        averageScore: rating.overallScore,
        date: rating.startDate.toISOString()
      }));
    
    // Лучшая и худшая недели
    const sortedByScore = [...allRatings].sort((a, b) => b.overallScore - a.overallScore);
    const bestWeek = sortedByScore[0] || null;
    const worstWeek = sortedByScore[sortedByScore.length - 1] || null;
    
    // Распределение настроений
    const moodDistribution = allRatings.reduce((acc, rating) => {
      acc[rating.mood] = (acc[rating.mood] || 0) + 1;
      return acc;
    }, {} as Record<WeeklyRating['mood'], number>);
    
    // Сезонные тренды
    const seasonalTrends = calculateSeasonalTrends(allRatings);
    
    return {
      averageByMetric,
      trendsOverTime,
      bestWeek,
      worstWeek,
      moodDistribution,
      seasonalTrends
    };
  };
  
  return {
    ratings,
    currentWeek,
    isLoading,
    updateWeekRating,
    updateMetricRating,
    getCurrentWeekRating,
    getAnalytics,
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    goToWeek,
    generateTestData
  };
};
```

### 2. ИИ хуки

#### useAIChat (`src/hooks/useAIChat.ts`)
**Назначение**: Управление чат-интерфейсом с ИИ

```typescript
const useAIChat = () => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sendMessage = async (content: string) => {
    const userMessage: AIMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    try {
      // Получение контекста пользователя
      const context = await getUserContext();
      
      // Генерация ответа ИИ
      const response = await generateAIResponse(content, context);
      
      const aiMessage: AIMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        metadata: {
          type: 'analysis',
          confidence: 85
        }
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Ошибка при генерации ответа');
      console.error('AI Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    setMessages([]);
    setError(null);
  };
  
  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      // Удаляем последний ответ ИИ
      setMessages(prev => prev.filter(m => 
        !(m.role === 'assistant' && m.timestamp > lastUserMessage.timestamp)
      ));
      
      // Генерируем новый ответ
      await sendMessage(lastUserMessage.content);
    }
  };
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    regenerateResponse
  };
};
```

#### useAIInsights (`src/hooks/useAIInsights.ts`)
**Назначение**: Управление ИИ-инсайтами и рекомендациями

```typescript
const useAIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateInsights = async (forceRefresh = false) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    
    try {
      // Получение данных пользователя
      const userData = await getUserData();
      
      // Проверка кеша
      const cacheKey = createDataHash(userData);
      if (!forceRefresh) {
        const cachedInsights = getCachedInsights(cacheKey);
        if (cachedInsights) {
          setInsights(cachedInsights);
          setIsGenerating(false);
          return;
        }
      }
      
      // Генерация инсайтов
      const newInsights: AIInsight[] = [
        ...findCorrelations(userData.weeklyRatings),
        ...analyzeTrends(userData.weeklyRatings),
        ...detectAnomalies(userData.weeklyRatings),
        ...analyzePatterns(userData.weeklyRatings)
      ];
      
      // Генерация рекомендаций
      const newRecommendations = generateRecommendations(newInsights, userData);
      
      // Сохранение в кеш
      setCachedInsights(cacheKey, newInsights);
      
      setInsights(newInsights);
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const dismissInsight = (id: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== id));
    // Сохранение в localStorage отклоненных инсайтов
    const dismissed = JSON.parse(localStorage.getItem('dismissedInsights') || '[]');
    localStorage.setItem('dismissedInsights', JSON.stringify([...dismissed, id]));
  };
  
  const executeAction = async (insightId: string, actionType: string, params?: any) => {
    const insight = insights.find(i => i.id === insightId);
    if (!insight) return;
    
    switch (actionType) {
      case 'create_hypothesis':
        // Создание гипотезы на основе инсайта
        const hypothesisData = createHypothesisFromInsight(insight, params);
        // Переход к созданию гипотезы
        break;
        
      case 'focus_attention':
        // Добавление метрики в фокус
        addToFocusMetrics(params.metricId);
        break;
        
      case 'set_goal':
        // Создание цели
        createGoalFromRecommendation(insight, params);
        break;
    }
    
    // Отметка действия как выполненного
    markActionAsExecuted(insightId, actionType);
  };
  
  return {
    insights,
    recommendations,
    isGenerating,
    generateInsights,
    dismissInsight,
    executeAction
  };
};
```

### 3. Утилитарные хуки

#### useMobile (`src/hooks/use-mobile.tsx`)
**Назначение**: Определение мобильного устройства

```typescript
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  return isMobile;
};
```

#### useToast (`src/hooks/use-toast.ts`)
**Назначение**: Управление уведомлениями

```typescript
interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
}

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const toast = ({ ...props }: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast = { id, ...props };
    
    setToasts(prev => [...prev, newToast]);
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
    
    return id;
  };
  
  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return {
    toasts,
    toast,
    dismiss
  };
};
```

## Утилитарные функции

### 1. Стратегические утилиты (`src/utils/strategy.ts`)

#### Расчет приоритета
```typescript
const calculatePriority = (hypothesis: Partial<EnhancedHypothesis>): number => {
  if (!hypothesis.impact || !hypothesis.confidence || !hypothesis.effort) {
    return 0;
  }
  
  // ICE Framework с модификациями
  const ease = 11 - hypothesis.effort; // Обратное к effort
  const riskFactor = hypothesis.risk ? (11 - hypothesis.risk) / 10 : 1;
  
  return Math.round(
    (hypothesis.impact * hypothesis.confidence * ease * riskFactor) / 1000
  );
};
```

#### Расчет прогресса гипотезы
```typescript
const calculateHypothesisProgress = (weeklyProgress: WeeklyProgress[]): number => {
  const totalWeeks = weeklyProgress.length;
  const ratedWeeks = weeklyProgress.filter(week => week.rating > 0);
  const completedWeeks = ratedWeeks.length;
  
  if (completedWeeks === 0) return 0;
  
  // Средний рейтинг
  const averageRating = ratedWeeks.reduce((sum, week) => sum + week.rating, 0) / completedWeeks;
  
  // Процент завершенности
  const completionRate = (completedWeeks / totalWeeks) * 100;
  
  // Качество выполнения (рейтинг из 4 переводим в проценты)
  const qualityRate = (averageRating / 4) * 100;
  
  // Комбинированный показатель
  return Math.round((completionRate + qualityRate) / 2);
};
```

#### Валидация гипотезы
```typescript
const validateHypothesis = (hypothesis: Partial<EnhancedHypothesis>) => {
  const errors: ValidationError[] = [];
  
  // Проверка структуры "ЕСЛИ-ТО-ПОТОМУ ЧТО"
  const hasIfThenBecause = 
    hypothesis.conditions?.toLowerCase().includes('если') &&
    hypothesis.expectedOutcome?.toLowerCase().includes('то') &&
    hypothesis.reasoning?.toLowerCase().includes('потому что');
  
  if (!hasIfThenBecause) {
    errors.push({
      type: 'format',
      message: 'Гипотеза должна содержать структуру "ЕСЛИ-ТО-ПОТОМУ ЧТО"'
    });
  }
  
  // Проверка детальности описания
  if (hypothesis.conditions && hypothesis.conditions.length < 20) {
    errors.push({
      type: 'content',
      message: 'Условия слишком краткие, опишите конкретные действия'
    });
  }
  
  // Проверка измеримости
  if (!hypothesis.goal?.targetValue) {
    errors.push({
      type: 'traceability',
      message: 'Необходимо указать целевое значение для измерения результата'
    });
  }
  
  // Проверка логической связности
  const conditionsText = hypothesis.conditions?.toLowerCase() || '';
  const outcomeText = hypothesis.expectedOutcome?.toLowerCase() || '';
  
  if (conditionsText && outcomeText) {
    const hasLogicalConnection = checkLogicalConnection(conditionsText, outcomeText);
    if (!hasLogicalConnection) {
      errors.push({
        type: 'direction',
        message: 'Нет логической связи между условиями и ожидаемым результатом'
      });
    }
  }
  
  return {
    status: errors.length === 0 ? ValidationStatus.VALIDATED : ValidationStatus.FAILED_VALIDATION,
    errors
  };
};
```

### 2. Адаптер данных (`src/utils/dataAdapter.ts`)

#### Адаптация еженедельных рейтингов
```typescript
const adaptWeeklyRatingsToMockData = (
  weeklyRatings: WeeklyRatingData,
  subjects: Subject[] = []
): any[] => {
  // Безопасная проверка данных
  if (!weeklyRatings || typeof weeklyRatings !== 'object') {
    return createEmptyMockData();
  }
  
  return Object.values(weeklyRatings)
    .filter(rating => rating && rating.startDate && rating.endDate)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .map(rating => {
      const weekData: any = {
        week: `W${rating.weekNumber || 0}`,
        date: formatWeekRange(rating.startDate.toISOString(), rating.endDate.toISOString()),
      };
      
      // Безопасное добавление рейтингов
      if (rating.ratings && typeof rating.ratings === 'object') {
        Object.entries(rating.ratings).forEach(([metricId, value]) => {
          const metric = BASE_METRICS.find(m => m.id === metricId);
          if (metric && typeof value === 'number') {
            weekData[metric.name] = value;
          }
        });
      }
      
      // Расчет общего индекса с проверками
      const values = rating.ratings 
        ? Object.values(rating.ratings).filter(v => typeof v === 'number' && v !== null && v !== undefined) as number[]
        : [];
      
      weekData.overall = values.length > 0 
        ? parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1))
        : rating.overallScore || 0;
      
      return weekData;
    })
    .filter(weekData => weekData !== null && weekData !== undefined);
};
```

### 3. Демо-данные (`src/utils/demoData.ts`)

#### Генерация комплексных демо-данных
```typescript
const generateComprehensiveDemoData = () => {
  const weeks = 12; // 3 месяца данных
  const startDate = subWeeks(new Date(), weeks);
  
  const demoRatings: WeeklyRatingData = {};
  const demoHypotheses: EnhancedHypothesis[] = [];
  const demoSubjects: Subject[] = [];
  
  // Генерация субъектов
  const subjects = [
    {
      id: 'subject-family',
      name: 'Семья',
      type: SubjectType.FAMILY,
      description: 'Близкие родственники',
      influenceLevel: 'high' as const,
      relationshipType: 'Поддерживающие',
      motivationFactors: ['Любовь', 'Забота', 'Поддержка'],
      resistanceFactors: ['Беспокойство', 'Переживания']
    },
    // ... другие субъекты
  ];
  
  demoSubjects.push(...subjects);
  
  // Генерация еженедельных рейтингов с реалистичными паттернами
  for (let i = 0; i < weeks; i++) {
    const weekStart = addWeeks(startDate, i);
    const weekId = format(weekStart, 'yyyy-ww');
    
    // Создание базовых значений с трендами и вариациями
    const baseValues = generateRealisticRatings(i, weeks);
    
    const rating: WeeklyRating = {
      id: weekId,
      weekNumber: getWeek(weekStart),
      startDate: startOfWeek(weekStart, { weekStartsOn: 1 }),
      endDate: endOfWeek(weekStart, { weekStartsOn: 1 }),
      ratings: baseValues,
      notes: generateRealisticNotes(baseValues),
      mood: determineMood(baseValues),
      keyEvents: generateKeyEvents(i),
      weather: generateWeather(weekStart),
      overallScore: calculateOverallScore(baseValues),
      createdAt: weekStart,
      updatedAt: weekStart
    };
    
    demoRatings[weekId] = rating;
  }
  
  // Генерация гипотез на основе данных
  const hypotheses = generateRealisticHypotheses(demoRatings, demoSubjects);
  demoHypotheses.push(...hypotheses);
  
  return {
    weeklyRatings: demoRatings,
    hypotheses: demoHypotheses,
    subjects: demoSubjects
  };
};
```

### 4. Вспомогательные утилиты (`src/lib/utils.ts`)

#### Объединение CSS классов
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### Генерация уникальных ID
```typescript
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
```

#### Форматирование дат
```typescript
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatWeekRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return `${format(start, 'dd.MM')} - ${format(end, 'dd.MM')}`;
};
```

#### Debounce функция
```typescript
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

#### Throttle функция
```typescript
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

## Паттерны использования

### 1. Композиция хуков
```typescript
const useDataManager = () => {
  const { hypotheses, createHypothesis } = useEnhancedHypotheses();
  const { ratings, updateWeekRating } = useWeeklyRatings();
  const { subjects } = useSubjects();
  const { insights, generateInsights } = useAIInsights();
  
  // Объединенная логика
  const createHypothesisWithContext = async (data: HypothesisFormData) => {
    const hypothesis = await createHypothesis(data);
    
    // Автоматическая генерация инсайтов после создания
    await generateInsights();
    
    return hypothesis;
  };
  
  return {
    // Данные
    hypotheses,
    ratings,
    subjects,
    insights,
    
    // Объединенные действия
    createHypothesisWithContext,
    
    // Отдельные действия
    updateWeekRating,
    generateInsights
  };
};
```

### 2. Кастомные хуки для конкретных случаев
```typescript
// Хук для dashboard страницы
const useDashboardData = () => {
  const { hypotheses } = useEnhancedHypotheses();
  const { ratings, getAnalytics } = useWeeklyRatings();
  const { insights } = useAIInsights();
  
  const dashboardMetrics = useMemo(() => {
    const analytics = getAnalytics();
    const activeHypotheses = hypotheses.filter(h => h.status === 'active');
    const totalProgress = activeHypotheses.reduce((sum, h) => sum + h.progress, 0) / activeHypotheses.length;
    
    return {
      totalHypotheses: hypotheses.length,
      activeHypotheses: activeHypotheses.length,
      averageProgress: totalProgress || 0,
      weeklyTrend: analytics.trendsOverTime.slice(-4),
      criticalInsights: insights.filter(i => i.importance === 'critical'),
      ...analytics
    };
  }, [hypotheses, ratings, insights]);
  
  return dashboardMetrics;
};
```

### 3. Хуки с внешними зависимостями
```typescript
// Хук для работы с localStorage
const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  return [storedValue, setValue] as const;
};
```

## Оптимизация производительности

### 1. Мемоизация вычислений
```typescript
// Мемоизация тяжелых расчетов
const useAnalytics = (ratings: WeeklyRatingData) => {
  const analytics = useMemo(() => {
    return calculateComplexAnalytics(ratings);
  }, [ratings]);
  
  return analytics;
};

// Мемоизация с зависимостями
const useFilteredHypotheses = (hypotheses: EnhancedHypothesis[], filters: any) => {
  const filtered = useMemo(() => {
    return hypotheses.filter(h => applyFilters(h, filters));
  }, [hypotheses, filters]);
  
  return filtered;
};
```

### 2. Debounce для частых обновлений
```typescript
const useDebounceValue = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 3. Lazy loading данных
```typescript
const useLazyData = <T>(fetchData: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const loadData = useCallback(async () => {
    if (isLoaded || isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await fetchData();
      setData(result);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading lazy data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, isLoaded, isLoading]);
  
  return { data, isLoading, isLoaded, loadData };
};
```

## Тестирование хуков

### 1. Unit тесты для утилит
```typescript
// strategy.test.ts
describe('calculatePriority', () => {
  it('should calculate priority correctly', () => {
    const hypothesis = {
      impact: 8,
      confidence: 7,
      effort: 3,
      risk: 2
    };
    
    const priority = calculatePriority(hypothesis);
    expect(priority).toBe(45); // Ожидаемое значение
  });
  
  it('should return 0 for incomplete data', () => {
    const hypothesis = { impact: 8 };
    const priority = calculatePriority(hypothesis);
    expect(priority).toBe(0);
  });
});
```

### 2. Интеграционные тесты для хуков
```typescript
// useEnhancedHypotheses.test.ts
import { renderHook, act } from '@testing-library/react';
import { useEnhancedHypotheses } from './useEnhancedHypotheses';

describe('useEnhancedHypotheses', () => {
  it('should create hypothesis correctly', async () => {
    const { result } = renderHook(() => useEnhancedHypotheses());
    
    const hypothesisData = {
      goal: { metricId: 'test', description: 'Test goal', targetValue: 8, currentValue: 5 },
      subjects: ['subject1'],
      conditions: 'ЕСЛИ я буду делать что-то',
      expectedOutcome: 'ТО получу результат',
      reasoning: 'ПОТОМУ ЧТО есть научное обоснование',
      impact: 8,
      effort: 3,
      confidence: 7,
      risk: 2,
      timeframe: 4
    };
    
    await act(async () => {
      const hypothesis = await result.current.createHypothesis(hypothesisData);
      expect(hypothesis.id).toBeDefined();
      expect(hypothesis.calculatedPriority).toBeGreaterThan(0);
    });
    
    expect(result.current.hypotheses).toHaveLength(1);
  });
});
```

## Лучшие практики

### 1. Разделение ответственности
- Каждый хук имеет одну основную ответственность
- Утилиты остаются чистыми функциями
- Бизнес-логика отделена от UI логики

### 2. Типизация
- Все хуки имеют четкие TypeScript интерфейсы
- Использование дженериков для переиспользуемости
- Строгая типизация возвращаемых значений

### 3. Обработка ошибок
- Graceful degradation при ошибках
- Логирование ошибок для отладки
- Fallback значения для стабильности

### 4. Производительность
- Мемоизация тяжелых вычислений
- Debounce для частых обновлений
- Lazy loading для необязательных данных
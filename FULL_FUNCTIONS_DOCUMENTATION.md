# Полная техническая документация функций - Life Quality Tracker

## 📋 Оглавление

1. [Основные компоненты](#основные-компоненты)
2. [Хуки и состояние](#хуки-и-состояние)  
3. [Утилиты и алгоритмы](#утилиты-и-алгоритмы)
4. [Типы данных](#типы-данных)
5. [UI компоненты](#ui-компоненты)
6. [Стратегические компоненты](#стратегические-компоненты)
7. [Алгоритмы и расчеты](#алгоритмы-и-расчеты)

---

## 🏗️ Основные компоненты

### LifeQualityTracker

**Файл:** `src/components/LifeQualityTracker.tsx`

Главный компонент приложения, управляющий всем состоянием и навигацией.

#### Основные функции состояния:

```tsx
const LifeQualityTracker = () => {
  // Состояние навигации
  const [currentView, setCurrentView] = useState('dashboard');
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Состояние рейтингов
  const [useQuickRating, setUseQuickRating] = useState(false);
  const [weekRatings, setWeekRatings] = useState({});
  const [metricNotes, setMetricNotes] = useState({});
  const [selectedMetric, setSelectedMetric] = useState(null);
  
  // Состояние UI
  const [animationDelay, setAnimationDelay] = useState(0);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Состояние кастомных метрик
  const [customMetrics, setCustomMetrics] = useState([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricDescription, setNewMetricDescription] = useState('');
  
  // Состояние стрик
  const [currentStreak, setCurrentStreak] = useState(5);
  const [bestStreak, setBestStreak] = useState(12);
  
  // Состояние стратегии
  const [strategyView, setStrategyView] = useState('dashboard');
  const [selectedHypothesisId, setSelectedHypothesisId] = useState(null);
}
```

#### Аналитические функции:

```tsx
// Генерация еженедельных инсайтов
const generateWeeklyInsights = () => {
  const recentData = mockData.slice(-4);
  // Анализ трендов и корреляций
  // Возвращает массив инсайтов с типами: 'trend', 'correlation', 'achievement'
}

// Расчет корреляции Пирсона
const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0);
  const sumYY = y.reduce((total, yi) => total + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

// Фильтрация данных по временному периоду
const getFilteredData = (filter: string) => {
  const filterMap = {
    'week': 1, 'month': 4, 'quarter': 12, 'year': 52
  };
  return mockData.slice(-(filterMap[filter] || 4));
}

// Расчет общего индекса качества жизни
const calculateOverallIndex = (weekData: any, metrics: any[]) => {
  const validRatings = metrics
    .map(m => weekData[m.name])
    .filter(rating => rating != null);
  
  return validRatings.length > 0 
    ? Math.round(validRatings.reduce((a, b) => a + b, 0) / validRatings.length)
    : 0;
}
```

#### Функции управления метриками:

```tsx
// Добавление кастомной метрики
const addCustomMetric = () => {
  if (!newMetricName.trim()) return;
  
  const newMetric = {
    id: `custom_${Date.now()}`,
    name: newMetricName,
    icon: '⭐',
    description: newMetricDescription,
    category: 'custom',
    isCustom: true
  };
  
  setCustomMetrics(prev => [...prev, newMetric]);
  // Сброс состояния формы
}

// Удаление кастомной метрики
const removeCustomMetric = (metricId: string) => {
  const metric = allMetrics.find(m => m.id === metricId);
  if (metric?.isCustom) {
    setCustomMetrics(prev => prev.filter(m => m.id !== metricId));
    // Очистка связанных данных
  }
}
```

#### Функции цветового кодирования:

```tsx
// Цвет оценки (1-10)
const getScoreColor = (value) => {
  if (value >= 8) return 'text-emerald-500';
  if (value >= 6) return 'text-blue-500';
  if (value >= 4) return 'text-yellow-500';
  return 'text-red-500';
}

// Цвет фона оценки
const getScoreBgColor = (value) => {
  if (value >= 8) return 'bg-emerald-500/10';
  if (value >= 6) return 'bg-blue-500/10';
  if (value >= 4) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}
```

#### Компоненты представлений:

```tsx
// Компонент ввода рейтинга
const RatingInput = ({ metric, value, onChange, onRemove, delay = 0, isCompleted = false }) => {
  // Поддержка обычного слайдера и быстрого emoji рейтинга
  // Анимации появления с задержкой
  // Индикаторы завершения
}

// Боковая панель навигации
const Sidebar = () => {
  // Навигация между разделами
  // Коллапс на мобильных устройствах
  // Индикаторы активного раздела
}

// Верхняя панель
const TopBar = () => {
  // Фильтры времени и категорий
  // Переключатель быстрого рейтинга
  // Кнопка коллапса сайдбара
}

// Главная панель
const DashboardView = () => {
  // Отображение графиков и метрик
  // Карточки с ключевыми показателями
  // Система стрик и достижений
}

// Аналитика
const AnalyticsView = () => {
  // Корреляционный анализ
  // Графики трендов
  // Персональные инсайты и рекомендации
}

// Рейтинги
const RatingView = () => {
  // Интерфейс оценки метрик
  // Завершенные и ожидающие метрики
  // Система уведомлений о завершении
}

// Детальный вид метрики
const MetricDetailView = () => {
  // Подробная информация о метрике
  // История изменений
  // Заметки и цели
}

// Области жизни
const AreasView = () => {
  // Группировка метрик по категориям
  // Сравнительный анализ областей
}
```

---

## 🔗 Хуки и состояние

### useEnhancedHypotheses

**Файл:** `src/hooks/strategy/useEnhancedHypotheses.ts`

Основной хук для управления гипотезами.

#### Основные функции:

```tsx
export const useEnhancedHypotheses = () => {
  const [hypotheses, setHypotheses] = useState<EnhancedHypothesis[]>([]);
  const [loading, setLoading] = useState(true);

  // Создание новой гипотезы
  const createHypothesis = useCallback((formData: HypothesisFormData): string => {
    const newHypothesis: EnhancedHypothesis = {
      ...formData,
      id: generateId(),
      calculatedPriority: calculatePriority(formData),
      validationStatus: ValidationStatus.PENDING,
      experimentStartDate: new Date(),
      experimentStatus: ExperimentStatus.NOT_STARTED,
      tasks: [],
      progress: 0,
      journal: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Автогенерация задач на основе гипотезы
    const defaultTasks = generateDefaultTasks(newHypothesis);
    newHypothesis.tasks = defaultTasks;
    
    // Валидация гипотезы
    const validation = validateHypothesis(newHypothesis);
    newHypothesis.validationStatus = validation.status;
    newHypothesis.validationErrors = validation.errors;
    
    // Сохранение в состояние и localStorage
    const updatedHypotheses = [...hypotheses, newHypothesis];
    setHypotheses(updatedHypotheses);
    saveToStorage(updatedHypotheses);
    
    return newHypothesis.id;
  }, [hypotheses, saveToStorage]);

  // Обновление гипотезы
  const updateHypothesis = useCallback((id: string, updates: Partial<EnhancedHypothesis>) => {
    const updatedHypotheses = hypotheses.map(h => {
      if (h.id === id) {
        const updated = { ...h, ...updates, updatedAt: new Date() };
        
        // Пересчет приоритета если изменились ключевые поля
        if (updates.impact || updates.effort || updates.confidence || updates.risk || updates.timeframe) {
          updated.calculatedPriority = calculatePriority(updated);
        }
        
        // Пересчет прогресса если изменились задачи
        if (updates.tasks) {
          updated.progress = calculateHypothesisProgress(updated.tasks);
        }
        
        // Повторная валидация
        if (updates.conditions || updates.expectedOutcome || updates.reasoning) {
          const validation = validateHypothesis(updated);
          updated.validationStatus = validation.status;
          updated.validationErrors = validation.errors;
        }
        
        return updated;
      }
      return h;
    });
    
    setHypotheses(updatedHypotheses);
    saveToStorage(updatedHypotheses);
  }, [hypotheses, saveToStorage]);

  // Переключение выполнения задачи
  const toggleTaskCompletion = useCallback((hypothesisId: string, taskId: string, index: number) => {
    const hypothesis = hypotheses.find(h => h.id === hypothesisId);
    if (!hypothesis) return;
    
    const updatedTasks = hypothesis.tasks.map(task => {
      if (task.id === taskId) {
        const newCompleted = [...task.completed];
        newCompleted[index] = !newCompleted[index];
        return { ...task, completed: newCompleted };
      }
      return task;
    });
    
    const newProgress = calculateHypothesisProgress(updatedTasks);
    updateHypothesis(hypothesisId, { 
      tasks: updatedTasks, 
      progress: newProgress 
    });
    
    // Празднование завершения на 100%
    if (newProgress === 100) {
      toast.success("🎉 Гипотеза полностью выполнена!");
    }
  }, [hypotheses, updateHypothesis]);

  // Добавление записи в журнал
  const addJournalEntry = useCallback((hypothesisId: string, entry: string, mood: 'positive' | 'negative' | 'neutral') => {
    const hypothesis = hypotheses.find(h => h.id === hypothesisId);
    if (!hypothesis) return;
    
    const newEntry: JournalEntry = {
      id: generateId(),
      date: new Date(),
      entry: entry.trim(),
      mood
    };
    
    updateHypothesis(hypothesisId, {
      journal: [...hypothesis.journal, newEntry]
    });
  }, [hypotheses, updateHypothesis]);

  // Получение активных гипотез (отсортированных по приоритету)
  const getActiveHypotheses = useCallback((): EnhancedHypothesis[] => {
    return hypotheses
      .filter(h => h.status === 'active')
      .sort((a, b) => (b.calculatedPriority || 0) - (a.calculatedPriority || 0));
  }, [hypotheses]);

  // Получение метрик стратегии
  const getStrategyMetrics = useCallback((): StrategyMetrics => {
    const activeHypotheses = hypotheses.filter(h => h.status === 'active');
    const validatedHypotheses = activeHypotheses.filter(h => h.validationStatus === ValidationStatus.VALIDATED);
    const totalProgress = activeHypotheses.reduce((sum, h) => sum + h.progress, 0);
    
    return {
      activeHypotheses: activeHypotheses.length,
      validatedHypotheses: validatedHypotheses.length,
      averageProgress: activeHypotheses.length > 0 
        ? Math.round(totalProgress / activeHypotheses.length) 
        : 0,
      totalSubjects: new Set(activeHypotheses.flatMap(h => h.subjects)).size
    };
  }, [hypotheses]);

  return {
    hypotheses,
    loading,
    createHypothesis,
    updateHypothesis,
    deleteHypothesis,
    toggleTaskCompletion,
    addJournalEntry,
    getHypothesis,
    getActiveHypotheses,
    getStrategyMetrics
  };
};
```

### useSubjects

**Файл:** `src/hooks/strategy/useSubjects.ts`

Хук для управления субъектами (люди/группы, чье поведение влияет на гипотезы).

#### Основные функции:

```tsx
export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Создание нового кастомного субъекта
  const createSubject = useCallback((subjectData: Omit<Subject, 'id'>): string => {
    const newSubject: Subject = {
      ...subjectData,
      id: generateId(),
      type: SubjectType.CUSTOM
    };

    const updatedSubjects = [...subjects, newSubject];
    setSubjects(updatedSubjects);
    saveToStorage(updatedSubjects);
    
    return newSubject.id;
  }, [subjects, saveToStorage]);

  // Обновление субъекта
  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    const updatedSubjects = subjects.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    
    setSubjects(updatedSubjects);
    saveToStorage(updatedSubjects);
  }, [subjects, saveToStorage]);

  // Удаление кастомного субъекта
  const deleteSubject = useCallback((id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (!subject || subject.type !== SubjectType.CUSTOM) {
      console.warn('Cannot delete default subject');
      return;
    }

    const updatedSubjects = subjects.filter(s => s.id !== id);
    setSubjects(updatedSubjects);
    saveToStorage(updatedSubjects);
  }, [subjects, saveToStorage]);

  // Получение субъектов по ID
  const getSubjectsByIds = useCallback((ids: string[]): Subject[] => {
    return subjects.filter(s => ids.includes(s.id));
  }, [subjects]);

  return {
    subjects,
    loading,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubject: (id: string) => subjects.find(s => s.id === id),
    getSubjectsByType: (type: SubjectType) => subjects.filter(s => s.type === type),
    getSubjectsByIds
  };
};
```

### useMobile

**Файл:** `src/hooks/use-mobile.tsx`

Хук для определения мобильного устройства.

```tsx
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
```

### useToast

**Файл:** `src/hooks/use-toast.ts`

Хук для системы уведомлений.

```tsx
// Типы уведомлений
type ToastProps = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ ...props }: Omit<ToastProps, "id">) => {
    const id = genId();
    const newToast = { ...props, id };
    setToasts(prev => [...prev, newToast]);
    
    // Автоудаление через 5 секунд
    setTimeout(() => dismiss(id), 5000);
    
    return { id, dismiss: () => dismiss(id) };
  };

  const dismiss = (toastId?: string) => {
    setToasts(prev => 
      toastId 
        ? prev.filter(t => t.id !== toastId)
        : []
    );
  };

  return { toast, dismiss, toasts };
};
```

---

## ⚙️ Утилиты и алгоритмы

### Стратегические утилиты

**Файл:** `src/utils/strategy.ts`

#### Расчет приоритета (ICE Framework):

```tsx
export const calculatePriority = (hypothesis: Partial<EnhancedHypothesis>): number => {
  const { impact = 5, effort = 5, confidence = 5, risk = 5, timeframe = 4 } = hypothesis;
  
  // Адаптированная формула ICE с учетом риска и времени
  // Priority = (Impact × Confidence) / (Effort × Risk × (Timeframe / 4))
  const priority = (impact * confidence) / (effort * risk * (timeframe / 4));
  
  return Math.round(priority * 100) / 100;
};
```

#### Расчет прогресса гипотезы:

```tsx
export const calculateHypothesisProgress = (tasks: Task[]): number => {
  if (!tasks || tasks.length === 0) return 0;
  
  let totalSlots = 0;
  let completedSlots = 0;
  
  tasks.forEach(task => {
    totalSlots += task.completed.length;
    completedSlots += task.completed.filter(Boolean).length;
  });
  
  return totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;
};
```

#### Валидация гипотезы:

```tsx
export const validateHypothesis = (hypothesis: Partial<EnhancedHypothesis>): {
  status: ValidationStatus;
  errors: ValidationError[];
} => {
  const errors: ValidationError[] = [];

  // Проверка формата "ЕСЛИ-ТО-ПОТОМУ ЧТО"
  if (!hypothesis.conditions || !hypothesis.expectedOutcome || !hypothesis.reasoning) {
    errors.push({
      type: 'format',
      message: 'Не все части гипотезы заполнены (ЕСЛИ-ТО-ПОТОМУ ЧТО)'
    });
  }

  // Проверка содержания
  if (hypothesis.conditions && hypothesis.conditions.length < 10) {
    errors.push({
      type: 'content',
      message: 'Условие слишком короткое, добавьте детали'
    });
  }

  if (hypothesis.reasoning && hypothesis.reasoning.length < 15) {
    errors.push({
      type: 'content',
      message: 'Объяснение механики слишком короткое'
    });
  }

  // Проверка направленности
  if (!hypothesis.subjects || hypothesis.subjects.length === 0) {
    errors.push({
      type: 'direction',
      message: 'Не указаны субъекты, поведение которых должно измениться'
    });
  }

  // Проверка трассировки
  if (!hypothesis.goal || !hypothesis.goal.metricId) {
    errors.push({
      type: 'traceability',
      message: 'Гипотеза не связана с конкретной целью/метрикой'
    });
  }

  // Проверка достижимости
  if (hypothesis.goal && hypothesis.goal.targetValue <= hypothesis.goal.currentValue) {
    errors.push({
      type: 'achievability',
      message: 'Целевое значение должно быть выше текущего'
    });
  }

  const status = errors.length === 0 ? ValidationStatus.VALIDATED : ValidationStatus.FAILED_VALIDATION;
  
  return { status, errors };
};
```

#### Категоризация приоритета:

```tsx
export const getPriorityCategory = (priority: number): PriorityCategory => {
  if (priority >= 5.0) {
    return {
      label: 'Высокий',
      gradient: 'from-emerald-400 to-green-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    };
  } else if (priority >= 2.0) {
    return {
      label: 'Средний',
      gradient: 'from-yellow-400 to-amber-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    };
  } else {
    return {
      label: 'Низкий',
      gradient: 'from-red-400 to-pink-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50'
    };
  }
};
```

#### Цветовое кодирование прогресса:

```tsx
export const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'from-emerald-400 to-green-500';
  if (progress >= 50) return 'from-yellow-400 to-amber-500';
  return 'from-blue-400 to-blue-500';
};
```

#### Мотивационные сообщения:

```tsx
export const getMotivationalMessage = (progress: number): string => {
  if (progress === 0) return "Начинайте действовать! 🚀";
  if (progress <= 25) return "Каждый шаг приближает к цели! 💪";
  if (progress <= 50) return "Вы входите в ритм! ⭐";
  if (progress <= 75) return "Отличный прогресс! 🎯";
  if (progress < 100) return "Почти у цели! 🏆";
  return "Эксперимент завершен! 🎉";
};
```

#### Создание задач по умолчанию:

```tsx
export const createDefaultTask = (description: string, frequency: 'daily' | 'weekly'): Task => {
  return {
    id: generateId(),
    description,
    frequency,
    completed: new Array(7).fill(false),
    priority: 'medium',
    linkedToHypothesis: true
  };
};
```

#### Генерация задач для гипотезы:

```tsx
export const generateDefaultTasks = (hypothesis: EnhancedHypothesis): Task[] => {
  const tasks: Task[] = [];
  
  // Основная ежедневная задача на основе условий
  if (hypothesis.conditions) {
    tasks.push(createDefaultTask(
      `Выполнение: ${hypothesis.conditions.slice(0, 50)}...`,
      'daily'
    ));
  }
  
  // Еженедельная задача отслеживания прогресса
  tasks.push(createDefaultTask(
    'Оценка прогресса и корректировка подхода',
    'weekly'
  ));
  
  // Ежедневная задача ведения журнала
  tasks.push(createDefaultTask(
    'Запись наблюдений в журнал',
    'daily'
  ));
  
  return tasks;
};
```

### Демо-данные

**Файл:** `src/utils/demoData.ts`

#### Создание демонстрационных гипотез:

```tsx
export const createDemoHypotheses = (): EnhancedHypothesis[] => {
  // Создает 3 демо-гипотезы:
  // 1. Улучшение физического здоровья
  // 2. Улучшение общения с партнером  
  // 3. Увеличение финансовой подушки
  
  // Каждая гипотеза включает:
  // - Полную структуру ЕСЛИ-ТО-ПОТОМУ ЧТО
  // - Связанные задачи с частичным выполнением
  // - Записи в журнале
  // - Различные статусы валидации
}

export const saveDemoData = () => {
  const demoHypotheses = createDemoHypotheses();
  
  // Расчет приоритетов и прогресса
  const updatedHypotheses = demoHypotheses.map(h => {
    const { calculatePriority, calculateHypothesisProgress } = require('@/utils/strategy');
    return {
      ...h,
      calculatedPriority: calculatePriority(h),
      progress: calculateHypothesisProgress(h.tasks)
    };
  });
  
  localStorage.setItem('lqt_hypotheses', JSON.stringify(updatedHypotheses));
};

export const clearDemoData = () => {
  localStorage.removeItem('lqt_hypotheses');
  localStorage.removeItem('lqt_subjects');
  localStorage.removeItem('lqt_journal');
};
```

---

## 📊 Типы данных

### Основные интерфейсы стратегии

**Файл:** `src/types/strategy.ts`

#### EnhancedHypothesis:

```tsx
interface EnhancedHypothesis {
  id: string;
  goal: {
    metricId: string;           // ID связанной метрики
    description: string;        // Описание цели
    targetValue: number;        // Целевое значение (1-10)
    currentValue: number;       // Текущее значение
  };
  subjects: string[];           // ID субъектов
  conditions: string;           // ЕСЛИ: условия
  expectedOutcome: string;      // ТО: ожидаемый результат
  reasoning: string;            // ПОТОМУ ЧТО: обоснование
  
  // Приоритизация (ICE Framework)
  impact: number;               // Влияние (1-10)
  effort: number;               // Усилия (1-10)
  confidence: number;           // Уверенность (1-10)
  risk: number;                 // Риск (1-10)
  timeframe: number;            // Временные рамки (недели)
  calculatedPriority: number;   // Рассчитанный приоритет
  
  // Валидация
  validationStatus: ValidationStatus;
  validationErrors: ValidationError[];
  
  // Эксперимент
  experimentStartDate: Date;
  experimentStatus: ExperimentStatus;
  experimentResults: any[];
  successCriteria: string[];
  
  // Выполнение
  tasks: Task[];
  status: 'active' | 'completed' | 'paused';
  progress: number;             // 0-100%
  
  // Журнал
  journal: JournalEntry[];
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
}
```

#### Task:

```tsx
interface Task {
  id: string;
  description: string;
  frequency: 'daily' | 'weekly';
  completed: boolean[];         // 7 элементов для трекинга
  priority: 'high' | 'medium' | 'low';
  linkedToHypothesis: boolean;
}
```

#### Subject:

```tsx
interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  description: string;
  influenceLevel: 'high' | 'medium' | 'low';
  relationshipType: string;
  motivationFactors: string[];
  resistanceFactors: string[];
}
```

#### Перечисления:

```tsx
enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  FAILED_VALIDATION = 'failed_validation'
}

enum ExperimentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

enum SubjectType {
  SELF = 'self',
  FAMILY = 'family',
  FRIENDS = 'friends',
  COLLEAGUES = 'colleagues',
  CUSTOM = 'custom'
}
```

---

## 🎨 Стратегические компоненты

### StrategyDashboard

**Файл:** `src/components/strategy/StrategyDashboard.tsx`

Главная панель стратегии с обзором гипотез.

#### Основные функции:

```tsx
// Empty State для пустого состояния
const EmptyState: React.FC<{ onCreateHypothesis: () => void }> = ({ onCreateHypothesis }) => {
  // Отображает призыв к действию для создания первой гипотезы
  // Анимированная иконка лампочки
  // Описание преимуществ научного подхода
}

// Обзор метрик
const MetricsOverview: React.FC<{ metrics: any }> = ({ metrics }) => {
  // 4 карточки с ключевыми показателями:
  // - Активные гипотезы
  // - Валидные гипотезы  
  // - Количество субъектов
  // - Средний прогресс
}

export const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
  onCreateHypothesis,
  onViewHypothesis
}) => {
  const { getActiveHypotheses, getStrategyMetrics, loading } = useEnhancedHypotheses();
  
  const activeHypotheses = getActiveHypotheses();
  const metrics = getStrategyMetrics();

  // Условный рендеринг empty state или полного dashboard
  // Сетка гипотез с сортировкой по приоритету
  // Кнопки создания новых гипотез
}
```

### HypothesisCard

**Файл:** `src/components/strategy/HypothesisCard.tsx`

Карточка отображения гипотезы.

#### Основные функции:

```tsx
export const HypothesisCard: React.FC<HypothesisCardProps> = ({
  hypothesis,
  priority,
  onView
}) => {
  const { getSubjectsByIds } = useSubjects();
  const subjects = getSubjectsByIds(hypothesis.subjects);
  const priorityCategory = getPriorityCategory(hypothesis.calculatedPriority);
  const progressColor = getProgressColor(hypothesis.progress);

  // Элементы карточки:
  // - Номер приоритета с цветовым кодированием
  // - Бейдж связанной метрики
  // - Статус валидации (✓ или ⚠)
  // - Процент прогресса крупными цифрами
  // - Описание цели
  // - Текущее → целевое значение
  // - Теги субъектов
  // - Превью условия "ЕСЛИ"
  // - Прогресс-бар с градиентом
  // - Метаинформация о задачах
}
```

### HypothesisDetail

**Файл:** `src/components/strategy/HypothesisDetail.tsx`

Детальный вид гипотезы.

#### Основные функции:

```tsx
export const HypothesisDetail: React.FC<HypothesisDetailProps> = ({ hypothesisId, onBack }) => {
  const { getHypothesis } = useEnhancedHypotheses();
  const { getSubjectsByIds } = useSubjects();
  
  const hypothesis = getHypothesis(hypothesisId);
  const subjects = getSubjectsByIds(hypothesis?.subjects || []);

  // Разделы детального вида:
  // 1. Шапка с кнопкой возврата
  // 2. Информация о цели
  // 3. Связанные субъекты
  // 4. Полная формулировка гипотезы (ЕСЛИ-ТО-ПОТОМУ ЧТО)
  // 5. Карточки приоритизации
  // 6. Общий прогресс
  // 7. Ошибки валидации (если есть)
  // 8. TaskTracker компонент
  // 9. ExperimentJournal компонент
}
```

### TaskTracker

**Файл:** `src/components/strategy/TaskTracker.tsx`

Трекер выполнения задач.

#### Основные функции:

```tsx
export const TaskTracker: React.FC<TaskTrackerProps> = ({ hypothesisId }) => {
  const { getHypothesis, toggleTaskCompletion } = useEnhancedHypotheses();
  const hypothesis = getHypothesis(hypothesisId);

  const handleTaskToggle = (taskId: string, index: number) => {
    toggleTaskCompletion(hypothesisId, taskId, index);
  };

  // Функции компонента:
  // - Отображение списка задач
  // - Группировка по частоте (ежедневные/еженедельные)
  // - Интерактивные кнопки дней/недель
  // - Подсчет прогресса по каждой задаче
  // - Общий прогресс-бар
  // - Цветовое кодирование выполнения
}
```

### ExperimentJournal

**Файл:** `src/components/strategy/ExperimentJournal.tsx`

Журнал экспериментальных наблюдений.

#### Основные функции:

```tsx
export const ExperimentJournal: React.FC<ExperimentJournalProps> = ({ hypothesisId }) => {
  const [newEntry, setNewEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState<'positive' | 'negative' | 'neutral'>('neutral');
  
  const { getHypothesis, addJournalEntry } = useEnhancedHypotheses();
  const hypothesis = getHypothesis(hypothesisId);

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      addJournalEntry(hypothesisId, newEntry, selectedMood);
      setNewEntry('');
      setSelectedMood('neutral');
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  // Функции компонента:
  // - Форма добавления новых записей
  // - Выбор настроения (позитивное/негативное/нейтральное)
  // - Список существующих записей с датами
  // - Иконки настроения
  // - Хронологическая сортировка
}
```

### HypothesisWizard

**Файл:** `src/components/strategy/HypothesisWizard.tsx`

Мастер создания гипотез (4 шага).

#### Основные функции:

```tsx
export const HypothesisWizard: React.FC<HypothesisWizardProps> = ({
  onComplete,
  onCancel,
  availableMetrics
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<HypothesisFormData>({
    goal: { metricId: '', description: '', targetValue: 5, currentValue: 3 },
    subjects: [],
    conditions: '',
    expectedOutcome: '',
    reasoning: '',
    impact: 5,
    effort: 5,
    confidence: 5,
    risk: 5,
    timeframe: 4
  });

  const steps = [
    { title: 'Цель', icon: Target, description: 'Определите цель эксперимента' },
    { title: 'Субъекты', icon: Users, description: 'Выберите участников' },
    { title: 'Гипотеза', icon: Lightbulb, description: 'Сформулируйте гипотезу' },
    { title: 'Приоритет', icon: Star, description: 'Оцените приоритет' }
  ];

  // Шаг 1: Выбор цели
  const Step1 = () => {
    // Dropdown выбора метрики
    // Описание цели
    // Слайдеры текущего и целевого значения
  };

  // Шаг 2: Выбор субъектов
  const Step2 = () => {
    // Список доступных субъектов
    // Множественный выбор
    // Группировка по типам
  };

  // Шаг 3: Формулирование гипотезы
  const Step3 = () => {
    // Три текстовых поля:
    // ЕСЛИ (условия)
    // ТО (ожидаемый результат)
    // ПОТОМУ ЧТО (обоснование)
  };

  // Шаг 4: Приоритизация
  const Step4 = () => {
    // 5 слайдеров: влияние, усилия, уверенность, риск, время
    // Автоматический расчет приоритета
    // Категория приоритета
  };

  // Навигация между шагами
  // Валидация на каждом шаге
  // Прогресс-индикатор
  // Финальное создание гипотезы
}
```

---

## 🧮 Алгоритмы и расчеты

### ICE Framework (приоритизация)

Адаптированная формула для расчета приоритета гипотез:

```
Priority = (Impact × Confidence) / (Effort × Risk × (Timeframe / 4))

Где:
- Impact: влияние на качество жизни (1-10)
- Confidence: уверенность в успехе (1-10)  
- Effort: необходимые усилия (1-10)
- Risk: уровень риска (1-10)
- Timeframe: временные рамки в неделях

Категории:
- Высокий приоритет: ≥ 5.0
- Средний приоритет: 2.0 - 4.9
- Низкий приоритет: < 2.0
```

### Расчет прогресса

```
Progress = (Completed Tasks Slots / Total Tasks Slots) × 100%

Где:
- Completed Tasks Slots: количество выполненных слотов задач
- Total Tasks Slots: общее количество слотов всех задач
- Каждая задача имеет 7 слотов (дни недели)
```

### Корреляция Пирсона

Для анализа связей между метриками:

```
r = (n∑xy - ∑x∑y) / √[(n∑x² - (∑x)²)(n∑y² - (∑y)²)]

Где:
- n: количество наблюдений
- x, y: значения двух метрик
- r: коэффициент корреляции (-1 до 1)
```

### Система валидации

Автоматическая проверка гипотез по 5 критериям:

1. **Формат**: наличие всех частей ЕСЛИ-ТО-ПОТОМУ ЧТО
2. **Содержание**: достаточная детализация (минимум символов)
3. **Направленность**: указаны субъекты изменения
4. **Трассировка**: связь с конкретной метрикой
5. **Достижимость**: целевое значение выше текущего

### Цветовое кодирование

#### Приоритет:
- Высокий: `from-emerald-400 to-green-500` 
- Средний: `from-yellow-400 to-amber-500`
- Низкий: `from-red-400 to-pink-500`

#### Прогресс:
- 80%+: `from-emerald-400 to-green-500`
- 50%+: `from-yellow-400 to-amber-500` 
- <50%: `from-blue-400 to-blue-500`

#### Настроение в журнале:
- Позитивное: 😊 `text-emerald-500`
- Негативное: 😞 `text-red-500`
- Нейтральное: 😐 `text-muted-foreground`

---

## 📱 UI компоненты

### Основные shadcn компоненты

Используются стандартные UI компоненты с кастомизацией:

- **Button**: кнопки с вариантами и градиентами
- **Card**: контейнеры контента с тенями
- **Badge**: метки и теги с цветовым кодированием  
- **Progress**: прогресс-бары с градиентами
- **Slider**: ползунки для оценок (1-10)
- **Textarea**: многострочный ввод текста
- **Select**: выпадающие списки
- **Dialog**: модальные окна
- **Toast**: уведомления

### Специализированные компоненты

#### QuickEmojiRating

```tsx
// Быстрая оценка эмодзи (1, 3, 5, 7, 9)
const QuickEmojiRating: React.FC<QuickEmojiRatingProps> = ({ value, onChange, disabled }) => {
  const emojiMap = {
    1: '😢', 3: '😐', 5: '😊', 7: '😍', 9: '🚀'
  };
  
  // Интерактивные кнопки с эмодзи
  // Hover эффекты и анимации
  // Отключение при disabled
}
```

#### MobileHeader

```tsx
// Заголовок для мобильных устройств  
const MobileHeader: React.FC<MobileHeaderProps> = ({ title, onMenuClick, showMenu }) => {
  // Адаптивная навигация
  // Кнопка меню-гамбургер
  // Заголовок страницы
}
```

#### BottomNavigation

```tsx
// Нижняя навигация для мобильных
const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentView, onViewChange }) => {
  // Иконки разделов
  // Индикаторы активного раздела
  // Touch-friendly размеры
}
```

---

## 🔧 Техническая архитектура

### Файловая структура

```
src/
├── components/
│   ├── LifeQualityTracker.tsx    # Главный компонент
│   ├── strategy/                 # Компоненты стратегии
│   │   ├── StrategyDashboard.tsx
│   │   ├── HypothesisCard.tsx
│   │   ├── HypothesisDetail.tsx
│   │   ├── HypothesisWizard.tsx
│   │   ├── TaskTracker.tsx
│   │   └── ExperimentJournal.tsx
│   ├── tracker/                  # Компоненты трекера
│   └── ui/                       # UI компоненты
├── hooks/
│   ├── strategy/                 # Хуки стратегии
│   │   ├── useEnhancedHypotheses.ts
│   │   └── useSubjects.ts
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── types/
│   └── strategy.ts               # Типы стратегии
├── utils/
│   ├── strategy.ts               # Утилиты стратегии
│   └── demoData.ts              # Демо-данные
└── lib/
    └── utils.ts                  # Общие утилиты
```

### Хранение данных

**LocalStorage ключи:**
- `lqt_hypotheses` - гипотезы
- `lqt_subjects` - субъекты  
- `lqt_journal` - журнал записей

### Состояние приложения

**Основное состояние** в `LifeQualityTracker`:
- Навигация между разделами
- Фильтры и настройки
- Пользовательские данные

**Стратегическое состояние** в хуках:
- Управление гипотезами
- Управление субъектами
- Валидация и расчеты

### Производительность

**Оптимизации:**
- `React.memo` для карточек компонентов
- `useMemo` для тяжелых вычислений
- `useCallback` для стабильных функций
- Lazy loading компонентов
- Дебаунс для поиска

---

## 🎯 Заключение

Проект Life Quality Tracker представляет собой комплексную систему для научного подхода к улучшению качества жизни. Раздел "Стратегия" реализует адаптированную методологию "Карты гипотез" с полным циклом создания, валидации, выполнения и анализа экспериментов.

### Ключевые преимущества архитектуры:

1. **Модульность** - четкое разделение компонентов и ответственности
2. **Типизация** - полная типизация TypeScript для надежности
3. **Состояние** - централизованное управление через хуки
4. **Валидация** - автоматическая проверка качества гипотез
5. **UX** - интуитивный интерфейс с научным подходом
6. **Адаптивность** - поддержка мобильных устройств
7. **Производительность** - оптимизированный рендеринг

Система готова к расширению дополнительными возможностями и интеграции с внешними сервисами.
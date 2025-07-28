# Типы данных и интерфейсы

## Обзор

Система типов обеспечивает строгую типизацию всех данных приложения, включая структуры данных, API интерфейсы, состояние компонентов и вспомогательные типы.

## Основные типы данных

### 1. Типы приложения (`src/types/app.ts`)

#### Состояние пользователя
```typescript
export type UserState = 'empty' | 'demo' | 'real_data';
```

**Описание состояний**:
- `empty` - новый пользователь без данных
- `demo` - демонстрационный режим с тестовыми данными
- `real_data` - пользователь с реальными данными

#### Состояние данных приложения
```typescript
export interface AppDataState {
  userState: UserState;
  isDemoMode: boolean;
  hasData: boolean;
  lastDataSync: Date | null;
}
```

#### Секции данных
```typescript
export interface DataSection {
  hypotheses: boolean;
  weeklyRatings: boolean;
  subjects: boolean;
  aiInsights: boolean;
  goals: boolean;
}
```

#### Статус синхронизации
```typescript
export interface DataSyncStatus {
  isLoading: boolean;
  lastSync: Date | null;
  sections: DataSection;
}
```

### 2. Типы еженедельных рейтингов (`src/types/weeklyRating.ts`)

#### Основная структура рейтинга
```typescript
export interface WeeklyRating {
  id: string;                    // Уникальный идентификатор
  weekNumber: number;            // Номер недели в году (1-53)
  startDate: Date;               // Начало недели (понедельник)
  endDate: Date;                 // Конец недели (воскресенье)
  ratings: Record<string, number>; // metricId -> rating (1-10)
  notes: Record<string, string>;   // metricId -> текстовая заметка
  mood: WeeklyMood;              // Общее настроение недели
  keyEvents: string[];           // Ключевые события недели
  weather?: string;              // Погодные условия (опционально)
  overallScore: number;          // Общий балл недели (1-10)
  createdAt: Date;               // Дата создания записи
  updatedAt: Date;               // Дата последнего обновления
}
```

#### Настроение недели
```typescript
export type WeeklyMood = 'excellent' | 'good' | 'neutral' | 'poor' | 'terrible';
```

#### Коллекция рейтингов
```typescript
export interface WeeklyRatingData {
  [weekId: string]: WeeklyRating;
}
```

#### Данные календарного дня
```typescript
export interface CalendarDayData {
  date: Date;
  hasRating: boolean;
  overallScore?: number;
  mood?: WeeklyMood;
}
```

#### Аналитика рейтингов
```typescript
export interface WeeklyRatingAnalytics {
  // Средние значения по каждой метрике
  averageByMetric: Record<string, number>;
  
  // Тренды изменения во времени
  trendsOverTime: Array<{
    weekNumber: number;
    averageScore: number;
    date: string;
  }>;
  
  // Лучшая и худшая недели
  bestWeek: WeeklyRating | null;
  worstWeek: WeeklyRating | null;
  
  // Распределение настроений
  moodDistribution: Record<WeeklyMood, number>;
  
  // Сезонные тренды (зима, весна, лето, осень)
  seasonalTrends: Record<string, number>;
}
```

### 3. Типы стратегий и гипотез (`src/types/strategy.ts`)

#### Метрика
```typescript
export interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}
```

#### Цель
```typescript
export interface Goal {
  id: string;
  metricName: string;
  metricIcon: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  isCompleted: boolean;
  createdAt: string;
}
```

#### Статусы валидации
```typescript
export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  FAILED_VALIDATION = 'failed_validation'
}
```

#### Статусы эксперимента
```typescript
export enum ExperimentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}
```

#### Типы субъектов
```typescript
export enum SubjectType {
  SELF = 'self',
  FAMILY = 'family',
  COLLEAGUES = 'colleagues',
  FRIENDS = 'friends',
  ENVIRONMENT = 'environment',
  CUSTOM = 'custom'
}
```

#### Ошибки валидации
```typescript
export interface ValidationError {
  type: 'format' | 'content' | 'direction' | 'traceability';
  message: string;
}
```

#### Запись в журнале
```typescript
export interface JournalEntry {
  id: string;
  date: Date;
  entry: string;
  mood: 'positive' | 'negative' | 'neutral';
}
```

#### Еженедельный прогресс
```typescript
export interface WeeklyProgress {
  week: number;              // Номер недели (1-6)
  startDate: Date;           // Дата начала недели
  endDate: Date;             // Дата окончания недели
  rating: 0 | 1 | 2 | 3 | 4; // 0 = не оценено, 1-4 = рейтинг
  note?: string;             // Заметка к неделе
  mood?: 'positive' | 'negative' | 'neutral';
  tags?: string[];           // Теги для категоризации
  keyEvents?: string[];      // Ключевые события недели
  photos?: string[];         // Пути к фотографиям
  lastModified?: Date;       // Время последнего изменения
}
```

#### Субъект
```typescript
export interface Subject {
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

#### Расширенная гипотеза
```typescript
export interface EnhancedHypothesis {
  id: string;
  
  // Цель гипотезы
  goal: {
    metricId: string;
    description: string;
    targetValue: number;
    currentValue: number;
  };
  
  // Участники
  subjects: string[]; // Subject IDs
  
  // Формулировка гипотезы (ЕСЛИ-ТО-ПОТОМУ ЧТО)
  conditions: string;        // ЕСЛИ: конкретные действия
  expectedOutcome: string;   // ТО: ожидаемый результат
  reasoning: string;         // ПОТОМУ ЧТО: научное обоснование
  
  // ICE Framework оценки
  impact: number;      // Влияние (1-10)
  effort: number;      // Усилия (1-10)
  confidence: number;  // Уверенность (1-10)
  risk: number;        // Риск (1-10)
  
  // Временные параметры
  timeframe: number;           // Временные рамки (недели)
  calculatedPriority: number;  // Автоматически рассчитываемый приоритет
  
  // Статусы
  validationStatus: ValidationStatus;
  validationErrors: ValidationError[];
  experimentStartDate: Date;
  experimentStatus: ExperimentStatus;
  status: 'active' | 'completed' | 'paused';
  
  // Прогресс и результаты
  progress: number;                // Прогресс выполнения (0-100%)
  experimentResults: any[];
  successCriteria: string[];
  weeklyProgress: WeeklyProgress[];
  
  // Журнал и заметки
  journal: JournalEntry[];
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
}
```

#### Данные формы гипотезы
```typescript
export interface HypothesisFormData {
  goal: {
    metricId: string;
    description: string;
    targetValue: number;
    currentValue: number;
  };
  subjects: string[];
  conditions: string;
  expectedOutcome: string;
  reasoning: string;
  impact: number;
  effort: number;
  confidence: number;
  risk: number;
  timeframe: number;
  weeklyProgress?: WeeklyProgress[];
}
```

#### Метрики стратегий
```typescript
export interface StrategyMetrics {
  activeHypotheses: number;
  validatedHypotheses: number;
  totalSubjects: number;
  averageProgress: number;
}
```

#### Категория приоритета
```typescript
export interface PriorityCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  gradient: string;
}
```

### 4. Типы ИИ системы (`src/types/ai.ts`)

#### Сообщение ИИ
```typescript
export interface AIMessage {
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

#### Инсайт ИИ
```typescript
export interface AIInsight {
  id: string;
  type: 'correlation' | 'trend' | 'pattern' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  confidence: number; // 0-100%
  importance: 'low' | 'medium' | 'high' | 'critical';
  data: any; // Данные для визуализации
  actionable: boolean;
  actions?: AIAction[];
  createdAt: Date;
  expiresAt?: Date;
}
```

#### Действие ИИ
```typescript
export interface AIAction {
  id: string;
  type: string;
  title: string;
  description: string;
  params?: Record<string, any>;
}
```

#### Рекомендация ИИ
```typescript
export interface AIRecommendation {
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

#### Контекст ИИ
```typescript
export interface AIContext {
  userId?: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  focusAreas: string[];
  preferences: {
    analysisDepth: 'basic' | 'detailed' | 'advanced';
    communicationStyle: 'formal' | 'casual' | 'motivational';
  };
  currentData: {
    hypotheses: EnhancedHypothesis[];
    weeklyRatings: WeeklyRatingData;
    subjects: Subject[];
  };
}
```

## Utility типы

### 1. Обобщенные типы
```typescript
// Общий тип для ID
export type ID = string;

// Тип для временных меток
export type Timestamp = Date | string;

// Опциональные поля
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Обязательные поля
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Глубокая опциональность
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### 2. Типы для форм
```typescript
// Базовый тип для состояния формы
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Тип для валидации
export type ValidationRule<T> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

// Тип для обработчиков формы
export interface FormHandlers<T> {
  onChange: (field: keyof T, value: T[keyof T]) => void;
  onBlur: (field: keyof T) => void;
  onSubmit: (data: T) => Promise<void> | void;
  onReset: () => void;
}
```

### 3. Типы для API
```typescript
// Базовый ответ API
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Состояние загрузки
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Пагинация
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### 4. Типы для UI компонентов
```typescript
// Размеры компонентов
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Варианты компонентов
export type ComponentVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

// Позиционирование
export type Position = 'top' | 'right' | 'bottom' | 'left';

// Базовые props для компонентов
export interface BaseComponentProps {
  className?: string;
  id?: string;
  testId?: string;
}

// Props для кликабельных компонентов
export interface ClickableProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}

// Props для форм
export interface FormControlProps extends BaseComponentProps {
  name: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}
```

## Типы для хуков

### 1. Типы состояния хуков
```typescript
// Состояние с данными
export interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Состояние с коллекцией
export interface CollectionState<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

// Состояние модального окна
export interface ModalState<T = any> {
  isOpen: boolean;
  data: T | null;
}

// Состояние фильтров
export interface FilterState<T> {
  filters: Partial<T>;
  activeFilters: (keyof T)[];
}
```

### 2. Типы для обработчиков
```typescript
// Обработчики CRUD операций
export interface CRUDHandlers<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  create: (data: CreateData) => Promise<T>;
  read: (id: string) => Promise<T>;
  update: (id: string, data: UpdateData) => Promise<T>;
  delete: (id: string) => Promise<void>;
  list: (params?: any) => Promise<T[]>;
}

// Обработчики навигации
export interface NavigationHandlers {
  goTo: (path: string) => void;
  goBack: () => void;
  goForward: () => void;
  replace: (path: string) => void;
}

// Обработчики уведомлений
export interface NotificationHandlers {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}
```

## Константы и перечислимые типы

### 1. Метрики
```typescript
export const BASE_METRICS = [
  {
    id: 'physical_health',
    name: 'Физическое здоровье',
    icon: '💪',
    description: 'Общее самочувствие, энергия, физическая форма',
    category: 'health'
  },
  {
    id: 'mental_health',
    name: 'Ментальное здоровье',
    icon: '🧠',
    description: 'Эмоциональное состояние, стресс, психологический комфорт',
    category: 'health'
  },
  // ... остальные метрики
] as const;

export type MetricId = typeof BASE_METRICS[number]['id'];
export type MetricCategory = typeof BASE_METRICS[number]['category'];
```

### 2. Категории приоритета
```typescript
export const PRIORITY_CATEGORIES: Record<string, PriorityCategory> = {
  high: {
    label: 'Высокий',
    min: 7,
    max: 10,
    color: 'text-red-600',
    gradient: 'from-red-500 to-red-600'
  },
  medium: {
    label: 'Средний',
    min: 4,
    max: 6,
    color: 'text-yellow-600',
    gradient: 'from-yellow-500 to-yellow-600'
  },
  low: {
    label: 'Низкий',
    min: 1,
    max: 3,
    color: 'text-green-600',
    gradient: 'from-green-500 to-green-600'
  }
} as const;
```

### 3. Цвета рейтингов
```typescript
export const RATING_COLORS = {
  0: 'bg-gray-200',    // Не оценено
  1: 'bg-red-500',     // Очень плохо
  2: 'bg-orange-500',  // Плохо
  3: 'bg-yellow-500',  // Средне
  4: 'bg-green-500',   // Хорошо
  5: 'bg-blue-500'     // Отлично
} as const;

export type RatingValue = keyof typeof RATING_COLORS;
```

## Type Guards

### 1. Проверки типов
```typescript
// Проверка, является ли значение валидным рейтингом
export const isValidRating = (value: any): value is number => {
  return typeof value === 'number' && value >= 1 && value <= 10;
};

// Проверка, является ли объект WeeklyRating
export const isWeeklyRating = (obj: any): obj is WeeklyRating => {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.weekNumber === 'number' &&
    obj.startDate instanceof Date &&
    obj.endDate instanceof Date &&
    typeof obj.ratings === 'object' &&
    typeof obj.overallScore === 'number';
};

// Проверка, является ли объект EnhancedHypothesis
export const isEnhancedHypothesis = (obj: any): obj is EnhancedHypothesis => {
  return obj &&
    typeof obj.id === 'string' &&
    obj.goal &&
    typeof obj.goal.metricId === 'string' &&
    typeof obj.conditions === 'string' &&
    typeof obj.expectedOutcome === 'string' &&
    typeof obj.reasoning === 'string';
};

// Проверка статуса валидации
export const isValidationStatus = (status: any): status is ValidationStatus => {
  return Object.values(ValidationStatus).includes(status);
};
```

### 2. Преобразователи типов
```typescript
// Преобразование строки в дату с проверкой
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

// Безопасное преобразование в число
export const parseNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Преобразование данных из localStorage
export const parseStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};
```

## Сложные типы

### 1. Условные типы
```typescript
// Тип, который включает только определенные поля
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

// Тип для извлечения ключей определенного типа
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Тип для создания Union из значений объекта
export type ValueOf<T> = T[keyof T];

// Тип для создания опциональных полей на основе условия
export type ConditionalOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
```

### 2. Mapped типы
```typescript
// Тип для создания обработчиков событий
export type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}`]?: (value: T[K]) => void;
};

// Тип для создания getter'ов
export type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

// Тип для создания setter'ов
export type Setters<T> = {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
};

// Тип для создания состояния с loading для каждого поля
export type LoadingState<T> = {
  [K in keyof T]: {
    data: T[K];
    isLoading: boolean;
    error: string | null;
  };
};
```

### 3. Рекурсивные типы
```typescript
// Тип для глубокой readonly структуры
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Тип для глубокого слияния объектов
export type DeepMerge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? K extends keyof T
      ? T[K] extends object
        ? U[K] extends object
          ? DeepMerge<T[K], U[K]>
          : U[K]
        : U[K]
      : U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

// Тип для создания пути к вложенным свойствам
export type NestedKeyOf<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];
```

## Валидация типов во время выполнения

### 1. Схемы валидации
```typescript
import { z } from 'zod';

// Схема для WeeklyRating
export const WeeklyRatingSchema = z.object({
  id: z.string(),
  weekNumber: z.number().min(1).max(53),
  startDate: z.date(),
  endDate: z.date(),
  ratings: z.record(z.string(), z.number().min(1).max(10)),
  notes: z.record(z.string(), z.string()),
  mood: z.enum(['excellent', 'good', 'neutral', 'poor', 'terrible']),
  keyEvents: z.array(z.string()),
  weather: z.string().optional(),
  overallScore: z.number().min(1).max(10),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Схема для EnhancedHypothesis
export const EnhancedHypothesisSchema = z.object({
  id: z.string(),
  goal: z.object({
    metricId: z.string(),
    description: z.string().min(10),
    targetValue: z.number().min(1).max(10),
    currentValue: z.number().min(1).max(10)
  }),
  subjects: z.array(z.string()),
  conditions: z.string().min(20),
  expectedOutcome: z.string().min(20),
  reasoning: z.string().min(20),
  impact: z.number().min(1).max(10),
  effort: z.number().min(1).max(10),
  confidence: z.number().min(1).max(10),
  risk: z.number().min(1).max(10),
  timeframe: z.number().min(1).max(52),
  // ... остальные поля
});

// Функции валидации
export const validateWeeklyRating = (data: unknown): WeeklyRating => {
  return WeeklyRatingSchema.parse(data);
};

export const validateHypothesis = (data: unknown): EnhancedHypothesis => {
  return EnhancedHypothesisSchema.parse(data);
};
```

### 2. Кастомные валидаторы
```typescript
// Валидатор для проверки формата гипотезы
export const validateHypothesisFormat = (hypothesis: Partial<EnhancedHypothesis>): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!hypothesis.conditions?.toLowerCase().includes('если')) {
    errors.push({
      type: 'format',
      message: 'Условия должны содержать "ЕСЛИ"'
    });
  }
  
  if (!hypothesis.expectedOutcome?.toLowerCase().includes('то')) {
    errors.push({
      type: 'format',
      message: 'Ожидаемый результат должен содержать "ТО"'
    });
  }
  
  if (!hypothesis.reasoning?.toLowerCase().includes('потому что')) {
    errors.push({
      type: 'format',
      message: 'Обоснование должно содержать "ПОТОМУ ЧТО"'
    });
  }
  
  return errors;
};

// Валидатор для проверки рейтингов
export const validateRatings = (ratings: Record<string, number>): boolean => {
  return Object.values(ratings).every(rating => 
    typeof rating === 'number' && rating >= 1 && rating <= 10
  );
};
```

## Лучшие практики

### 1. Именование типов
- Используйте PascalCase для интерфейсов и типов
- Добавляйте суффикс для специфичных типов (`Data`, `State`, `Props`)
- Используйте префикс для generic типов (`T`, `K`, `V`)

### 2. Структурирование
- Группируйте связанные типы в одном файле
- Экспортируйте только необходимые типы
- Используйте индексные файлы для удобного импорта

### 3. Документирование
- Добавляйте комментарии к сложным типам
- Объясняйте назначение полей в интерфейсах
- Приводите примеры использования для generic типов

### 4. Безопасность типов
- Используйте строгие типы вместо `any`
- Применяйте type guards для проверок времени выполнения
- Валидируйте данные из внешних источников
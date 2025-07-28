# Система стратегий и гипотез

## Обзор

Система стратегий - это ядро приложения, реализующее научно-обоснованный подход к улучшению качества жизни через формулирование, тестирование и валидацию гипотез.

## Архитектура системы

### 1. Основные компоненты

#### StrategyDashboard (`src/components/strategy/StrategyDashboard.tsx`)
**Назначение**: Главная панель управления стратегиями

**Функциональность**:
- Обзор всех активных гипотез
- Статистика по приоритетам и прогрессу
- Быстрые действия (создание, фильтрация)
- Визуализация KPI метрик

**Взаимосвязи**:
- Использует `useEnhancedHypotheses` для данных
- Интегрируется с `HypothesisCard` для отображения
- Связан с `QuickActions` для операций

#### HypothesisWizard (`src/components/strategy/HypothesisWizard.tsx`)
**Назначение**: Многошаговая форма создания гипотез

**Этапы создания**:
1. **Выбор цели** - метрика и целевое значение
2. **Выбор субъектов** - кто будет участвовать
3. **Формулирование условий** - "ЕСЛИ" часть гипотезы
4. **Ожидаемый результат** - "ТО" часть гипотезы
5. **Научное обоснование** - "ПОТОМУ ЧТО" часть
6. **Оценка параметров** - Impact, Effort, Confidence, Risk
7. **Временные рамки** - продолжительность эксперимента

**Валидация**:
- Проверка формата гипотезы
- Валидация логической связности
- Проверка на дублирование

#### HypothesisCard (`src/components/strategy/HypothesisCard.tsx`)
**Назначение**: Компактное отображение гипотезы

**Информация**:
- Заголовок и описание
- Индикатор приоритета
- Прогресс выполнения
- Статус валидации
- Быстрые действия

**Визуальные элементы**:
- Цветовая индикация приоритета
- Progress bar для прогресса
- Иконки статусов
- Градиенты для привлечения внимания

#### HypothesisDetail (`src/components/strategy/HypothesisDetail.tsx`)
**Назначение**: Детальный просмотр и управление гипотезой

**Секции**:
- **Header** - основная информация и статус
- **Metrics** - оценки Impact, Effort, Confidence, Risk
- **Progress** - еженедельный трекинг прогресса
- **Journal** - дневник экспериментов
- **Validation** - результаты валидации
- **Actions** - операции управления

### 2. Система трекинга прогресса

#### WeeklyProgressTracker (`src/components/strategy/WeeklyProgressTracker.tsx`)
**Назначение**: Еженедельное отслеживание прогресса гипотез

**Механика**:
- Сетка недель (обычно 6 недель)
- Рейтинг от 0 до 4 для каждой недели
- Визуальная индикация прогресса
- Заметки к каждой неделе

**Цветовая схема**:
- 0 (Не оценено) - Серый
- 1 (Плохо) - Красный
- 2 (Средне) - Оранжевый
- 3 (Хорошо) - Зеленый
- 4 (Отлично) - Синий

**Расчет прогресса**:
```typescript
const calculateProgress = (weeklyProgress: WeeklyProgress[]) => {
  const ratedWeeks = weeklyProgress.filter(week => week.rating > 0);
  const totalRating = ratedWeeks.reduce((sum, week) => sum + week.rating, 0);
  const maxPossibleRating = ratedWeeks.length * 4;
  return maxPossibleRating > 0 ? (totalRating / maxPossibleRating) * 100 : 0;
};
```

#### CompactProgressTracker (`src/components/strategy/CompactProgressTracker.tsx`)
**Назначение**: Компактное отображение прогресса для карточек

**Особенности**:
- Минималистичная визуализация
- Показывает только ключевые метрики
- Интегрируется в HypothesisCard

### 3. Система журналирования

#### ExperimentJournal (`src/components/strategy/ExperimentJournal.tsx`)
**Назначение**: Дневник экспериментов и наблюдений

**Функциональность**:
- Создание записей с датой
- Категоризация настроения (positive/negative/neutral)
- Поиск и фильтрация записей
- Экспорт данных

**Структура записи**:
```typescript
interface JournalEntry {
  id: string;
  date: Date;
  entry: string;
  mood: 'positive' | 'negative' | 'neutral';
}
```

### 4. Система валидации

#### HypothesisHero (`src/components/strategy/HypothesisHero.tsx`)
**Назначение**: Отображение статуса валидации гипотезы

**Статусы валидации**:
- `PENDING` - Ожидает валидации
- `VALIDATED` - Прошла валидацию
- `FAILED_VALIDATION` - Не прошла валидацию

**Типы ошибок валидации**:
```typescript
interface ValidationError {
  type: 'format' | 'content' | 'direction' | 'traceability';
  message: string;
}
```

**Критерии валидации**:
1. **Формат** - соответствие структуре "ЕСЛИ-ТО-ПОТОМУ ЧТО"
2. **Содержание** - наличие конкретных действий и измеримых результатов
3. **Направление** - логическая связь между условиями и результатами
4. **Отслеживаемость** - возможность измерить результаты

### 5. Система приоритизации

#### ICE Framework
**Impact** (Влияние 1-10):
- Насколько сильно изменение повлияет на метрику
- Учитывается потенциальный размер улучшения

**Confidence** (Уверенность 1-10):
- Насколько мы уверены в успехе
- Основано на опыте и данных

**Ease** (Простота, обратная к Effort 1-10):
- Насколько легко реализовать изменение
- Учитывает ресурсы и время

**Расчет приоритета**:
```typescript
const calculatePriority = (hypothesis: EnhancedHypothesis) => {
  const ease = 11 - hypothesis.effort; // Обратное к effort
  return Math.round(
    (hypothesis.impact * hypothesis.confidence * ease) / 100
  );
};
```

**Категории приоритета**:
- **Высокий** (7-10): Требует немедленного внимания
- **Средний** (4-6): Важно, но можно отложить
- **Низкий** (1-3): Низкий приоритет

### 6. Аналитика и отчетность

#### ProgressAnalytics (`src/components/strategy/ProgressAnalytics.tsx`)
**Назначение**: Анализ прогресса и трендов

**Метрики**:
- Общий прогресс по всем гипотезам
- Успешность валидации
- Временные тренды
- Эффективность по категориям

#### WeeklyProgressHistory (`src/components/strategy/WeeklyProgressHistory.tsx`)
**Назначение**: Исторический анализ еженедельного прогресса

**Визуализация**:
- Графики трендов
- Сравнение периодов
- Выявление паттернов

## Типы данных

### EnhancedHypothesis
```typescript
interface EnhancedHypothesis {
  id: string;
  
  // Цель
  goal: {
    metricId: string;
    description: string;
    targetValue: number;
    currentValue: number;
  };
  
  // Участники
  subjects: string[]; // Subject IDs
  
  // Формулировка гипотезы
  conditions: string;        // ЕСЛИ
  expectedOutcome: string;   // ТО
  reasoning: string;         // ПОТОМУ ЧТО
  
  // ICE оценки
  impact: number;      // 1-10
  effort: number;      // 1-10
  confidence: number;  // 1-10
  risk: number;        // 1-10
  
  // Временные рамки
  timeframe: number;           // недели
  experimentStartDate: Date;
  
  // Приоритет и статус
  calculatedPriority: number;
  status: 'active' | 'completed' | 'paused';
  experimentStatus: ExperimentStatus;
  
  // Валидация
  validationStatus: ValidationStatus;
  validationErrors: ValidationError[];
  
  // Прогресс
  progress: number;                // 0-100%
  weeklyProgress: WeeklyProgress[];
  successCriteria: string[];
  
  // Дополнительно
  journal: JournalEntry[];
  experimentResults: any[];
  
  // Метаданные
  createdAt: Date;
  updatedAt: Date;
}
```

### WeeklyProgress
```typescript
interface WeeklyProgress {
  week: number;        // 1-6
  startDate: Date;
  endDate: Date;
  rating: 0 | 1 | 2 | 3 | 4;  // 0 = не оценено
  note?: string;
  mood?: 'positive' | 'negative' | 'neutral';
  tags?: string[];
  keyEvents?: string[];
  photos?: string[];
  lastModified?: Date;
}
```

### Subject
```typescript
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

## Хуки и утилиты

### useEnhancedHypotheses
**Назначение**: Управление состоянием гипотез

**Основные методы**:
- `createHypothesis(data: HypothesisFormData)` - создание новой гипотезы
- `updateHypothesis(id: string, updates: Partial<EnhancedHypothesis>)` - обновление
- `deleteHypothesis(id: string)` - удаление
- `updateWeeklyRating(id: string, week: number, rating: number, note?: string)` - обновление прогресса
- `addJournalEntry(id: string, entry: Omit<JournalEntry, 'id'>)` - добавление записи в журнал

### useSubjects
**Назначение**: Управление субъектами

**Основные методы**:
- `createSubject(data: Omit<Subject, 'id'>)` - создание субъекта
- `updateSubject(id: string, updates: Partial<Subject>)` - обновление
- `deleteSubject(id: string)` - удаление
- `getSubjectsByType(type: SubjectType)` - фильтрация по типу

### Утилиты (src/utils/strategy.ts)
- `calculatePriority()` - расчет приоритета по ICE
- `calculateHypothesisProgress()` - расчет прогресса
- `validateHypothesis()` - валидация гипотезы
- `getPriorityCategory()` - категоризация приоритета
- `getRatingColor()` - цвет для рейтинга
- `getRatingLabel()` - подпись для рейтинга

## Интеграция с другими системами

### 1. Система рейтингов
- Использует данные WeeklyRatings для валидации гипотез
- Текущие значения метрик берутся из последних рейтингов
- Целевые значения сравниваются с трендами

### 2. ИИ система
- Предоставляет данные для анализа ИИ
- Получает рекомендации по оптимизации гипотез
- Автоматические инсайты на основе прогресса

### 3. Dashboard
- Агрегирует данные о прогрессе всех гипотез
- Показывает общую эффективность стратегий
- Предоставляет быстрый доступ к действиям

## Алгоритмы и вычисления

### Расчет приоритета
```typescript
// ICE Framework с модификациями
const calculatePriority = (hypothesis: Partial<EnhancedHypothesis>): number => {
  if (!hypothesis.impact || !hypothesis.confidence || !hypothesis.effort) {
    return 0;
  }
  
  const ease = 11 - hypothesis.effort; // Обратное к effort (1-10 -> 10-1)
  const riskFactor = hypothesis.risk ? (11 - hypothesis.risk) / 10 : 1; // Снижение за риск
  
  return Math.round(
    (hypothesis.impact * hypothesis.confidence * ease * riskFactor) / 1000
  );
};
```

### Расчет прогресса
```typescript
const calculateHypothesisProgress = (weeklyProgress: WeeklyProgress[]): number => {
  const totalWeeks = weeklyProgress.length;
  const completedWeeks = weeklyProgress.filter(week => week.rating > 0).length;
  const averageRating = weeklyProgress
    .filter(week => week.rating > 0)
    .reduce((sum, week) => sum + week.rating, 0) / completedWeeks || 0;
  
  // Комбинированный показатель: процент завершенных недель + качество выполнения
  const completionRate = (completedWeeks / totalWeeks) * 100;
  const qualityRate = (averageRating / 4) * 100;
  
  return Math.round((completionRate + qualityRate) / 2);
};
```

### Валидация гипотезы
```typescript
const validateHypothesis = (hypothesis: Partial<EnhancedHypothesis>) => {
  const errors: ValidationError[] = [];
  
  // Проверка формата
  if (!hypothesis.conditions?.toLowerCase().includes('если') ||
      !hypothesis.expectedOutcome?.toLowerCase().includes('то') ||
      !hypothesis.reasoning?.toLowerCase().includes('потому что')) {
    errors.push({
      type: 'format',
      message: 'Гипотеза должна содержать структуру "ЕСЛИ-ТО-ПОТОМУ ЧТО"'
    });
  }
  
  // Проверка содержания
  if (hypothesis.conditions && hypothesis.conditions.length < 20) {
    errors.push({
      type: 'content',
      message: 'Условия слишком краткие, опишите конкретные действия'
    });
  }
  
  // Проверка измеримости
  if (hypothesis.goal && !hypothesis.goal.targetValue) {
    errors.push({
      type: 'traceability',
      message: 'Необходимо указать целевое значение для измерения результата'
    });
  }
  
  return {
    status: errors.length === 0 ? ValidationStatus.VALIDATED : ValidationStatus.FAILED_VALIDATION,
    errors
  };
};
```

## Лучшие практики

### 1. Создание гипотез
- Используйте конкретные, измеримые цели
- Формулируйте четкие условия и ожидаемые результаты
- Указывайте научное обоснование
- Реалистично оценивайте effort и confidence

### 2. Трекинг прогресса
- Регулярно обновляйте еженедельные рейтинги
- Ведите подробные заметки о ключевых событиях
- Документируйте препятствия и успехи
- Анализируйте тренды для корректировки стратегий

### 3. Валидация
- Проводите валидацию на ранней стадии
- Учитывайте обратную связь для улучшения формулировок
- Переформулируйте гипотезы при необходимости
- Используйте результаты валидации для обучения

### 4. Приоритизация
- Фокусируйтесь на гипотезах с высоким приоритетом
- Балансируйте быстрые победы и долгосрочные цели
- Учитывайте доступные ресурсы при планировании
- Регулярно пересматривайте приоритеты
import { 
  EnhancedHypothesis, 
  ValidationStatus, 
  ValidationError, 
  WeeklyProgress,
  PriorityCategory 
} from '@/types/strategy';

// ============== CALCULATION UTILITIES ==============

/**
 * Calculate hypothesis priority using ICE Framework adaptation
 * Priority = (Impact × Confidence) / (Effort × Risk × (Timeframe / 4))
 */
export const calculatePriority = (hypothesis: Partial<EnhancedHypothesis>): number => {
  const { impact = 1, effort = 1, confidence = 1, risk = 1, timeframe = 4 } = hypothesis;
  
  if (effort === 0 || risk === 0) return 0;
  
  const priority = (impact * confidence) / (effort * risk * (timeframe / 4));
  return Math.round(priority * 100) / 100;
};

/**
 * Calculate hypothesis progress based on weekly ratings
 */
export const calculateHypothesisProgress = (weeklyProgress: WeeklyProgress[]): number => {
  if (!weeklyProgress || weeklyProgress.length === 0) return 0;
  
  const ratedWeeks = weeklyProgress.filter(week => week.rating > 0);
  if (ratedWeeks.length === 0) return 0;
  
  const averageRating = ratedWeeks.reduce((sum, week) => sum + week.rating, 0) / ratedWeeks.length;
  const completionFactor = ratedWeeks.length / weeklyProgress.length;
  
  return Math.round((averageRating / 4) * 100 * completionFactor);
};

/**
 * Validate hypothesis according to specification criteria
 */
export const validateHypothesis = (hypothesis: Partial<EnhancedHypothesis>): {
  status: ValidationStatus;
  errors: ValidationError[];
} => {
  const errors: ValidationError[] = [];
  
  // Проверка формата (ЕСЛИ-ТО-ПОТОМУ ЧТО)
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
  
  const status = errors.length === 0 ? ValidationStatus.VALIDATED : ValidationStatus.FAILED_VALIDATION;
  
  return { status, errors };
};

/**
 * Get priority category based on calculated priority value
 */
export const getPriorityCategory = (priority: number): PriorityCategory => {
  if (priority >= 5.0) {
    return {
      label: 'Высокий',
      min: 5.0,
      max: Infinity,
      color: 'hsl(var(--success))',
      gradient: 'bg-gradient-to-r from-success/80 to-success'
    };
  } else if (priority >= 2.0) {
    return {
      label: 'Средний', 
      min: 2.0,
      max: 4.9,
      color: 'hsl(var(--warning))',
      gradient: 'bg-gradient-to-r from-warning/80 to-warning'
    };
  } else {
    return {
      label: 'Низкий',
      min: 0,
      max: 1.9,
      color: 'hsl(var(--error))',
      gradient: 'bg-gradient-to-r from-error/80 to-error'
    };
  }
};

/**
 * Get progress color based on percentage
 */
export const getProgressColor = (progress: number): string => {
  if (progress >= 80) {
    return 'bg-gradient-to-r from-success/80 to-success';
  } else if (progress >= 50) {
    return 'bg-gradient-to-r from-warning/80 to-warning';
  } else {
    return 'bg-gradient-to-r from-primary/80 to-primary';
  }
};

/**
 * Get motivational message based on progress
 */
export const getMotivationalMessage = (progress: number): string => {
  if (progress === 100) return "Эксперимент завершен! 🏆";
  if (progress >= 76) return "Почти у цели! 🎯";
  if (progress >= 51) return "Отличный прогресс! ⭐";
  if (progress >= 26) return "Вы входите в ритм! 💪";
  return "Начинайте действовать! 🚀";
};

/**
 * Generate unique ID for entities
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Format date for display
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Sort hypotheses by priority (highest first)
 */
export const sortHypothesesByPriority = (hypotheses: EnhancedHypothesis[]): EnhancedHypothesis[] => {
  return [...hypotheses].sort((a, b) => (b.calculatedPriority || 0) - (a.calculatedPriority || 0));
};

/**
 * Create default weekly progress array for hypothesis with dates
 */
export const createDefaultWeeklyProgress = (weeks: number = 6, startDate: Date = new Date()): WeeklyProgress[] => {
  return Array.from({ length: weeks }, (_, index) => {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (index * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      week: index + 1,
      startDate: weekStart,
      endDate: weekEnd,
      rating: 0,
      mood: 'neutral',
      tags: [],
      keyEvents: [],
      photos: []
    };
  });
};

/**
 * Create test data for 10 weeks with realistic scenarios
 */
export const createTestWeeklyProgress = (startDate: Date = new Date()): WeeklyProgress[] => {
  const testScenarios = [
    { rating: 2, note: "Начал внедрять новую привычку, пока тяжело входить в ритм", mood: 'neutral', tags: ['старт', 'привычка'], keyEvents: ['Первый день нового распорядка'] },
    { rating: 3, note: "Лучше чем на прошлой неделе, но все еще есть пропуски", mood: 'positive', tags: ['прогресс', 'стабилизация'], keyEvents: ['3 дня подряд без пропусков', 'Заметил первые результаты'] },
    { rating: 1, note: "Сложная неделя, много стрессов на работе, сбился с графика", mood: 'negative', tags: ['стресс', 'срыв'], keyEvents: ['Дедлайн на работе', 'Пропустил 4 дня'] },
    { rating: 2, note: "Возвращаюсь в колею после прошлой недели, медленно но верно", mood: 'neutral', tags: ['восстановление'], keyEvents: ['Пересмотрел план', 'Упростил задачи'] },
    { rating: 4, note: "Отличная неделя! Все получается, вошел в ритм, чувствую результаты", mood: 'positive', tags: ['успех', 'ритм', 'результаты'], keyEvents: ['Неделя без пропусков', 'Друзья заметили изменения', 'Повысил сложность'] },
    { rating: 3, note: "Стабильно хорошо, иногда лень берет верх, но в целом доволен", mood: 'positive', tags: ['стабильность'], keyEvents: ['Мотивировал коллегу', 'Новый личный рекорд'] },
    { rating: 3, note: "Продолжаю в том же духе, результаты стабильные", mood: 'positive', tags: ['постоянство'], keyEvents: ['Месяц с начала эксперимента'] },
    { rating: 2, note: "Немного сложнее стало, возможно, нужно пересмотреть подход", mood: 'neutral', tags: ['анализ', 'корректировка'], keyEvents: ['Анализ результатов', 'Планирование изменений'] },
    { rating: 4, note: "После корректировок снова все хорошо! Новый подход работает лучше", mood: 'positive', tags: ['адаптация', 'улучшение'], keyEvents: ['Внедрил новую стратегию', 'Лучший результат за все время'] },
    { rating: 4, note: "Уверенный финиш! Гипотеза полностью подтвердилась, планирую продолжать", mood: 'positive', tags: ['финиш', 'успех', 'планы'], keyEvents: ['Достиг цели эксперимента', 'Планирую новую гипотезу'] }
  ];

  return testScenarios.map((scenario, index) => {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (index * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    return {
      week: index + 1,
      startDate: weekStart,
      endDate: weekEnd,
      rating: scenario.rating as WeeklyProgress['rating'],
      note: scenario.note,
      mood: scenario.mood as WeeklyProgress['mood'],
      tags: scenario.tags,
      keyEvents: scenario.keyEvents,
      photos: [],
      lastModified: new Date(weekEnd.getTime() - Math.random() * 24 * 60 * 60 * 1000) // Случайное время в течение недели
    };
  });
};

/**
 * Get rating color based on rating value
 */
export const getRatingColor = (rating: number): string => {
  switch (rating) {
    case 1: return 'hsl(var(--destructive))'; // красный
    case 2: return 'hsl(var(--warning))'; // оранжевый
    case 3: return 'hsl(var(--success))'; // зеленый
    case 4: return 'hsl(var(--primary))'; // синий/фиолетовый
    default: return 'hsl(var(--muted))'; // серый для не оцененных
  }
};

/**
 * Get rating label based on rating value
 */
export const getRatingLabel = (rating: number): string => {
  switch (rating) {
    case 1: return 'Плохо';
    case 2: return 'Средне';
    case 3: return 'Хорошо';
    case 4: return 'Отлично';
    default: return 'Не оценено';
  }
};
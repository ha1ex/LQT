// ============== STRATEGY TYPES ==============

export interface Metric {
  id: string;
  name: string;
  icon: string;
  category: string;
}

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

export enum ValidationStatus {
  PENDING = 'pending',
  VALIDATED = 'validated',
  FAILED_VALIDATION = 'failed_validation'
}

export enum ExperimentStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused'
}

export enum SubjectType {
  SELF = 'self',
  FAMILY = 'family',
  COLLEAGUES = 'colleagues',
  FRIENDS = 'friends',
  ENVIRONMENT = 'environment',
  CUSTOM = 'custom'
}

export interface ValidationError {
  type: 'format' | 'content' | 'direction' | 'traceability';
  message: string;
}

export interface JournalEntry {
  id: string;
  date: Date;
  entry: string;
  mood: 'positive' | 'negative' | 'neutral';
}

export interface WeeklyProgress {
  week: number; // номер недели (1-6)
  startDate: Date; // дата начала недели
  endDate: Date; // дата окончания недели
  rating: 0 | 1 | 2 | 3 | 4; // 0 = не оценено, 1 = плохо, 2 = средне, 3 = хорошо, 4 = отлично
  note?: string; // основная заметка
  mood?: 'positive' | 'negative' | 'neutral'; // настроение на неделе
  tags?: string[]; // тэги для категоризации
  keyEvents?: string[]; // ключевые события недели
  photos?: string[]; // пути к фотографиям
  lastModified?: Date; // время последнего изменения
}

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

export interface EnhancedHypothesis {
  id: string;
  goal: {
    metricId: string;
    description: string;
    targetValue: number;
    currentValue: number;
  };
  subjects: string[]; // Subject IDs
  conditions: string; // ЕСЛИ: конкретные действия
  expectedOutcome: string; // ТО: ожидаемый результат
  reasoning: string; // ПОТОМУ ЧТО: научное обоснование
  impact: number; // Влияние (1-10)
  effort: number; // Усилия (1-10)
  confidence: number; // Уверенность (1-10)
  risk: number; // Риск (1-10)
  timeframe: number; // Временные рамки (недели)
  calculatedPriority: number; // Автоматически рассчитываемый приоритет
  validationStatus: ValidationStatus;
  validationErrors: ValidationError[];
  experimentStartDate: Date;
  experimentStatus: ExperimentStatus;
  experimentResults: any[];
  successCriteria: string[];
  weeklyProgress: WeeklyProgress[];
  status: 'active' | 'completed' | 'paused';
  progress: number; // Прогресс выполнения (0-100%)
  journal: JournalEntry[];
  createdAt: Date;
  updatedAt: Date;
}

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

export interface StrategyMetrics {
  activeHypotheses: number;
  validatedHypotheses: number;
  totalSubjects: number;
  averageProgress: number;
}

export interface PriorityCategory {
  label: string;
  min: number;
  max: number;
  color: string;
  gradient: string;
}
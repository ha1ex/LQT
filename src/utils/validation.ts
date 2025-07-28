import { WeeklyRating } from '@/types/weeklyRating';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Validate rating value (1-10)
export const validateRating = (value: number): boolean => {
  return typeof value === 'number' && 
         !isNaN(value) && 
         isFinite(value) && 
         value >= 1 && 
         value <= 10 && 
         Number.isInteger(value);
};

// Validate date
export const validateDate = (date: Date): boolean => {
  return date instanceof Date && 
         !isNaN(date.getTime()) && 
         date.getTime() <= Date.now(); // Can't be in future
};

// Validate mood
export const validateMood = (mood: string): mood is WeeklyRating['mood'] => {
  return ['excellent', 'good', 'neutral', 'poor', 'terrible'].includes(mood);
};

// Validate key events
export const validateKeyEvents = (events: string[]): boolean => {
  return Array.isArray(events) && 
         events.every(event => typeof event === 'string' && event.trim().length > 0) &&
         events.length <= 10; // Max 10 events
};

// Validate notes
export const validateNotes = (notes: Record<string, string>): boolean => {
  return typeof notes === 'object' && 
         notes !== null &&
         Object.values(notes).every(note => typeof note === 'string' && note.length <= 500); // Max 500 chars per note
};

// Comprehensive validation for weekly rating data
export const validateWeeklyRating = (data: Partial<WeeklyRating>): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate ratings
  if (data.ratings) {
    Object.entries(data.ratings).forEach(([metricId, rating]) => {
      if (!validateRating(rating)) {
        errors.push({
          field: `ratings.${metricId}`,
          message: `Оценка для "${metricId}" должна быть целым числом от 1 до 10`
        });
      }
    });
  }

  // Validate mood
  if (data.mood && !validateMood(data.mood)) {
    errors.push({
      field: 'mood',
      message: 'Некорректное значение настроения'
    });
  }

  // Validate key events
  if (data.keyEvents && !validateKeyEvents(data.keyEvents)) {
    errors.push({
      field: 'keyEvents',
      message: 'Некорректные ключевые события (максимум 10 событий)'
    });
  }

  // Validate notes
  if (data.notes && !validateNotes(data.notes)) {
    errors.push({
      field: 'notes',
      message: 'Заметки содержат некорректные данные (максимум 500 символов на заметку)'
    });
  }

  // Check if at least one rating is provided
  if (data.ratings && Object.keys(data.ratings).length === 0) {
    errors.push({
      field: 'ratings',
      message: 'Необходимо оценить хотя бы один критерий'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitize and clean data
export const sanitizeWeeklyRating = (data: Partial<WeeklyRating>): Partial<WeeklyRating> => {
  const sanitized: Partial<WeeklyRating> = {};

  // Clean ratings
  if (data.ratings) {
    const cleanRatings: Record<string, number> = {};
    Object.entries(data.ratings).forEach(([metricId, rating]) => {
      if (validateRating(rating)) {
        cleanRatings[metricId] = rating;
      }
    });
    sanitized.ratings = cleanRatings;
  }

  // Clean notes
  if (data.notes) {
    const cleanNotes: Record<string, string> = {};
    Object.entries(data.notes).forEach(([metricId, note]) => {
      if (typeof note === 'string' && note.trim().length > 0 && note.length <= 500) {
        cleanNotes[metricId] = note.trim();
      }
    });
    sanitized.notes = cleanNotes;
  }

  // Clean mood
  if (data.mood && validateMood(data.mood)) {
    sanitized.mood = data.mood;
  }

  // Clean key events
  if (data.keyEvents) {
    const cleanEvents = data.keyEvents
      .filter(event => typeof event === 'string' && event.trim().length > 0)
      .map(event => event.trim())
      .slice(0, 10); // Max 10 events
    sanitized.keyEvents = cleanEvents;
  }

  return sanitized;
};
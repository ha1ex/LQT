import { WeeklyRating } from '@/types/weeklyRating';
import { startOfWeek, endOfWeek, format, addWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';

// Маппинг ваших метрик к метрикам приложения
export const METRIC_MAPPING: Record<string, string> = {
  'Спокойствие ума': 'peace_of_mind',
  'Фин подушка': 'financial_cushion',
  'Доход': 'income',
  'Качество общения с женой': 'wife_communication',
  'Качество общения с семьёй': 'family_communication',
  'Физическое здоровье': 'physical_activity',
  'Уровень физической активности': 'physical_activity',
  'Социализация': 'socialization',
  'Социализация ': 'socialization', // С пробелом в xlsx
  'Проявленность': 'manifestation',
  'Путшествия': 'travel',
  'Ментальное здоровье': 'mental_health',
  'Низкий уровень тревожности': 'anxiety_level',
  'Уровень тревожности': 'anxiety_level',
  'Состояние здоровья': 'health_condition',
  'Ощущение счастья': 'happiness',
  'Самооценка': 'self_esteem'
};

// Функция для преобразования недели в дату
export const weekToDate = (weekNumber: string, year: number = 2025): Date => {
  // W08 означает 8-ю неделю года
  const weekNum = parseInt(weekNumber.replace('W', ''));
  const januaryFirst = new Date(year, 0, 1);
  const firstWeekStart = startOfWeek(januaryFirst, { locale: ru });
  return addWeeks(firstWeekStart, weekNum - 1);
};

// Функция для создания рейтинга недели
export const createWeekRating = (
  weekNumber: string,
  ratings: Record<string, number>,
  year: number = 2025
): WeeklyRating => {
  const startDate = weekToDate(weekNumber, year);
  const endDate = endOfWeek(startDate, { locale: ru });

  // Данные уже в шкале 1-10, просто маппим имена метрик на ID
  const normalizedRatings: Record<string, number> = {};
  Object.entries(ratings).forEach(([metricName, rating]) => {
    if (rating && !isNaN(rating)) {
      const metricId = METRIC_MAPPING[metricName];
      if (metricId) {
        normalizedRatings[metricId] = Math.min(10, Math.max(1, Math.round(rating)));
      }
    }
  });

  // Вычисляем общий балл
  const validRatings = Object.values(normalizedRatings).filter(r => r > 0);
  const overallScore = validRatings.length > 0 
    ? validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length 
    : 0;

  // Определяем настроение на основе общего балла
  let mood: WeeklyRating['mood'] = 'neutral';
  if (overallScore >= 8) mood = 'excellent';
  else if (overallScore >= 6) mood = 'good';
  else if (overallScore >= 4) mood = 'neutral';
  else if (overallScore >= 2) mood = 'poor';
  else mood = 'terrible';

  return {
    id: format(startDate, 'yyyy-MM-dd'),
    weekNumber: parseInt(weekNumber.replace('W', '')),
    startDate,
    endDate,
    ratings: normalizedRatings,
    notes: {},
    overallScore: Math.round(overallScore * 10) / 10,
    mood,
    keyEvents: [],
    weather: undefined,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Функция для импорта данных из вашей таблицы
export const importQuarterData = (quarterData: {
  weeks: string[];
  metrics: Record<string, Record<string, number>>;
  year?: number;
}): WeeklyRating[] => {
  const { weeks, metrics, year = 2025 } = quarterData;
  const ratings: WeeklyRating[] = [];

  weeks.forEach(weekNumber => {
    const weekRatings: Record<string, number> = {};
    
    // Собираем все метрики для этой недели
    Object.entries(metrics).forEach(([metricName, weekData]) => {
      const rating = weekData[weekNumber];
      if (rating !== undefined && rating !== null && !isNaN(rating)) {
        weekRatings[metricName] = rating;
      }
    });

    // Создаем рейтинг недели только если есть данные
    if (Object.keys(weekRatings).length > 0) {
      const weekRating = createWeekRating(weekNumber, weekRatings, year);
      ratings.push(weekRating);
    }
  });

  return ratings;
};

// Функция для сохранения данных в localStorage
export const saveImportedData = (ratings: WeeklyRating[]): void => {
  try {
    // Получаем существующие данные
    const existingData = localStorage.getItem('lqt_weekly_ratings');
    const existingRatings: Record<string, WeeklyRating> = existingData 
      ? JSON.parse(existingData) 
      : {};

    // Добавляем новые данные, перезаписывая существующие
    ratings.forEach(rating => {
      existingRatings[rating.id] = rating;
    });

    // Сохраняем обратно
    localStorage.setItem('lqt_weekly_ratings', JSON.stringify(existingRatings));
    
  } catch (error) {
    if (import.meta.env.DEV) console.error('Ошибка при сохранении данных:', error);
  }
};

// Функция для очистки демо-данных и загрузки реальных (используется QuickDataLoader)
export const replaceWithRealData = (ratings: WeeklyRating[]): void => {
  try {
    // Очищаем все существующие данные
    localStorage.removeItem('lqt_weekly_ratings');

    // Сохраняем реальные данные
    saveImportedData(ratings);

    // Обновляем флаг инициализации
    localStorage.setItem('lqt_data_seeded', 'true');

  } catch (error) {
    if (import.meta.env.DEV) console.error('Ошибка при замене данных:', error);
  }
};

// Однократная инициализация сид-данных — вызывается при первом запуске
// Если данные уже загружены (флаг lqt_data_seeded), не трогает localStorage
export const initializeSeedDataOnce = (seedLoader: () => WeeklyRating[]): void => {
  try {
    const alreadySeeded = localStorage.getItem('lqt_data_seeded');
    if (alreadySeeded) return; // Данные уже были загружены, не перезаписываем

    const existingData = localStorage.getItem('lqt_weekly_ratings');
    if (existingData) {
      const parsed = JSON.parse(existingData);
      if (Object.keys(parsed).length > 0) {
        // Уже есть данные — помечаем как инициализированные
        localStorage.setItem('lqt_data_seeded', 'true');
        return;
      }
    }

    // Первый запуск — загружаем сид-данные
    const seedRatings = seedLoader();
    saveImportedData(seedRatings);
    localStorage.setItem('lqt_data_seeded', 'true');
  } catch (error) {
    if (import.meta.env.DEV) console.error('Ошибка инициализации сид-данных:', error);
  }
};
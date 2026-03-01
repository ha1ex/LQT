import { WeeklyRating } from '@/types/weeklyRating';
import { AppDataState } from '@/types/app';

/** A single row of weekly metric data with dynamic metric-name keys */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic metric keys require flexible index type; values are always string | number at runtime
export type WeekDataRecord = Record<string, any>;

// Все метрики из данных пользователя (включая исторические и новые)
export const BASE_METRICS = [
  { id: 'peace_of_mind', name: 'Спокойствие ума', icon: '🧘', category: 'mental' },
  { id: 'financial_cushion', name: 'Финансовая подушка', icon: '💰', category: 'finance' },
  { id: 'income', name: 'Доход', icon: '💼', category: 'finance' },
  { id: 'wife_communication', name: 'Качество общения с женой', icon: '❤️', category: 'relationships' },
  { id: 'family_communication', name: 'Качество общения с семьёй', icon: '👨‍👩‍👧‍👦', category: 'relationships' },
  { id: 'physical_activity', name: 'Уровень физической активности', icon: '🏃', category: 'health' },
  { id: 'socialization', name: 'Социализация', icon: '🤝', category: 'social' },
  { id: 'manifestation', name: 'Проявленность', icon: '✨', category: 'personal' },
  { id: 'travel', name: 'Путешествия', icon: '✈️', category: 'lifestyle' },
  { id: 'mental_health', name: 'Ментальное здоровье', icon: '🧠', category: 'mental' },
  { id: 'anxiety_level', name: 'Уровень тревожности', icon: '😌', category: 'mental' },
  { id: 'health_condition', name: 'Состояние здоровья', icon: '🏥', category: 'health' },
  { id: 'happiness', name: 'Ощущение счастья', icon: '😊', category: 'mental' },
  { id: 'self_esteem', name: 'Самооценка', icon: '💎', category: 'personal' }
];

// Адаптер для преобразования данных из GlobalDataProvider в формат weeklyData
export const adaptWeeklyRatingsToWeeklyData = (
  weeklyRatings: Record<string, WeeklyRating>,
  appState: AppDataState
): WeekDataRecord[] => {
  // Если нет данных или это пустое состояние, возвращаем пустой массив
  if (appState.userState === 'empty' || Object.keys(weeklyRatings).length === 0) {
    return [];
  }

  // Преобразуем недельные оценки в формат weeklyData
  return Object.values(weeklyRatings)
    .filter(rating => rating && rating.startDate && rating.endDate) // Фильтруем некорректные записи
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .map(rating => {
      const weekData: WeekDataRecord = {
        week: `W${rating.weekNumber || 0}`,
        date: formatWeekRange(rating.startDate.toISOString(), rating.endDate.toISOString()),
      };

      // Добавляем оценки по метрикам, используя правильные названия
      if (rating.ratings && typeof rating.ratings === 'object') {
        // Маппинг старых id → новые id для обратной совместимости
        const legacyIdMap: Record<string, string> = {
          physical_health: 'physical_activity',
          low_anxiety: 'anxiety_level',
        };

        Object.entries(rating.ratings).forEach(([metricId, value]) => {
          const resolvedId = legacyIdMap[metricId] ?? metricId;
          const metric = BASE_METRICS.find(m => m.id === resolvedId);
          if (metric && typeof value === 'number' && !isNaN(value) && value !== null && value !== undefined) {
            // Не перезаписываем если новый id уже установлен
            if (!(resolvedId !== metricId && weekData[metric.name] !== undefined)) {
              weekData[metric.name] = value;
            }
          }
        });
      }

      // Рассчитываем общий индекс
      const values = rating.ratings 
        ? Object.values(rating.ratings).filter(v => typeof v === 'number' && v !== null && v !== undefined && !isNaN(v)) as number[]
        : [];
      weekData.overall = values.length > 0 
        ? parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1))
        : (typeof rating.overallScore === 'number' && !isNaN(rating.overallScore) ? rating.overallScore : 0);

      return weekData;
    })
    .filter(weekData => weekData !== null && weekData !== undefined); // Дополнительная фильтрация
};

// Адаптер для создания пустой структуры данных
export const createEmptyDataStructure = () => {
  return [];
};

// Форматирование диапазона недели
const formatWeekRange = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.toLocaleDateString('ru', { month: 'short' });
  const endMonth = endDate.toLocaleDateString('ru', { month: 'short' });
  
  if (startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth}`;
  } else {
    return `${startDay} ${startMonth}-${endDay} ${endMonth}`;
  }
};

// Получение последних N недель данных
export const getLastNWeeks = (data: WeekDataRecord[], n: number): WeekDataRecord[] => {
  return data.slice(-n);
};

// Фильтрация данных по временному периоду
export const filterDataByPeriod = (data: WeekDataRecord[], period: string): WeekDataRecord[] => {
  switch (period) {
    case 'week':
      return getLastNWeeks(data, 1);
    case 'month':
      return getLastNWeeks(data, 4);
    case 'quarter':
      return getLastNWeeks(data, 12);
    case 'year':
      return data;
    default:
      return getLastNWeeks(data, 4);
  }
};

// Проверка наличия данных
export const hasDataForPeriod = (data: WeekDataRecord[], period: string): boolean => {
  const filteredData = filterDataByPeriod(data, period);
  return filteredData.length > 0;
};

// Получение метрик из данных
export const getMetricsFromData = (data: WeekDataRecord[]): string[] => {
  if (data.length === 0) return [];
  
  const latestWeek = data[data.length - 1];
  return Object.keys(latestWeek).filter(key => 
    !['week', 'date', 'overall'].includes(key)
  );
};
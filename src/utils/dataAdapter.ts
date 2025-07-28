import { WeeklyRating } from '@/types/weeklyRating';
import { AppDataState } from '@/types/app';

// Базовые метрики для совместимости
export const BASE_METRICS = [
  { id: 'peace_of_mind', name: 'Спокойствие ума', icon: '🧘', category: 'mental' },
  { id: 'financial_cushion', name: 'Финансовая подушка', icon: '💰', category: 'finance' },
  { id: 'income', name: 'Доход', icon: '💼', category: 'finance' },
  { id: 'wife_communication', name: 'Качество общения с женой', icon: '❤️', category: 'relationships' },
  { id: 'family_communication', name: 'Качество общения с семьей', icon: '👨‍👩‍👧‍👦', category: 'relationships' },
  { id: 'physical_health', name: 'Физическое здоровье', icon: '💪', category: 'health' },
  { id: 'socialization', name: 'Социализация', icon: '🤝', category: 'social' },
  { id: 'manifestation', name: 'Проявленность', icon: '✨', category: 'personal' },
  { id: 'travel', name: 'Путешествия', icon: '✈️', category: 'lifestyle' },
  { id: 'mental_health', name: 'Ментальное здоровье', icon: '🧠', category: 'mental' }
];

// Адаптер для преобразования данных из GlobalDataProvider в формат mockData
export const adaptWeeklyRatingsToMockData = (
  weeklyRatings: Record<string, WeeklyRating>,
  appState: AppDataState
): any[] => {
  // Если нет данных или это пустое состояние, возвращаем пустой массив
  if (appState.userState === 'empty' || Object.keys(weeklyRatings).length === 0) {
    return [];
  }

  // Преобразуем недельные оценки в формат mockData
  return Object.values(weeklyRatings)
    .filter(rating => rating && rating.startDate && rating.endDate) // Фильтруем некорректные записи
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .map(rating => {
      const weekData: any = {
        week: `W${rating.weekNumber || 0}`,
        date: formatWeekRange(rating.startDate.toISOString(), rating.endDate.toISOString()),
      };

      // Добавляем оценки по метрикам, используя правильные названия
      if (rating.ratings && typeof rating.ratings === 'object') {
        Object.entries(rating.ratings).forEach(([metricId, value]) => {
          // Находим соответствующую метрику по ID
          const metric = BASE_METRICS.find(m => m.id === metricId);
          if (metric && typeof value === 'number' && !isNaN(value)) {
            weekData[metric.name] = value;
          }
        });
      }

      // Рассчитываем общий индекс
      const values = rating.ratings 
        ? Object.values(rating.ratings).filter(v => typeof v === 'number' && v !== null && v !== undefined && !isNaN(v)) as number[]
        : [];
      
      let overallScore = 0;
      if (values.length > 0) {
        overallScore = parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1));
      } else if (typeof rating.overallScore === 'number' && !isNaN(rating.overallScore)) {
        overallScore = rating.overallScore;
      }
      
      console.log('Week data calculation:', { 
        weekNumber: rating.weekNumber, 
        values, 
        overallScore, 
        originalOverallScore: rating.overallScore 
      });
      
      weekData.overall = isNaN(overallScore) ? 0 : overallScore;

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
export const getLastNWeeks = (data: any[], n: number): any[] => {
  return data.slice(-n);
};

// Фильтрация данных по временному периоду
export const filterDataByPeriod = (data: any[], period: string): any[] => {
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
export const hasDataForPeriod = (data: any[], period: string): boolean => {
  const filteredData = filterDataByPeriod(data, period);
  return filteredData.length > 0;
};

// Получение метрик из данных
export const getMetricsFromData = (data: any[]): string[] => {
  if (data.length === 0) return [];
  
  const latestWeek = data[data.length - 1];
  return Object.keys(latestWeek).filter(key => 
    !['week', 'date', 'overall'].includes(key)
  );
};
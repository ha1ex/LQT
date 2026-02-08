// Тест компонента аналитики
console.log('🧪 Тестируем компонент аналитики...');

// Проверяем данные
const ratingsData = localStorage.getItem('lqt_weekly_ratings');
console.log('📊 Данные рейтингов:', ratingsData ? 'Есть' : 'Нет');

if (ratingsData) {
  try {
    const parsed = JSON.parse(ratingsData);
    console.log('📈 Количество недель:', Object.keys(parsed).length);
    
    // Создаем простую аналитику
    const allRatings = Object.values(parsed);
    console.log('📊 Все рейтинги:', allRatings);
    
    // Проверяем структуру данных
    if (allRatings.length > 0) {
      const firstRating = allRatings[0];
      console.log('🔍 Первый рейтинг:', firstRating);
      console.log('📊 Ключи рейтинга:', Object.keys(firstRating));
      console.log('📈 Рейтинги метрик:', firstRating.ratings);
      console.log('🎯 Общий балл:', firstRating.overallScore);
      console.log('😊 Настроение:', firstRating.mood);
    }
    
    // Создаем простую аналитику
    const averageByMetric = {};
    const trendsOverTime = [];
    const moodDistribution = { excellent: 0, good: 0, neutral: 0, poor: 0, terrible: 0 };
    
    allRatings.forEach(rating => {
      // Средние по метрикам
      Object.entries(rating.ratings).forEach(([metricId, value]) => {
        if (!averageByMetric[metricId]) {
          averageByMetric[metricId] = { sum: 0, count: 0 };
        }
        averageByMetric[metricId].sum += value;
        averageByMetric[metricId].count += 1;
      });
      
      // Тренды по времени
      trendsOverTime.push({
        weekNumber: rating.weekNumber,
        averageScore: rating.overallScore,
        date: rating.startDate
      });
      
      // Распределение настроений
      moodDistribution[rating.mood]++;
    });
    
    // Вычисляем средние
    Object.keys(averageByMetric).forEach(metricId => {
      averageByMetric[metricId] = averageByMetric[metricId].sum / averageByMetric[metricId].count;
    });
    
    console.log('📊 Аналитика создана:');
    console.log('📈 Средние по метрикам:', averageByMetric);
    console.log('📅 Тренды по времени:', trendsOverTime);
    console.log('😊 Распределение настроений:', moodDistribution);
    
  } catch (error) {
    console.error('❌ Ошибка обработки данных:', error);
  }
} else {
  console.log('❌ Нет данных для анализа');
} 
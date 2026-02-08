// Тест загрузки данных
console.log('🧪 Тестируем загрузку данных...');

// Очищаем localStorage
localStorage.clear();
console.log('🗑️ localStorage очищен');

// Импортируем функцию создания данных
import('./src/utils/comprehensiveDemoData.ts').then(module => {
  console.log('📦 Модуль загружен');
  
  // Вызываем функцию создания данных
  module.createComprehensiveDemoData().then(() => {
    console.log('✅ Данные созданы');
    
    // Проверяем результат
    const ratingsData = localStorage.getItem('lqt_weekly_ratings');
    console.log('📊 Данные в localStorage:', ratingsData ? 'Есть' : 'Нет');
    
    if (ratingsData) {
      try {
        const parsed = JSON.parse(ratingsData);
        console.log('📈 Количество недель:', Object.keys(parsed).length);
        console.log('📅 Ключи недель:', Object.keys(parsed));
        
        // Проверяем первую неделю
        const firstKey = Object.keys(parsed)[0];
        if (firstKey) {
          console.log('🔍 Первая неделя:', parsed[firstKey]);
        }
      } catch (error) {
        console.error('❌ Ошибка парсинга:', error);
      }
    }
  }).catch(error => {
    console.error('❌ Ошибка создания данных:', error);
  });
}).catch(error => {
  console.error('❌ Ошибка загрузки модуля:', error);
}); 
// Тест функции createComprehensiveDemoData
console.log('🧪 Тестируем функцию createComprehensiveDemoData...');

// Очищаем localStorage
localStorage.clear();
console.log('🗑️ localStorage очищен');

// Проверяем, что функция доступна
if (typeof window !== 'undefined' && window.createComprehensiveDemoData) {
  console.log('✅ Функция доступна в window');
  
  // Вызываем функцию
  window.createComprehensiveDemoData().then(() => {
    console.log('✅ Функция выполнена успешно');
    
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
    console.error('❌ Ошибка выполнения функции:', error);
  });
} else {
  console.log('❌ Функция не доступна в window');
  
  // Попробуем найти её в модулях
  console.log('🔍 Ищем функцию в модулях...');
  if (window.__vite_ssr_exports__) {
    console.log('Vite SSR exports:', Object.keys(window.__vite_ssr_exports__));
  }
  
  // Проверяем все глобальные переменные
  const globalVars = Object.keys(window).filter(key => 
    key.includes('create') || key.includes('demo') || key.includes('data')
  );
  console.log('Глобальные переменные с данными:', globalVars);
} 
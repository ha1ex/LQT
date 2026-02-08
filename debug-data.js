// Временный файл для отладки данных
console.log('🔍 Проверяем данные в localStorage...');

// Проверяем все ключи
const allKeys = Object.keys(localStorage);
console.log('Все ключи в localStorage:', allKeys);

// Проверяем ключ с рейтингами
const ratingsKey = 'lqt_weekly_ratings';
const ratingsData = localStorage.getItem(ratingsKey);
console.log('Данные рейтингов:', ratingsData);

if (ratingsData) {
  try {
    const parsed = JSON.parse(ratingsData);
    console.log('Парсинг успешен, количество недель:', Object.keys(parsed).length);
    console.log('Ключи недель:', Object.keys(parsed));
    
    // Проверяем первую неделю
    const firstWeekKey = Object.keys(parsed)[0];
    if (firstWeekKey) {
      console.log('Первая неделя:', parsed[firstWeekKey]);
    }
  } catch (error) {
    console.error('Ошибка парсинга:', error);
  }
} else {
  console.log('❌ Данные рейтингов не найдены');
}

// Проверяем другие ключи
const demoKey = 'lqt_demo_mode';
const demoData = localStorage.getItem(demoKey);
console.log('Демо режим:', demoData);

console.log('✅ Отладка завершена'); 
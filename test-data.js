// Тестовый скрипт для проверки данных
console.log('🧪 Начинаем тестирование данных...');

// 1. Проверяем localStorage
console.log('\n1️⃣ Проверяем localStorage:');
const allKeys = Object.keys(localStorage);
console.log('Все ключи:', allKeys);

// 2. Проверяем данные рейтингов
console.log('\n2️⃣ Проверяем данные рейтингов:');
const ratingsData = localStorage.getItem('lqt_weekly_ratings');
console.log('Данные рейтингов найдены:', !!ratingsData);

if (ratingsData) {
  try {
    const parsed = JSON.parse(ratingsData);
    console.log('Количество недель:', Object.keys(parsed).length);
    console.log('Ключи недель:', Object.keys(parsed));
    
    if (Object.keys(parsed).length > 0) {
      const firstKey = Object.keys(parsed)[0];
      console.log('Первая неделя:', parsed[firstKey]);
    }
  } catch (error) {
    console.error('Ошибка парсинга:', error);
  }
}

// 3. Проверяем демо режим
console.log('\n3️⃣ Проверяем демо режим:');
const demoMode = localStorage.getItem('lqt_demo_mode');
console.log('Демо режим:', demoMode);

// 4. Проверяем другие ключи
console.log('\n4️⃣ Проверяем другие ключи:');
['lqt_hypotheses', 'lqt_subjects', 'lqt_ai_insights'].forEach(key => {
  const data = localStorage.getItem(key);
  console.log(`${key}:`, data ? 'Есть данные' : 'Нет данных');
});

console.log('\n✅ Тестирование завершено'); 
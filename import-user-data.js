import puppeteer from 'puppeteer';

async function importUserData() {
  console.log('🚀 Начинаю импорт данных пользователя...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Открываем приложение
    console.log('📱 Открываю приложение...');
    await page.goto('http://localhost:8082');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Очищаем localStorage
    console.log('🧹 Очищаю localStorage...');
    await page.evaluate(() => {
      localStorage.clear();
      console.log('✅ localStorage очищен');
    });
    
    // Загружаем данные
    console.log('📊 Загружаю ваши данные...');
    await page.evaluate(async () => {
      try {
        const { createExactUserData } = await import('@/utils/exactUserData');
        await createExactUserData();
        console.log('✅ Данные загружены');
        
        // Проверяем данные
        const data = localStorage.getItem('weeklyRatings');
        if (data) {
          const parsed = JSON.parse(data);
          console.log('📊 Всего недель:', Object.keys(parsed).length);
          console.log('📊 Недели:', Object.keys(parsed).sort());
          
          // Проверяем значения
          const allScores = Object.values(parsed).map(w => 
            Math.max(...Object.values(w.ratings))
          );
          console.log('📊 Максимальное значение:', Math.max(...allScores));
          console.log('📊 Минимальное значение:', Math.min(...allScores));
          
          // Проверяем пропуски
          const weekNumbers = Object.values(parsed).map(w => w.weekNumber).sort((a, b) => a - b);
          console.log('📊 Заполненные номера недель:', weekNumbers);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
      }
    });
    
    // Перезагружаем страницу
    console.log('🔄 Перезагружаю страницу...');
    await page.reload();
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Переходим в раздел "Аналитика"
    console.log('📈 Перехожу в раздел "Аналитика"...');
    await page.evaluate(() => {
      const analyticsButton = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('Аналитика')
      );
      if (analyticsButton) {
        analyticsButton.click();
        console.log('✅ Перешел в раздел "Аналитика"');
      }
    });
    
    // Ждем загрузки аналитики
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Проверяем отображение данных
    console.log('🔍 Проверяю отображение данных...');
    const dataCheck = await page.evaluate(() => {
      const charts = document.querySelectorAll('[class*="recharts"]');
      const hasData = charts.length > 0;
      console.log('📊 Найдено графиков:', charts.length);
      return { hasData, chartsCount: charts.length };
    });
    
    console.log('✅ Проверка завершена:', dataCheck);
    
    // Ждем для просмотра результата
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Импорт данных завершен!');
    console.log('🎯 Теперь вы можете пользоваться сервисом с вашими данными!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

importUserData(); 
import puppeteer from 'puppeteer';

async function fixDataCompletely() {
  console.log('🔧 Полностью исправляю данные...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Включаем логи консоли
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    // Открываем приложение
    await page.goto('http://localhost:8080');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Полностью очищаем localStorage и загружаем правильные данные
    console.log('🧹 Очищаю localStorage и загружаю правильные данные...');
    await page.evaluate(async () => {
      try {
        // Полностью очищаем все ключи
        localStorage.clear();
        console.log('✅ localStorage полностью очищен');
        
        // Загружаем точные данные
        const { createExactUserData } = await import('@/utils/exactUserData');
        await createExactUserData();
        console.log('✅ Точные данные загружены');
        
        // Проверяем, что данные сохранились в правильных ключах
        const lqtData = localStorage.getItem('lqt_weekly_ratings');
        const weeklyData = localStorage.getItem('weeklyRatings');
        
        if (lqtData && weeklyData) {
          const lqtParsed = JSON.parse(lqtData);
          const weeklyParsed = JSON.parse(weeklyData);
          
          console.log('📊 Данные в lqt_weekly_ratings:', Object.keys(lqtParsed).length, 'недель');
          console.log('📊 Данные в weeklyRatings:', Object.keys(weeklyParsed).length, 'недель');
          
          // Устанавливаем флаги
          localStorage.setItem('lqt_has_data', 'true');
          console.log('✅ Флаги установлены');
          
          // Показываем пример данных
          const sampleWeek = lqtParsed[Object.keys(lqtParsed)[0]];
          console.log('📈 Пример недели:', {
            weekNumber: sampleWeek.weekNumber,
            overallScore: sampleWeek.overallScore,
            ratings: sampleWeek.ratings
          });
        } else {
          console.error('❌ Данные не сохранились в localStorage');
        }
        
        // Перезагружаем страницу
        console.log('🔄 Перезагружаю страницу...');
        setTimeout(() => window.location.reload(), 1000);
        
      } catch (error) {
        console.error('❌ Ошибка:', error);
      }
    });
    
    // Ждем перезагрузки
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Проверяем результат
    const result = await page.evaluate(() => {
      const lqtData = localStorage.getItem('lqt_weekly_ratings');
      const weeklyData = localStorage.getItem('weeklyRatings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      
      if (lqtData) {
        const data = JSON.parse(lqtData);
        const weeks = Object.keys(data).sort();
        const sampleWeek = data[weeks[0]];
        
        return {
          hasData: true,
          totalWeeks: Object.keys(data).length,
          weeks: weeks,
          sampleWeek: {
            weekNumber: sampleWeek.weekNumber,
            overallScore: sampleWeek.overallScore,
            ratings: sampleWeek.ratings
          },
          hasDataFlag: !!hasDataFlag,
          lqtWeeklyRatings: !!lqtData,
          weeklyRatings: !!weeklyData
        };
      } else {
        return {
          hasData: false,
          hasDataFlag: !!hasDataFlag,
          lqtWeeklyRatings: !!lqtData,
          weeklyRatings: !!weeklyData
        };
      }
    });
    
    console.log('📊 Результат исправления:', JSON.stringify(result, null, 2));
    
    // Переходим в аналитику и ждем загрузки
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
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Делаем скриншот
    await page.screenshot({ path: 'fixed-analytics.png', fullPage: true });
    console.log('📸 Скриншот сохранен как fixed-analytics.png');
    
    console.log('✅ Исправление завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

fixDataCompletely(); 
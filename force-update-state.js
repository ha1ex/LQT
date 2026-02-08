import puppeteer from 'puppeteer';

async function forceUpdateState() {
  console.log('🔧 Принудительно обновляю состояние приложения...');
  
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
    
    // Принудительно обновляем состояние
    console.log('🔄 Принудительно обновляю состояние...');
    await page.evaluate(async () => {
      try {
        // Проверяем текущие данные
        const lqtData = localStorage.getItem('lqt_weekly_ratings');
        const weeklyData = localStorage.getItem('weeklyRatings');
        
        console.log('📊 Текущие данные в localStorage:');
        console.log('- lqt_weekly_ratings:', lqtData ? 'есть' : 'нет');
        console.log('- weeklyRatings:', weeklyData ? 'есть' : 'нет');
        
        if (lqtData) {
          const data = JSON.parse(lqtData);
          console.log('- Количество недель:', Object.keys(data).length);
          console.log('- Недели:', Object.keys(data).sort());
          
          // Показываем пример данных
          const sampleWeek = data[Object.keys(data)[0]];
          console.log('- Пример недели:', {
            weekNumber: sampleWeek.weekNumber,
            overallScore: sampleWeek.overallScore,
            ratings: sampleWeek.ratings
          });
        }
        
        // Устанавливаем правильные флаги
        localStorage.setItem('lqt_has_data', 'true');
        localStorage.setItem('lqt_demo_mode', 'false');
        
        // Принудительно обновляем состояние приложения
        console.log('🔄 Принудительно обновляю состояние приложения...');
        
        // Вызываем функцию обновления состояния
        if (window.forceUpdateAppState) {
          window.forceUpdateAppState();
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
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      const demoMode = localStorage.getItem('lqt_demo_mode');
      
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
          demoMode: demoMode === 'true',
          appState: 'real_data'
        };
      } else {
        return {
          hasData: false,
          hasDataFlag: !!hasDataFlag,
          demoMode: demoMode === 'true',
          appState: 'empty'
        };
      }
    });
    
    console.log('📊 Результат обновления:', JSON.stringify(result, null, 2));
    
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
    await page.screenshot({ path: 'updated-analytics.png', fullPage: true });
    console.log('📸 Скриншот сохранен как updated-analytics.png');
    
    console.log('✅ Обновление состояния завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

forceUpdateState(); 
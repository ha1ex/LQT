import puppeteer from 'puppeteer';

async function fixUserState() {
  console.log('🔧 Исправляю userState...');
  
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
    
        // Загружаем данные и принудительно обновляем состояние
    console.log('📊 Загружаю данные и обновляю состояние...');
    await page.evaluate(async () => {
      try {
        // Загружаем данные
        const { createExactUserData } = await import('@/utils/exactUserData');
        await createExactUserData();
        console.log('✅ Данные загружены');
        
        // Принудительно обновляем состояние
        const data = localStorage.getItem('weeklyRatings');
        if (data) {
          const parsed = JSON.parse(data);
          console.log('📊 Данные в localStorage:', Object.keys(parsed).length, 'недель');
          
          // Устанавливаем флаги
          localStorage.setItem('lqt_has_data', 'true');
          localStorage.setItem('lqt_weekly_ratings', data);
          console.log('✅ Флаги данных установлены');
        }
        
        // Перезагружаем страницу для применения изменений
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
      const data = localStorage.getItem('weeklyRatings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      
      return {
        hasData: !!data,
        dataLength: data ? Object.keys(JSON.parse(data)).length : 0,
        hasDataFlag: !!hasDataFlag
      };
    });
    
    console.log('📊 Результат исправления:', result);
    
    // Переходим в аналитику
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
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Исправление завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

fixUserState(); 
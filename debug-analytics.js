import puppeteer from 'puppeteer';

async function debugAnalytics() {
  console.log('🔍 Отладка аналитики...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Включаем логи консоли
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    
    // Открываем приложение
    await page.goto('http://localhost:8082');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
    
    // Проверяем данные
    const debugInfo = await page.evaluate(() => {
      // Проверяем localStorage
      const data = localStorage.getItem('weeklyRatings');
      const hasLocalData = !!data;
      
      // Проверяем appState
      const appState = window.appState || {};
      
      // Проверяем mockData
      const mockData = window.mockData || [];
      
      return {
        hasLocalData,
        appState: appState.userState,
        mockDataLength: mockData.length,
        localStorageLength: data ? Object.keys(JSON.parse(data)).length : 0
      };
    });
    
    console.log('📊 Отладочная информация:', debugInfo);
    
    // Ждем для просмотра
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

debugAnalytics(); 
import puppeteer from 'puppeteer';

async function testAnalyticsData() {
  console.log('🧪 Тестирую данные аналитики...');
  
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
    
    // Проверяем данные в localStorage
    console.log('📊 Проверяю данные в localStorage...');
    const localStorageData = await page.evaluate(() => {
      const lqtData = localStorage.getItem('lqt_weekly_ratings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      const demoModeFlag = localStorage.getItem('lqt_demo_mode');
      
      if (lqtData) {
        const data = JSON.parse(lqtData);
        const weeks = Object.keys(data);
        const sampleWeek = weeks[0];
        
        return {
          hasData: !!lqtData,
          dataLength: weeks.length,
          hasDataFlag: !!hasDataFlag,
          demoModeFlag: !!demoModeFlag,
          sampleWeek: sampleWeek,
          sampleWeekData: sampleWeek ? data[sampleWeek] : null
        };
      } else {
        return {
          hasData: false,
          dataLength: 0,
          hasDataFlag: !!hasDataFlag,
          demoModeFlag: !!demoModeFlag
        };
      }
    });
    
    console.log('📊 Данные localStorage:', JSON.stringify(localStorageData, null, 2));
    
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
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Проверяем содержимое страницы аналитики
    console.log('📊 Проверяю содержимое страницы аналитики...');
    const pageContent = await page.evaluate(() => {
      const allText = document.body.innerText;
      const h2Elements = Array.from(document.querySelectorAll('h2')).map(h => h.textContent);
      const cardElements = Array.from(document.querySelectorAll('[class*="card"]')).length;
      const gridElements = Array.from(document.querySelectorAll('[class*="grid"]')).length;
      
      return {
        hasAnalyticsTitle: allText.includes('Аналитика'),
        h2Elements: h2Elements,
        cardElements: cardElements,
        gridElements: gridElements,
        totalTextLength: allText.length
      };
    });
    
    console.log('📊 Содержимое страницы:', JSON.stringify(pageContent, null, 2));
    
    // Ищем конкретные элементы
    console.log('🔍 Ищу конкретные элементы...');
    const specificElements = await page.evaluate(() => {
      const elements = {
        statisticsOverview: document.querySelector('[class*="grid-cols-2"]')?.innerText || 'Не найдено',
        averageScores: document.querySelector('*')?.innerText?.includes('Средние оценки') || false,
        compactOverview: document.querySelector('*')?.innerText?.includes('Обзор областей') || false,
        timeFilterButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent?.includes('1Н') || btn.textContent?.includes('1М') || btn.textContent?.includes('3М') || btn.textContent?.includes('1Г')
        ).length
      };
      
      return elements;
    });
    
    console.log('📊 Конкретные элементы:', JSON.stringify(specificElements, null, 2));
    
    // Делаем скриншот
    await page.screenshot({ path: 'analytics-data-test.png', fullPage: true });
    console.log('📸 Скриншот сохранен как analytics-data-test.png');
    
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

testAnalyticsData(); 
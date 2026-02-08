import puppeteer from 'puppeteer';

async function checkMetricsData() {
  console.log('🔍 Проверяю данные метрик...');
  
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
    
    // Проверяем данные
    const result = await page.evaluate(() => {
      const lqtData = localStorage.getItem('lqt_weekly_ratings');
      
      if (lqtData) {
        const data = JSON.parse(lqtData);
        const weeks = Object.keys(data).sort();
        
        // Проверяем Q2 и Q3 недели
        const q2Week = data['2024-04-15']; // W16
        const q3Week = data['2024-07-01']; // W27
        
        return {
          totalWeeks: Object.keys(data).length,
          weeks: weeks,
          q2Metrics: q2Week ? Object.keys(q2Week.ratings) : [],
          q3Metrics: q3Week ? Object.keys(q3Week.ratings) : [],
          q2Data: q2Week ? q2Week.ratings : {},
          q3Data: q3Week ? q3Week.ratings : {}
        };
      } else {
        return { error: 'Нет данных' };
      }
    });
    
    console.log('📊 Результат проверки:', JSON.stringify(result, null, 2));
    
    // Переходим в аналитику
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
    await page.screenshot({ path: 'metrics-check.png', fullPage: true });
    console.log('📸 Скриншот сохранен как metrics-check.png');
    
    console.log('✅ Проверка завершена!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

checkMetricsData(); 
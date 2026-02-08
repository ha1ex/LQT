import puppeteer from 'puppeteer';

async function checkLoadedData() {
  console.log('🔍 Проверяю загруженные данные...');
  
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
      const weeklyRatings = localStorage.getItem('weeklyRatings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      const lqtWeeklyRatings = localStorage.getItem('lqt_weekly_ratings');
      
      if (weeklyRatings) {
        const data = JSON.parse(weeklyRatings);
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
          lqtWeeklyRatings: !!lqtWeeklyRatings
        };
      } else {
        return {
          hasData: false,
          hasDataFlag: !!hasDataFlag,
          lqtWeeklyRatings: !!lqtWeeklyRatings
        };
      }
    });
    
    console.log('📊 Результат проверки:', JSON.stringify(result, null, 2));
    
    // Делаем скриншот
    await page.screenshot({ path: 'data-check.png', fullPage: true });
    console.log('📸 Скриншот сохранен как data-check.png');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

checkLoadedData(); 
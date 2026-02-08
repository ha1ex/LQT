import puppeteer from 'puppeteer';

async function testUpdatedMetrics() {
  console.log('🧪 Тестирую обновленные метрики...');
  
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
    
    // Проверяем данные и переходим в аналитику
    console.log('📊 Проверяю данные и перехожу в аналитику...');
    await page.evaluate(async () => {
      try {
        // Проверяем текущие данные
        const lqtData = localStorage.getItem('lqt_weekly_ratings');
        
        if (lqtData) {
          const data = JSON.parse(lqtData);
          console.log('📊 Данные в localStorage:', Object.keys(data).length, 'недель');
          
          // Проверяем метрики в разных периодах
          const q2Week = data['2024-04-15']; // W16
          const q3Week = data['2024-07-01']; // W27
          
          console.log('📈 Q2 неделя (W16):', {
            weekNumber: q2Week.weekNumber,
            metrics: Object.keys(q2Week.ratings),
            physical_health: q2Week.ratings.physical_health,
            physical_activity: q2Week.ratings.physical_activity
          });
          
          console.log('📈 Q3 неделя (W27):', {
            weekNumber: q3Week.weekNumber,
            metrics: Object.keys(q3Week.ratings),
            physical_health: q3Week.ratings.physical_health,
            physical_activity: q3Week.ratings.physical_activity,
            low_anxiety: q3Week.ratings.low_anxiety,
            health_condition: q3Week.ratings.health_condition
          });
        }
        
        // Переходим в аналитику
        const analyticsButton = Array.from(document.querySelectorAll('*')).find(el => 
          el.textContent?.includes('Аналитика')
        );
        if (analyticsButton) {
          analyticsButton.click();
          console.log('✅ Перешел в раздел "Аналитика"');
        }
        
      } catch (error) {
        console.error('❌ Ошибка:', error);
      }
    });
    
    // Ждем загрузки аналитики
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Проверяем, какие графики отображаются
    const result = await page.evaluate(() => {
      // Ищем все графики
      const charts = document.querySelectorAll('[class*="chart"], [class*="Chart"]');
      const chartTitles = Array.from(charts).map(chart => {
        const title = chart.querySelector('h3, .font-semibold, [class*="title"]');
        return title ? title.textContent : 'Без названия';
      });
      
      // Ищем все метрики в интерфейсе
      const metricElements = document.querySelectorAll('[class*="metric"], [class*="Metric"]');
      const metricNames = Array.from(metricElements).map(el => el.textContent).filter(Boolean);
      
      return {
        chartsFound: charts.length,
        chartTitles: chartTitles,
        metricNames: metricNames
      };
    });
    
    console.log('📊 Результат проверки:', JSON.stringify(result, null, 2));
    
    // Делаем скриншот
    await page.screenshot({ path: 'updated-metrics-test.png', fullPage: true });
    console.log('📸 Скриншот сохранен как updated-metrics-test.png');
    
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

testUpdatedMetrics(); 
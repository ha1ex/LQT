import puppeteer from 'puppeteer';

async function checkData() {
  console.log('🔍 Проверяю загруженные данные...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null
  });
  
  try {
    const page = await browser.newPage();
    
    // Открываем приложение
    await page.goto('http://localhost:8082');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Проверяем данные в localStorage
    console.log('📊 Проверяю данные в localStorage...');
    const dataInfo = await page.evaluate(() => {
      const data = localStorage.getItem('weeklyRatings');
      if (data) {
        const parsed = JSON.parse(data);
        const weekNumbers = Object.values(parsed).map(w => w.weekNumber).sort((a, b) => a - b);
        const allScores = Object.values(parsed).map(w => 
          Math.max(...Object.values(w.ratings))
        );
        
        return {
          totalWeeks: Object.keys(parsed).length,
          weekNumbers: weekNumbers,
          maxScore: Math.max(...allScores),
          minScore: Math.min(...allScores),
          hasData: true
        };
      } else {
        return { hasData: false };
      }
    });
    
    console.log('📊 Результат проверки:', dataInfo);
    
    if (dataInfo.hasData) {
      console.log('✅ Данные найдены!');
      console.log(`📊 Всего недель: ${dataInfo.totalWeeks}`);
      console.log(`📊 Номера недель: ${dataInfo.weekNumbers.join(', ')}`);
      console.log(`📊 Максимальная оценка: ${dataInfo.maxScore}`);
      console.log(`📊 Минимальная оценка: ${dataInfo.minScore}`);
      
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
      
      // Проверяем графики
      const chartsInfo = await page.evaluate(() => {
        const charts = document.querySelectorAll('[class*="recharts"]');
        const chartContainers = document.querySelectorAll('[class*="chart"]');
        const responsiveContainers = document.querySelectorAll('[class*="ResponsiveContainer"]');
        
        return {
          rechartsElements: charts.length,
          chartContainers: chartContainers.length,
          responsiveContainers: responsiveContainers.length
        };
      });
      
      console.log('📊 Информация о графиках:', chartsInfo);
      
    } else {
      console.log('❌ Данные не найдены в localStorage');
      
      // Загружаем данные заново
      console.log('🔄 Загружаю данные заново...');
      await page.evaluate(async () => {
        try {
          const { createExactUserData } = await import('@/utils/exactUserData');
          await createExactUserData();
          console.log('✅ Данные загружены заново');
        } catch (error) {
          console.error('❌ Ошибка загрузки:', error);
        }
      });
      
      await page.reload();
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Ждем для просмотра
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

checkData(); 
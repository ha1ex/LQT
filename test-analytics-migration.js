import puppeteer from 'puppeteer';

async function testAnalyticsMigration() {
  console.log('🧪 Тестирую перенос блоков аналитики...');
  
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
    
    // Проверяем наличие блоков аналитики
    console.log('📊 Проверяю блоки аналитики...');
    const analyticsResult = await page.evaluate(() => {
      // Ищем обзор статистики
      const statisticsCards = Array.from(document.querySelectorAll('[class*="grid-cols-2"]')).filter(el => 
        el.querySelector('p')?.textContent?.includes('Общий индекс') ||
        el.querySelector('p')?.textContent?.includes('Лучшая неделя') ||
        el.querySelector('p')?.textContent?.includes('Оценено метрик') ||
        el.querySelector('p')?.textContent?.includes('Всего недель')
      );
      
      // Ищем средние оценки
      const averageScores = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('Средние оценки по критериям')
      );
      
      // Ищем компактный обзор областей
      const compactOverview = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('Обзор областей') ||
        el.textContent?.includes('Проблемные области') ||
        el.textContent?.includes('Сильные стороны')
      );
      
      // Ищем детальные графики
      const detailedCharts = Array.from(document.querySelectorAll('[class*="grid-cols-1"]')).filter(el => 
        el.querySelector('canvas') || el.querySelector('svg')
      );
      
      return {
        statisticsCardsFound: statisticsCards.length,
        averageScoresFound: !!averageScores,
        compactOverviewFound: !!compactOverview,
        detailedChartsFound: detailedCharts.length,
        totalElements: document.querySelectorAll('*').length
      };
    });
    
    console.log('📊 Результат проверки аналитики:', JSON.stringify(analyticsResult, null, 2));
    
    // Проверяем, что в разделе "Оценка" нет блоков аналитики
    console.log('📝 Перехожу в раздел "Оценка"...');
    await page.evaluate(() => {
      const ratingButton = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent?.includes('Оценка')
      );
      if (ratingButton) {
        ratingButton.click();
        console.log('✅ Перешел в раздел "Оценка"');
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const ratingResult = await page.evaluate(() => {
      // Проверяем, что нет блоков аналитики в разделе оценки
      const analyticsInRating = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent?.includes('Общий индекс') ||
        el.textContent?.includes('Средние оценки по критериям')
      );
      
      // Проверяем наличие элементов оценки
      const ratingElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent?.includes('Текущая неделя') ||
        el.textContent?.includes('Календарь') ||
        el.textContent?.includes('Прогресс оценки')
      );
      
      return {
        analyticsInRatingFound: analyticsInRating.length,
        ratingElementsFound: ratingElements.length
      };
    });
    
    console.log('📊 Результат проверки оценки:', JSON.stringify(ratingResult, null, 2));
    
    // Делаем скриншоты
    await page.screenshot({ path: 'analytics-migration-test.png', fullPage: true });
    console.log('📸 Скриншот сохранен как analytics-migration-test.png');
    
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

testAnalyticsMigration(); 
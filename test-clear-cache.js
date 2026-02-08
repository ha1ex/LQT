import puppeteer from 'puppeteer';

async function testClearCache() {
  console.log('🧪 Тестирую кнопку очистки кэша...');
  
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
    
    // Проверяем наличие кнопок в шапке
    console.log('📊 Проверяю кнопки в шапке...');
    const headerResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cacheButton = buttons.find(btn => 
        btn.querySelector('svg') && 
        btn.closest('div')?.textContent?.includes('Очистить кэш')
      );
      const refreshButton = buttons.find(btn => 
        btn.querySelector('svg') && 
        btn.closest('div')?.textContent?.includes('Обновить данные')
      );
      const clearButton = buttons.find(btn => 
        btn.querySelector('svg') && 
        btn.closest('div')?.textContent?.includes('Очистить все данные')
      );
      
      return {
        cacheButtonFound: !!cacheButton,
        refreshButtonFound: !!refreshButton,
        clearButtonFound: !!clearButton,
        totalButtons: buttons.length
      };
    });
    
    console.log('📊 Кнопки в шапке:', JSON.stringify(headerResult, null, 2));
    
    // Проверяем данные перед очисткой
    console.log('📊 Проверяю данные перед очисткой...');
    const beforeData = await page.evaluate(() => {
      const lqtData = localStorage.getItem('lqt_weekly_ratings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      const demoModeFlag = localStorage.getItem('lqt_demo_mode');
      
      return {
        hasData: !!lqtData,
        dataLength: lqtData ? Object.keys(JSON.parse(lqtData)).length : 0,
        hasDataFlag: !!hasDataFlag,
        demoModeFlag: !!demoModeFlag
      };
    });
    
    console.log('📊 Данные до очистки:', JSON.stringify(beforeData, null, 2));
    
    // Нажимаем кнопку очистки кэша
    console.log('🧹 Нажимаю кнопку очистки кэша...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cacheButton = buttons.find(btn => 
        btn.querySelector('svg') && 
        btn.closest('div')?.textContent?.includes('Очистить кэш')
      );
      if (cacheButton) {
        cacheButton.click();
        console.log('✅ Нажал кнопку очистки кэша');
      } else {
        console.log('❌ Кнопка очистки кэша не найдена');
      }
    });
    
    // Ждем перезагрузки
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Проверяем данные после очистки
    console.log('📊 Проверяю данные после очистки...');
    const afterData = await page.evaluate(() => {
      const lqtData = localStorage.getItem('lqt_weekly_ratings');
      const hasDataFlag = localStorage.getItem('lqt_has_data');
      const demoModeFlag = localStorage.getItem('lqt_demo_mode');
      
      return {
        hasData: !!lqtData,
        dataLength: lqtData ? Object.keys(JSON.parse(lqtData)).length : 0,
        hasDataFlag: !!hasDataFlag,
        demoModeFlag: !!demoModeFlag
      };
    });
    
    console.log('📊 Данные после очистки:', JSON.stringify(afterData, null, 2));
    
    // Делаем скриншот
    await page.screenshot({ path: 'clear-cache-test.png', fullPage: true });
    console.log('📸 Скриншот сохранен как clear-cache-test.png');
    
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

testClearCache(); 
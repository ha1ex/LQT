import puppeteer from 'puppeteer';

async function testTimeFilters() {
  console.log('🧪 Тестирую переключатели периодов...');
  
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
    
    // Проверяем главную страницу
    console.log('📊 Проверяю главную страницу...');
    const dashboardResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('1Н') || btn.textContent?.includes('1М') || btn.textContent?.includes('3М') || btn.textContent?.includes('1Г')
      );
      
      return {
        buttonsFound: buttons.length,
        buttonTexts: buttons.map(btn => btn.textContent),
        activeButton: buttons.find(btn => btn.classList.contains('btn-primary'))?.textContent
      };
    });
    
    console.log('📊 Главная страница:', JSON.stringify(dashboardResult, null, 2));
    
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
    
    // Проверяем аналитику
    const analyticsResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('1Н') || btn.textContent?.includes('1М') || btn.textContent?.includes('3М') || btn.textContent?.includes('1Г')
      );
      
      return {
        buttonsFound: buttons.length,
        buttonTexts: buttons.map(btn => btn.textContent),
        activeButton: buttons.find(btn => btn.classList.contains('btn-primary'))?.textContent
      };
    });
    
    console.log('📊 Аналитика:', JSON.stringify(analyticsResult, null, 2));
    
    // Тестируем переключение периодов
    console.log('🔄 Тестирую переключение периодов...');
    await page.evaluate(() => {
      const monthButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('1М')
      );
      if (monthButton) {
        monthButton.click();
        console.log('✅ Переключил на 1 месяц');
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Проверяем активную кнопку
    const activeResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent?.includes('1Н') || btn.textContent?.includes('1М') || btn.textContent?.includes('3М') || btn.textContent?.includes('1Г')
      );
      
      return {
        activeButton: buttons.find(btn => btn.classList.contains('btn-primary'))?.textContent
      };
    });
    
    console.log('📊 Активная кнопка после переключения:', JSON.stringify(activeResult, null, 2));
    
    // Делаем скриншот
    await page.screenshot({ path: 'time-filters-test.png', fullPage: true });
    console.log('📸 Скриншот сохранен как time-filters-test.png');
    
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

testTimeFilters(); 
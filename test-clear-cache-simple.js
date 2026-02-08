import puppeteer from 'puppeteer';

async function testClearCacheSimple() {
  console.log('🧪 Тестирую кнопку очистки кэша (упрощенный тест)...');
  
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
    
    // Проверяем все кнопки на странице
    console.log('📊 Проверяю все кнопки на странице...');
    const buttonsResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const buttonInfo = buttons.map((btn, index) => {
        const text = btn.textContent?.trim();
        const hasIcon = btn.querySelector('svg') !== null;
        const classes = btn.className;
        const isVisible = btn.offsetParent !== null;
        
        return {
          index,
          text: text || 'Без текста',
          hasIcon,
          classes: classes.substring(0, 100), // Ограничиваем длину
          isVisible
        };
      }).filter(btn => btn.isVisible);
      
      return {
        totalButtons: buttons.length,
        visibleButtons: buttonInfo.length,
        buttonDetails: buttonInfo.slice(0, 10) // Показываем первые 10
      };
    });
    
    console.log('📊 Кнопки на странице:', JSON.stringify(buttonsResult, null, 2));
    
    // Ищем кнопку с иконкой Database (кэш)
    console.log('🔍 Ищу кнопку очистки кэша...');
    const cacheButtonResult = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const cacheButton = buttons.find(btn => {
        const svg = btn.querySelector('svg');
        if (!svg) return false;
        
        // Проверяем, есть ли иконка Database (для кэша)
        const path = svg.querySelector('path');
        if (!path) return false;
        
        // Проверяем по классу или содержимому
        return btn.className.includes('text-orange') || 
               btn.getAttribute('title')?.includes('кэш') ||
               btn.textContent?.includes('кэш');
      });
      
      if (cacheButton) {
        return {
          found: true,
          text: cacheButton.textContent?.trim(),
          className: cacheButton.className,
          title: cacheButton.getAttribute('title')
        };
      } else {
        return { found: false };
      }
    });
    
    console.log('📊 Результат поиска кнопки кэша:', JSON.stringify(cacheButtonResult, null, 2));
    
    // Делаем скриншот
    await page.screenshot({ path: 'clear-cache-simple-test.png', fullPage: true });
    console.log('📸 Скриншот сохранен как clear-cache-simple-test.png');
    
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await browser.close();
  }
}

testClearCacheSimple(); 
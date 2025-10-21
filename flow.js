console.log('Автоматизация запущена');

const waitForButton = () => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      let button = null;
      // Проверяем основной документ
      button = document.querySelector('button[data-state="closed"]');
      if (!button || !button.textContent.includes('Veo 3.1 - Fast')) {
        // Проверяем iframe
        const iframes = document.querySelectorAll('iframe');
        console.log('Найдено iframe:', iframes.length);
        for (let frame of iframes) {
          try {
            button = frame.contentDocument.querySelector('button[data-state="closed"]');
            if (button && button.textContent.includes('Veo 3.1 - Fast')) {
              console.log('Кнопка найдена в iframe:', button.outerHTML);
              break;
            }
          } catch (e) {
            console.log('Нет доступа к iframe:', e);
          }
        }
      }
      // Логируем все кнопки
      const allButtons = document.querySelectorAll('button');
      console.log('Найдено кнопок:', allButtons.length);
      allButtons.forEach(b => {
        if (b.getAttribute('data-state') === 'closed') {
          console.log('Кнопка с data-state="closed":', b.outerHTML, b.textContent);
        }
      });

      if (button && button.textContent.includes('Veo 3.1 - Fast')) {
        resolve(button);
      } else if (Date.now() - start > 20000) { // 20 секунд
        reject(new Error('Кнопка не найдена за 20 секунд'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

waitForButton()
  .then(button => {
    button.click();
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: button.getBoundingClientRect().left + button.getBoundingClientRect().width / 2,
      clientY: button.getBoundingClientRect().top + button.getBoundingClientRect().height / 2
    });
    button.dispatchEvent(clickEvent);
    console.log('Кнопка "Veo 3.1 - Fast" нажата:', button.outerHTML);
  })
  .catch(err => console.error('Ошибка:', err.message));

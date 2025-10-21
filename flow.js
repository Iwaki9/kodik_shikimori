console.log('Автоматизация запущена');

// Функция ожидания кнопки (до 10 секунд)
const waitForButton = () => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      // Ищем кнопку
      const button = document.querySelector('button[data-state="closed"]');
      // Логируем все кнопки для отладки
      const allButtons = document.querySelectorAll('button');
      console.log('Найдено кнопок:', allButtons.length, 'Текущий data-state:', button ? button.outerHTML : 'нет');
      
      if (button && button.textContent.includes('Veo 3.1 - Fast')) {
        resolve(button);
      } else if (Date.now() - start > 10000) { // Увеличиваем до 10 секунд
        reject(new Error('Кнопка не найдена за 10 секунд'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

waitForButton()
  .then(button => {
    // Пробуем разные способы клика
    button.click();
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    button.dispatchEvent(clickEvent);
    console.log('Кнопка "Veo 3.1 - Fast" найдена и нажата:', button.outerHTML);
  })
  .catch(err => console.error('Ошибка:', err.message));

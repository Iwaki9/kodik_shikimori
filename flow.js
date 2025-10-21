console.log('Автоматизация запущена');

// Функция ожидания кнопки (до 5 секунд)
const waitForButton = () => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const button = document.querySelector('button[data-state="closed"]');
      if (button && button.textContent.includes('Veo 3.1 - Fast')) {
        resolve(button);
      } else if (Date.now() - start > 5000) {
        reject(new Error('Кнопка не найдена за 5 секунд'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

waitForButton()
  .then(button => {
    // Пробуем программный клик
    button.click();
    // Дополнительно отправляем событие для надёжности
    const clickEvent = new Event('click', { bubbles: true });
    button.dispatchEvent(clickEvent);
    console.log('Кнопка "Veo 3.1 - Fast" найдена и нажата');
  })
  .catch(err => console.error(err.message));

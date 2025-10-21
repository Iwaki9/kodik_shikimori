console.log('Автоматизация запущена');

const waitForButton = () => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const buttons = document.querySelectorAll('button[data-state="closed"]');
      console.log('Найдено кнопок с data-state="closed":', buttons.length);
      
      let targetButton = null;
      buttons.forEach(button => {
        const text = button.textContent.trim().toLowerCase();
        console.log('Кнопка:', button.outerHTML, 'Текст:', text);
        if (text.includes('veo 3.1 - fast')) {
          targetButton = button;
        }
      });

      if (targetButton) {
        resolve(targetButton);
      } else if (Date.now() - start > 30000) {
        reject(new Error('Кнопка не найдена за 30 секунд'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

waitForButton()
  .then(button => {
    console.log('Кнопка найдена:', button.outerHTML);
    setTimeout(() => {
      // Выполняем клик
      button.click();
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: button.getBoundingClientRect().left + button.getBoundingClientRect().width / 2,
        clientY: button.getBoundingClientRect().top + button.getBoundingClientRect().height / 2
      });
      button.dispatchEvent(clickEvent);
      console.log('Кнопка "Veo 3.1 - Fast" нажата:', button.outerHTML);
      // Проверяем состояние и DOM
      setTimeout(() => {
        const state = button.getAttribute('data-state');
        console.log('Состояние кнопки после клика:', state);
        console.log('HTML кнопки после клика:', button.outerHTML);
        // Место для следующего шага автоматизации
        // Например: найти и кликнуть другую кнопку
        // const nextButton = document.querySelector('.next-step-selector');
        // if (nextButton) {
        //   nextButton.click();
        //   console.log('Кликнута следующая кнопка:', nextButton.outerHTML);
        // } else {
        //   console.error('Следующая кнопка не найдена');
        // }
      }, 1000);
    }, 1000);
  })
  .catch(err => console.error('Ошибка:', err.message));

console.log('Автоматизация запущена');

// Функция ожидания элемента
const waitForElement = (selector, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const element = document.querySelector(selector);
      console.log(`Проверка селектора "${selector}":`, element ? 'найден' : 'не найден');
      if (element) {
        resolve(element);
      } else if (Date.now() - start > timeout) {
        reject(new Error(`Элемент "${selector}" не найден за ${timeout/1000} секунд`));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};

// Основная функция автоматизации
(async () => {
  try {
    // Шаг 1: Создаём input для выбора файлов (временное решение)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg,.webp,.heic';
    input.multiple = true;
    document.body.appendChild(input);
    console.log('Создан input для выбора файлов. Пожалуйста, выберите изображения.');
    
    // Ожидаем, пока пользователь выберет файлы
    await new Promise((resolve) => {
      input.addEventListener('change', () => {
        console.log('Файлы выбраны:', input.files);
        resolve();
      });
      input.click(); // Открываем диалог выбора файлов
    });

    // Шаг 2: Клик по кнопке "add"
    const addButton = await waitForElement('button.sc-d6df593a-1.sc-74578dc8-1');
    console.log('Кнопка "add" найдена:', addButton.outerHTML);
    addButton.click();
    const addClickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    addButton.dispatchEvent(addClickEvent);
    console.log('Кнопка "add" нажата');

    // Шаг 3: Клик по кнопке "upload"
    const uploadButton = await waitForElement('button.sc-fbea20b2-0');
    console.log('Кнопка "upload" найдена:', uploadButton.outerHTML);
    uploadButton.click();
    const uploadClickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    uploadButton.dispatchEvent(uploadClickEvent);
    console.log('Кнопка "upload" нажата');

    // Шаг 4: Клик по кнопке "Cắt và lưu"
    const cropButton = await waitForElement('button.sc-d6df593a-1.sc-27bcafa7-7');
    console.log('Кнопка "Cắt và lưu" найдена:', cropButton.outerHTML);
    cropButton.click();
    const cropClickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    cropButton.dispatchEvent(cropClickEvent);
    console.log('Кнопка "Cắt và lưu" нажата');

    // Шаг 5: Ожидание завершения загрузки
    const loadCompleteButton = await waitForElement('button.sc-d6df593a-1.sc-74578dc8-1[data-state="closed"]');
    console.log('Загрузка завершена, найдена кнопка:', loadCompleteButton.outerHTML);

    // Шаг 6: Ввод текста в textarea
    const textarea = await waitForElement('#PINHOLE_TEXT_AREA_ELEMENT_ID');
    const promptText = 'Create an animation video with the uploaded images'; // Замени на нужный промт
    textarea.value = promptText;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('Текст введён в textarea:', promptText);

    // Шаг 7: Клик по кнопке генерации видео
    const generateButton = await waitForElement('button.sc-d6df593a-1.sc-408537d4-2');
    console.log('Кнопка генерации найдена:', generateButton.outerHTML);
    generateButton.click();
    const generateClickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    generateButton.dispatchEvent(generateClickEvent);
    console.log('Кнопка генерации нажата');

    // Шаг 8: Ожидание начала генерации
    const progressIndicator = await waitForElement('div.sc-dd6abb21-1');
    console.log('Начало генерации, прогресс:', progressIndicator.textContent);

    // Шаг 9: Ожидание завершения генерации
    const videoElement = await waitForElement('video[src*="storage.googleapis.com"]', 60000); // 60 секунд
    console.log('Генерация завершена, видео найдено:', videoElement.outerHTML);

    // Шаг 10: Скачивание видео
    const videoUrl = videoElement.src;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = 'generated_video.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Видео скачано:', videoUrl);

  } catch (err) {
    console.error('Ошибка:', err.message);
  }
})();

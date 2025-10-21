console.log('Автоматизация запущена2');

const waitForElement = (selector, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const element = document.querySelector(selector);
      console.log(`Проверка селектора "${selector}":`, element ? 'найден' : 'не найден');
      if (element) resolve(element);
      else if (Date.now() - start > timeout) reject(new Error(`Элемент "${selector}" не найден за ${timeout/1000} секунд`));
      else setTimeout(check, 100);
    };
    check();
  });
};

const waitForButtonByText = (text, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const buttons = Array.from(document.querySelectorAll('[role="option"], button'));
      const targetButton = buttons.find(b => b.textContent.includes(text));
      console.log(`Проверка элемента с текстом "${text}":`, targetButton ? 'найден' : 'не найден');
      if (targetButton) resolve(targetButton);
      else if (Date.now() - start > timeout) reject(new Error(`Элемент с текстом "${text}" не найден за ${timeout/1000} секунд`));
      else setTimeout(check, 100);
    };
    check();
  });
};

(async () => {
  try {
    // Шаг 1: Выбор файлов
    const customInput = document.createElement('input');
    customInput.type = 'file';
    customInput.accept = '.png,.jpg,.webp,.heic';
    customInput.multiple = true;
    document.body.appendChild(customInput);
    console.log('Создан input для выбора файлов.');
    const files = await new Promise((resolve) => {
      customInput.addEventListener('change', () => {
        console.log('Файлы выбраны:', customInput.files);
        resolve(Array.from(customInput.files));
      });
      customInput.click();
    });

    // Цикл по каждому файлу
    for (let i = 0; i < files.length; i++) {
      console.log(`Обработка файла ${i + 1}/${files.length}:`, files[i].name);

      // Шаг 2: Клик по кнопке "add"
      const addButton = await waitForElement('button.sc-d6df593a-1.sc-74578dc8-1');
      console.log('Кнопка "add" найдена:', addButton.outerHTML);
      addButton.click();
      console.log('Кнопка "add" нажата');

      // Шаг 3: Передача одного файла в input на странице
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pageInput = await waitForElement('input[type="file"]', 30000);
      console.log('Page input найден:', pageInput.outerHTML);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[i]);
      pageInput.files = dataTransfer.files;
      pageInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('Файл передан в pageInput:', files[i].name);

      // Шаг 3.5: Выбор ориентации "Dọc"
      await new Promise(resolve => setTimeout(resolve, 5000));
      const orientationCombo = await waitForElement('button.sc-d6df593a-1.sc-9a21ccc9-0.sc-acb5d8f5-0[role="combobox"]', 30000);
      console.log('Комбобокс ориентации найден:', orientationCombo.outerHTML);
      orientationCombo.click();
      console.log('Комбобокс ориентации открыт');
      const verticalOption = await waitForButtonByText('Dọc', 10000);
      console.log('Ориентация Dọc найдена:', verticalOption.outerHTML);
      verticalOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      console.log('Ориентация Dọc выбрана');
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Комбобокс после выбора:', orientationCombo.outerHTML);

      // Шаг 4: Клик по кнопке "Cắt và lưu"
      const cropButton = await waitForButtonByText('Cắt và lưu', 60000);
      console.log('Кнопка "Cắt và lưu" найдена:', cropButton.outerHTML);
      cropButton.click();
      console.log('Кнопка "Cắt và lưu" нажата');

      // Шаг 5: Ожидание завершения загрузки
      const textarea = await waitForElement('#PINHOLE_TEXT_AREA_ELEMENT_ID', 60000);
      console.log('Textarea найдена, загрузка завершена:', textarea.outerHTML);

      // Шаг 6: Ввод текста в textarea
      console.log('Textarea найдена:', textarea.outerHTML);
      const promptText = 'Tạo video hoạt hình từ hình ảnh đã tải lên';
      Object.defineProperty(textarea, 'value', { value: promptText, writable: true });
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'Enter' }));
      textarea.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      textarea.blur();
      console.log('Текст введён:', textarea.value);

      // Проверяем кнопку генерации
      const generateButton = await waitForElement('button.sc-d6df593a-1.sc-408537d4-2');
      console.log('Кнопка генерации:', generateButton.outerHTML);
      console.log('Кнопка disabled?', generateButton.disabled);

      // Ждём активации кнопки
      await new Promise((resolve, reject) => {
        const start = Date.now();
        const check = () => {
          if (!generateButton.disabled) resolve();
          else if (Date.now() - start > 15000) reject(new Error('Кнопка генерации не активировалась за 15 секунд'));
          else setTimeout(check, 100);
        };
        check();
      });

      // Шаг 7: Клик по кнопке генерации
      console.log('Кнопка генерации найдена:', generateButton.outerHTML);
      generateButton.click();
      console.log('Кнопка генерации нажата');

      // Шаг 8: Ожидание начала генерации
      const progressIndicator = await waitForElement('div.sc-dd6abb21-1', 60000);
      console.log('Генерация начата, прогресс:', progressIndicator.textContent);

      // Шаг 9: Ожидание завершения генерации
      const videoElement = await waitForElement('video[src*="storage.googleapis.com"]', 120000);
      console.log('Генерация завершена, видео:', videoElement.outerHTML);

      // Шаг 10: Скачивание видео
      const videoUrl = videoElement.src;
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `video_${i + 1}_${files[i].name}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Видео ${i + 1} скачано:`, videoUrl);
    }

    console.log('Все файлы обработаны');

  } catch (err) {
    console.error('Ошибка:', err.message);
  }
})();

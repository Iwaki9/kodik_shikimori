console.log('Автоматизация запущена');

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
      const buttons = Array.from(document.querySelectorAll('button, [role="option"]'));
      const targetButton = buttons.find(b => b.textContent.trim().includes(text));
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
      const addIcon = await waitForElement('button i.google-symbols[font-size="1.5rem"]', 60000);
      console.log('Элемент i.google-symbols найден:', addIcon.outerHTML);
      console.log('textContent элемента:', addIcon.textContent);
      if (!addIcon.textContent.includes('add')) throw new Error('Кнопка add не содержит текст "add"');
      const addButton = addIcon.parentElement;
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
      const orientationCombo = await waitForElement('button[role="combobox"]:has(i.google-symbols[font-size="1.5rem"])', 30000);
      console.log('Комбобокс ориентации найден:', orientationCombo.outerHTML);
      orientationCombo.click();
      console.log('Комбобокс ориентации открыт');
      await new Promise(resolve => setTimeout(resolve, 5000));
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      console.log('Доступные опции в комбобоксе:', options.map(opt => opt.textContent.trim()));
      const verticalOption = options.find(opt => opt.textContent.trim().includes('Dọc') || opt.textContent.trim().includes('Vertical'));
      if (!verticalOption) throw new Error('Опция Dọc или Vertical не найдена');
      console.log('Ориентация найдена:', verticalOption.outerHTML);
      verticalOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      console.log('Ориентация выбрана:', verticalOption.textContent.trim());
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
      console.log('Свойства textarea:', { disabled: textarea.disabled, readOnly: textarea.readOnly });

      // Шаг 6: Ввод текста в textarea
      const promptText = 'Tạo video hoạt hình từ hình ảnh đã tải lên';
      console.log('Текущий текст в textarea:', textarea.value);
      textarea.focus();
      Object.defineProperty(textarea, 'value', { value: '', writable: true });
      for (let char of promptText) {
        const currentValue = textarea.value;
        Object.defineProperty(textarea, 'value', { value: currentValue + char, writable: true });
        textarea.dispatchEvent(new InputEvent('input', { data: char, inputType: 'insertText', bubbles: true }));
        textarea.dispatchEvent(new Event('beforeinput', { bubbles: true }));
      }
      textarea.dispatchEvent(new Event('change', { bubbles: true }));
      textarea.dispatchEvent(new Event('compositionend', { bubbles: true }));
      textarea.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
      textarea.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'Enter' }));
      textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
      textarea.blur();
      console.log('Текст введён:', textarea.value);
      console.log('Текст в интерфейсе:', document.querySelector('#PINHOLE_TEXT_AREA_ELEMENT_ID').value);

      // Шаг 7: Клик по кнопке генерации
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('Все кнопки с arrow_forward:', Array.from(document.querySelectorAll('button:has(i.google-symbols)')).map(btn => ({ outerHTML: btn.outerHTML, disabled: btn.disabled })));
      console.log('Все кнопки с классом sc-408537d4-2 gdXWm:', Array.from(document.querySelectorAll('button.sc-408537d4-2.gdXWm')).map(btn => ({ outerHTML: btn.outerHTML, disabled: btn.disabled })));
      const generateButton = await waitForElement('button.sc-408537d4-2.gdXWm:not([disabled])', 60000);
      console.log('Кнопка генерации найдена:', generateButton.outerHTML, { disabled: generateButton.disabled });
      generateButton.click();
      console.log('Кнопка генерации нажата');

      // Шаг 8: Ожидание начала генерации
      const progressIndicator = await waitForElement('div.sc-dd6abb21-1', 60000);
      console.log('Генерация начата, прогресс:', progressIndicator.textContent);

      // Шаг 9: Ожидание завершения генерации
      const videoElement = await waitForElement('video[src*="storage.googleapis.com"]', 120000);
      console.log('Генерация завершена, видео:', videoElement.outerHTML);

      // Шаг 10: Скачивание видео
      const fileName = files[i].name.split('.').slice(0, -1).join('.');
      const videoUrl = videoElement.src;
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${fileName}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log(`Видео ${i + 1} скачано с именем: ${fileName}.mp4`, videoUrl);
    }

    console.log('Все файлы обработаны');

  } catch (err) {
    console.error('Ошибка:', err.message);
  }
})();

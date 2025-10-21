console.log('Автоматизация запущена');

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

(async () => {
  try {
    // Шаг 1: Выбор файлов
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.png,.jpg,.webp,.heic';
    input.multiple = true;
    document.body.appendChild(input);
    console.log('Создан input для выбора файлов. Пожалуйста, выберите изображения.');
    await new Promise((resolve) => {
      input.addEventListener('change', () => {
        console.log('Файлы выбраны:', input.files);
        resolve();
      });
      input.click();
    });

    // Шаг 2: Клик по кнопке "add"
    const addButton = await waitForElement('button.sc-d6df593a-1.sc-74578dc8-1');
    console.log('Кнопка "add" найдена:', addButton.outerHTML);
    addButton.click();
    addButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    console.log('Кнопка "add" нажата');

    // Шаг 3: Клик по кнопке "upload"
    const uploadButton = await waitForElement('button.sc-fbea20b2-0');
    console.log('Кнопка "upload" найдена:', uploadButton.outerHTML);
    console.log('Текст кнопки:', uploadButton.textContent);
    uploadButton.click();
    uploadButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    console.log('Кнопка "upload" нажата');

    // Шаг 4: Клик по кнопке "Cắt và lưu"
    const cropButton = await waitForElement('button.sc-d6df593a-1.sc-27bcafa7-7', 60000);
    console.log('Кнопка "Cắt và lưu" найдена:', cropButton.outerHTML);
    cropButton.click();
    cropButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    console.log('Кнопка "Cắt và lưu" нажата');

    // Шаг 5: Ожидание завершения загрузки
    const loadCompleteButton = await waitForElement('button.sc-d6df593a-1.sc-74578dc8-1[data-state="closed"]', 60000);
    console.log('Загрузка завершена, найдена кнопка:', loadCompleteButton.outerHTML);

    // Шаг 6: Ввод текста в textarea
    const textarea = await waitForElement('#PINHOLE_TEXT_AREA_ELEMENT_ID');
    console.log('Textarea найдена:', textarea.outerHTML);
    const promptText = 'Tạo video hoạt hình từ hình ảnh đã tải lên'; // Замени на нужный промт
    Object.defineProperty(textarea, 'value', { value: promptText, writable: true });
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'Enter' }));
    textarea.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
    textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.blur();
    textarea.dispatchEvent(new FocusEvent('blur', { bubbles: true }));
    console.log('Текст введён:', textarea.value);

    // Проверяем состояние кнопки генерации
    const generateButton = await waitForElement('button.sc-d6df593a-1.sc-408537d4-2');
    console.log('Кнопка генерации:', generateButton.outerHTML);
    console.log('Кнопка disabled?', generateButton.disabled);

    // Ждём, пока кнопка станет активной
    await new Promise((resolve, reject) => {
      const start = Date.now();
      const check = () => {
        if (!generateButton.disabled) {
          resolve();
        } else if (Date.now() - start > 15000) {
          reject(new Error('Кнопка генерации не активировалась за 15 секунд'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });

    // Шаг 7: Клик по кнопке генерации
    console.log('Кнопка генерации найдена:', generateButton.outerHTML);
    generateButton.click();
    generateButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    console.log('Кнопка генерации нажата');

  } catch (err) {
    console.error('Ошибка:', err.message);
  }
})();

const logToWindow = (message, isError = false) => {
  const logEntry = document.createElement('div');
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logEntry.style.color = isError ? '#ff4444' : '#ffffff';
  logEntry.style.marginBottom = '8px';
  const logWindow = document.querySelector('#log-content');
  if (logWindow) {
    logWindow.appendChild(logEntry);
    logWindow.scrollTop = logWindow.scrollHeight;
  }
  console.log(message); // Сохраняем вывод в консоль
  if (isError || message.includes('найдена') || message.includes('Текс') || message.includes('скачано') || message.includes('запущена') || message.includes('Прогресс') || message.includes('Видео найдено') || message.includes('Комбобокс режима')) {
    alert(message); // Всплывающее окно для ключевых сообщений
  }
};

const errorToWindow = (message) => {
  logToWindow(message, true);
  console.error(message);
};

// Создание окна логов на странице
const createLogWindow = () => {
  const logDiv = document.createElement('div');
  logDiv.id = 'custom-log-window';
  logDiv.style.position = 'fixed';
  logDiv.style.top = '20px';
  logDiv.style.right = '20px';
  logDiv.style.width = '450px';
  logDiv.style.maxHeight = '80vh';
  logDiv.style.backgroundColor = '#333';
  logDiv.style.color = '#fff';
  logDiv.style.padding = '15px';
  logDiv.style.borderRadius = '8px';
  logDiv.style.zIndex = '99999';
  logDiv.style.overflowY = 'auto';
  logDiv.style.fontFamily = 'monospace';
  logDiv.style.fontSize = '14px';
  logDiv.style.border = '2px solid #ff4444';
  logDiv.style.boxShadow = '0 0 15px rgba(0,0,0,0.7)';

  const clearButton = document.createElement('button');
  clearButton.textContent = 'Очистить логи';
  clearButton.style.marginBottom = '10px';
  clearButton.style.padding = '8px 12px';
  clearButton.style.backgroundColor = '#ff4444';
  clearButton.style.color = 'white';
  clearButton.style.border = 'none';
  clearButton.style.borderRadius = '4px';
  clearButton.style.cursor = 'pointer';
  clearButton.onclick = () => {
    logDiv.querySelector('#log-content').innerHTML = '';
    logToWindow('Логи очищены');
  };

  const logContent = document.createElement('div');
  logContent.id = 'log-content';
  logDiv.appendChild(clearButton);
  logDiv.appendChild(logContent);
  document.body.appendChild(logDiv);
  logToWindow('Окно логов создано');
  alert('Окно логов создано в правом верхнем углу страницы');
  return logContent;
};

const logWindow = createLogWindow();

logToWindow('Автоматизация запущена');

const waitForElement = (selector, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const element = document.querySelector(selector);
      logToWindow(`Проверка селектора "${selector}": ${element ? 'найден' : 'не найден'}`);
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
      logToWindow(`Проверка элемента с текстом "${text}": ${targetButton ? 'найден' : 'не найден'}`);
      if (targetButton) resolve(targetButton);
      else if (Date.now() - start > timeout) reject(new Error(`Элемент с текстом "${text}" не найден за ${timeout/1000} секунд`));
      else setTimeout(check, 100);
    };
    check();
  });
};

const waitForProgressOrVideo = (timeout = 240000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    let progressSeen = false;

    const check = () => {
      const container = document.querySelector('[data-index="1"]');
      if (!container) {
        logToWindow('Контейнер [data-index="1"] не найден');
        if (Date.now() - start > timeout) reject(new Error('Контейнер [data-index="1"] не найден за 240 секунд'));
        else setTimeout(check, 2000);
        return;
      }

      logToWindow('HTML [data-index="1"]: ' + container.innerHTML.substring(0, 200) + '...'); // Логируем часть HTML для отладки

      const existingVideo = container.querySelector('video[src*="storage.googleapis.com"]');
      if (existingVideo && !progressSeen) {
        logToWindow('Обнаружено старое видео в [data-index="1"], ждём нового');
      }

      const progress = container.querySelector('div.sc-dd6abb21-1.iEQNVH');
      const video = container.querySelector('video[src*="storage.googleapis.com"]');

      if (progress) {
        progressSeen = true;
        logToWindow(`Прогресс генерации: ${progress.textContent}`);
        setTimeout(check, 2000); // Проверяем каждые 2 секунды
      } else if (video && progressSeen) {
        logToWindow('Видео найдено в [data-index="1"]: ' + video.outerHTML);
        resolve(video);
      } else if (Date.now() - start > timeout) {
        reject(new Error('Видео не найдено в [data-index="1"] за 240 секунд'));
      } else {
        logToWindow('Ожидание прогресс-бара или видео в [data-index="1"]');
        setTimeout(check, 2000);
      }
    };
    check();
  });
};

(async () => {
  try {
    // Шаг 0: Выбор режима "Tạo video từ các khung hình" в комбобоксе
    const modeCombo = await waitForElement('button[role="combobox"].sc-acb5d8f5-0', 30000);
    logToWindow('Комбобокс режима найден: ' + modeCombo.outerHTML);
    modeCombo.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    modeCombo.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    modeCombo.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    logToWindow('Комбобокс режима открыт');
    await new Promise(resolve => setTimeout(resolve, 10000));
    const viewport = document.querySelector('div[data-radix-select-viewport]');
    logToWindow('Viewport комбобокса: ' + (viewport ? viewport.innerHTML.substring(0, 200) + '...' : 'не найден'));
    const modeOptions = Array.from(document.querySelectorAll('[role="option"]'));
    logToWindow('Доступные опции в комбобоксе режима: ' + modeOptions.map(opt => opt.textContent.trim()).join(', '));
    const frameModeOption = modeOptions.find(opt => opt.textContent.trim().includes('Tạo video từ các khung hình'));
    if (!frameModeOption) throw new Error('Опция "Tạo video từ các khung hình" не найдена');
    logToWindow('Опция режима найдена: ' + frameModeOption.outerHTML);
    frameModeOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    logToWindow('Режим выбран: ' + frameModeOption.textContent.trim());
    await new Promise(resolve => setTimeout(resolve, 3000));
    logToWindow('Комбобокс режима после выбора: ' + modeCombo.outerHTML);

    // Шаг 1: Выбор файлов
    const customInput = document.createElement('input');
    customInput.type = 'file';
    customInput.accept = '.png,.jpg,.webp,.heic';
    customInput.multiple = true;
    document.body.appendChild(customInput);
    logToWindow('Создан input для выбора файлов.');
    const files = await new Promise((resolve) => {
      customInput.addEventListener('change', () => {
        logToWindow('Файлы выбраны: ' + Array.from(customInput.files).map(f => f.name).join(', '));
        resolve(Array.from(customInput.files));
      });
      customInput.click();
    });

    // Цикл по каждому файлу
    for (let i = 0; i < files.length; i++) {
      logToWindow(`Обработка файла ${i + 1}/${files.length}: ${files[i].name}`);

      // Шаг 2: Клик по кнопке "add"
      const addIcon = await waitForElement('button i.google-symbols[font-size="1.5rem"]', 60000);
      logToWindow('Элемент i.google-symbols найден: ' + addIcon.outerHTML);
      logToWindow('textContent элемента: ' + addIcon.textContent);
      if (!addIcon.textContent.includes('add')) throw new Error('Кнопка add не содержит текст "add"');
      const addButton = addIcon.parentElement;
      logToWindow('Кнопка "add" найдена: ' + addButton.outerHTML);
      addButton.click();
      logToWindow('Кнопка "add" нажата');

      // Шаг 3: Передача одного файла в input на странице
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pageInput = await waitForElement('input[type="file"]', 30000);
      logToWindow('Page input найден: ' + pageInput.outerHTML);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(files[i]);
      pageInput.files = dataTransfer.files;
      pageInput.dispatchEvent(new Event('change', { bubbles: true }));
      logToWindow('Файл передан в pageInput: ' + files[i].name);

      // Шаг 3.5: Выбор ориентации "Dọc"
      await new Promise(resolve => setTimeout(resolve, 5000));
      const orientationCombo = await waitForElement('button[role="combobox"]:has(i.google-symbols[font-size="1.5rem"])', 30000);
      logToWindow('Комбобокс ориентации найден: ' + orientationCombo.outerHTML);
      orientationCombo.click();
      logToWindow('Комбобокс ориентации открыт');
      await new Promise(resolve => setTimeout(resolve, 5000));
      const options = Array.from(document.querySelectorAll('[role="option"]'));
      logToWindow('Доступные опции в комбобоксе: ' + options.map(opt => opt.textContent.trim()).join(', '));
      const verticalOption = options.find(opt => opt.textContent.trim().includes('Dọc') || opt.textContent.trim().includes('Vertical'));
      if (!verticalOption) throw new Error('Опция Dọc или Vertical не найдена');
      logToWindow('Ориентация найдена: ' + verticalOption.outerHTML);
      verticalOption.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      logToWindow('Ориентация выбрана: ' + verticalOption.textContent.trim());
      await new Promise(resolve => setTimeout(resolve, 3000));
      logToWindow('Комбобокс после выбора: ' + orientationCombo.outerHTML);

      // Шаг 4: Клик по кнопке "Cắt và lưu"
      const cropButton = await waitForButtonByText('Cắt và lưu', 60000);
      logToWindow('Кнопка "Cắt và lưu" найдена: ' + cropButton.outerHTML);
      cropButton.click();
      logToWindow('Кнопка "Cắt và lưu" нажата');

      // Шаг 5: Ожидание завершения загрузки
      const textarea = await waitForElement('#PINHOLE_TEXT_AREA_ELEMENT_ID', 60000);
      logToWindow('Textarea найдена, загрузка завершена: ' + textarea.outerHTML);
      logToWindow('Свойства textarea: ' + JSON.stringify({ disabled: textarea.disabled, readOnly: textarea.readOnly }));

      // Шаг 6: Ввод текста в textarea
      const promptText = 'Tạo video hoạt hình từ hình ảnh đã tải lên';
      logToWindow('Текущий текст в textarea: ' + textarea.value);
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
      logToWindow('Текст введён: ' + textarea.value);
      logToWindow('Текст в интерфейсе: ' + document.querySelector('#PINHOLE_TEXT_AREA_ELEMENT_ID').value);

      // Шаг 7: Клик по кнопке генерации
      await new Promise(resolve => setTimeout(resolve, 10000));
      logToWindow('Все кнопки с arrow_forward: ' + JSON.stringify(Array.from(document.querySelectorAll('button:has(i.google-symbols)')).map(btn => ({ outerHTML: btn.outerHTML, disabled: btn.disabled }))));
      logToWindow('Все кнопки с классом sc-408537d4-2 gdXWm: ' + JSON.stringify(Array.from(document.querySelectorAll('button.sc-408537d4-2.gdXWm')).map(btn => ({ outerHTML: btn.outerHTML, disabled: btn.disabled }))));
      const generateButton = await waitForElement('button.sc-408537d4-2.gdXWm:not([disabled])', 60000);
      logToWindow('Кнопка генерации найдена: ' + generateButton.outerHTML + ', disabled: ' + generateButton.disabled);
      generateButton.click();
      logToWindow('Кнопка генерации нажата');

      // Шаг 8: Ожидание начала и завершения генерации
      const videoElement = await waitForProgressOrVideo(240000);
      logToWindow('Генерация завершена, видео: ' + videoElement.outerHTML);

      // Шаг 9: Ожидание завершения генерации (закомментировано)
      /*
      const videoElement = await waitForElement('video[src*="storage.googleapis.com"]', 120000);
      logToWindow('Генерация завершена, видео: ' + videoElement.outerHTML);
      */

      // Шаг 10: Скачивание видео (закомментировано)
      /*
      const fileName = files[i].name.split('.').slice(0, -1).join('.');
      const videoUrl = videoElement.src;
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `${fileName}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      logToWindow(`Видео ${i + 1} скачано с именем: ${fileName}.mp4, URL: ${videoUrl}`);
      */
    }

    logToWindow('Все файлы обработаны');

  } catch (err) {
    errorToWindow('Ошибка: ' + err.message);
  }
})();

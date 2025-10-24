// =======================
// ЛОГИРОВАНИЕ И УВЕДОМЛЕНИЯ
// =======================

const showNotification = (message, level = 'info') => {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.cssText = `
    position: fixed; top: 15px; right: 15px;
    background: ${level === 'error' ? '#c62828' : '#2e7d32'};
    color: #fff; padding: 10px 16px;
    font-family: sans-serif; font-size: 14px;
    border-radius: 5px; box-shadow: 0 0 8px rgba(0,0,0,0.4);
    opacity: 0; z-index: 100000; transition: opacity 0.3s;
  `;
  document.body.appendChild(note);
  requestAnimationFrame(() => (note.style.opacity = 1));
  setTimeout(() => note.remove(), 3500);
};

const logToWindow = (message, level = 'info') => {
  const logContent = document.querySelector('#log-content');
  if (!logContent) return console.log(message);

  const logEntry = document.createElement('div');
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logEntry.style.color = level === 'error' ? '#ff4d4d' : '#ffffff';
  logEntry.style.marginBottom = '6px';
  logContent.appendChild(logEntry);
  logContent.scrollTop = logContent.scrollHeight;
  console[level === 'error' ? 'error' : 'log'](message);

  if (level === 'error') showNotification(message, 'error');
};

const createLogWindow = () => {
  if (document.querySelector('#custom-log-window')) return;

  const container = document.createElement('div');
  container.id = 'custom-log-window';
  container.style = `
    position: fixed; top: 15px; right: 15px;
    width: 420px; max-height: 80vh;
    background: #222; color: #ddd; 
    padding: 12px; border-radius: 6px;
    border: 1px solid #444;
    overflow-y: auto; font-family: monospace;
    font-size: 13px; z-index: 100000;
  `;

  const clearButton = document.createElement('button');
  clearButton.textContent = 'Очистить';
  clearButton.style = `
    margin-bottom: 8px; padding: 6px 10px;
    background: #555; color: white;
    border: none; cursor: pointer; border-radius: 4px;
  `;
  clearButton.onclick = () => {
    document.querySelector('#log-content').innerHTML = '';
    logToWindow('Логи очищены');
  };

  const logDiv = document.createElement('div');
  logDiv.id = 'log-content';

  container.append(clearButton, logDiv);
  document.body.appendChild(container);
  logToWindow('Создано окно логов');
};
createLogWindow();

// =======================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =======================

const waitForElement = (selector, timeout = 30000) =>
  new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Элемент ${selector} не найден`));
    }, timeout);
  });

const waitForButtonByText = (text, timeout = 30000) =>
  new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="option"]'));
      const btn = buttons.find(b => b.textContent.trim().includes(text));
      if (btn) {
        clearInterval(interval);
        resolve(btn);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        reject(new Error(`Кнопка с текстом "${text}" не найдена`));
      }
    }, 300);
  });

const simulateClick = (element) => {
  if (!element) return;
  ['mousedown', 'click', 'mouseup'].forEach(ev =>
    element.dispatchEvent(new MouseEvent(ev, { bubbles: true }))
  );
};

// =======================
// ОСНОВНОЙ АСИНХРОННЫЙ ЦИКЛ
// =======================

(async () => {
  try {
    logToWindow('Сценарий запущен');

    // Шаг 1 — выбрать режим
    const combo = await waitForElement('button[role="combobox"].sc-acb5d8f5-0');
    simulateClick(combo);
    logToWindow('Комбобокс режима найден и открыт');

    const options = [...document.querySelectorAll('[role="option"]')];
    const frameModeOption = options.find(o => o.textContent.includes('Tạo video từ các khung hình'));
    if (!frameModeOption) throw new Error('Режим "Tạo video từ các khung hình" не найден');
    simulateClick(frameModeOption);
    logToWindow('Выбран режим: ' + frameModeOption.textContent);

    // Шаг 2 — создать input
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.png,.jpg,.webp';
    document.body.appendChild(input);
    input.click();

    const files = await new Promise(resolve =>
      input.addEventListener('change', () => resolve([...input.files]))
    );

    logToWindow(`Выбрано файлов: ${files.map(f => f.name).join(', ')}`);

    // Цикл обработки файлов
    for (const file of files) {
      logToWindow(`Обработка файла: ${file.name}`);

      const addButton = await waitForElement('button i.google-symbols[font-size="1.5rem"]');
      simulateClick(addButton.closest('button'));
      logToWindow('Кнопка "add" нажата');

      const pageInput = await waitForElement('input[type="file"]');
      const transfer = new DataTransfer();
      transfer.items.add(file);
      pageInput.files = transfer.files;
      pageInput.dispatchEvent(new Event('change', { bubbles: true }));
      logToWindow(`Файл передан: ${file.name}`);

      const cropButton = await waitForButtonByText('Cắt và lưu', 60000);
      simulateClick(cropButton);
      logToWindow('Нажата кнопка "Cắt và lưu"');

      logToWindow('Ожидание генерации видео...');
      const video = await waitForElement('video[src*="storage.googleapis.com"]', 240000);
      logToWindow('Видео создано: ' + video.src);

      // Скачивание файла
      const link = document.createElement('a');
      link.href = video.src;
      link.download = `${file.name.split('.')[0]}.mp4`;
      link.click();
      logToWindow(`Видео скачано: ${link.download}`);
    }

    logToWindow('Все файлы обработаны');
  } catch (err) {
    logToWindow(`Ошибка: ${err.message}`, 'error');
  }
})();

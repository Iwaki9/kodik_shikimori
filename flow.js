// Универсальные функции логирования и уведомлений
const logToWindow = (message, level = 'info') => {
  const colors = {
    info: '#ffffff',
    warn: '#ffaa00',
    error: '#ff4444'
  };
  const logContent = document.querySelector('#log-content');
  if (!logContent) return console.log(message);

  const logEntry = document.createElement('div');
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logEntry.style.color = colors[level] || '#fff';
  logEntry.style.marginBottom = '8px';
  logContent.appendChild(logEntry);
  logContent.scrollTop = logContent.scrollHeight;

  console[level === 'error' ? 'error' : 'log'](message);

  if (['error', 'warn'].includes(level)) showNotification(message, level);
};

const showNotification = (message, level = 'info') => {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.cssText = `
    position: fixed; top: 15px; right: 15px;
    background: ${level === 'error' ? '#c62828' : '#2e7d32'};
    color: #fff; padding: 10px 16px;
    font-family: sans-serif;
    font-size: 14px; border-radius: 5px;
    box-shadow: 0 0 8px rgba(0,0,0,0.4);
    opacity: 0; z-index: 100000;
    transition: opacity 0.3s;
  `;
  document.body.appendChild(note);
  requestAnimationFrame(() => (note.style.opacity = 1));
  setTimeout(() => note.remove(), 3500);
};

// Окно логов
const createLogWindow = () => {
  if (document.querySelector('#custom-log-window')) return;

  const logDiv = document.createElement('div');
  logDiv.id = 'custom-log-window';
  logDiv.style = `
    position: fixed; top: 20px; right: 20px;
    width: 450px; max-height: 80vh;
    background: #202020; color: white;
    padding: 15px; border-radius: 8px;
    border: 1px solid #555;
    overflow-y: auto; font-family: monospace;
    font-size: 13px; z-index: 99999;
  `;

  const clearButton = document.createElement('button');
  clearButton.textContent = 'Очистить логи';
  clearButton.style = `
    margin-bottom: 10px; padding: 8px;
    background: #555; color: white;
    border: none; border-radius: 4px;
    cursor: pointer;
  `;
  clearButton.onclick = () => {
    logDiv.querySelector('#log-content').innerHTML = '';
    logToWindow('Логи очищены', 'info');
  };

  const logContent = document.createElement('div');
  logContent.id = 'log-content';

  logDiv.append(clearButton, logContent);
  document.body.appendChild(logDiv);
  logToWindow('Окно логов создано', 'info');
};
createLogWindow();

// Улучшенные функции ожидания с MutationObserver
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

// Универсальная функция симуляции клика
const simulateClick = (element) => {
  if (!element) return;
  ['mousedown', 'click', 'mouseup'].forEach((eventType) =>
    element.dispatchEvent(new MouseEvent(eventType, { bubbles: true }))
  );
};

// Основной поток автоматизации
(async () => {
  try {
    logToWindow('Скрипт запущен', 'info');

    const comboBox = await waitForElement('button[role="combobox"]', 20000);
    simulateClick(comboBox);
    logToWindow('Комбобокс найден и открыт', 'info');

    const options = [...document.querySelectorAll('[role="option"]')];
    const targetOption = options.find((o) =>
      o.textContent.includes('Tạo video từ các khung hình')
    );
    if (!targetOption) throw new Error('Опция режима не найдена');
    simulateClick(targetOption);
    logToWindow('Режим выбран: ' + targetOption.textContent, 'info');

    // Пример параллельного ожидания
    const [inputEl, saveBtn] = await Promise.all([
      waitForElement('input[type="file"]', 15000),
      waitForElement('button:has(i.google-symbols)', 15000),
    ]);

    logToWindow('Элементы для загрузки готовы', 'info');
    simulateClick(saveBtn);
  } catch (e) {
    logToWindow(`Ошибка: ${e.message}`, 'error');
  }
})();

// ================================
// СИСТЕМА ЛОГОВ + УВЕДОМЛЕНИЯ1
// ================================

const showNotification = (message, level = 'info') => {
  const note = document.createElement('div');
  note.textContent = message;
  note.style.cssText = `
    position: fixed; top: 15px; right: 15px;
    background: ${level === 'error' ? '#c62828' : '#388e3c'};
    color: white; padding: 10px 16px;
    border-radius: 6px; box-shadow: 0 0 8px rgba(0,0,0,0.4);
    font-family: sans-serif; font-size: 14px;
    z-index: 100000; opacity: 0; transition: opacity .3s;
  `;
  document.body.appendChild(note);
  requestAnimationFrame(() => note.style.opacity = 1);
  setTimeout(() => note.remove(), 3500);
};

const logToWindow = (message, level = 'info') => {
  const logContainer = document.querySelector('#log-content');
  if (!logContainer) return console.log(message);

  const entry = document.createElement('div');
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  entry.style.color = level === 'error' ? '#ff4d4d' : '#ddd';
  entry.style.marginBottom = '6px';
  logContainer.appendChild(entry);
  logContainer.scrollTop = logContainer.scrollHeight;

  console[level === 'error' ? 'error' : 'log'](message);
  if (level === 'error') showNotification(message, 'error');
};

const createLogWindow = () => {
  if (document.querySelector('#custom-log-window')) return;

  const shell = document.createElement('div');
  shell.id = 'custom-log-window';
  shell.style = `
    position: fixed; top: 15px; right: 15px; width: 420px;
    background: #111; color: #eee;
    padding: 12px; border-radius: 6px;
    max-height: 80vh; overflow-y: auto;
    font-family: monospace; border: 1px solid #444;
    z-index: 99999;
  `;

  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Очистить логи';
  clearBtn.style = `
    margin-bottom: 8px; background: #444;
    color: white; border: none; cursor: pointer;
    padding: 6px 10px; border-radius: 4px;
  `;
  clearBtn.onclick = () => {
    document.querySelector('#log-content').innerHTML = '';
    logToWindow('Логи очищены');
  };

  const logDiv = document.createElement('div');
  logDiv.id = 'log-content';
  shell.append(clearBtn, logDiv);
  document.body.appendChild(shell);
  logToWindow('Создано окно логов');
};
createLogWindow();


// ================================
// ПОДДЕРЖКА ОЖИДАНИЙ И КЛИКОВ
// ================================

const waitForElement = (selector, timeout = 30000) =>
  new Promise((resolve, reject) => {
    const found = document.querySelector(selector);
    if (found) return resolve(found);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Элемент ${selector} не найден`));
    }, timeout);
  });

const simulateClick = (element) => {
  if (!element) return logToWindow('Попытка клика по несуществующему элементу', 'warn');
  ['mousedown', 'click', 'mouseup'].forEach(evt =>
    element.dispatchEvent(new MouseEvent(evt, { bubbles: true }))
  );
};


// ================================
// ОТДЕЛЬНЫЕ ОТЛАЖИВАЕМЫЕ ШАГИ
// ================================

const DebugSteps = {
  async step1_openModeMenu() {
    const combo = await waitForElement('button[role="combobox"]');
    simulateClick(combo);
    logToWindow('[STEP 1] Комбобокс режимов найден и кликнут');
  },

  async step2_selectMode() {
    // Ждем, пока интерфейс отрисует список
    await new Promise(r => setTimeout(r, 1500));

    const options = [...document.querySelectorAll('[role="option"]')];
    logToWindow('[STEP 2] Найденные опции: ' +
      options.map(o => o.textContent.trim()).join(' | '));

    const target = options.find(o =>
      o.textContent.includes('Tạo video từ các khung hình')
    );

    if (!target) throw new Error('Опция "Tạo video từ các khung hình" не найдена');
    simulateClick(target);
    logToWindow('[STEP 2] Режим выбран: ' + target.textContent);
  },

  async step3_uploadFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.png,.jpg,.webp';
    document.body.appendChild(input);
    input.click();
    const files = await new Promise(r => input.addEventListener('change', () => r([...input.files])));
    logToWindow('[STEP 3] Выбрано файлов: ' + files.map(f => f.name).join(', '));
    return files;
  },

  async step4_sendFileToPage(file) {
    const pageInput = await waitForElement('input[type="file"]', 20000);
    const transfer = new DataTransfer();
    transfer.items.add(file);
    pageInput.files = transfer.files;
    pageInput.dispatchEvent(new Event('change', { bubbles: true }));
    logToWindow('[STEP 4] Файл передан странице: ' + file.name);
  },

  async step5_clickGenerate() {
    const genBtn = await waitForElement('button.sc-408537d4-2.gdXWm:not([disabled])');
    simulateClick(genBtn);
    logToWindow('[STEP 5] Кнопка генерации нажата');
  },

  async step6_waitVideo() {
    logToWindow('[STEP 6] Проверка загрузки видео...');
    const video = await waitForElement('video[src*="storage.googleapis.com"]', 240000);
    logToWindow('[STEP 6] Видео найдено: ' + video.src);
    return video;
  }
};


// ================================
// ПОЛНЫЙ АВТОМАТИЧЕСКИЙ ЦИКЛ
// ================================

(async () => {
  try {
    logToWindow('==== НАЧАЛО СЦЕНАРИЯ ====');
    await DebugSteps.step1_openModeMenu();
    await DebugSteps.step2_selectMode();

    const files = await DebugSteps.step3_uploadFiles();
    for (const file of files) {
      await DebugSteps.step4_sendFileToPage(file);
      await DebugSteps.step5_clickGenerate();
      const video = await DebugSteps.step6_waitVideo();

      // скачивание видео
      const name = file.name.replace(/\.\w+$/, '');
      const link = document.createElement('a');
      link.href = video.src;
      link.download = `${name}.mp4`;
      link.click();
      logToWindow(`Видео "${name}.mp4" скачано`, 'info');
    }

    showNotification('Автоматизация успешно завершена!');
  } catch (err) {
    logToWindow(`ОШИБКА: ${err.message}`, 'error');
  }
})();

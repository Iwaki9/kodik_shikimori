console.log('Автоматизация запущена');

// Ищем кнопку по атрибуту data-state и тексту
const button = document.querySelector('button[data-state="closed"]');
if (button && button.textContent.includes('Veo 3.1 - Fast')) {
  button.click();
  console.log('Кнопка "Veo 3.1 - Fast" найдена и нажата');
} else {
  console.error('Кнопка не найдена');
}

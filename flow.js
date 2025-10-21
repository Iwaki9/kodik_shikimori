(function(){
// Простой тестовый сигнал
var bm = document.createElement('div');
bm.id = 'bm_test_marker';
bm.style.position = 'fixed';
bm.style.bottom = '10px';
bm.style.left = '10px';
bm.style.padding = '8px 12px';
bm.style.background = '#28a745';
bm.style.color = '#fff';
bm.style.fontFamily = 'Arial, sans-serif';
bm.style.zIndex = 9999;
bm.style.borderRadius = '6px';
bm.textContent = 'Bookmarklet: тест прошёл';
document.body.appendChild(bm);
})();


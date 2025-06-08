// Скрипт для исправления проблем с аналитическими данными
// Запустите в консоли браузера: window.fixAnalytics()

window.fixAnalytics = function () {
  console.log('🔧 Исправление настроек аналитики...');

  // Диагностика текущих настроек
  const useMocks = localStorage.getItem('useMocks');
  const mockDataType = localStorage.getItem('mockDataType');

  console.log('📊 Текущие настройки:');
  console.log('- useMocks:', useMocks);
  console.log('- mockDataType:', mockDataType);

  // Исправление настроек
  localStorage.setItem('useMocks', 'true');
  localStorage.setItem('mockDataType', 'filled');

  console.log('✅ Настройки исправлены:');
  console.log('- useMocks: true');
  console.log('- mockDataType: filled');

  // Очистка кэша
  if ('caches' in window) {
    caches.keys().then(function (names) {
      names.forEach(function (name) {
        caches.delete(name);
      });
    });
  }

  console.log('🔄 Перезагрузка через 2 секунды...');
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

// Автоматическая диагностика при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  const useMocks = localStorage.getItem('useMocks');
  const mockDataType = localStorage.getItem('mockDataType');

  if (useMocks !== 'true' || mockDataType !== 'filled') {
    console.warn('⚠️ Обнаружены проблемы с настройками аналитики');
    console.log('💡 Запустите window.fixAnalytics() для исправления');
  }
});

console.log(
  '📋 Скрипт исправления аналитики загружен. Используйте window.fixAnalytics() для исправления проблем.'
);

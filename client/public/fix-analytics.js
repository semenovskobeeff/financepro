// Скрипт для диагностики проблем с аналитическими данными
// НЕ запускайте на продакшене - моки недоступны в production!

window.fixAnalytics = function () {
  // Определяем продакшен
  const isProduction =
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  if (isProduction) {
    console.error('❌ [PRODUCTION] Моки недоступны в продакшене!');
    console.error('На продакшене используйте только реальные данные из БД');
    console.error('Проверьте:');
    console.error('- Подключение к базе данных');
    console.error('- Работу API сервера');
    console.error('- Сетевое подключение');
    return;
  }

  console.log('🔧 Исправление настроек аналитики (только для разработки)...');

  // Диагностика текущих настроек
  const useMocks = localStorage.getItem('useMocks');
  const mockDataType = localStorage.getItem('mockDataType');

  console.log('📊 Текущие настройки:');
  console.log('- useMocks:', useMocks);
  console.log('- mockDataType:', mockDataType);

  // Исправление настроек только для development
  localStorage.setItem('useMocks', 'true');
  localStorage.setItem('mockDataType', 'filled');

  console.log('✅ Настройки исправлены для разработки:');
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

  // Определяем продакшен
  const isProduction =
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  if (isProduction) {
    console.log('🔍 [PRODUCTION] Продакшен режим - моки отключены');

    if (useMocks === 'true') {
      console.warn('⚠️ [PRODUCTION] Обнаружены настройки моков в продакшене!');
      console.warn('Удаляем некорректные настройки...');
      localStorage.removeItem('useMocks');
      localStorage.removeItem('mockDataType');
      localStorage.removeItem('fallbackToMocks');
    } else {
      console.log(
        '✅ [PRODUCTION] Настройки корректны - используются реальные данные'
      );
    }
  } else if (useMocks !== 'true' || mockDataType !== 'filled') {
    console.warn(
      '⚠️ [DEVELOPMENT] Обнаружены проблемы с настройками аналитики'
    );
    console.log('💡 Запустите window.fixAnalytics() для исправления');
  }
});

console.log(
  '📋 Скрипт исправления аналитики загружен. Используйте window.fixAnalytics() для исправления проблем.'
);

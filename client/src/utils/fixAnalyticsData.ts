// Утилита для диагностики и исправления проблем с аналитическими данными

interface AnalyticsDataCheck {
  useMocks: boolean;
  mockDataType: 'filled' | 'empty';
  hasAnalyticsData: boolean;
  issues: string[];
  fixes: string[];
}

// Функция для очистки избыточных данных localStorage
export const cleanupLocalStorage = (): void => {
  try {
    // Удаляем потенциально большие данные из localStorage
    const keysToRemove = [
      'persist:root',
      'debug',
      'networkErrorTipShown',
      'configLogged',
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Очищаем sessionStorage
    sessionStorage.clear();

    console.log('🧹 localStorage очищен от избыточных данных');
  } catch (error) {
    console.warn('⚠️ Ошибка при очистке localStorage:', error);
  }
};

export const diagnoseAnalyticsData = (): AnalyticsDataCheck => {
  const issues: string[] = [];
  const fixes: string[] = [];

  // Проверяем настройки localStorage
  const useMocks = localStorage.getItem('useMocks') === 'true';
  const mockDataType =
    (localStorage.getItem('mockDataType') as 'filled' | 'empty') || 'filled';

  console.log('🔍 Диагностика аналитических данных:');
  console.log('- useMocks:', useMocks);
  console.log('- mockDataType:', mockDataType);

  if (!useMocks) {
    issues.push('Моки отключены, но сервер может быть недоступен');
    fixes.push('Включить моки для демонстрации функциональности');
  }

  if (mockDataType === 'empty') {
    issues.push('Установлен режим пустых данных');
    fixes.push('Переключиться на режим заполненных данных');
  }

  const hasAnalyticsData = mockDataType === 'filled' && useMocks;

  return {
    useMocks,
    mockDataType,
    hasAnalyticsData,
    issues,
    fixes,
  };
};

export const fixAnalyticsData = (): void => {
  console.log('🔧 Исправление настроек аналитических данных...');

  // Принудительно устанавливаем правильные настройки
  localStorage.setItem('useMocks', 'true');
  localStorage.setItem('mockDataType', 'filled');

  console.log('✅ Настройки исправлены:');
  console.log('- useMocks: true');
  console.log('- mockDataType: filled');
  console.log('💡 Настройки применятся при следующем запросе к API');
};

// Автоматическая диагностика при импорте
if (typeof window !== 'undefined') {
  // Сначала очищаем localStorage от избыточных данных
  cleanupLocalStorage();

  const diagnosis = diagnoseAnalyticsData();

  if (diagnosis.issues.length > 0) {
    console.warn(
      '⚠️ Обнаружены проблемы с аналитическими данными:',
      diagnosis.issues
    );
    console.log('💡 Рекомендуемые исправления:', diagnosis.fixes);

    // Автоматическое исправление в development режиме БЕЗ перезагрузки
    if (import.meta.env.DEV) {
      console.log('🔧 Автоматическое исправление в режиме разработки...');
      // Принудительно устанавливаем правильные настройки
      localStorage.setItem('useMocks', 'true');
      localStorage.setItem('mockDataType', 'filled');
      console.log('✅ Настройки автоматически исправлены');
    }
  } else {
    console.log('✅ Настройки аналитических данных корректны');
  }
}

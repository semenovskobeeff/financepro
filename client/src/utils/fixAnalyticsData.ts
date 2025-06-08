// Утилита для диагностики и исправления проблем с аналитическими данными

interface AnalyticsDataCheck {
  useMocks: boolean;
  mockDataType: 'filled' | 'empty';
  hasAnalyticsData: boolean;
  issues: string[];
  fixes: string[];
}

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
  console.log('Перезагрузите страницу для применения изменений');

  // Автоматическая перезагрузка
  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Автоматическая диагностика при импорте
if (typeof window !== 'undefined') {
  const diagnosis = diagnoseAnalyticsData();

  if (diagnosis.issues.length > 0) {
    console.warn(
      '⚠️ Обнаружены проблемы с аналитическими данными:',
      diagnosis.issues
    );
    console.log('💡 Рекомендуемые исправления:', diagnosis.fixes);

    // Автоматическое исправление в development режиме
    if (import.meta.env.DEV) {
      console.log('🔧 Автоматическое исправление в режиме разработки...');
      fixAnalyticsData();
    }
  } else {
    console.log('✅ Настройки аналитических данных корректны');
  }
}

// Утилита для диагностики и исправления проблем с аналитическими данными
import { safeLocalStorage } from '../shared/utils/errorUtils';

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
      'redux-localstorage-simple',
    ];

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        safeLocalStorage.removeItem(key);
      }
    });

    // Очищаем sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Не удалось очистить sessionStorage:', e);
    }

    console.log('🧹 localStorage очищен от избыточных данных');
  } catch (error) {
    console.warn('⚠️ Ошибка при очистке localStorage:', error);
  }
};

export const diagnoseAnalyticsData = (): AnalyticsDataCheck => {
  const issues: string[] = [];
  const fixes: string[] = [];

  // Проверяем настройки localStorage
  const useMocks = safeLocalStorage.getItem('useMocks') === 'true';
  const mockDataType =
    (safeLocalStorage.getItem('mockDataType') as 'filled' | 'empty') ||
    'filled';

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
  const mockSuccess = safeLocalStorage.setItem('useMocks', 'true');
  const dataTypeSuccess = safeLocalStorage.setItem('mockDataType', 'filled');

  if (mockSuccess && dataTypeSuccess) {
    console.log('✅ Настройки исправлены:');
    console.log('- useMocks: true');
    console.log('- mockDataType: filled');
    console.log('💡 Настройки применятся при следующем запросе к API');
  } else {
    console.error('❌ Не удалось сохранить настройки в localStorage');
    console.error('Возможно переполнение или ограничения браузера');
  }
};

// Автоматическая диагностика при импорте
if (typeof window !== 'undefined') {
  // Определяем среду
  const isProduction =
    import.meta.env.PROD ||
    import.meta.env.MODE === 'production' ||
    (window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1');

  // В продакшене не выполняем диагностику для избежания лишних логов
  if (isProduction) {
    console.log('[CONFIG] Production режим - диагностика аналитики отключена');
  } else {
    // Сначала очищаем localStorage от избыточных данных только в development
    cleanupLocalStorage();

    const diagnosis = diagnoseAnalyticsData();

    if (diagnosis.issues.length > 0) {
      console.warn(
        '⚠️ Обнаружены проблемы с аналитическими данными:',
        diagnosis.issues
      );
      console.log('💡 Рекомендуемые исправления:', diagnosis.fixes);

      // Автоматическое исправление ТОЛЬКО в development режиме
      if (import.meta.env.DEV) {
        console.log(
          '🔧 Автоматическое исправление настроек аналитики (development)...'
        );
        fixAnalyticsData();
      }
    } else {
      console.log('✅ Настройки аналитических данных корректны');
    }
  }
}

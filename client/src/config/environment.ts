import { safeLocalStorage } from '../shared/utils/errorUtils';

// Функция для получения настройки использования моков
const getUseMocks = (): boolean => {
  // В production НИКОГДА не используем моки
  if (isProduction()) {
    return false;
  }

  // В development проверяем localStorage
  if (typeof window !== 'undefined') {
    const localStorageSetting = safeLocalStorage.getItem('useMocks');
    if (localStorageSetting !== null) {
      return localStorageSetting === 'true';
    }
  }

  // По умолчанию в development используем моки
  return true;
};

// Функция для получения типа моковых данных
const getMockDataType = (): 'filled' | 'empty' => {
  if (typeof window !== 'undefined') {
    const localStorageSetting = safeLocalStorage.getItem('mockDataType');
    if (localStorageSetting === 'filled' || localStorageSetting === 'empty') {
      return localStorageSetting;
    }
  }

  // ВАЖНО: По умолчанию используем заполненные данные для демонстрации функциональности
  return 'filled';
};

// Функция для принудительного сброса настроек к заполненным данным
const forceFilledDataMode = (): void => {
  if (typeof window !== 'undefined') {
    safeLocalStorage.setItem('mockDataType', 'filled');
    safeLocalStorage.setItem('useMocks', 'true');
    console.log('[CONFIG] Принудительно установлен режим заполненных данных');
  }
};

// Функция для определения среды
const isProduction = (): boolean => {
  // Проверяем несколько индикаторов продакшена
  return (
    import.meta.env.PROD ||
    import.meta.env.MODE === 'production' ||
    (window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1')
  );
};

const isDevelopment = (): boolean => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

// Создаем реактивную конфигурацию окружения
class AppConfig {
  private _useMocks: boolean;
  private _mockDataType: 'filled' | 'empty';

  constructor() {
    this._useMocks = getUseMocks();
    this._mockDataType = getMockDataType();
  }

  get useMocks(): boolean {
    return this._useMocks;
  }

  set useMocks(value: boolean) {
    this._useMocks = value;
    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('useMocks', value.toString());
    }
  }

  get mockDataType(): 'filled' | 'empty' {
    return this._mockDataType;
  }

  set mockDataType(value: 'filled' | 'empty') {
    this._mockDataType = value;
    if (typeof window !== 'undefined') {
      safeLocalStorage.setItem('mockDataType', value);
    }
  }

  // URL API сервера
  get apiUrl(): string {
    // В production используем переменную окружения или fallback URL
    if (isProduction()) {
      return (
        import.meta.env.VITE_API_URL || 'https://financepro-patx.vercel.app/api'
      );
    }

    // В development используем локальный сервер
    return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  }

  // Режим отладки (включен только в режиме разработки)
  get debug(): boolean {
    return isDevelopment() || import.meta.env.VITE_DEBUG === 'true';
  }

  // Среда выполнения
  get isDevelopment(): boolean {
    return isDevelopment();
  }

  get isProduction(): boolean {
    return isProduction();
  }

  // Метод для обновления конфигурации
  updateUseMocks(value: boolean): void {
    this.useMocks = value;
    console.log(`[CONFIG] Обновлена настройка useMocks: ${value}`);
  }

  // Метод для обновления типа моковых данных
  updateMockDataType(value: 'filled' | 'empty'): void {
    this.mockDataType = value;
    console.log(`[CONFIG] Обновлена настройка mockDataType: ${value}`);
  }

  // Метод для принудительного сброса к заполненным данным (только для development)
  forceFilledDataMode(): void {
    if (isProduction()) {
      console.warn('[CONFIG] Моки недоступны в продакшене');
      return;
    }

    this.useMocks = true;
    this.mockDataType = 'filled';
    console.log(
      '[CONFIG] Принудительно установлен режим заполненных данных (только для разработки)'
    );
  }

  // Метод для получения текущего состояния
  getState() {
    return {
      useMocks: this.useMocks,
      mockDataType: this.mockDataType,
      apiUrl: this.apiUrl,
      debug: this.debug,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
      environment: import.meta.env.MODE,
    };
  }
}

// Экспортируем единственный экземпляр конфигурации
export const config = new AppConfig();

// Экспортируем функцию для принудительного сброса
export { forceFilledDataMode };

// Логирование конфигурации в режиме разработки
if (config.debug && typeof window !== 'undefined') {
  // Проверяем, что логирование еще не было выполнено
  const hasLoggedConfig = sessionStorage.getItem('configLogged');
  if (!hasLoggedConfig) {
    console.log('[CONFIG] Настройки приложения:', config.getState());
    sessionStorage.setItem('configLogged', 'true');

    // Принудительно устанавливаем режим заполненных данных только для разработки
    if (isDevelopment()) {
      config.forceFilledDataMode();
    } else {
      console.log(
        '[CONFIG] Продакшен режим - принудительное исправление отключено'
      );
    }
  }
}

// Функция для получения настройки использования моков
const getUseMocks = (): boolean => {
  // Сначала проверяем localStorage
  if (typeof window !== 'undefined') {
    const localStorageSetting = localStorage.getItem('useMocks');
    if (localStorageSetting !== null) {
      return localStorageSetting === 'true';
    }
  }

  // По умолчанию false (будет использовать реальный API)
  return false;
};

// Создаем реактивную конфигурацию окружения
class AppConfig {
  private _useMocks: boolean;

  constructor() {
    this._useMocks = getUseMocks();
  }

  get useMocks(): boolean {
    return this._useMocks;
  }

  set useMocks(value: boolean) {
    this._useMocks = value;
    if (typeof window !== 'undefined') {
      localStorage.setItem('useMocks', value.toString());
    }
  }

  // URL API сервера
  get apiUrl(): string {
    return 'http://localhost:3001/api';
  }

  // Режим отладки (включен в режиме разработки)
  get debug(): boolean {
    return true;
  }

  // Среда выполнения
  get isDevelopment(): boolean {
    return true;
  }

  get isProduction(): boolean {
    return false;
  }

  // Метод для обновления конфигурации
  updateUseMocks(value: boolean): void {
    this.useMocks = value;
    console.log(`[CONFIG] Обновлена настройка useMocks: ${value}`);
  }

  // Метод для получения текущего состояния
  getState() {
    return {
      useMocks: this.useMocks,
      apiUrl: this.apiUrl,
      debug: this.debug,
      isDevelopment: this.isDevelopment,
      isProduction: this.isProduction,
    };
  }
}

// Экспортируем единственный экземпляр конфигурации
export const config = new AppConfig();

// Логирование конфигурации в режиме разработки (только один раз)
if (config.debug && typeof window !== 'undefined') {
  // Проверяем, что логирование еще не было выполнено
  const hasLoggedConfig = sessionStorage.getItem('configLogged');
  if (!hasLoggedConfig) {
    console.log('[CONFIG] Настройки приложения:', config.getState());
    sessionStorage.setItem('configLogged', 'true');
  }
}

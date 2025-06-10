// Типы ошибок API
export interface ApiError {
  status?: number;
  data?: {
    message?: string;
    error?: string;
    details?: string[];
  };
  message?: string;
}

// Константы ошибок на русском языке
export const ERROR_MESSAGES = {
  // Сетевые ошибки
  NETWORK_ERROR: 'Ошибка подключения к серверу. Проверьте интернет-соединение.',
  TIMEOUT_ERROR: 'Превышено время ожидания ответа сервера.',

  // Ошибки аутентификации
  INVALID_CREDENTIALS: 'Неверный email или пароль.',
  ACCOUNT_DISABLED: 'Аккаунт заблокирован. Обратитесь к администратору.',
  TOKEN_EXPIRED: 'Сессия истекла. Пожалуйста, войдите заново.',
  UNAUTHORIZED: 'Доступ запрещен. Пожалуйста, войдите в систему.',

  // Ошибки валидации
  VALIDATION_ERROR: 'Проверьте правильность заполнения полей.',
  EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует.',
  WEAK_PASSWORD: 'Пароль должен содержать не менее 6 символов.',
  INVALID_EMAIL: 'Некорректный формат email адреса.',

  // Серверные ошибки
  SERVER_ERROR: 'Внутренняя ошибка сервера. Попробуйте позже.',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен. Попробуйте позже.',

  // Общие ошибки
  UNKNOWN_ERROR: 'Произошла неизвестная ошибка. Попробуйте позже.',
  CONNECTION_REFUSED: 'Не удается подключиться к серверу.',
} as const;

/**
 * Обрабатывает ошибки API и возвращает понятное сообщение на русском языке
 */
export const getErrorMessage = (error: ApiError | any): string => {
  // Проверяем, есть ли подключение к серверу
  if (
    error?.name === 'TypeError' &&
    error?.message?.includes('Failed to fetch')
  ) {
    return ERROR_MESSAGES.CONNECTION_REFUSED;
  }

  // Обработка ошибок RTK Query
  if (error?.status) {
    const status = error.status;
    const serverMessage = error.data?.message || error.data?.error;

    switch (status) {
      case 400:
        if (
          serverMessage?.includes('email') &&
          serverMessage?.includes('exist')
        ) {
          return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
        }
        if (serverMessage?.includes('password')) {
          return ERROR_MESSAGES.WEAK_PASSWORD;
        }
        if (
          serverMessage?.includes('email') &&
          serverMessage?.includes('invalid')
        ) {
          return ERROR_MESSAGES.INVALID_EMAIL;
        }
        return serverMessage || ERROR_MESSAGES.VALIDATION_ERROR;

      case 401:
        if (
          serverMessage?.includes('деактивирован') ||
          serverMessage?.includes('заблокирован')
        ) {
          return ERROR_MESSAGES.ACCOUNT_DISABLED;
        }
        if (
          serverMessage?.includes('токен') ||
          serverMessage?.includes('истек')
        ) {
          return ERROR_MESSAGES.TOKEN_EXPIRED;
        }
        return serverMessage || ERROR_MESSAGES.INVALID_CREDENTIALS;

      case 403:
        return ERROR_MESSAGES.UNAUTHORIZED;

      case 404:
        return serverMessage || 'Запрошенные данные не найдены.';

      case 409:
        return serverMessage || ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;

      case 422:
        return serverMessage || ERROR_MESSAGES.VALIDATION_ERROR;

      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;

      case 502:
      case 503:
        return ERROR_MESSAGES.SERVICE_UNAVAILABLE;

      case 408:
        return ERROR_MESSAGES.TIMEOUT_ERROR;

      default:
        return serverMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }

  // Обработка других типов ошибок
  if (error?.message) {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }

    if (message.includes('timeout')) {
      return ERROR_MESSAGES.TIMEOUT_ERROR;
    }

    return error.message;
  }

  // Если ошибка - строка
  if (typeof error === 'string') {
    return error;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Проверяет, является ли ошибка сетевой
 */
export const isNetworkError = (error: ApiError | any): boolean => {
  return (
    error?.name === 'TypeError' ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network Error') ||
    !error?.status
  );
};

/**
 * Проверяет, является ли ошибка серверной (5xx)
 */
export const isServerError = (error: ApiError | any): boolean => {
  return error?.status >= 500;
};

/**
 * Проверяет, является ли ошибка клиентской (4xx)
 */
export const isClientError = (error: ApiError | any): boolean => {
  return error?.status >= 400 && error?.status < 500;
};

/**
 * Безопасная работа с localStorage с обработкой ошибок
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`[safeLocalStorage] Ошибка чтения ${key}:`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`[safeLocalStorage] Ошибка записи ${key}:`, error);
      if (error instanceof DOMException) {
        if (error.code === 22 || error.name === 'QuotaExceededError') {
          console.error(
            'Превышена квота localStorage. Очищаем старые данные...'
          );
          try {
            // Очищаем неважные ключи
            const keysToRemove = ['errorLogs', 'configLogged', 'debug'];
            keysToRemove.forEach(k => localStorage.removeItem(k));
            // Повторяем попытку записи
            localStorage.setItem(key, value);
            return true;
          } catch (retryError) {
            console.error(
              'Не удалось записать даже после очистки:',
              retryError
            );
          }
        }
      }
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[safeLocalStorage] Ошибка удаления ${key}:`, error);
      return false;
    }
  },
};

/**
 * Обработка IO ошибок (файловые операции, кеш)
 */
export const handleIOError = (
  error: any,
  context: string = 'IO операция'
): void => {
  console.error(`[IO Error] ${context}:`, error);

  // Специфичные ошибки IO
  if (error?.message?.includes('FILE_ERROR_NO_SPACE')) {
    console.error('Недостаточно места на диске');
  } else if (error?.message?.includes('ChromeMethodBFE: 3')) {
    console.error('Ошибка Chrome File API - возможно проблема с кешем');
    // Попытка очистить кеш
    if ('caches' in window) {
      caches
        .keys()
        .then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        })
        .catch(e => console.warn('Не удалось очистить кеш:', e));
    }
  } else if (error?.name === 'DataCloneError') {
    console.error('Ошибка клонирования данных - возможно циклические ссылки');
  }
};

/**
 * Глобальный обработчик для неперехваченных ошибок
 */
export const setupGlobalErrorHandlers = (): void => {
  // Обработка неперехваченных ошибок JavaScript
  window.addEventListener('error', event => {
    console.error('🚨 Глобальная ошибка JavaScript:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });

    // Специальная обработка IO ошибок
    if (
      event.message.includes('IO error') ||
      event.message.includes('FILE_ERROR')
    ) {
      handleIOError(event.error, 'Глобальная IO ошибка');
    }
  });

  // Обработка неперехваченных Promise rejection
  window.addEventListener('unhandledrejection', event => {
    console.error('🚨 Неперехваченное отклонение Promise:', event.reason);

    // Обработка ошибок кеширования
    if (
      event.reason?.message?.includes('setWithHTTL') ||
      event.reason?.message?.includes('cache') ||
      event.reason?.message?.includes('FILE_ERROR_NO_SPACE') ||
      event.reason?.message?.includes('ChromeMethodBFE')
    ) {
      console.error(
        'Ошибка кеширования - возможно переполнение или повреждение кеша'
      );
      handleIOError(event.reason, 'Ошибка кеширования');

      // Предотвращаем показ ошибки пользователю для некритичных ошибок кеша
      event.preventDefault();
    }

    // Специальная обработка React ошибок
    if (event.reason?.message?.includes('Minified React error')) {
      console.error('🔧 Обнаружена минифицированная ошибка React');

      // Если это ошибка хуков (#310), логируем дополнительную информацию
      if (event.reason?.message?.includes('#310')) {
        console.error('🔧 React Error #310 - проблема с порядком хуков');
        console.error(
          '💡 Проверьте что все хуки вызываются в одинаковом порядке'
        );
        console.error('💡 Убедитесь что нет условных хуков или early returns');
      }
    }
  });

  // Дополнительная защита от переполнения localStorage
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key: string, value: string) {
    try {
      return originalSetItem.call(this, key, value);
    } catch (error) {
      console.warn(`Ошибка записи в localStorage для ключа ${key}:`, error);

      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        console.log('Попытка очистки localStorage...');
        // Очищаем старые данные
        const keysToRemove = ['errorLogs', 'debug', 'configLogged'];
        keysToRemove.forEach(k => {
          try {
            localStorage.removeItem(k);
          } catch (e) {
            // Игнорируем ошибки очистки
          }
        });

        // Повторная попытка записи
        try {
          return originalSetItem.call(this, key, value);
        } catch (retryError) {
          console.error('Не удалось записать даже после очистки');
        }
      }

      throw error;
    }
  };
};

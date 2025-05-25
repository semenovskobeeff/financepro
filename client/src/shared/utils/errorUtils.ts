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

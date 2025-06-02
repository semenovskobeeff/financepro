import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { config } from '../../config/environment';

// Базовый запрос с общими настройками для всех API
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: config.useMocks ? '/api' : config.apiUrl,
  timeout: 15000, // Увеличен таймаут до 15 секунд
  prepareHeaders: (headers, { getState }) => {
    // Получение токена из локального хранилища
    const token = localStorage.getItem('token');

    // Если токен есть, добавляем его в заголовки
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Устанавливаем Content-Type для JSON только если он не установлен
    if (!headers.get('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
});

// Обертка для обработки ошибок
export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Логирование запросов в режиме отладки
  if (config.debug) {
    const url = typeof args === 'string' ? args : args.url;
    console.log('[API] Запрос:', {
      url: `${config.useMocks ? '/api' : config.apiUrl}${url}`,
      useMocks: config.useMocks,
      method: typeof args === 'object' ? args.method || 'GET' : 'GET',
    });
  }

  const result = await baseQueryWithAuth(args, api, extraOptions);

  // Обработка ошибок
  if (result.error) {
    const endpoint = typeof args === 'string' ? args : args.url;
    const isNetworkError = result.error.status === 'FETCH_ERROR';

    // Более мягкое логирование ошибок
    if (isNetworkError && !config.useMocks) {
      console.warn('[API] Сервер недоступен:', {
        endpoint,
        recommendation:
          'Переключитесь на тестовые данные для работы без сервера',
      });

      // Не спамим в консоль если сервер недоступен
      const shouldShowTip = !localStorage.getItem('networkErrorTipShown');
      if (shouldShowTip) {
        console.info(
          '💡 Совет: Используйте переключатель "Режим данных" в правом верхнем углу'
        );
        localStorage.setItem('networkErrorTipShown', 'true');
      }
    } else if (config.debug) {
      console.warn('[API] Ошибка:', {
        status: result.error.status,
        endpoint,
        useMocks: config.useMocks,
      });
    }

    // Обработка различных типов ошибок без агрессивных действий
    if (result.error.status === 'TIMEOUT_ERROR') {
      if (config.debug) {
        console.warn('[API] Таймаут запроса:', {
          endpoint,
          recommendation: 'Проверьте соединение с сервером',
        });
      }
    } else if (result.error.status === 401) {
      // Минимальное логирование для 401
      if (config.debug) {
        console.info('[API] Требуется авторизация для:', endpoint);
      }
    } else if (result.error.status === 403) {
      if (config.debug) {
        console.warn('[API] Доступ запрещен:', endpoint);
      }
    } else if (result.error.status === 404) {
      if (config.debug) {
        console.info('[API] Ресурс не найден:', endpoint);
      }
    } else if (result.error.status === 500) {
      console.warn('[API] Ошибка сервера:', {
        endpoint,
        recommendation: 'Попробуйте позже или переключитесь на тестовые данные',
      });
    }
  } else if (config.debug && result.data) {
    // Логирование успешных ответов в режиме отладки
    const endpoint = typeof args === 'string' ? args : args.url;
    console.log('[API] Успех:', {
      endpoint,
      dataType: Array.isArray(result.data)
        ? `array[${result.data.length}]`
        : typeof result.data,
    });
  }

  return result;
};

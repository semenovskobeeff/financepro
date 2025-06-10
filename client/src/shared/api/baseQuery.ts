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

  // Обработка ошибок с подробным логированием
  if (result.error) {
    const endpoint = typeof args === 'string' ? args : args.url;
    const isNetworkError = result.error.status === 'FETCH_ERROR';
    const isTimeoutError = result.error.status === 'TIMEOUT_ERROR';

    // Логирование ошибок подключения к серверу
    if (isNetworkError) {
      console.error('[API] ❌ Ошибка подключения к серверу:', {
        endpoint,
        apiUrl: config.apiUrl,
        useMocks: config.useMocks,
        error: 'Сервер недоступен',
        recommendation: config.useMocks
          ? 'Проверьте работу MSW и настройки моков'
          : 'Проверьте работу сервера и сетевое подключение',
      });

      if (!config.useMocks) {
        console.error('[API] 🔧 Рекомендации для продакшена:');
        console.error('- Проверьте что сервер запущен');
        console.error('- Проверьте URL API:', config.apiUrl);
        console.error('- Проверьте CORS настройки сервера');
        console.error('- Проверьте сетевое подключение');
      }
    } else if (isTimeoutError) {
      console.error('[API] ⏰ Таймаут запроса:', {
        endpoint,
        timeout: '15 секунд',
        recommendation: 'Сервер слишком долго отвечает',
      });
    } else if (result.error.status === 401) {
      console.warn('[API] 🔐 Ошибка авторизации:', {
        endpoint,
        message: 'Требуется аутентификация',
      });
    } else if (result.error.status === 403) {
      console.warn('[API] 🚫 Доступ запрещен:', {
        endpoint,
        message: 'Недостаточно прав доступа',
      });
    } else if (result.error.status === 404) {
      console.warn('[API] 📄 Ресурс не найден:', {
        endpoint,
        message: 'Запрашиваемый ресурс не существует',
      });
    } else if (result.error.status === 500) {
      console.error('[API] 💥 Внутренняя ошибка сервера:', {
        endpoint,
        message: 'Ошибка на стороне сервера',
        recommendation: 'Обратитесь к администратору',
      });
    } else {
      console.error('[API] ❌ Неизвестная ошибка:', {
        endpoint,
        status: result.error.status,
        error: result.error,
      });
    }
  } else if (config.debug && result.data) {
    // Логирование успешных ответов в режиме отладки
    const endpoint = typeof args === 'string' ? args : args.url;

    // Проверяем размер ответа для предотвращения проблем с кешированием
    try {
      const dataSize = JSON.stringify(result.data).length;
      const sizeInMB = dataSize / (1024 * 1024);

      if (sizeInMB > 5) {
        console.warn(
          `[API] ⚠️ Большой ответ (${sizeInMB.toFixed(2)}MB) для ${endpoint}`
        );
        console.warn('Возможны проблемы с кешированием');
      }

      console.log('[API] ✅ Успешный запрос:', {
        endpoint,
        dataType: Array.isArray(result.data)
          ? `array[${result.data.length}]`
          : typeof result.data,
        size: `${(dataSize / 1024).toFixed(1)}KB`,
      });
    } catch (sizeError) {
      console.log('[API] ✅ Успешный запрос:', {
        endpoint,
        dataType: Array.isArray(result.data)
          ? `array[${result.data.length}]`
          : typeof result.data,
        note: 'Не удалось вычислить размер',
      });
    }
  }

  return result;
};

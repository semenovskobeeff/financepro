import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';

// Базовый запрос с общими настройками для всех API
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: '/api',
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
  const result = await baseQueryWithAuth(args, api, extraOptions);

  // Обработка ошибок
  if (result.error) {
    console.error('API Error:', result.error);

    // Обработка 401 ошибки (истекшая сессия)
    if (result.error.status === 401) {
      // Очищаем локальное хранилище при истекшей сессии
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Перенаправляем на страницу входа, если не на ней
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        !window.location.pathname.startsWith('/reset-password')
      ) {
        window.location.href = '/login';
      }
    }

    // Обработка 403 ошибки (недостаточно прав)
    if (result.error.status === 403) {
      console.warn('Access denied:', result.error);
    }

    // Обработка 500 ошибки (ошибка сервера)
    if (result.error.status === 500) {
      console.error('Server error:', result.error);
    }
  }

  return result;
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

/**
 * Хук для автоматического перенаправления на страницу логина при ошибке 401
 */
export const useAuthRedirect = (
  error: FetchBaseQueryError | SerializedError | undefined,
  pageName: string = 'Page'
) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (error && 'status' in error && error.status === 401) {
      console.warn(
        `[${pageName}] Ошибка авторизации - перенаправление на страницу входа`
      );
      navigate('/login');
    }
  }, [error, navigate, pageName]);

  return error && 'status' in error && error.status === 401;
};

/**
 * Проверяет является ли ошибка ошибкой авторизации (401)
 */
export const isAuthError = (
  error: FetchBaseQueryError | SerializedError | undefined
): boolean => {
  return !!(error && 'status' in error && error.status === 401);
};

/**
 * Проверяет является ли ошибка сетевой ошибкой
 */
export const isNetworkError = (
  error: FetchBaseQueryError | SerializedError | undefined
): boolean => {
  return !!(error && 'status' in error && error.status === 'FETCH_ERROR');
};

/**
 * Получает сообщение об ошибке для отображения пользователю
 */
export const getErrorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined
): string => {
  if (!error) return '';

  if ('status' in error) {
    if (error.status === 401) {
      return 'Необходима авторизация';
    }
    if (error.status === 403) {
      return 'Доступ запрещен';
    }
    if (error.status === 404) {
      return 'Данные не найдены';
    }
    if (error.status === 'FETCH_ERROR') {
      return 'Ошибка соединения с сервером';
    }
    if (typeof error.status === 'number' && error.status >= 500) {
      return 'Внутренняя ошибка сервера';
    }
    if (
      error.data &&
      typeof error.data === 'object' &&
      'message' in error.data
    ) {
      return error.data.message as string;
    }
  }

  if ('message' in error) {
    return error.message || 'Неизвестная ошибка';
  }

  return 'Произошла ошибка';
};

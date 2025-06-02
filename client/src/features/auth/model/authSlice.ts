import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from './types';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../../../shared/utils/errorUtils';
import { config } from '../../../config/environment';

// Инициализируем состояние из localStorage
const getInitialState = (): AuthState => {
  console.log('[AUTH] Инициализация состояния авторизации');
  console.log(
    '[AUTH] Режим работы:',
    config.useMocks ? 'тестовые данные' : 'реальный API'
  );

  // В режиме реального API НЕ восстанавливаем состояние авторизации автоматически
  // Пользователь должен войти через форму авторизации
  if (!config.useMocks) {
    console.log(
      '[AUTH] Режим реального API - требуется авторизация через форму'
    );
    // Очищаем возможные старые данные авторизации из тестового режима
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // В режиме тестовых данных проверяем сохраненные данные авторизации
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const hasValidAuth = !!(storedToken && storedUser);

  if (hasValidAuth) {
    console.log(
      '[AUTH] Найдены сохраненные данные авторизации (тестовый режим)'
    );
    try {
      const user = JSON.parse(storedUser);
      return {
        user,
        token: storedToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    } catch (error) {
      console.warn(
        '[AUTH] Ошибка парсинга сохраненных данных пользователя:',
        error
      );
      // Очищаем поврежденные данные
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  console.log('[AUTH] Нет сохраненных данных авторизации в тестовом режиме');
  // В тестовом режиме, если нет данных, они будут созданы MSW при инициализации
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: state => {
      console.log('[AUTH] Выход из системы');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setCredentials: (
      state,
      { payload }: PayloadAction<{ user: User; token: string }>
    ) => {
      console.log('[AUTH] Установка учетных данных:', payload.user.email);
      state.user = payload.user;
      state.token = payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    setUser: (state, { payload }: PayloadAction<User>) => {
      state.user = payload;
      localStorage.setItem('user', JSON.stringify(payload));
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    // Новый экшен для переинициализации при смене режима
    reinitializeAuth: state => {
      console.log('[AUTH] Переинициализация авторизации при смене режима');
      console.log(
        '[AUTH] Новый режим:',
        config.useMocks ? 'тестовые данные' : 'реальный API'
      );

      // Если переключились на реальный API, очищаем данные авторизации
      if (!config.useMocks) {
        console.log(
          '[AUTH] Переключение на реальный API - очистка авторизации'
        );
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      const newState = getInitialState();
      Object.assign(state, newState);
    },
  },
  extraReducers: builder => {
    builder
      // Обработка результатов API запросов
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          console.log('[AUTH] Успешная авторизация:', payload.user.email);
          state.user = payload.user;
          state.token = payload.token;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
          localStorage.setItem('token', payload.token);
          localStorage.setItem('user', JSON.stringify(payload.user));
        }
      )
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, { payload }) => {
          console.log('[AUTH] Успешная регистрация:', payload.user.email);
          state.user = payload.user;
          state.token = payload.token;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.error = null;
          localStorage.setItem('token', payload.token);
          localStorage.setItem('user', JSON.stringify(payload.user));
        }
      )
      .addMatcher(
        authApi.endpoints.updateProfile.matchFulfilled,
        (state, { payload }) => {
          state.user = { ...state.user, ...payload };
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      )
      // Обработка ошибок
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        console.warn('[AUTH] Ошибка авторизации:', action.error);
        state.error = getErrorMessage(action.error);
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        console.warn('[AUTH] Ошибка регистрации:', action.error);
        state.error = getErrorMessage(action.error);
        state.isLoading = false;
        state.isAuthenticated = false;
      })
      .addMatcher(
        authApi.endpoints.updateProfile.matchRejected,
        (state, action) => {
          console.warn('[AUTH] Ошибка обновления профиля:', action.error);
          state.error = getErrorMessage(action.error);
          state.isLoading = false;
        }
      )
      // Обработка начала запросов
      .addMatcher(
        action =>
          action.type.endsWith('/pending') && action.type.includes('auth'),
        state => {
          state.isLoading = true;
          state.error = null;
        }
      );
  },
});

export const {
  logout,
  setCredentials,
  setUser,
  setError,
  clearError,
  reinitializeAuth,
} = authSlice.actions;
export default authSlice.reducer;

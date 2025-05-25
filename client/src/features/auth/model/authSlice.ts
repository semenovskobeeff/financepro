import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from './types';
import { authApi } from '../api/authApi';
import { getErrorMessage } from '../../../shared/utils/errorUtils';

// Инициализируем состояние из localStorage
const getInitialState = (): AuthState => {
  const storedToken = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  // В режиме разработки автоматически авторизуем тестового пользователя
  if (process.env.NODE_ENV === 'development' && !storedToken) {
    const testUser: User = {
      id: 'user1',
      email: 'test@example.com',
      name: 'Тестовый пользователь',
      roles: ['user'],
      settings: {},
    };
    const testToken = 'fake-jwt-token-user1';

    localStorage.setItem('token', testToken);
    localStorage.setItem('user', JSON.stringify(testUser));

    return {
      user: testUser,
      token: testToken,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
  }

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: state => {
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
  },
  extraReducers: builder => {
    builder
      // Обработка результатов API запросов
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
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
        state.error = getErrorMessage(action.error);
        state.isLoading = false;
      })
      .addMatcher(authApi.endpoints.register.matchRejected, (state, action) => {
        state.error = getErrorMessage(action.error);
        state.isLoading = false;
      })
      .addMatcher(
        authApi.endpoints.updateProfile.matchRejected,
        (state, action) => {
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

export const { logout, setCredentials, setUser, setError, clearError } =
  authSlice.actions;
export default authSlice.reducer;

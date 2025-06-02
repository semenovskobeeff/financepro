import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useLoginMutation } from '../api/authApi';
import { RootState } from '../../../app/store';
import {
  getErrorMessage,
  isNetworkError,
  isServerError,
} from '../../../shared/utils/errorUtils';
import ErrorAlert from '../../../shared/ui/ErrorAlert';
import { config } from '../../../config/environment';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [apiError, setApiError] = useState('');
  const [originalError, setOriginalError] = useState<any>(null);

  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector(
    (state: RootState) =>
      state.auth as { isAuthenticated: boolean; error: string | null }
  );

  // RTK Query хук для выполнения запроса на вход
  const [login, { isLoading }] = useLoginMutation();

  // Перенаправление на главную, если пользователь авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setApiError('');

    // Валидация формы
    if (!email.trim() || !password.trim()) {
      setFormError('Пожалуйста, заполните все поля');
      return;
    }

    if (!validateEmail(email)) {
      setFormError('Введите корректный email адрес');
      return;
    }

    if (password.length < 6) {
      setFormError('Пароль должен содержать не менее 6 символов');
      return;
    }

    try {
      // Выполнение запроса на вход
      await login({ email, password }).unwrap();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setApiError(errorMessage);
      setOriginalError(err);

      // Логирование для отладки
      if (isNetworkError(err)) {
        console.error('Сетевая ошибка:', err);
      } else if (isServerError(err)) {
        console.error('Ошибка сервера:', err);
      } else {
        console.error('Ошибка аутентификации:', err);
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Вход в приложение
      </Typography>

      {!config.useMocks && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>Данные для тестового входа:</strong>
          </Typography>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            <Chip
              label="test@example.com"
              size="small"
              onClick={() => setEmail('test@example.com')}
              clickable
              variant="outlined"
            />
            <Chip
              label="password"
              size="small"
              onClick={() => setPassword('password')}
              clickable
              variant="outlined"
            />
          </Box>
        </Alert>
      )}

      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {apiError && (
        <ErrorAlert error={apiError} originalError={originalError} />
      )}

      {error && !apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          placeholder="Email"
          name="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            if (formError || apiError) {
              setFormError('');
              setApiError('');
              setOriginalError(null);
            }
          }}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          placeholder="Пароль"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
            if (formError || apiError) {
              setFormError('');
              setApiError('');
              setOriginalError(null);
            }
          }}
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Войти'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Нет аккаунта?{' '}
            <Button
              variant="text"
              onClick={() => navigate('/register')}
              disabled={isLoading}
            >
              Зарегистрироваться
            </Button>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 1 }}>
          <Typography variant="body2">
            <RouterLink
              to="/forgot-password"
              style={{ textDecoration: 'none' }}
            >
              <Button variant="text" disabled={isLoading}>
                Забыли пароль?
              </Button>
            </RouterLink>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default LoginForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useRegisterMutation } from '../api/authApi';
import { RootState } from '../../../app/store';
import {
  getErrorMessage,
  isNetworkError,
  isServerError,
} from '../../../shared/utils/errorUtils';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();
  const { isAuthenticated, error } = useSelector(
    (state: RootState) => state.auth
  );

  // RTK Query хук для выполнения запроса на регистрацию
  const [register, { isLoading }] = useRegisterMutation();

  // Перенаправление на главную, если пользователь авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    // Валидация полей формы
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Пожалуйста, заполните все поля');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Пароли не совпадают');
      return false;
    }

    if (password.length < 6) {
      setFormError('Пароль должен содержать не менее 6 символов');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Некорректный формат email');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      // Выполнение запроса на регистрацию
      await register({ name, email, password }).unwrap();
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setApiError(errorMessage);

      // Логирование для отладки
      if (isNetworkError(err)) {
        console.error('Сетевая ошибка:', err);
      } else if (isServerError(err)) {
        console.error('Ошибка сервера:', err);
      } else {
        console.error('Ошибка регистрации:', err);
      }
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Регистрация
      </Typography>

      {(error || formError || apiError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError || apiError || error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Имя"
          name="name"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Пароль"
          type="password"
          id="password"
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Подтвердите пароль"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
        </Button>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2">
            Уже есть аккаунт?{' '}
            <Button
              variant="text"
              onClick={() => navigate('/login')}
              disabled={isLoading}
            >
              Войти
            </Button>
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default RegisterForm;

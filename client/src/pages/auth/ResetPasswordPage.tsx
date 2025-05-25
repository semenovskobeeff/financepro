import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
} from '@mui/material';
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from 'react-router-dom';
import { useResetPasswordMutation } from '../../features/auth/api/authApi'; // Исправленный относительный путь
import PasswordStrengthIndicator from '../../shared/ui/PasswordStrengthIndicator';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading, isSuccess, error, data }] =
    useResetPasswordMutation();

  useEffect(() => {
    const queryToken = searchParams.get('token');
    if (queryToken) {
      setToken(queryToken);
    } else {
      // Можно показать ошибку или редиректить, если токена нет
      console.error('Токен для сброса пароля отсутствует в URL');
      // navigate('/login'); // Например, редирект на страницу входа
    }
  }, [searchParams, navigate]);

  const [passwordError, setPasswordError] = React.useState<string>('');

  const validatePassword = (pwd: string): boolean => {
    const minLength = pwd.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[@$!%*?&]/.test(pwd);

    if (!minLength) {
      setPasswordError('Пароль должен содержать минимум 8 символов');
      return false;
    }
    if (!hasUpperCase) {
      setPasswordError('Пароль должен содержать заглавную букву');
      return false;
    }
    if (!hasLowerCase) {
      setPasswordError('Пароль должен содержать строчную букву');
      return false;
    }
    if (!hasNumbers) {
      setPasswordError('Пароль должен содержать цифру');
      return false;
    }
    if (!hasSpecialChar) {
      setPasswordError('Пароль должен содержать специальный символ (@$!%*?&)');
      return false;
    }

    setPasswordError('');
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    if (token) {
      await resetPassword({ token, password });
    }
  };

  useEffect(() => {
    if (isSuccess && data) {
      // Показываем сообщение об успехе и редиректим через несколько секунд
      setTimeout(() => {
        navigate('/login');
      }, 3000); // 3 секунды задержки
    }
  }, [isSuccess, data, navigate]);

  if (!token && !searchParams.get('token')) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" color="error">
            Ошибка
          </Typography>
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            Токен для сброса пароля не найден в URL. Пожалуйста, запросите
            ссылку для сброса пароля снова.
          </Alert>
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Запросить новую ссылку
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Сброс пароля
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Новый пароль"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={isLoading || isSuccess}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Подтвердите новый пароль"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={isLoading || isSuccess}
          />

          {password && (
            <PasswordStrengthIndicator password={password} />
          )}

          {passwordError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {passwordError}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(error as any)?.data?.message ||
                'Произошла ошибка при сбросе пароля'}
            </Alert>
          )}
          {isSuccess && data && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {data.message ||
                'Пароль успешно сброшен! Вы будете перенаправлены на страницу входа.'}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || isSuccess || !token}
          >
            {isLoading ? 'Сброс...' : 'Сбросить пароль'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;

import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useResetPasswordMutation } from '../../features/auth/api/authApi';
import PasswordStrengthIndicator from '../../shared/ui/PasswordStrengthIndicator';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [resetPassword, { isLoading, isSuccess, error }] =
    useResetPasswordMutation();

  // Проверяем наличие токена при загрузке
  useEffect(() => {
    if (!token) {
      console.error('Токен восстановления не найден в URL');
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  // Валидация пароля
  const validatePassword = (pwd: string): boolean => {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push('Минимум 8 символов');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Строчная буква');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Заглавная буква');
    }
    if (!/\d/.test(pwd)) {
      errors.push('Цифра');
    }
    if (!/[@$!%*?&]/.test(pwd)) {
      errors.push('Специальный символ (@$!%*?&)');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      validatePassword(newPassword);
    } else {
      setValidationErrors([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      return;
    }

    // Валидация перед отправкой
    if (!validatePassword(password)) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    try {
      await resetPassword({ token, password }).unwrap();
      // Успех обрабатывается через isSuccess
    } catch (err) {
      console.error('Ошибка сброса пароля:', err);
    }
  };

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    password &&
    confirmPassword &&
    passwordsMatch &&
    validationErrors.length === 0 &&
    !isLoading;

  if (isSuccess) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography component="h1" variant="h5" gutterBottom>
            Пароль успешно сброшен!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Ваш пароль был успешно изменен. Теперь вы можете войти в систему с
            новым паролем.
          </Typography>
          <RouterLink
            to="/login"
            style={{ textDecoration: 'none', width: '100%' }}
          >
            <Button fullWidth variant="contained" size="large">
              Войти в систему
            </Button>
          </RouterLink>
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
        <Typography component="h1" variant="h5" gutterBottom>
          Установка нового пароля
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, textAlign: 'center' }}
        >
          Введите новый пароль для вашего аккаунта
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1, width: '100%' }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Новый пароль"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            disabled={isLoading}
            error={password.length > 0 && validationErrors.length > 0}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {password && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <PasswordStrengthIndicator password={password} />
            </Box>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Подтвердите пароль"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            error={confirmPassword.length > 0 && !passwordsMatch}
            helperText={
              confirmPassword.length > 0 && !passwordsMatch
                ? 'Пароли не совпадают'
                : ''
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(error as any)?.data?.message ||
                'Произошла ошибка при сбросе пароля'}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={!canSubmit}
            size="large"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="text">Вернуться ко входу</Button>
            </RouterLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;

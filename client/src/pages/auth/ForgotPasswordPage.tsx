import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../features/auth/api/authApi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [forgotPassword, { isLoading, isSuccess, error }] =
    useForgotPasswordMutation();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email обязателен');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Введите корректный email адрес');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && emailError) {
      validateEmail(newEmail);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
    } catch (err) {
      console.error('Ошибка при запросе восстановления пароля:', err);
    }
  };

  if (isSuccess) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center',
              width: '100%',
            }}
          >
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography component="h1" variant="h5" gutterBottom>
              Письмо отправлено!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              Если ваш email зарегистрирован в системе, вы получите письмо с
              инструкциями по восстановлению пароля.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Проверьте папку "Спам", если письмо не пришло в течение нескольких
              минут.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                onClick={() => window.location.reload()}
                variant="outlined"
                size="large"
              >
                Отправить еще раз
              </Button>
              <RouterLink to="/login" style={{ textDecoration: 'none' }}>
                <Button fullWidth variant="contained" size="large">
                  Вернуться ко входу
                </Button>
              </RouterLink>
            </Box>
          </Paper>
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
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Email color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography component="h1" variant="h4" gutterBottom>
            Восстановление пароля
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Введите ваш email адрес и мы отправим инструкции для восстановления
            пароля
          </Typography>
        </Box>

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
            id="email"
            label="Email адрес"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            disabled={isLoading}
            error={!!emailError}
            helperText={emailError}
            sx={{ mb: 2 }}
          />

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(error as any)?.data?.message ||
                'Произошла ошибка при отправке запроса'}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 3 }}
            disabled={isLoading || !email || !!emailError}
            size="large"
            startIcon={isLoading ? <CircularProgress size={20} /> : <Email />}
          >
            {isLoading ? 'Отправка...' : 'Отправить ссылку для восстановления'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Вспомнили пароль?
            </Typography>
            <RouterLink to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="text" size="large">
                Войти в систему
              </Button>
            </RouterLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;

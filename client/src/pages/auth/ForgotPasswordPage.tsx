import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPasswordMutation } from '../../features/auth/api/authApi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [forgotPassword, { isLoading, isSuccess, error }] =
    useForgotPasswordMutation();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await forgotPassword({ email });
  };

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
          Восстановление пароля
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
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
            onChange={e => setEmail(e.target.value)}
            disabled={isLoading || isSuccess}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {(error as any)?.data?.message ||
                'Произошла ошибка при отправке запроса'}
            </Alert>
          )}
          {isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Если ваш email зарегистрирован, вы получите письмо для сброса
              пароля.
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading || isSuccess}
          >
            {isLoading ? 'Отправка...' : 'Отправить ссылку для восстановления'}
          </Button>
          <RouterLink to="/login" style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="text">
              Вернуться ко входу
            </Button>
          </RouterLink>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPasswordPage;

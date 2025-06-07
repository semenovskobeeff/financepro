import React from 'react';
import { Box, Paper, Typography, Chip, Button } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../app/store/hooks';
import { config } from '../../config/environment';
import { reinitializeAuth, logout } from '../../features/auth/model/authSlice';

const DebugAuthStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error } = useAppSelector(
    state => state.auth
  );

  const handleReinitialize = () => {
    dispatch(reinitializeAuth());
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  // Показываем только в режиме разработки
  if (config.isProduction) {
    return null;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        p: 2,
        minWidth: 300,
        maxWidth: 400,
        zIndex: 9999,
        opacity: 0.9,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        🔍 Отладка авторизации
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Режим данных:
        </Typography>
        <Chip
          size="small"
          label={config.useMocks ? 'Тестовые' : 'Реальный API'}
          color={config.useMocks ? 'info' : 'primary'}
          sx={{ ml: 1 }}
        />
      </Box>

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Состояние:
        </Typography>
        <Chip
          size="small"
          label={
            isLoading
              ? 'Загрузка...'
              : isAuthenticated
              ? 'Авторизован'
              : 'Не авторизован'
          }
          color={isLoading ? 'default' : isAuthenticated ? 'success' : 'error'}
          sx={{ ml: 1 }}
        />
      </Box>

      {user && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" color="textSecondary">
            Пользователь: {user.name} ({user.email})
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{ mb: 1 }}>
          <Typography
            variant="caption"
            color="error"
            sx={{ fontSize: '0.7rem' }}
          >
            Ошибка: {error}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Button size="small" variant="outlined" onClick={handleReinitialize}>
          Переинициализировать
        </Button>
        {isAuthenticated && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Выйти
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default DebugAuthStatus;

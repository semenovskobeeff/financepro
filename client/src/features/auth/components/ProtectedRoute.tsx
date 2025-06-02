import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  CircularProgress,
  Alert,
  Typography,
  Button,
} from '@mui/material';
import { RootState } from 'app/store';
import { config } from '../../../config/environment';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Компонент для защиты маршрутов от неавторизованных пользователей
 * При необходимости проверяет роли пользователя
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
}) => {
  const { isAuthenticated, user, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  // Пока проверяем авторизацию, показываем индикатор загрузки
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Если пользователь не авторизован
  if (!isAuthenticated) {
    console.warn('[ProtectedRoute] Пользователь не авторизован:', {
      currentPath: location.pathname,
      hasError: !!error,
      useMocks: config.useMocks,
    });

    // Перенаправляем на страницу авторизации
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Проверяем роли, если они указаны
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role =>
      user.roles.includes(role)
    );

    if (!hasRequiredRole) {
      console.warn('[ProtectedRoute] Недостаточно прав:', {
        userRoles: user.roles,
        requiredRoles,
        currentPath: location.pathname,
      });

      // При недостатке прав показываем ошибку, а не перенаправляем
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: 3,
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              Недостаточно прав
            </Typography>
            <Typography variant="body2">
              У вас нет прав для доступа к этой странице.
            </Typography>
          </Alert>
        </Box>
      );
    }
  }

  // Если все проверки пройдены, показываем дочерние компоненты
  return <>{children}</>;
};

export default ProtectedRoute;

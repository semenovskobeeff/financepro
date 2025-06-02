import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../config/environment';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // В режиме тестовых данных пропускаем проверку
    if (config.useMocks) {
      return;
    }

    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    // Проверяем авторизацию только для защищенных страниц
    const isAuthPage =
      ['/login', '/register', '/forgot-password'].includes(currentPath) ||
      currentPath.startsWith('/reset-password');

    if (!token && !isAuthPage) {
      console.log('[AUTH] Нет токена, перенаправление на /login');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return <>{children}</>;
};

export default AuthGuard;

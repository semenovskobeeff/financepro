import React, { useState, useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { CssBaseline, Box, Snackbar } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import { ThemeProvider } from './shared/config/ThemeContext';
import { useAppDispatch, useAppSelector } from './app/store/hooks';
import { useAppLoading } from './shared/hooks/useAppLoading';
import Preloader from './shared/ui/Preloader';
import './App.css';

// Компоненты
import AppHeader from './shared/ui/AppHeader';
import Navbar from './shared/ui/Navbar';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ToastNotification from './shared/ui/ToastNotification';
import ErrorAlert from './shared/ui/ErrorAlert';
import DebugAuthStatus from './shared/ui/DebugAuthStatus';
import MockDataIndicator from './shared/ui/MockDataIndicator';
import TestDataInfo from './shared/ui/TestDataInfo';
import { PaymentModalProvider } from './shared/contexts/PaymentModalContext';
import PaymentModalManager from './shared/components/PaymentModalManager';
import { ModalProvider } from './shared/contexts/ModalContext';

// Страницы
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import AccountDetails from './pages/AccountDetails';
import Transactions from './pages/Transactions';
import Categories from './pages/Categories';
import Goals from './pages/Goals';
import GoalDetails from './pages/GoalDetails';
import Debts from './pages/Debts';
import DebtDetails from './pages/DebtDetails';
import Subscriptions from './pages/Subscriptions';
import SubscriptionDetails from './pages/SubscriptionDetails';
import ShoppingLists from './pages/ShoppingLists';
import Analytics from './pages/Analytics';
import Archive from './pages/Archive';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import PastelColorDemo from './pages/PastelColorDemo';
import Settings from './pages/Settings';

// Стили и утилиты
import { useTheme } from './shared/config/ThemeContext';
import { applyNotionChartDefaults } from './shared/utils/chartUtils';
import { config } from './config/environment';

// Модули для работы с API и данными
import ApiModeToggle from './shared/ui/ApiModeToggle';

// Утилиты для диагностики
import './utils/fixAnalyticsData';

// Константы
const drawerWidth = 240;

// Глобальный обработчик ошибок API
const GlobalErrorHandler: React.FC = () => {
  const dispatch = useAppDispatch();
  const [apiError, setApiError] = useState<{
    message: string;
    originalError?: any;
  } | null>(null);

  useEffect(() => {
    // Слушаем глобальные ошибки сети
    const handleGlobalError = (event: any) => {
      // Проверяем, это ли ошибка связанная с API
      if (event.reason && typeof event.reason === 'object') {
        const error = event.reason;
        if (error.status === 'FETCH_ERROR' && !config.useMocks) {
          setApiError({
            message:
              'Потеряно соединение с сервером. Проверьте подключение или переключитесь на тестовые данные.',
            originalError: error,
          });
        }
      }
    };

    // Слушаем необработанные отклонения промисов
    window.addEventListener('unhandledrejection', handleGlobalError);

    // Слушаем изменения в localStorage для useMocks
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'useMocks') {
        setApiError(null); // Очищаем ошибки при смене режима
        console.log(
          '[GlobalErrorHandler] Режим данных изменен, очищаем ошибки'
        );
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('unhandledrejection', handleGlobalError);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleCloseError = () => {
    setApiError(null);
  };

  const handleSwitchToMocks = () => {
    setApiError(null);
    // Переинициализируем авторизацию при переключении
    dispatch({ type: 'auth/reinitializeAuth' });
    console.log('[GlobalErrorHandler] Переключились на тестовые данные');
  };

  if (!apiError) return null;

  return (
    <Snackbar
      open={Boolean(apiError)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ mt: 8, maxWidth: '500px' }}
      autoHideDuration={10000}
      onClose={handleCloseError}
    >
      <ErrorAlert
        error={apiError.message}
        originalError={apiError.originalError}
        showTitle={true}
        showDetails={true}
        showMockSwitch={true}
        onSwitchToMocks={handleSwitchToMocks}
        sx={{ width: '100%' }}
      />
    </Snackbar>
  );
};

// Компонент для условного рендеринга макета
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname.startsWith('/reset-password'); // Учитываем токен в URL

  if (isAuthPage) {
    // Для страниц авторизации - только содержимое без левого блока и шапки
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </Box>
    );
  }

  // Для остальных страниц - полный макет
  return (
    <div className="app-container">
      <Navbar />
      <div className="content-wrapper">
        <AppHeader />
        <main className="main-content">{children}</main>
      </div>
      <GlobalErrorHandler />
    </div>
  );
};

// Компонент для защиты маршрутов, доступных только в режиме разработки
const DevOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (import.meta.env.MODE !== 'development') {
    return null; // В production режиме возвращаем null (маршрут недоступен)
  }
  return <>{children}</>;
};

function App() {
  // Инициализируем тему
  const { themeMode } = useTheme();

  // Состояние загрузки приложения
  const { isLoading, loadingMessage } = useAppLoading({ minLoadingTime: 800 });

  // Генерация темы Material UI с правильными цветами
  const theme = createTheme({
    palette: {
      mode: themeMode,
      error: {
        main: themeMode === 'dark' ? '#ff7979' : '#ff6b6b',
        light: themeMode === 'dark' ? '#fd9a9a' : '#ff8787',
        dark: themeMode === 'dark' ? '#e85a5a' : '#f03e3e',
      },
    },
  });

  // Применяем тему к body атрибуту
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  // Применяем настройки графиков
  useEffect(() => {
    applyNotionChartDefaults();
  }, []);

  // Показываем прелоадер во время загрузки
  if (isLoading) {
    return (
      <ThemeProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Preloader message={loadingMessage} />
        </MuiThemeProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ModalProvider>
            <PaymentModalProvider>
              <AppLayout>
                <Routes>
                  {/* Публичные маршруты */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />

                  {/* Защищенные маршруты */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/accounts"
                    element={
                      <ProtectedRoute>
                        <Accounts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/accounts/:id"
                    element={
                      <ProtectedRoute>
                        <AccountDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories"
                    element={
                      <ProtectedRoute>
                        <Categories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/goals"
                    element={
                      <ProtectedRoute>
                        <Goals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/goals/:id"
                    element={
                      <ProtectedRoute>
                        <GoalDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/debts"
                    element={
                      <ProtectedRoute>
                        <Debts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/debts/:id"
                    element={
                      <ProtectedRoute>
                        <DebtDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subscriptions"
                    element={
                      <ProtectedRoute>
                        <Subscriptions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subscriptions/:id"
                    element={
                      <ProtectedRoute>
                        <SubscriptionDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/shopping-lists"
                    element={
                      <ProtectedRoute>
                        <ShoppingLists />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/archive"
                    element={
                      <ProtectedRoute>
                        <Archive />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <DevOnlyRoute>
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      </DevOnlyRoute>
                    }
                  />
                  <Route path="/pastel-colors" element={<PastelColorDemo />} />
                </Routes>
              </AppLayout>

              {/* Уведомления о платежах */}
              <ToastNotification />

              {/* Менеджер модального окна платежей */}
              <PaymentModalManager />

              {/* Переключатель режима API */}
              <ApiModeToggle />

              {/* Индикатор типа моковых данных */}
              <MockDataIndicator />

              {/* Компонент отладки авторизации */}
              <DebugAuthStatus />

              {/* Информация о тестовых данных */}
              <TestDataInfo />
            </PaymentModalProvider>
          </ModalProvider>
        </Router>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState, useEffect, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from '@mui/material/styles';
import { ThemeProvider } from './shared/config/ThemeContext';
import { useAppDispatch, useAppSelector } from './app/store/hooks';
import './App.css';

// Компоненты
import AppHeader from './shared/ui/AppHeader';
import Navbar from './shared/ui/Navbar';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ToastNotification from './shared/ui/ToastNotification';

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

// Модули для работы с API и данными
import PaymentForm from './features/subscriptions/components/PaymentForm';
import { Subscription } from './entities/subscription/model/types';
import {
  useGetSubscriptionByIdQuery,
  useMakePaymentMutation,
} from './entities/subscription/api/subscriptionApi';

// Константы
const drawerWidth = 240;

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
    </div>
  );
};

function App() {
  // Инициализируем тему
  const { themeMode } = useTheme();

  // Состояние для формы платежа
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  // Получаем данные подписки, если указан ID
  const { data: subscription } = useGetSubscriptionByIdQuery(
    subscriptionId || '',
    { skip: !subscriptionId }
  );

  // Мутация для выполнения платежа
  const [makePayment] = useMakePaymentMutation();

  // Генерация темы Material UI
  const theme = createTheme({
    palette: {
      mode: themeMode,
      // другие настройки палитры...
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

  // Обработчики для окна платежа по подписке
  const handlePaymentClick = (id: string) => {
    setSubscriptionId(id);
  };

  const handleClosePaymentForm = () => {
    setSubscriptionId(null);
  };

  const handleSubmitPayment = async (paymentData: any) => {
    if (!subscriptionId) return;

    try {
      const response = await makePayment({
        id: subscriptionId,
        data: paymentData,
      }).unwrap();

      handleClosePaymentForm();
      return response;
    } catch (error) {
      console.error('Payment error:', error);
      return null;
    }
  };

  return (
    <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Router
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AppLayout>
            <Routes>
              {/* Публичные маршруты */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

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
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="/pastel-colors" element={<PastelColorDemo />} />
            </Routes>
          </AppLayout>

          {/* Уведомления о платежах */}
          <ToastNotification onPaymentClick={handlePaymentClick} />

          {/* Модальное окно для оплаты подписки */}
          {subscription && (
            <PaymentForm
              subscription={subscription}
              open={Boolean(subscription)}
              onClose={handleClosePaymentForm}
              onSubmit={handleSubmitPayment}
            />
          )}
        </Router>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;

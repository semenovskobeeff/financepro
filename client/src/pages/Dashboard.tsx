import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
import {
  ArrowUpward as IncomeIcon,
  ArrowDownward as ExpenseIcon,
  AccountBalance as AccountIcon,
  CreditCard as DebtIcon,
  Subscriptions as SubscriptionIcon,
  Flag as GoalIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Savings,
  Notifications,
} from '@mui/icons-material';
import { useGetDashboardAnalyticsQuery } from 'entities/analytics/api/analyticsApi';
import { useGetUpcomingPaymentsQuery } from 'entities/subscription/api/subscriptionApi';
import { useGetUpcomingPaymentsQuery as useGetUpcomingDebtPaymentsQuery } from 'entities/debt/api/debtApi';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'shared/ui/PageContainer';
import { formatNumber } from '../shared/utils/formatUtils';
import {
  getChartColors,
  getNotionChartOptions,
} from '../shared/utils/chartUtils';
import { useTheme } from '../shared/config/ThemeContext';
import { NotionCard } from '../shared/ui/NotionCard';
import { NotionTag } from '../shared/ui/NotionTag';
import AddFormModal from '../shared/ui/AddFormModal';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';

  // Состояние для модальных окон быстрых действий
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formType, setFormType] = useState<string | null>(null);

  // Получаем сводную аналитику для дашборда
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetDashboardAnalyticsQuery();

  // Получаем предстоящие платежи по подпискам
  const {
    data: upcomingPayments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useGetUpcomingPaymentsQuery(7); // Платежи на ближайшие 7 дней

  // Получаем предстоящие платежи по долгам
  const {
    data: upcomingDebtPayments,
    isLoading: debtPaymentsLoading,
    error: debtPaymentsError,
  } = useGetUpcomingDebtPaymentsQuery(7); // Платежи по долгам на ближайшие 7 дней

  // Отладочная информация
  useEffect(() => {
    console.log('=== Dashboard Debug Info ===');
    console.log('Current URL:', window.location.href);
    console.log('Analytics loading:', analyticsLoading);
    console.log('Analytics error:', analyticsError);
    console.log('Analytics data:', analytics);
    console.log('Payments loading:', paymentsLoading);
    console.log('Payments error:', paymentsError);
    console.log('Upcoming payments:', upcomingPayments);
    console.log('Debt payments loading:', debtPaymentsLoading);
    console.log('Debt payments error:', debtPaymentsError);
    console.log('Upcoming debt payments:', upcomingDebtPayments);
    console.log(
      'MSW worker status:',
      navigator.serviceWorker?.controller ? 'активен' : 'не активен'
    );
    console.log('=== End Debug Info ===');
  }, [
    analytics,
    analyticsLoading,
    analyticsError,
    upcomingPayments,
    paymentsLoading,
    paymentsError,
    upcomingDebtPayments,
    debtPaymentsLoading,
    debtPaymentsError,
  ]);

  // Данные для графика доходов и расходов
  const getFinancialData = () => {
    if (!analytics) return null;

    return {
      totalBalance: analytics.accounts?.totalBalance || 0,
      monthlyIncome: analytics.monthStats?.income || 0,
      monthlyExpense: analytics.monthStats?.expense || 0,
      monthlyBalance: analytics.monthStats?.balance || 0,
      accountsCount: analytics.accounts?.count || 0,
      subscriptionsCount: analytics.subscriptions?.count || 0,
      subscriptionsAmount: analytics.subscriptions?.monthlyAmount || 0,
      debtsCount: analytics.debts?.count || 0,
      debtsAmount: analytics.debts?.totalAmount || 0,
      goalsCount: analytics.goals?.count || 0,
      goalsProgress: analytics.goals?.totalProgress || 0,
      goalsTarget: analytics.goals?.totalTarget || 0,
    };
  };

  // Данные для графика распределения средств по счетам
  const getDistributionData = () => {
    const data = getFinancialData();
    if (!data) return null;

    return {
      labels: ['Доходы', 'Расходы', 'Сбережения'],
      datasets: [
        {
          data: [
            data.monthlyIncome,
            Math.abs(data.monthlyExpense),
            Math.max(0, data.monthlyBalance),
          ],
          backgroundColor: getChartColors(isDarkMode).slice(0, 3),
          borderWidth: 0,
        },
      ],
    };
  };

  const getAccountsData = () => {
    const data = getFinancialData();
    if (!data) return null;

    return {
      labels: ['Счета', 'Подписки', 'Долги', 'Цели'],
      datasets: [
        {
          label: 'Количество',
          data: [
            data.accountsCount,
            data.subscriptionsCount,
            data.debtsCount,
            data.goalsCount,
          ],
          backgroundColor: getChartColors(isDarkMode).slice(0, 4),
          borderWidth: 0,
        },
      ],
    };
  };

  if (analyticsError && paymentsError && debtPaymentsError) {
    return (
      <PageContainer title="Финансовый обзор">
        <Paper sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={refetchAnalytics}>
                Повторить
              </Button>
            }
          >
            Ошибка загрузки данных дашборда. Проверьте подключение к серверу.
          </Alert>
        </Paper>
      </PageContainer>
    );
  }

  if (analyticsLoading || paymentsLoading || debtPaymentsLoading) {
    return (
      <PageContainer title="Финансовый обзор">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  const financialData = getFinancialData();
  const distributionData = getDistributionData();
  const accountsData = getAccountsData();

  // Форматирование суммы в рубли
  const formatCurrency = (amount: number) => `${formatNumber(amount)} ₽`;

  // Обработчики для быстрых действий
  const handleQuickAction = (actionType: string) => {
    setFormType(actionType);
    setFormModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setFormType(null);
  };

  return (
    <PageContainer title="Финансовый обзор">
      {/* Предупреждения о частичных ошибках */}
      {(analyticsError || paymentsError || debtPaymentsError) && (
        <Box sx={{ mb: 3 }}>
          {analyticsError && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Не удалось загрузить основную аналитику:{' '}
              {analyticsError.toString()}
            </Alert>
          )}
          {paymentsError && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Не удалось загрузить данные о подписках:{' '}
              {paymentsError.toString()}
            </Alert>
          )}
          {debtPaymentsError && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Не удалось загрузить данные о долгах:{' '}
              {debtPaymentsError.toString()}
            </Alert>
          )}
        </Box>
      )}

      {/* Быстрые действия */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <NotionCard title="Быстрые действия" icon={<DebtIcon />} color="gray">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleQuickAction('income')}
              >
                Добавить доход
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleQuickAction('expense')}
              >
                Добавить расход
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => handleQuickAction('transfer')}
              >
                Добавить перевод
              </Button>
            </Box>
          </NotionCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <NotionCard title="Общий баланс" icon={<AccountIcon />} color="blue">
            <Typography variant="h5" color="primary">
              {formatCurrency(financialData?.totalBalance || 0)}
            </Typography>
          </NotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <NotionCard
            title="Доходы за месяц"
            icon={<TrendingUp />}
            color="green"
          >
            <Typography variant="h5" color="success.main">
              +{formatCurrency(financialData?.monthlyIncome || 0)}
            </Typography>
          </NotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <NotionCard
            title="Расходы за месяц"
            icon={<TrendingDown />}
            color="red"
          >
            <Typography variant="h5" color="error.main">
              -{formatCurrency(Math.abs(financialData?.monthlyExpense || 0))}
            </Typography>
          </NotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <NotionCard
            title="Баланс месяца"
            icon={<Savings />}
            color={(financialData?.monthlyBalance || 0) >= 0 ? 'green' : 'red'}
          >
            <Typography
              variant="h5"
              color={
                (financialData?.monthlyBalance || 0) >= 0
                  ? 'success.main'
                  : 'error.main'
              }
            >
              {(financialData?.monthlyBalance || 0) >= 0 ? '+' : ''}
              {formatCurrency(financialData?.monthlyBalance || 0)}
            </Typography>
          </NotionCard>
        </Grid>
      </Grid>

      {/* Графики */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <NotionCard title="Распределение финансов" color="purple">
            {distributionData ? (
              <Box
                sx={{ height: 300, display: 'flex', justifyContent: 'center' }}
              >
                <Pie
                  data={distributionData}
                  options={getNotionChartOptions(isDarkMode, {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  })}
                />
              </Box>
            ) : (
              <Typography color="text.secondary">
                Нет данных для отображения
              </Typography>
            )}
          </NotionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <NotionCard title="Обзор счетов" color="blue">
            {accountsData ? (
              <Box sx={{ height: 300 }}>
                <Bar
                  data={accountsData}
                  options={getNotionChartOptions(isDarkMode, {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                        },
                      },
                    },
                  })}
                />
              </Box>
            ) : (
              <Typography color="text.secondary">
                Нет данных для отображения
              </Typography>
            )}
          </NotionCard>
        </Grid>
      </Grid>

      {/* Предстоящие платежи */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <NotionCard
            title="Подписки"
            icon={<SubscriptionIcon />}
            color="blue"
            badge={upcomingPayments?.length?.toString() || '0'}
          >
            {upcomingPayments && upcomingPayments.length > 0 ? (
              <Box>
                {upcomingPayments.slice(0, 5).map(payment => (
                  <Box
                    key={payment.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(payment.nextPaymentDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <NotionTag
                      label={formatCurrency(payment.amount)}
                      color="blue"
                    />
                  </Box>
                ))}
                {upcomingPayments.length > 5 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    И еще {upcomingPayments.length - 5} подписок...
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Нет предстоящих платежей по подпискам
              </Typography>
            )}
          </NotionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <NotionCard
            title="Долги и кредиты"
            icon={<DebtIcon />}
            color="red"
            badge={upcomingDebtPayments?.length?.toString() || '0'}
          >
            {upcomingDebtPayments && upcomingDebtPayments.length > 0 ? (
              <Box>
                {upcomingDebtPayments.slice(0, 5).map(payment => (
                  <Box
                    key={payment.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.nextPaymentDate
                          ? new Date(
                              payment.nextPaymentDate
                            ).toLocaleDateString()
                          : 'Дата не указана'}
                      </Typography>
                    </Box>
                    <NotionTag
                      label={formatCurrency(
                        payment.nextPaymentAmount || payment.currentAmount
                      )}
                      color="red"
                    />
                  </Box>
                ))}
                {upcomingDebtPayments.length > 5 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    И еще {upcomingDebtPayments.length - 5} долгов...
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Нет предстоящих платежей по долгам
              </Typography>
            )}
          </NotionCard>
        </Grid>
      </Grid>

      {/* Модальное окно для быстрых действий */}
      <AddFormModal
        type={formType}
        open={formModalOpen}
        onClose={handleCloseForm}
      />
    </PageContainer>
  );
};

export default Dashboard;

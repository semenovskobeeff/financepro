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
  Tab,
  Tabs,
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
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
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
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import {
  useGetDashboardAnalyticsQuery,
  useGetTransactionsAnalyticsQuery,
} from 'entities/analytics/api/analyticsApi';
import { useGetUpcomingPaymentsQuery as useGetUpcomingSubscriptionPaymentsQuery } from 'entities/subscription/api/subscriptionApi';
import { useGetUpcomingPaymentsQuery as useGetUpcomingDebtPaymentsQuery } from 'entities/debt/api/debtApi';
import { useGetGoalsQuery } from 'entities/goal/api/goalApi';
import { useNavigate } from 'react-router-dom';
import PageContainer from 'shared/ui/PageContainer';
import { formatNumber } from '../shared/utils/formatUtils';
import {
  getChartColors,
  getNotionChartOptions,
} from '../shared/utils/chartUtils';
import { useTheme } from '../shared/config/ThemeContext';
import { isAuthError } from '../shared/utils/authUtils';
import { NotionCard } from '../shared/ui/NotionCard';
import { NotionTag } from '../shared/ui/NotionTag';
import AddFormModal from '../shared/ui/AddFormModal';

// Новые компоненты графиков
import {
  FinancialTrendChart,
  BudgetAnalysisChart,
  ExpenseStructureWidget,
  GoalsProgressWidget,
  FinancialSummaryWidget,
  SmartNotificationsWidget,
} from '../shared/ui/DashboardCharts';

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
  const [selectedTab, setSelectedTab] = useState(0);

  // Получаем сводную аналитику для дашборда
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetDashboardAnalyticsQuery();

  // Получаем детальную аналитику транзакций за последние 6 месяцев
  const {
    data: transactionsAnalytics,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useGetTransactionsAnalyticsQuery({
    period: 'month',
    startDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Получаем предстоящие платежи по подпискам
  const {
    data: upcomingPayments,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useGetUpcomingSubscriptionPaymentsQuery(7);

  // Получаем предстоящие платежи по долгам
  const {
    data: upcomingDebtPayments,
    isLoading: debtPaymentsLoading,
    error: debtPaymentsError,
  } = useGetUpcomingDebtPaymentsQuery({ days: 7 });

  // Получаем цели
  const {
    data: goalsData,
    isLoading: goalsLoading,
    error: goalsError,
  } = useGetGoalsQuery({ status: 'active' });

  // Проверяем ошибки авторизации
  const hasAuthErrors =
    isAuthError(analyticsError) ||
    isAuthError(transactionsError) ||
    isAuthError(paymentsError) ||
    isAuthError(debtPaymentsError) ||
    isAuthError(goalsError);

  // Проверяем общее состояние загрузки
  const isLoading =
    analyticsLoading ||
    transactionsLoading ||
    paymentsLoading ||
    debtPaymentsLoading ||
    goalsLoading;

  // Отладочная информация (только при загрузке)
  useEffect(() => {
    if (hasAuthErrors) {
      console.warn(
        '[Dashboard] Ошибки авторизации - перенаправление на страницу входа'
      );
      navigate('/login');
      return;
    }

    if (analytics && transactionsAnalytics && goalsData) {
      console.log('[Dashboard] Данные загружены:', {
        hasAnalytics: !!analytics,
        hasTransactionsAnalytics: !!transactionsAnalytics,
        hasGoalsData: !!goalsData,
        goalsCount: goalsData?.length || 0,
      });
    }
  }, [
    hasAuthErrors,
    !!analytics,
    !!transactionsAnalytics,
    !!goalsData,
    navigate,
  ]);

  // Подготовка данных для графика трендов
  const getFinancialTrendData = () => {
    if (!transactionsAnalytics) return null;

    const last6Months: Array<{ label: string; key: string }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`;

      last6Months.push({
        label: date.toLocaleDateString('ru', {
          month: 'short',
          year: '2-digit',
        }),
        key: monthKey,
      });
    }

    // Заглушка данных для демонстрации
    return {
      labels: last6Months.map(m => m.label),
      income: [65000, 70000, 68000, 72000, 75000, 73000],
      expense: [-45000, -52000, -48000, -55000, -58000, -54000],
      balance: [20000, 18000, 20000, 17000, 17000, 19000],
    };
  };

  // Подготовка данных для анализа бюджета
  const getBudgetAnalysisData = () => {
    if (!analytics) return null;

    return {
      income: analytics.monthStats?.income || 0,
      expense: Math.abs(analytics.monthStats?.expense || 0),
      balance: analytics.monthStats?.balance || 0,
      categories: [
        { name: 'Продукты', spent: 15000, budget: 12000, percentage: 25 },
        { name: 'Транспорт', spent: 8000, budget: 10000, percentage: 13 },
        { name: 'Развлечения', spent: 12000, budget: 8000, percentage: 20 },
        { name: 'Коммунальные', spent: 6000, budget: 6500, percentage: 10 },
        { name: 'Здоровье', spent: 4000, budget: 5000, percentage: 7 },
      ],
      lastMonthBalance: 18000,
      averageExpenseLastThreeMonths: 52000,
    };
  };

  // Подготовка данных для структуры расходов
  const getExpenseStructureData = () => {
    if (!transactionsAnalytics) return null;

    return {
      totalExpense: Math.abs(analytics?.monthStats?.expense || 0),
      period: 'текущий месяц',
      categories: [
        {
          id: '1',
          name: 'Продукты',
          amount: 15000,
          percentage: 27.8,
          color: '#3b82f6',
          trend: 5.2,
        },
        {
          id: '2',
          name: 'Транспорт',
          amount: 8000,
          percentage: 14.8,
          color: '#ef4444',
          trend: -2.1,
        },
        {
          id: '3',
          name: 'Развлечения',
          amount: 12000,
          percentage: 22.2,
          color: '#22c55e',
          trend: 15.3,
        },
        {
          id: '4',
          name: 'Коммунальные',
          amount: 6000,
          percentage: 11.1,
          color: '#f59e0b',
          trend: 0.5,
        },
        {
          id: '5',
          name: 'Здоровье',
          amount: 4000,
          percentage: 7.4,
          color: '#8b5cf6',
          trend: -8.7,
        },
        {
          id: '6',
          name: 'Одежда',
          amount: 5000,
          percentage: 9.3,
          color: '#06b6d4',
          trend: 12.4,
        },
        {
          id: '7',
          name: 'Прочее',
          amount: 4000,
          percentage: 7.4,
          color: '#84cc16',
          trend: 3.1,
        },
      ],
    };
  };

  // Подготовка данных для прогресса целей
  const getGoalsProgressData = () => {
    if (!goalsData) return null;

    const goals = goalsData.map((goal: any) => ({
      id: goal.id,
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.progress,
      deadline: goal.deadline,
      progress: (goal.progress / goal.targetAmount) * 100,
      status: goal.status,
      monthlyTarget: Math.round(goal.targetAmount / 12),
    }));

    return {
      goals,
      totalProgress: goals.reduce(
        (sum: number, goal: any) => sum + goal.progress,
        0
      ),
      completedGoals: goals.filter((goal: any) => goal.status === 'completed')
        .length,
      totalGoals: goals.length,
      totalTargetAmount: goals.reduce(
        (sum: number, goal: any) => sum + goal.targetAmount,
        0
      ),
      totalCurrentAmount: goals.reduce(
        (sum: number, goal: any) => sum + goal.currentAmount,
        0
      ),
    };
  };

  // Данные для графика доходов и расходов (старый формат)
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

  // Данные для графика распределения средств по счетам (старый формат)
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

  // Подготовка данных для финансовой сводки
  const getFinancialSummaryData = () => {
    if (!analytics) return null;

    return {
      period: 'текущий месяц',
      healthScore: {
        current: 78,
        target: 85,
        status: 'good' as const,
      },
      metrics: [
        {
          label: 'Чистый доход',
          value: analytics.monthStats?.balance || 0,
          previousValue: 15000,
          format: 'currency' as const,
          color: 'success' as const,
          icon: <TrendingUp />,
        },
        {
          label: 'Норма сбережений',
          value: analytics.monthStats?.income
            ? ((analytics.monthStats.balance || 0) /
                analytics.monthStats.income) *
              100
            : 0,
          target: 20,
          format: 'percentage' as const,
          color: 'info' as const,
          icon: <Savings />,
        },
        {
          label: 'Выполнено целей',
          value: 2,
          target: 5,
          format: 'number' as const,
          color: 'primary' as const,
          icon: <GoalIcon />,
        },
        {
          label: 'Активных счетов',
          value: analytics.accounts?.count || 0,
          format: 'number' as const,
          color: 'warning' as const,
          icon: <AccountIcon />,
        },
      ],
      insights: [
        {
          type: 'positive' as const,
          message: 'Ваши расходы на 12% ниже прошлого месяца',
        },
        {
          type: 'neutral' as const,
          message: 'Рекомендуем увеличить ежемесячные сбережения до 20%',
        },
        {
          type: 'negative' as const,
          message: 'Превышен бюджет на развлечения на 2,500 ₽',
        },
      ],
    };
  };

  // Подготовка данных для умных уведомлений
  const getSmartNotificationsData = () => {
    const notifications = [
      {
        id: '1',
        type: 'tip' as const,
        priority: 'medium' as const,
        title: 'Оптимизация расходов',
        message:
          'Вы потратили на 15% больше на продукты в этом месяце. Рассмотрите составление списка покупок.',
        action: {
          label: 'Создать план',
          onClick: () => console.log('Create budget plan'),
        },
        dismissible: true,
        category: 'spending' as const,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        amount: 2500,
      },
      {
        id: '2',
        type: 'warning' as const,
        priority: 'high' as const,
        title: 'Приближается платеж',
        message: 'Платеж по кредитной карте через 3 дня (5,200 ₽)',
        action: {
          label: 'Оплатить',
          onClick: () => console.log('Pay debt'),
        },
        dismissible: false,
        category: 'debt' as const,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        amount: 5200,
      },
      {
        id: '3',
        type: 'success' as const,
        priority: 'low' as const,
        title: 'Цель достигнута!',
        message: 'Поздравляем! Вы накопили на отпуск',
        dismissible: true,
        category: 'goal' as const,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        amount: 50000,
      },
    ];

    return {
      notifications,
      totalUnread: 2,
      categories: [
        { name: 'Расходы', count: 1, color: '#ef4444' },
        { name: 'Долги', count: 1, color: '#f59e0b' },
        { name: 'Цели', count: 1, color: '#22c55e' },
      ],
    };
  };

  // Обработчик экспорта данных
  const handleExportData = () => {
    // Подготовка данных для экспорта
    const exportData = {
      date: new Date().toISOString(),
      period: 'month',
      summary: financialData,
      analytics: {
        trends: trendData,
        budget: budgetData,
        expenses: expenseStructureData,
        goals: goalsProgressData,
      },
    };

    // Создание и скачивание файла
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `finance-report-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

  if (
    analyticsLoading ||
    paymentsLoading ||
    debtPaymentsLoading ||
    transactionsLoading ||
    goalsLoading
  ) {
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
  const trendData = getFinancialTrendData();
  const budgetData = getBudgetAnalysisData();
  const expenseStructureData = getExpenseStructureData();
  const goalsProgressData = getGoalsProgressData();
  const financialSummaryData = getFinancialSummaryData();
  const smartNotificationsData = getSmartNotificationsData();

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = () => {
    refetchAnalytics();
  };

  // Показываем индикатор загрузки
  if (isLoading) {
    return (
      <PageContainer title="Финансовый обзор">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </PageContainer>
    );
  }

  // Показываем сообщение если нет данных и нет ошибок авторизации
  if (!analytics && !isLoading && !hasAuthErrors) {
    return (
      <PageContainer title="Финансовый обзор">
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            Добро пожаловать!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            У вас пока нет данных для отображения аналитики. Начните с создания
            счетов и добавления операций.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              onClick={() => navigate('/accounts')}
              startIcon={<AccountIcon />}
            >
              Создать счёт
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/transactions')}
              startIcon={<PaymentIcon />}
            >
              Добавить операцию
            </Button>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Финансовый обзор"
      action={{
        label: 'Экспорт',
        icon: <ExportIcon />,
        onClick: handleExportData,
      }}
    >
      {/* Предупреждения о частичных ошибках */}
      {(analyticsError || paymentsError || debtPaymentsError) && (
        <Box sx={{ mb: 3 }}>
          {analyticsError && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Не удалось загрузить основную аналитику
            </Alert>
          )}
          {paymentsError && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Не удалось загрузить данные о подписках
            </Alert>
          )}
          {debtPaymentsError && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              Не удалось загрузить данные о долгах
            </Alert>
          )}
        </Box>
      )}

      {/* Быстрые действия */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <NotionCard
            title="Быстрые действия"
            icon={<PaymentIcon />}
            color="gray"
          >
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

      {/* Основные метрики */}
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

      {/* Вкладки для разных представлений */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
        >
          <Tab label="Обзор" />
          <Tab label="Аналитика" />
          <Tab label="Планирование" />
        </Tabs>
      </Box>

      {/* Содержимое вкладок */}
      {selectedTab === 0 && (
        <>
          {/* Финансовая сводка - перенесено в начало вкладки "Обзор" */}
          {financialSummaryData && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <FinancialSummaryWidget data={financialSummaryData} />
              </Grid>
            </Grid>
          )}

          {/* Основные графики */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              {trendData && (
                <FinancialTrendChart data={trendData} height={350} />
              )}
            </Grid>

            <Grid item xs={12} lg={4}>
              {smartNotificationsData && (
                <SmartNotificationsWidget
                  data={smartNotificationsData}
                  onDismiss={id => console.log('Dismiss notification:', id)}
                  onAction={(id, action) =>
                    console.log('Notification action:', id, action)
                  }
                />
              )}
            </Grid>
          </Grid>

          {/* Второй ряд графиков */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} lg={8}>
              {budgetData && <BudgetAnalysisChart data={budgetData} />}
            </Grid>

            {/* Блок "Распределение финансов" скрыт */}
            {/*
            <Grid item xs={12} lg={4}>
              <NotionCard title="Распределение финансов" color="purple">
                {distributionData ? (
                  <Box
                    sx={{
                      height: 300,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
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
            */}
          </Grid>

          {/* Предстоящие платежи */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
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
                            {new Date(
                              payment.nextPaymentDate
                            ).toLocaleDateString()}
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
        </>
      )}

      {selectedTab === 1 && (
        <>
          {/* Детальная аналитика */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              {expenseStructureData && (
                <ExpenseStructureWidget data={expenseStructureData} />
              )}
            </Grid>
          </Grid>
        </>
      )}

      {selectedTab === 2 && (
        <>
          {/* Планирование и цели */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              {goalsProgressData && (
                <GoalsProgressWidget data={goalsProgressData} />
              )}
            </Grid>
          </Grid>
        </>
      )}

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

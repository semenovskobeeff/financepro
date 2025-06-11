import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
} from '@mui/material';
import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  Category as CategoryIcon,
  Timeline as TimelineIcon,
  Savings as SavingsIcon,
  CreditCard as CreditCardIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  useGetTransactionsAnalyticsQuery,
  useGetGoalsAnalyticsQuery,
  useGetDebtsAnalyticsQuery,
} from 'entities/analytics/api/analyticsApi';
import PageContainer from 'shared/ui/PageContainer';
import ExpenseStructureChart from 'shared/ui/ExpenseStructureChart';
import ExpenseInsights from 'shared/ui/ExpenseInsights';
import IncomeStructureChart from 'shared/ui/IncomeStructureChart';
import IncomeInsights from 'shared/ui/IncomeInsights';
import DetailedIncomeAnalysis from 'shared/ui/DetailedIncomeAnalysis';
import DetailedExpenseAnalysis from 'shared/ui/DetailedExpenseAnalysis';

const COLORS = [
  '#BAE1FF', // голубой (ледяной акцент)
  '#BAFFC9', // мятный (успешные статусы)
  '#D0B0FF', // лавандовый (креативные блоки)
  '#FFB3BA', // нежно-розовый (клубничный йогурт)
  '#FFDFBA', // песочный (нейтральные элементы)
  '#FFF5BA', // лимонный крем (предупреждения)
];

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [period, setPeriod] = useState<string>('month');

  // Состояния для модальных окон детального анализа
  const [showDetailedIncome, setShowDetailedIncome] = useState(false);
  const [showDetailedExpense, setShowDetailedExpense] = useState(false);

  // Запросы с использованием RTK Query
  const {
    data: transactionsData,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetTransactionsAnalyticsQuery({ period });

  // Данные предыдущего периода для сравнения (можно добавить отдельный запрос)
  const { data: previousPeriodData } = useGetTransactionsAnalyticsQuery({
    period: 'month', // временно используем тот же период
    // В будущем можно добавить логику для предыдущего периода
  });

  const {
    data: goalsData,
    isLoading: isGoalsLoading,
    refetch: refetchGoals,
  } = useGetGoalsAnalyticsQuery();

  const {
    data: debtsData,
    isLoading: isDebtsLoading,
    refetch: refetchDebts,
  } = useGetDebtsAnalyticsQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPeriod(event.target.value as string);
  };

  const handleRefresh = () => {
    if (activeTab === 0) refetchTransactions();
    else if (activeTab === 1) refetchGoals();
    else if (activeTab === 2) refetchDebts();
  };

  // Получение строкового представления периода
  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'неделю';
      case 'month':
        return 'месяц';
      case 'quarter':
        return 'квартал';
      case 'year':
        return 'год';
      default:
        return 'период';
    }
  };

  // Обработчики для модальных окон
  const handleOpenDetailedIncome = () => setShowDetailedIncome(true);
  const handleCloseDetailedIncome = () => setShowDetailedIncome(false);
  const handleOpenDetailedExpense = () => setShowDetailedExpense(true);
  const handleCloseDetailedExpense = () => setShowDetailedExpense(false);

  // Рендер аналитики транзакций
  const renderTransactionsAnalytics = () => {
    if (isTransactionsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!transactionsData) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Нет данных для отображения. Добавьте транзакции для получения
          аналитики.
        </Alert>
      );
    }

    return (
      <Box>
        {/* Сводная информация */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Доходы
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {transactionsData.summary.income.toFixed(0)} ₽
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Расходы
              </Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">
                {Math.abs(transactionsData.summary.expense).toFixed(0)} ₽
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Баланс
              </Typography>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={
                  transactionsData.summary.income -
                    transactionsData.summary.expense >=
                  0
                    ? 'success.main'
                    : 'error.main'
                }
              >
                {(
                  transactionsData.summary.income -
                  transactionsData.summary.expense
                ).toFixed(0)}{' '}
                ₽
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Всего на счетах
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {transactionsData.summary.balance.toFixed(0)} ₽
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Компактные диаграммы с кнопками детального анализа */}
        <Box sx={{ mb: 4 }}>
          {/* Структура доходов */}
          <Box sx={{ mb: 4 }}>
            <IncomeStructureChart
              data={transactionsData.categoryStats.income}
              title="Структура доходов"
              period={getPeriodLabel(period)}
              showPercentages={true}
              showLegend={false}
              interactive={true}
              minSlicePercentage={1}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={handleOpenDetailedIncome}
                color="success"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 'fit-content',
                  px: 2,
                }}
              >
                Детальный анализ доходов
              </Button>
            </Box>
          </Box>

          {/* Структура расходов */}
          <Box sx={{ mb: 4 }}>
            <ExpenseStructureChart
              data={transactionsData.categoryStats.expense}
              title="Структура расходов"
              period={getPeriodLabel(period)}
              showPercentages={true}
              showLegend={false}
              interactive={true}
              minSlicePercentage={1}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<TrendingDownIcon />}
                onClick={handleOpenDetailedExpense}
                color="error"
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 'fit-content',
                  px: 2,
                }}
              >
                Детальный анализ расходов
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Кнопка экспорта */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            component="a"
            href={`/api/analytics/export?type=transactions&format=csv&period=${period}`}
            target="_blank"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Экспортировать данные
          </Button>
        </Box>

        {/* Модальные окна с детальным анализом */}
        <DetailedIncomeAnalysis
          open={showDetailedIncome}
          onClose={handleCloseDetailedIncome}
          data={transactionsData.categoryStats.income}
          previousPeriodData={previousPeriodData?.categoryStats.income}
          period={getPeriodLabel(period)}
        />

        <DetailedExpenseAnalysis
          open={showDetailedExpense}
          onClose={handleCloseDetailedExpense}
          data={transactionsData.categoryStats.expense}
          previousPeriodData={previousPeriodData?.categoryStats.expense}
          period={getPeriodLabel(period)}
        />
      </Box>
    );
  };

  // Рендер аналитики целей
  const renderGoalsAnalytics = () => {
    if (isGoalsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!goalsData || goalsData.goals.length === 0) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Нет данных для отображения. Добавьте цели для получения аналитики.
        </Alert>
      );
    }

    // Данные для графика прогресса целей
    const goalsProgressData = goalsData.goals.map(goal => ({
      name: goal.name,
      progress: goal.progress,
      target: goal.targetAmount - goal.progress,
    }));

    return (
      <Box>
        {/* Сводная информация */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Активные цели
              </Typography>
              <Typography variant="h4">
                {goalsData.summary.activeCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Завершенные
              </Typography>
              <Typography variant="h4">
                {goalsData.summary.completedCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Прогресс
              </Typography>
              <Typography variant="h4">
                {goalsData.summary.totalProgress.toFixed(2)} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {goalsData.summary.averageCompletion.toFixed(1)}% выполнено
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Целевая сумма
              </Typography>
              <Typography variant="h4">
                {goalsData.summary.totalTargetAmount.toFixed(2)} ₽
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* График прогресса целей */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Прогресс целей
          </Typography>
          <Box sx={{ height: 400, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={goalsProgressData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="progress"
                  name="Накоплено"
                  stackId="a"
                  fill="#8884d8"
                />
                <Bar
                  dataKey="target"
                  name="Осталось"
                  stackId="a"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Список целей с детальной информацией */}
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Активные цели
          </Typography>
          <Grid container spacing={3}>
            {goalsData.goals.map(goal => (
              <Grid item xs={12} sm={6} md={4} key={goal.id}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {goal.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Прогресс:
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {goal.progressPercent.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mb: 2,
                      height: 10,
                      bgcolor: 'grey.300',
                      borderRadius: 5,
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.min(100, goal.progressPercent)}%`,
                        bgcolor: 'primary.main',
                        borderRadius: 5,
                      }}
                    />
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Накоплено:
                      </Typography>
                      <Typography variant="body2">
                        {goal.progress.toFixed(2)} ₽
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Цель:
                      </Typography>
                      <Typography variant="body2">
                        {goal.targetAmount.toFixed(2)} ₽
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  // Рендер аналитики долгов
  const renderDebtsAnalytics = () => {
    if (isDebtsLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!debtsData || !debtsData.typeStats.length) {
      return (
        <Alert severity="info" sx={{ mb: 2 }}>
          Нет данных для отображения. Добавьте долги для получения аналитики.
        </Alert>
      );
    }

    // Данные для графика долгов по типам
    const debtTypeData = debtsData.typeStats.map(item => ({
      name: getDebtTypeName(item.type),
      current: item.totalCurrent,
      paid: item.totalPaid,
    }));

    return (
      <Box>
        {/* Сводная информация */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Активные долги
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {debtsData.summary.activeCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Выплаченные
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {debtsData.summary.paidCount}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Остаток
              </Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">
                {debtsData.summary.totalCurrentAmount.toFixed(2)} ₽
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                height: 120,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                Выплачено
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {debtsData.summary.totalPayments.toFixed(2)} ₽
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* График долгов по типам */}
        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Долги по типам
          </Typography>
          <Box sx={{ height: 400, overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={debtTypeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar
                  dataKey="current"
                  name="Текущая задолженность"
                  fill="#ff7675"
                />
                <Bar dataKey="paid" name="Выплачено" fill="#74b9ff" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* Ближайшие платежи */}
        {debtsData.upcomingPayments.length > 0 && (
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ближайшие платежи
            </Typography>
            <Grid container spacing={3}>
              {debtsData.upcomingPayments.map(payment => (
                <Grid item xs={12} sm={6} md={4} key={payment.id}>
                  <Paper elevation={2} sx={{ p: 2, minHeight: 160 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {payment.name}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Тип: {getDebtTypeName(payment.type)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Дата платежа:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(payment.nextPaymentDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Сумма:
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        {payment.nextPaymentAmount.toFixed(2)} ₽
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-between' }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Осталось дней:
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={
                          payment.daysLeft <= 3 ? 'error.main' : 'text.primary'
                        }
                      >
                        {payment.daysLeft}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Box>
    );
  };

  // Хелпер для получения названия типа долга
  const getDebtTypeName = (type: string): string => {
    switch (type) {
      case 'credit':
        return 'Кредит';
      case 'loan':
        return 'Заём';
      case 'creditCard':
        return 'Кредитная карта';
      case 'personalDebt':
        return 'Личный долг';
      default:
        return type;
    }
  };

  return (
    <PageContainer
      title="Аналитика и отчёты"
      action={{
        label: 'Обновить',
        icon: <RefreshIcon />,
        onClick: handleRefresh,
      }}
    >
      {/* Табы для выбора типа аналитики */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            px: 2,
            py: { xs: 1, sm: 0 },
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 0 },
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              },
            }}
          >
            <Tab
              icon={<TimelineIcon />}
              iconPosition="start"
              label="Транзакции"
            />
            <Tab icon={<SavingsIcon />} iconPosition="start" label="Цели" />
            <Tab icon={<CreditCardIcon />} iconPosition="start" label="Долги" />
          </Tabs>

          {activeTab === 0 && (
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 120,
                ml: { xs: 0, sm: 2 },
                alignSelf: { xs: 'flex-start', sm: 'center' },
              }}
            >
              <InputLabel>Период</InputLabel>
              <Select
                value={period}
                onChange={handlePeriodChange as any}
                label="Период"
              >
                <MenuItem value="week">Неделя</MenuItem>
                <MenuItem value="month">Месяц</MenuItem>
                <MenuItem value="quarter">Квартал</MenuItem>
                <MenuItem value="year">Год</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </Paper>

      {/* Контент аналитики */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        {activeTab === 0 && renderTransactionsAnalytics()}
        {activeTab === 1 && renderGoalsAnalytics()}
        {activeTab === 2 && renderDebtsAnalytics()}
      </Paper>
    </PageContainer>
  );
};

export default Analytics;

import React, { useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  AlertTitle,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useGetAccountHistoryQuery } from '../api/accountApi';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { red, green, blue } from '@mui/material/colors';
import { AccountHistoryItem } from '../model/types';
import {
  format,
  subDays,
  subMonths,
  subQuarters,
  subYears,
  isAfter,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../../../shared/utils/formatUtils';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';

interface AccountStatisticsProps {
  accountId: string;
}

const AccountStatistics: React.FC<AccountStatisticsProps> = ({ accountId }) => {
  const [period, setPeriod] = React.useState('month');
  const {
    data: history,
    isLoading,
    error,
  } = useGetAccountHistoryQuery({ accountId });

  // Отладочное логгирование
  useEffect(() => {
    if (history && history.history) {
      console.log('История получена:', history.history.length, 'операций');
    }
  }, [history]);

  const handlePeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    newPeriod: string | null
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
      console.log('Выбран период:', newPeriod);
    }
  };

  // Фильтруем операции в зависимости от выбранного периода
  const filteredHistory = useMemo(() => {
    if (!history || !history.history || history.history.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate;

    // Определяем начальную дату для фильтрации
    switch (period) {
      case 'week':
        startDate = subDays(now, 7);
        console.log('Фильтр по неделе:', startDate);
        break;
      case 'month':
        startDate = subMonths(now, 1);
        console.log('Фильтр по месяцу:', startDate);
        break;
      case 'quarter':
        startDate = subQuarters(now, 1);
        console.log('Фильтр по кварталу:', startDate);
        break;
      case 'year':
        startDate = subYears(now, 1);
        console.log('Фильтр по году:', startDate);
        break;
      default:
        startDate = subMonths(now, 1);
    }

    // Фильтруем операции по дате
    const filtered = history.history.filter(item => {
      try {
        const itemDate = new Date(item.date);
        return isAfter(itemDate, startDate);
      } catch (e) {
        console.error('Ошибка при обработке даты:', e);
        return false;
      }
    });

    console.log(
      `Отфильтровано ${filtered.length} операций из ${history.history.length} за период ${period}`
    );
    return filtered;
  }, [history, period]);

  // Рассчитываем основную статистику на основе отфильтрованных данных
  const stats = useMemo(() => {
    if (!filteredHistory || filteredHistory.length === 0) {
      return {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        operationsCount: 0,
        largestIncome: null as AccountHistoryItem | null,
        largestExpense: null as AccountHistoryItem | null,
        incomeOperations: 0,
        expenseOperations: 0,
        transferOperations: 0,
      };
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let largestIncome: AccountHistoryItem | null = null;
    let largestExpense: AccountHistoryItem | null = null;
    let incomeOperations = 0;
    let expenseOperations = 0;
    let transferOperations = 0;

    filteredHistory.forEach(item => {
      try {
        if (item.type === 'income') {
          totalIncome += item.amount;
          incomeOperations++;
          if (!largestIncome || item.amount > largestIncome.amount) {
            largestIncome = item;
          }
        } else if (item.type === 'expense') {
          totalExpense += item.amount;
          expenseOperations++;
          if (!largestExpense || item.amount > largestExpense.amount) {
            largestExpense = item;
          }
        } else if (item.type === 'transfer') {
          transferOperations++;
        }
      } catch (e) {
        console.error('Ошибка при обработке операции:', e);
      }
    });

    console.log(`Статистика за ${period}:`, {
      totalIncome,
      totalExpense,
      incomeOps: incomeOperations,
      expenseOps: expenseOperations,
      transferOps: transferOperations,
    });

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      operationsCount: filteredHistory.length,
      largestIncome,
      largestExpense,
      incomeOperations,
      expenseOperations,
      transferOperations,
    };
  }, [filteredHistory, period]);

  // Вычисляем типы операций
  const operationTypes = useMemo(() => {
    const total =
      stats.incomeOperations +
      stats.expenseOperations +
      stats.transferOperations;
    return {
      income: {
        count: stats.incomeOperations,
        percent:
          total > 0 ? Math.round((stats.incomeOperations / total) * 100) : 0,
      },
      expense: {
        count: stats.expenseOperations,
        percent:
          total > 0 ? Math.round((stats.expenseOperations / total) * 100) : 0,
      },
      transfer: {
        count: stats.transferOperations,
        percent:
          total > 0 ? Math.round((stats.transferOperations / total) * 100) : 0,
      },
    };
  }, [stats]);

  // Получаем заголовок для периода
  const getPeriodTitle = () => {
    switch (period) {
      case 'week':
        return 'за неделю';
      case 'month':
        return 'за месяц';
      case 'quarter':
        return 'за квартал';
      case 'year':
        return 'за год';
      default:
        return '';
    }
  };

  // Данные для диаграммы соотношения доходов и расходов
  const chartData = useMemo(() => {
    // Создаем данные для графика
    const incomeAmount = stats.totalIncome;
    const expenseAmount = stats.totalExpense;
    const transferAmount =
      stats.transferOperations > 0
        ? Math.min(incomeAmount, expenseAmount) / 2
        : 0; // Условная сумма для переводов

    return {
      // Данные для столбчатой диаграммы
      barData: {
        series: [
          {
            data: [
              stats.incomeOperations,
              stats.expenseOperations,
              stats.transferOperations,
            ],
            label: 'Количество операций',
            color: '#2196f3',
          },
        ],
        categories: ['Доходы', 'Расходы', 'Переводы'],
      },
      // Данные для круговой диаграммы
      pieData: [
        {
          id: 0,
          value: stats.incomeOperations,
          label: 'Доходы',
          color: green[500],
        },
        {
          id: 1,
          value: stats.expenseOperations,
          label: 'Расходы',
          color: red[500],
        },
        {
          id: 2,
          value: stats.transferOperations,
          label: 'Переводы',
          color: blue[500],
        },
      ].filter(item => item.value > 0),
      // Суммы для отображения в карточках
      amounts: {
        income: incomeAmount,
        expense: expenseAmount,
        transfer: transferAmount,
      },
    };
  }, [stats]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Ошибка при загрузке статистики</AlertTitle>
        Не удалось загрузить данные. Пожалуйста, повторите попытку позже.
      </Alert>
    );
  }

  if (!history || !history.history || history.history.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Нет данных для статистики</AlertTitle>
        Выполните операции по счету, чтобы увидеть статистику
      </Alert>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Статистика по счету</Typography>
          <ToggleButtonGroup
            size="small"
            value={period}
            exclusive
            onChange={handlePeriodChange}
          >
            <ToggleButton value="week">НЕДЕЛЯ</ToggleButton>
            <ToggleButton value="month">МЕСЯЦ</ToggleButton>
            <ToggleButton value="quarter">КВАРТАЛ</ToggleButton>
            <ToggleButton value="year">ГОД</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {/* Основные показатели */}{' '}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {' '}
          <Grid item xs={12} sm={3}>
            {' '}
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: green[50], height: '100%' }}
            >
              {' '}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {' '}
                <TrendingUpIcon sx={{ color: green[500], mr: 1 }} />{' '}
                <Typography variant="subtitle2" color="text.secondary">
                  {' '}
                  Доходы {getPeriodTitle()}{' '}
                </Typography>{' '}
              </Box>{' '}
              <Typography
                variant="h5"
                sx={{ color: green[700], fontWeight: 'bold' }}
              >
                {' '}
                +{formatNumber(stats.totalIncome)}{' '}
              </Typography>{' '}
              <Typography variant="body2" color="text.secondary">
                {' '}
                {stats.incomeOperations} операций{' '}
              </Typography>{' '}
            </Paper>{' '}
          </Grid>{' '}
          <Grid item xs={12} sm={3}>
            {' '}
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: red[50], height: '100%' }}
            >
              {' '}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {' '}
                <TrendingDownIcon sx={{ color: red[500], mr: 1 }} />{' '}
                <Typography variant="subtitle2" color="text.secondary">
                  {' '}
                  Расходы {getPeriodTitle()}{' '}
                </Typography>{' '}
              </Box>{' '}
              <Typography
                variant="h5"
                sx={{ color: red[700], fontWeight: 'bold' }}
              >
                {' '}
                -{formatNumber(stats.totalExpense)}{' '}
              </Typography>{' '}
              <Typography variant="body2" color="text.secondary">
                {' '}
                {stats.expenseOperations} операций{' '}
              </Typography>{' '}
            </Paper>{' '}
          </Grid>{' '}
          <Grid item xs={12} sm={3}>
            {' '}
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: blue[50], height: '100%' }}
            >
              {' '}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {' '}
                <CompareArrowsIcon sx={{ color: blue[500], mr: 1 }} />{' '}
                <Typography variant="subtitle2" color="text.secondary">
                  {' '}
                  Переводы {getPeriodTitle()}{' '}
                </Typography>{' '}
              </Box>{' '}
              <Typography
                variant="h5"
                sx={{ color: blue[700], fontWeight: 'bold' }}
              >
                {' '}
                {chartData.amounts.transfer > 0 ? '+' : ''}{' '}
                {formatNumber(chartData.amounts.transfer)}{' '}
              </Typography>{' '}
              <Typography variant="body2" color="text.secondary">
                {' '}
                {stats.transferOperations} операций{' '}
              </Typography>{' '}
            </Paper>{' '}
          </Grid>{' '}
          <Grid item xs={12} sm={3}>
            {' '}
            <Paper
              elevation={0}
              sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}
            >
              {' '}
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {' '}
                Баланс операций {getPeriodTitle()}{' '}
              </Typography>{' '}
              <Typography
                variant="h5"
                sx={{
                  color: stats.balance >= 0 ? green[700] : red[700],
                  fontWeight: 'bold',
                }}
              >
                {' '}
                {stats.balance >= 0 ? '+' : ''} {formatNumber(stats.balance)}{' '}
              </Typography>{' '}
              <Typography variant="body2" color="text.secondary">
                {' '}
                Всего {stats.operationsCount} операций{' '}
              </Typography>{' '}
            </Paper>{' '}
          </Grid>{' '}
        </Grid>
        {/* Распределение операций */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Распределение операций {getPeriodTitle()}
          </Typography>

          {stats.operationsCount > 0 ? (
            <Box>
              {/* Визуализация соотношения доходов/расходов */}
              <Box sx={{ height: 300, p: 1 }}>
                {' '}
                <BarChart
                  xAxis={[
                    {
                      scaleType: 'band',
                      data: ['Доходы', 'Расходы', 'Переводы'],
                      tickLabelStyle: { fontSize: 12 },
                    },
                  ]}
                  series={[
                    {
                      data: [stats.totalIncome, 0, 0],
                      label: 'Доходы',
                      color: green[500],
                      stack: 'total',
                    },
                    {
                      data: [0, stats.totalExpense, 0],
                      label: 'Расходы',
                      color: red[500],
                      stack: 'total',
                    },
                    {
                      data: [0, 0, chartData.amounts.transfer],
                      label: 'Переводы',
                      color: blue[500],
                      stack: 'total',
                    },
                  ]}
                  slotProps={{
                    legend: {
                      position: { vertical: 'top', horizontal: 'center' },
                    },
                  }}
                  height={300}
                  margin={{ top: 20, right: 40, bottom: 30, left: 40 }}
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" align="center">
              Нет операций за выбранный период
            </Typography>
          )}
        </Box>
        {/* Крупнейшие операции */}
        <Typography variant="subtitle1" gutterBottom>
          Крупнейшие операции {getPeriodTitle()}
        </Typography>
        <Grid container spacing={2}>
          {stats.largestIncome ? (
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Крупнейший доход</Typography>
                  <Chip label="Доход" size="small" color="success" />
                </Box>
                <Typography variant="h6" color="success.main">
                  +{formatNumber(stats.largestIncome.amount)}
                </Typography>
                <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                  {stats.largestIncome.description || 'Без описания'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(
                    new Date(stats.largestIncome.date),
                    'dd MMM yyyy, HH:mm',
                    { locale: ru }
                  )}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Нет доходов за выбранный период
                </Typography>
              </Paper>
            </Grid>
          )}

          {stats.largestExpense ? (
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Крупнейший расход</Typography>
                  <Chip label="Расход" size="small" color="error" />
                </Box>
                <Typography variant="h6" color="error.main">
                  -{formatNumber(stats.largestExpense.amount)}
                </Typography>
                <Typography variant="body2" noWrap sx={{ mb: 1 }}>
                  {stats.largestExpense.description || 'Без описания'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(
                    new Date(stats.largestExpense.date),
                    'dd MMM yyyy, HH:mm',
                    { locale: ru }
                  )}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Нет расходов за выбранный период
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AccountStatistics;

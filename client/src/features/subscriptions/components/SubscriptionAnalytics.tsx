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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Card,
  CardContent,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  Payment as PaymentIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../../../shared/utils/formatUtils';

import { SubscriptionAnalyticsResponse } from '../../../entities/subscription/model/types';
import { useGetSubscriptionAnalyticsQuery } from '../../../entities/subscription/api/subscriptionApi';

const COLORS = [
  '#BAE1FF', // голубой (ледяной акцент)
  '#BAFFC9', // мятный (успешные статусы)
  '#D0B0FF', // лавандовый (креативные блоки)
  '#FFB3BA', // нежно-розовый (клубничный йогурт)
  '#FFDFBA', // песочный (нейтральные элементы)
  '#FFF5BA', // лимонный крем (предупреждения)
];

interface SubscriptionAnalyticsProps {
  className?: string;
}

const SubscriptionAnalytics: React.FC<SubscriptionAnalyticsProps> = ({
  className,
}) => {
  const [period, setPeriod] = useState<string>('month');
  const [activeTab, setActiveTab] = useState<number>(0);

  const { data, isLoading, error, refetch } =
    useGetSubscriptionAnalyticsQuery(period);

  const handlePeriodChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPeriod(event.target.value as string);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Ошибка при загрузке аналитики
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        Нет данных для отображения. Добавьте подписки для получения аналитики.
      </Alert>
    );
  }

  // Подготовка данных для графиков
  const pieData = data.categoryStats.map(item => ({
    name: item.categoryName,
    value: item.amount,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    icon: item.categoryIcon,
  }));

  const frequencyData = data.frequencyStats.map(item => ({
    name: item.label,
    amount: item.amount,
    count: item.count,
  }));

  const forecastData = data.monthlyForecast.map(item => ({
    name: `${item.month} ${item.year}`,
    amount: item.totalAmount,
  }));

  const historyData = data.paymentHistory.map(item => ({
    name: `${item.month} ${item.year}`,
    amount: item.totalAmount,
  }));

  return (
    <Box className={className}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 3,
          alignItems: 'center',
        }}
      >
        <Typography variant="h5">Аналитика подписок</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120, mr: 1 }}
          >
            <InputLabel>Период</InputLabel>
            <Select
              value={period}
              onChange={handlePeriodChange as any}
              label="Период"
            >
              <MenuItem value="month">Месяц</MenuItem>
              <MenuItem value="quarter">Квартал</MenuItem>
              <MenuItem value="year">Год</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={() => refetch()}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Карточки с общей информацией */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Активные подписки
              </Typography>
              <Typography variant="h4">{data.summary.activeCount}</Typography>
              <Typography variant="body2" color="textSecondary">
                из {data.summary.totalCount} всего
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Ежемесячные расходы
              </Typography>
              <Typography variant="h4">
                {formatNumber(data.summary.totalMonthly)} ₽
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatNumber(data.summary.totalMonthly / 30)} ₽ в день
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Годовые расходы
              </Typography>
              <Typography variant="h4">
                {formatNumber(data.summary.totalYearly)} ₽
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {formatNumber(data.summary.totalYearly / 12)} ₽ в месяц
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Среднее на подписку
              </Typography>
              <Typography variant="h4">
                {data.summary.activeCount
                  ? formatNumber(
                      data.summary.totalMonthly / data.summary.activeCount
                    )
                  : '0.00'}{' '}
                ₽
              </Typography>
              <Typography variant="body2" color="textSecondary">
                в месяц
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Вкладки для разных типов графиков */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="По категориям" icon={<CategoryIcon />} />
          <Tab label="По периодичности" icon={<ScheduleIcon />} />
          <Tab label="Прогноз расходов" icon={<TrendingUpIcon />} />
          <Tab label="История платежей" icon={<PaymentIcon />} />
        </Tabs>

        <Box p={3}>
          {activeTab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom>
                  Распределение по категориям
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={entry =>
                          `${entry.name}: ${formatNumber(entry.value)} ₽`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => [
                          `${value.toFixed(2)} ₽`,
                          'Сумма',
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom>
                  Категории
                </Typography>
                <List>
                  {data.categoryStats.map(category => (
                    <React.Fragment
                      key={category.categoryId || 'uncategorized'}
                    >
                      <ListItem>
                        <ListItemIcon>
                          <CategoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={category.categoryName}
                          secondary={`${category.count} подписок`}
                        />
                        <Typography variant="body2">
                          {formatNumber(category.amount)} ₽/мес.
                        </Typography>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom>
                  Распределение по периодичности
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={frequencyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          `${formatNumber(value)} ₽`,
                          'Сумма',
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        name="Сумма (₽/мес.)"
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom>
                  Периодичность
                </Typography>
                <List>
                  {data.frequencyStats.map(item => (
                    <React.Fragment key={item.frequency}>
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.label}
                          secondary={`${item.count} подписок`}
                        />
                        <Typography variant="body2">
                          {formatNumber(item.amount)} ₽/мес.
                        </Typography>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Прогноз расходов на 6 месяцев
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          `${formatNumber(value)} ₽`,
                          'Сумма',
                        ]}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        name="Сумма (₽)"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Детали по месяцам
                </Typography>
                <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                  {data.monthlyForecast.map((month, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">
                        {month.month} {month.year} -{' '}
                        {formatNumber(month.totalAmount)} ₽
                      </Typography>
                      <List dense>
                        {month.subscriptionsDue.map(sub => (
                          <ListItem key={sub.id}>
                            <ListItemIcon>
                              <CalendarIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={sub.name} />
                            <Typography variant="body2">
                              {formatNumber(sub.amount)} ₽
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  История платежей за последние 6 месяцев
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={historyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip
                        formatter={(value: number) => [
                          `${formatNumber(value)} ₽`,
                          'Сумма',
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="amount" name="Сумма (₽)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Детализация платежей
                </Typography>
                <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                  {data.paymentHistory.map((month, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">
                        {month.month} {month.year} -{' '}
                        {formatNumber(month.totalAmount)} ₽
                      </Typography>
                      <List dense>
                        {month.payments.map((payment, paymentIndex) => (
                          <ListItem key={paymentIndex}>
                            <ListItemIcon>
                              <PaymentIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={payment.subscriptionName}
                              secondary={format(
                                new Date(payment.date),
                                'd MMMM yyyy',
                                { locale: ru }
                              )}
                            />
                            <Typography variant="body2">
                              {formatNumber(payment.amount)} ₽
                            </Typography>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default SubscriptionAnalytics;

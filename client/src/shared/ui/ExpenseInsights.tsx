import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { formatNumber } from '../utils/formatUtils';

interface CategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
}

interface ExpenseInsightsProps {
  data: CategoryData[];
  period?: string;
  previousPeriodData?: CategoryData[];
  showRecommendations?: boolean;
}

interface Insight {
  type: 'warning' | 'info' | 'success' | 'recommendation';
  title: string;
  description: string;
  value?: string;
  icon: React.ReactNode;
}

const ExpenseInsights: React.FC<ExpenseInsightsProps> = ({
  data,
  period = 'месяц',
  previousPeriodData,
  showRecommendations = true,
}) => {
  // Анализ данных и генерация инсайтов
  const insights = useMemo(() => {
    if (!data || data.length === 0) return [];

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
    const insights: Insight[] = [];

    // 1. Топ категория расходов
    const topCategory = data.reduce(
      (max, item) => (item.total > max.total ? item : max),
      data[0]
    );

    const topCategoryPercentage = (topCategory.total / totalAmount) * 100;

    if (topCategoryPercentage > 40) {
      insights.push({
        type: 'warning',
        title: 'Концентрация расходов',
        description: `${
          topCategory.categoryName
        } составляет ${topCategoryPercentage.toFixed(1)}% от всех расходов`,
        value: `${formatNumber(topCategory.total)} ₽`,
        icon: <WarningIcon />,
      });
    } else if (topCategoryPercentage > 25) {
      insights.push({
        type: 'info',
        title: 'Основная категория',
        description: `Больше всего тратите на "${topCategory.categoryName}"`,
        value: `${topCategoryPercentage.toFixed(1)}%`,
        icon: <InfoIcon />,
      });
    }

    // 2. Количество активных категорий
    const activeCategories = data.filter(item => item.total > 0).length;
    if (activeCategories <= 3) {
      insights.push({
        type: 'info',
        title: 'Ограниченное разнообразие',
        description: `Активно используете только ${activeCategories} категории расходов`,
        icon: <InfoIcon />,
      });
    }

    // 3. Мелкие расходы
    const smallExpenses = data.filter(item => item.total < totalAmount * 0.05);
    if (smallExpenses.length > 5) {
      insights.push({
        type: 'info',
        title: 'Множество мелких трат',
        description: `${smallExpenses.length} категорий с расходами менее 5% от общей суммы`,
        icon: <AssignmentIcon />,
      });
    }

    // 4. Сравнение с предыдущим периодом
    if (previousPeriodData && previousPeriodData.length > 0) {
      const prevTotal = previousPeriodData.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const growth = ((totalAmount - prevTotal) / prevTotal) * 100;

      if (Math.abs(growth) > 20) {
        insights.push({
          type: growth > 0 ? 'warning' : 'success',
          title: growth > 0 ? 'Рост расходов' : 'Снижение расходов',
          description: `Расходы ${
            growth > 0 ? 'выросли' : 'снизились'
          } на ${Math.abs(growth).toFixed(
            1
          )}% по сравнению с предыдущим периодом`,
          value: `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`,
          icon: growth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
        });
      }

      // Анализ изменений по категориям
      data.forEach(currentItem => {
        const prevItem = previousPeriodData.find(
          prev => prev.categoryId === currentItem.categoryId
        );

        if (prevItem) {
          const categoryGrowth =
            ((currentItem.total - prevItem.total) / prevItem.total) * 100;

          if (categoryGrowth > 50) {
            insights.push({
              type: 'warning',
              title: `Рост в категории "${currentItem.categoryName}"`,
              description: `Расходы выросли на ${categoryGrowth.toFixed(1)}%`,
              value: `+${formatNumber(currentItem.total - prevItem.total)} ₽`,
              icon: <TrendingUpIcon />,
            });
          }
        } else if (currentItem.total > totalAmount * 0.1) {
          insights.push({
            type: 'info',
            title: 'Новая значимая категория',
            description: `Появились расходы на "${currentItem.categoryName}"`,
            value: `${formatNumber(currentItem.total)} ₽`,
            icon: <InfoIcon />,
          });
        }
      });
    }

    // 5. Рекомендации по оптимизации
    if (showRecommendations) {
      // Рекомендация по топ-3 категориям
      const top3Categories = [...data]
        .sort((a, b) => b.total - a.total)
        .slice(0, 3);

      const top3Total = top3Categories.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const top3Percentage = (top3Total / totalAmount) * 100;

      if (top3Percentage > 70) {
        insights.push({
          type: 'recommendation',
          title: 'Фокус на ключевых категориях',
          description: `Топ-3 категории составляют ${top3Percentage.toFixed(
            1
          )}% расходов. Рассмотрите возможность оптимизации этих направлений`,
          icon: <CheckCircleIcon />,
        });
      }

      // Рекомендация по планированию
      if (activeCategories > 10) {
        insights.push({
          type: 'recommendation',
          title: 'Упрощение бюджета',
          description:
            'Много активных категорий может усложнить планирование. Рассмотрите объединение похожих трат',
          icon: <AssignmentIcon />,
        });
      }
    }

    return insights.slice(0, 6); // Ограничиваем количество инсайтов
  }, [data, previousPeriodData, showRecommendations]);

  // Статистика по категориям
  const categoryStats = useMemo(() => {
    if (!data || data.length === 0) {
      return null;
    }

    const totalAmount = data.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalTransactions = data.reduce(
      (sum, item) => sum + (item.count || 0),
      0
    );

    const sortedData = [...data].sort(
      (a, b) => (b.total || 0) - (a.total || 0)
    );

    // Защита от деления на ноль
    const avgAmountPerCategory =
      data.length > 0 ? totalAmount / data.length : 0;
    const avgTransactionsPerCategory =
      data.length > 0 ? totalTransactions / data.length : 0;
    const concentrationIndex =
      totalAmount > 0 ? (sortedData[0]?.total || 0) / totalAmount : 0;

    const stats = {
      totalCategories: data.length,
      avgAmountPerCategory,
      avgTransactionsPerCategory,
      topCategory: sortedData[0],
      concentrationIndex,
    };

    return stats;
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Аналитика недоступна
        </Typography>
        <Typography color="text.secondary">
          Недостаточно данных для анализа расходов
        </Typography>
      </Paper>
    );
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'recommendation':
        return 'info';
      default:
        return 'default';
    }
  };

  const getInsightSeverity = (type: string) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'recommendation':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        💡 Аналитические инсайты за {period}
      </Typography>

      {/* Ключевые показатели */}
      {categoryStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {categoryStats.totalCategories}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Активных категорий
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="secondary">
                  {formatNumber(categoryStats.avgAmountPerCategory)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₽ на категорию
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4">
                  {categoryStats.avgTransactionsPerCategory.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  операций на категорию
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4">
                  {(categoryStats.concentrationIndex * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  концентрация в топ-1
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Список инсайтов */}
      <Grid container spacing={2}>
        {insights.map((insight, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Alert
              severity={getInsightSeverity(insight.type)}
              icon={insight.icon}
              variant="outlined"
              sx={{ height: '100%' }}
            >
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  {insight.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {insight.description}
                </Typography>
                {insight.value && (
                  <Chip
                    label={insight.value}
                    size="small"
                    color={getInsightColor(insight.type) as any}
                    variant="filled"
                  />
                )}
              </Box>
            </Alert>
          </Grid>
        ))}
      </Grid>

      {insights.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Структура расходов выглядит сбалансированной. Продолжайте
            отслеживать свои траты!
          </Typography>
        </Alert>
      )}

      {/* Прогресс-бар концентрации расходов */}
      {categoryStats && categoryStats.concentrationIndex > 0.3 && (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Концентрация расходов
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={categoryStats.concentrationIndex * 100}
                color={
                  categoryStats.concentrationIndex > 0.5 ? 'error' : 'warning'
                }
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 35 }}
            >
              {(categoryStats.concentrationIndex * 100).toFixed(0)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {categoryStats.concentrationIndex > 0.5
              ? 'Высокая концентрация - рассмотрите диверсификацию расходов'
              : 'Умеренная концентрация - контролируйте основные категории'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ExpenseInsights;

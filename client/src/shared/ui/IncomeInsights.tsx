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
  AccountBalance as IncomeIcon,
} from '@mui/icons-material';
import { formatNumber } from '../utils/formatUtils';

interface CategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
}

interface IncomeInsightsProps {
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

const IncomeInsights: React.FC<IncomeInsightsProps> = ({
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

    // 1. Топ источник доходов
    const topCategory = data.reduce(
      (max, item) => (item.total > max.total ? item : max),
      data[0]
    );

    const topCategoryPercentage = (topCategory.total / totalAmount) * 100;

    if (topCategoryPercentage > 70) {
      insights.push({
        type: 'warning',
        title: 'Высокая зависимость от одного источника',
        description: `${
          topCategory.categoryName
        } составляет ${topCategoryPercentage.toFixed(1)}% от всех доходов`,
        value: `${formatNumber(topCategory.total)} ₽`,
        icon: <WarningIcon />,
      });
    } else if (topCategoryPercentage > 50) {
      insights.push({
        type: 'info',
        title: 'Основной источник доходов',
        description: `Больше всего получаете от "${topCategory.categoryName}"`,
        value: `${topCategoryPercentage.toFixed(1)}%`,
        icon: <InfoIcon />,
      });
    }

    // 2. Диверсификация доходов
    const activeCategories = data.filter(item => item.total > 0).length;
    if (activeCategories >= 4) {
      insights.push({
        type: 'success',
        title: 'Хорошая диверсификация',
        description: `У вас ${activeCategories} активных источников доходов`,
        icon: <CheckCircleIcon />,
      });
    } else if (activeCategories <= 2) {
      insights.push({
        type: 'warning',
        title: 'Ограниченные источники',
        description: `Только ${activeCategories} источника доходов - рассмотрите диверсификацию`,
        icon: <WarningIcon />,
      });
    }

    // 3. Регулярность доходов
    const regularIncomes = data.filter(item => item.count >= 2);
    const irregularIncomes = data.filter(item => item.count === 1);

    if (irregularIncomes.length > regularIncomes.length) {
      insights.push({
        type: 'info',
        title: 'Много разовых поступлений',
        description: `${irregularIncomes.length} категорий с единичными поступлениями`,
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

      if (Math.abs(growth) > 15) {
        insights.push({
          type: growth > 0 ? 'success' : 'warning',
          title: growth > 0 ? 'Рост доходов' : 'Снижение доходов',
          description: `Доходы ${
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

          if (categoryGrowth > 30) {
            insights.push({
              type: 'success',
              title: `Рост в категории "${currentItem.categoryName}"`,
              description: `Доходы выросли на ${categoryGrowth.toFixed(1)}%`,
              value: `+${formatNumber(currentItem.total - prevItem.total)} ₽`,
              icon: <TrendingUpIcon />,
            });
          } else if (categoryGrowth < -30) {
            insights.push({
              type: 'warning',
              title: `Снижение в категории "${currentItem.categoryName}"`,
              description: `Доходы снизились на ${Math.abs(
                categoryGrowth
              ).toFixed(1)}%`,
              value: `${formatNumber(currentItem.total - prevItem.total)} ₽`,
              icon: <TrendingDownIcon />,
            });
          }
        } else if (currentItem.total > totalAmount * 0.1) {
          insights.push({
            type: 'success',
            title: 'Новый значимый источник',
            description: `Появились доходы от "${currentItem.categoryName}"`,
            value: `${formatNumber(currentItem.total)} ₽`,
            icon: <TrendingUpIcon />,
          });
        }
      });
    }

    // 5. Рекомендации по оптимизации
    if (showRecommendations) {
      // Рекомендация по стабильности
      if (topCategoryPercentage > 60) {
        insights.push({
          type: 'recommendation',
          title: 'Развитие дополнительных источников',
          description: `Рассмотрите возможность развития дополнительных источников дохода для снижения зависимости`,
          icon: <AssignmentIcon />,
        });
      }

      // Рекомендация по пассивным доходам
      const passiveIncomeCategories = data.filter(
        item =>
          item.categoryName.toLowerCase().includes('инвестиции') ||
          item.categoryName.toLowerCase().includes('дивиденды') ||
          item.categoryName.toLowerCase().includes('аренда') ||
          item.categoryName.toLowerCase().includes('проценты')
      );

      if (passiveIncomeCategories.length === 0) {
        insights.push({
          type: 'recommendation',
          title: 'Развитие пассивных доходов',
          description:
            'Рассмотрите возможность создания источников пассивного дохода',
          icon: <IncomeIcon />,
        });
      } else {
        const passiveTotal = passiveIncomeCategories.reduce(
          (sum, item) => sum + item.total,
          0
        );
        const passivePercentage = (passiveTotal / totalAmount) * 100;

        if (passivePercentage > 20) {
          insights.push({
            type: 'success',
            title: 'Хорошие пассивные доходы',
            description: `Пассивные доходы составляют ${passivePercentage.toFixed(
              1
            )}% от общих доходов`,
            value: `${formatNumber(passiveTotal)} ₽`,
            icon: <CheckCircleIcon />,
          });
        }
      }
    }

    return insights.slice(0, 6); // Ограничиваем количество инсайтов
  }, [data, previousPeriodData, showRecommendations]);

  // Статистика по категориям
  const categoryStats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);
    const totalTransactions = data.reduce((sum, item) => sum + item.count, 0);

    const sortedData = [...data].sort((a, b) => b.total - a.total);

    return {
      totalCategories: data.length,
      avgAmountPerCategory: totalAmount / data.length,
      avgTransactionsPerCategory: totalTransactions / data.length,
      topCategory: sortedData[0],
      stabilityIndex: 1 - (sortedData[0]?.total || 0) / totalAmount, // Чем выше, тем более диверсифицированы доходы
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Аналитика недоступна
        </Typography>
        <Typography color="text.secondary">
          Недостаточно данных для анализа доходов
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
        💰 Анализ доходов за {period}
      </Typography>

      {/* Ключевые показатели */}
      {categoryStats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="success.main">
                  {categoryStats.totalCategories}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Источников доходов
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4" color="primary">
                  {formatNumber(categoryStats.avgAmountPerCategory)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₽ на источник
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
                  операций на источник
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="h4">
                  {(categoryStats.stabilityIndex * 100).toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  индекс стабильности
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
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Структура доходов выглядит стабильной. Продолжайте развивать свои
            источники дохода!
          </Typography>
        </Alert>
      )}

      {/* Прогресс-бар стабильности доходов */}
      {categoryStats && categoryStats.stabilityIndex < 0.7 && (
        <Paper elevation={1} sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Стабильность доходов
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={categoryStats.stabilityIndex * 100}
                color={
                  categoryStats.stabilityIndex < 0.3
                    ? 'error'
                    : categoryStats.stabilityIndex < 0.5
                    ? 'warning'
                    : 'success'
                }
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ minWidth: 35 }}
            >
              {(categoryStats.stabilityIndex * 100).toFixed(0)}%
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {categoryStats.stabilityIndex < 0.3
              ? 'Низкая стабильность - высокая зависимость от одного источника'
              : categoryStats.stabilityIndex < 0.5
              ? 'Средняя стабильность - рассмотрите диверсификацию'
              : 'Хорошая стабильность - доходы диверсифицированы'}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default IncomeInsights;

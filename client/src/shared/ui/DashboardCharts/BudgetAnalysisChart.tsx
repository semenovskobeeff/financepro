import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  Alert,
  Collapse,
  Button,
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { NotionCard } from '../NotionCard';
import { formatNumber } from '../../utils/formatUtils';

interface BudgetData {
  hasData?: boolean;
  income: number;
  expense: number;
  balance: number;
  categories: {
    name: string;
    spent: number;
    budget?: number;
    percentage: number;
  }[];
  lastMonthBalance: number;
  averageExpenseLastThreeMonths: number;
  emptyMessage?: string;
}

interface BudgetAnalysisChartProps {
  data: BudgetData;
}

const BudgetAnalysisChart: React.FC<BudgetAnalysisChartProps> = ({ data }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Если нет данных, используем нулевые значения
  const isEmpty = data.hasData === false;

  // Расчет ключевых показателей
  const income = isEmpty ? 0 : data.income;
  const balance = isEmpty ? 0 : data.balance;
  const lastMonthBalance = isEmpty ? 0 : data.lastMonthBalance;

  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  const balanceChange = balance - lastMonthBalance;
  const balanceChangePercentage =
    lastMonthBalance !== 0
      ? (balanceChange / Math.abs(lastMonthBalance)) * 100
      : 0;

  // Прогноз на следующий месяц
  const projectedExpense = isEmpty ? 0 : data.averageExpenseLastThreeMonths;
  const projectedBalance = income - projectedExpense;

  // Анализ категорий с превышением бюджета
  const overBudgetCategories = isEmpty
    ? []
    : data.categories.filter(cat => cat.budget && cat.spent > cat.budget);

  // Определение статуса бюджета
  const getBudgetStatus = () => {
    if (savingsRate >= 20)
      return {
        status: 'excellent',
        color: 'success',
        text: 'Отличное управление',
      };
    if (savingsRate >= 10)
      return { status: 'good', color: 'info', text: 'Хорошее управление' };
    if (savingsRate >= 0)
      return { status: 'ok', color: 'warning', text: 'Можно улучшить' };
    return { status: 'poor', color: 'error', text: 'Требует внимания' };
  };

  const budgetStatus = getBudgetStatus();

  // Рекомендации
  const getRecommendations = () => {
    const recommendations: Array<{
      type: 'warning' | 'error' | 'info';
      text: string;
      action: string;
    }> = [];

    if (savingsRate < 10) {
      recommendations.push({
        type: 'warning',
        text: 'Рекомендуется откладывать минимум 10% от доходов',
        action: 'Настроить автоматические переводы на накопительный счет',
      });
    }

    if (overBudgetCategories.length > 0) {
      recommendations.push({
        type: 'error',
        text: `Превышен бюджет в ${overBudgetCategories.length} категориях`,
        action: 'Пересмотреть расходы в этих категориях',
      });
    }

    if (balanceChange < 0 && Math.abs(balanceChangePercentage) > 20) {
      recommendations.push({
        type: 'warning',
        text: 'Значительное снижение баланса по сравнению с прошлым месяцем',
        action: 'Проанализировать крупные расходы',
      });
    }

    if (projectedBalance < 0) {
      recommendations.push({
        type: 'error',
        text: 'Прогноз показывает отрицательный баланс в следующем месяце',
        action: 'Необходимо сократить планируемые расходы',
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  return (
    <NotionCard
      title="Анализ бюджета"
      color={isEmpty ? 'gray' : (budgetStatus.color as any)}
      subtitle="Текущее состояние и прогнозы"
    >
      {/* Основные метрики */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight="medium">
            Норма сбережений
          </Typography>
          <Chip
            label={budgetStatus.text}
            color={budgetStatus.color as any}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {savingsRate.toFixed(1)}% от дохода
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatNumber(balance)} ₽
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(savingsRate, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor:
                  savingsRate >= 20
                    ? '#22c55e'
                    : savingsRate >= 10
                    ? '#3b82f6'
                    : savingsRate >= 0
                    ? '#f59e0b'
                    : '#ef4444',
              },
            }}
          />
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              0%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              20% (цель)
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Изменение баланса */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {balanceChange >= 0 ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : (
            <TrendingDownIcon color="error" fontSize="small" />
          )}
          <Typography variant="body2" fontWeight="medium">
            Изменение баланса
          </Typography>
        </Box>
        <Typography
          variant="h6"
          color={balanceChange >= 0 ? 'success.main' : 'error.main'}
        >
          {balanceChange >= 0 ? '+' : ''}
          {formatNumber(balanceChange)} ₽
          <Typography component="span" variant="body2" sx={{ ml: 1 }}>
            ({balanceChangePercentage >= 0 ? '+' : ''}
            {balanceChangePercentage.toFixed(1)}%)
          </Typography>
        </Typography>
      </Box>

      {/* Прогноз */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Прогноз на следующий месяц
        </Typography>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            При текущих расходах
          </Typography>
          <Typography
            variant="body2"
            fontWeight="medium"
            color={projectedBalance >= 0 ? 'success.main' : 'error.main'}
          >
            {projectedBalance >= 0 ? '+' : ''}
            {formatNumber(projectedBalance)} ₽
          </Typography>
        </Box>
      </Box>

      {/* Рекомендации */}
      {recommendations.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
            variant="text"
            sx={{ mb: 1 }}
          >
            Рекомендации ({recommendations.length})
          </Button>

          <Collapse in={showDetails}>
            <Box sx={{ space: 1 }}>
              {recommendations.map((rec, index) => (
                <Alert
                  key={index}
                  severity={rec.type as any}
                  sx={{ mb: 1, fontSize: '0.875rem' }}
                  icon={
                    rec.type === 'error' ? (
                      <WarningIcon fontSize="small" />
                    ) : rec.type === 'warning' ? (
                      <WarningIcon fontSize="small" />
                    ) : (
                      <CheckIcon fontSize="small" />
                    )
                  }
                >
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    {rec.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rec.action}
                  </Typography>
                </Alert>
              ))}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Категории с превышением бюджета */}
      {overBudgetCategories.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Превышение бюджета
          </Typography>
          {overBudgetCategories.slice(0, 3).map((category, index) => (
            <Box
              key={index}
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography variant="body2">{category.name}</Typography>
              <Typography variant="body2" color="error.main">
                +{formatNumber(category.spent - (category.budget || 0))} ₽
              </Typography>
            </Box>
          ))}
          {overBudgetCategories.length > 3 && (
            <Typography variant="caption" color="text.secondary">
              И еще {overBudgetCategories.length - 3} категорий...
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Tooltip title="Анализ основан на ваших доходах, расходах и истории транзакций. Рекомендации помогают улучшить финансовое планирование.">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Данные обновляются ежедневно
        </Typography>
      </Box>
    </NotionCard>
  );
};

export default BudgetAnalysisChart;

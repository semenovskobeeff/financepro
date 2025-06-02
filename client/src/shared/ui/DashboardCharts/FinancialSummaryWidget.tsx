import React from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as TrendIcon,
  MonetizationOn as MoneyIcon,
  Savings as SavingsIcon,
  CreditCard as ExpenseIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import { NotionCard } from '../NotionCard';
import { formatNumber } from '../../utils/formatUtils';

interface FinancialMetric {
  label: string;
  value: number;
  previousValue?: number;
  target?: number;
  format: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
  color: 'success' | 'error' | 'warning' | 'info' | 'primary';
  icon: React.ReactNode;
}

interface FinancialSummaryData {
  period: string;
  metrics: FinancialMetric[];
  healthScore: {
    current: number;
    target: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
  };
  insights: Array<{
    type: 'positive' | 'negative' | 'neutral';
    message: string;
  }>;
}

interface FinancialSummaryWidgetProps {
  data: FinancialSummaryData;
}

const FinancialSummaryWidget: React.FC<FinancialSummaryWidgetProps> = ({
  data,
}) => {
  // Форматирование значений
  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `${formatNumber(value)} ₽`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return formatNumber(value);
      default:
        return value.toString();
    }
  };

  // Расчет изменения в процентах
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // Получение цвета статуса здоровья
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#22c55e';
      case 'good':
        return '#3b82f6';
      case 'fair':
        return '#f59e0b';
      case 'poor':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  // Получение текста статуса
  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Отличное';
      case 'good':
        return 'Хорошее';
      case 'fair':
        return 'Удовлетворительное';
      case 'poor':
        return 'Требует внимания';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <NotionCard
      title="Финансовая сводка"
      color="blue"
      subtitle={`Ключевые показатели за ${data.period}`}
    >
      {/* Индекс финансового здоровья */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            Индекс финансового здоровья
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            color={getHealthColor(data.healthScore.status)}
          >
            {data.healthScore.current}/100
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={data.healthScore.current}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            mb: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: getHealthColor(data.healthScore.status),
            },
          }}
        />

        <Typography variant="caption" color="text.secondary">
          Состояние: {getHealthStatusText(data.healthScore.status)}
        </Typography>
      </Box>

      {/* Ключевые метрики */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {data.metrics.map((metric, index) => {
          const change = metric.previousValue
            ? calculateChange(metric.value, metric.previousValue)
            : 0;

          return (
            <Grid item xs={6} sm={3} key={index}>
              <Card
                sx={{
                  p: 2,
                  height: '100%',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: '0 !important' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ color: `${metric.color}.main` }}>
                      {metric.icon}
                    </Box>
                    {metric.previousValue && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          color: change >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {change >= 0 ? (
                          <TrendingUpIcon fontSize="small" />
                        ) : (
                          <TrendingDownIcon fontSize="small" />
                        )}
                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                          {Math.abs(change).toFixed(1)}%
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    gutterBottom
                  >
                    {metric.label}
                  </Typography>

                  <Typography variant="h6" fontWeight="medium">
                    {formatValue(metric.value, metric.format)}
                  </Typography>

                  {/* Прогресс к цели */}
                  {metric.target && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(
                          (metric.value / metric.target) * 100,
                          100
                        )}
                        color={metric.color}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Цель: {formatValue(metric.target, metric.format)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Инсайты */}
      {data.insights && data.insights.length > 0 && (
        <Box>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Ключевые инсайты
          </Typography>
          {data.insights.slice(0, 3).map((insight, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                p: 1,
                borderRadius: 1,
                backgroundColor:
                  insight.type === 'positive'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : insight.type === 'negative'
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(107, 114, 128, 0.1)',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor:
                    insight.type === 'positive'
                      ? 'success.main'
                      : insight.type === 'negative'
                      ? 'error.main'
                      : 'text.secondary',
                  flexShrink: 0,
                  mt: 0.75,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {insight.message}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Tooltip title="Индекс рассчитывается на основе соотношения доходов и расходов, прогресса по целям и общего финансового поведения.">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Обновляется ежедневно
        </Typography>
      </Box>
    </NotionCard>
  );
};

export default FinancialSummaryWidget;

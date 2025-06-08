import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Savings,
} from '@mui/icons-material';
import { formatNumberWithDots } from '../utils/formatUtils';

interface SmartFinancialSummaryProps {
  data: {
    balance: number;
    income: number;
    expense: number;
    healthScore: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    savingsRate: number;
    accountsCount: number;
  };
}

const SmartFinancialSummary: React.FC<SmartFinancialSummaryProps> = ({
  data,
}) => {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return '#4caf50';
      case 'good':
        return '#8bc34a';
      case 'fair':
        return '#ff9800';
      case 'poor':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Отлично';
      case 'good':
        return 'Хорошо';
      case 'fair':
        return 'Удовлетворительно';
      case 'poor':
        return 'Плохо';
      default:
        return 'Не определено';
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Финансовая сводка
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box display="flex" alignItems="center" mb={2}>
            <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="body1">
              Баланс: <strong>{formatNumberWithDots(data.balance)} ₽</strong>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            {data.income >= 0 ? (
              <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
            )}
            <Typography variant="body1">
              Доходы: <strong>{formatNumberWithDots(data.income)} ₽</strong>
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
            <Typography variant="body1">
              Расходы:{' '}
              <strong>{formatNumberWithDots(Math.abs(data.expense))} ₽</strong>
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box mb={2}>
            <Typography variant="body2" gutterBottom>
              Финансовое здоровье
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <LinearProgress
                variant="determinate"
                value={data.healthScore}
                sx={{
                  flexGrow: 1,
                  mr: 2,
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getHealthColor(data.healthStatus),
                  },
                }}
              />
              <Typography variant="body2">{data.healthScore}%</Typography>
            </Box>
            <Chip
              label={getHealthLabel(data.healthStatus)}
              size="small"
              sx={{
                backgroundColor: getHealthColor(data.healthStatus),
                color: 'white',
              }}
            />
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Savings sx={{ mr: 1, color: 'info.main' }} />
            <Typography variant="body1">
              Норма сбережений: <strong>{data.savingsRate.toFixed(1)}%</strong>
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Счетов: {data.accountsCount}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SmartFinancialSummary;

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  LinearProgress,
  Grid,
  Chip,
} from '@mui/material';
import { CheckCircle, Schedule, Flag } from '@mui/icons-material';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  status: 'active' | 'completed' | 'overdue';
  deadline?: string;
  category: string;
}

interface GoalsProgressChartProps {
  data: {
    hasData: boolean;
    goals: Goal[];
    totalGoals: number;
    completedGoals: number;
    activeGoals: number;
    emptyMessage?: string;
  };
}

const GoalsProgressChart: React.FC<GoalsProgressChartProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'overdue':
        return 'error';
      case 'active':
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle />;
      case 'overdue':
        return <Schedule />;
      case 'active':
      default:
        return <Flag />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Выполнена';
      case 'overdue':
        return 'Просрочена';
      case 'active':
      default:
        return 'Активна';
    }
  };

  if (!data.hasData) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Прогресс целей
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={4}
        >
          {data.emptyMessage || 'Нет активных целей'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Прогресс целей
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h4" color="primary.main">
              {data.totalGoals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Всего целей
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main">
              {data.completedGoals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Выполнено
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box textAlign="center">
            <Typography variant="h4" color="info.main">
              {data.activeGoals}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Активных
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box>
        {data.goals.slice(0, 5).map(goal => (
          <Box key={goal.id} mb={3}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle2" mr={1}>
                  {goal.name}
                </Typography>
                <Chip
                  icon={getStatusIcon(goal.status)}
                  label={getStatusLabel(goal.status)}
                  size="small"
                  color={getStatusColor(goal.status) as any}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {goal.currentAmount.toLocaleString()} /{' '}
                {goal.targetAmount.toLocaleString()} ₽
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(goal.progress, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor:
                    goal.status === 'completed'
                      ? '#4caf50'
                      : goal.status === 'overdue'
                      ? '#f44336'
                      : '#2196f3',
                },
              }}
            />

            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {goal.category}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {goal.progress.toFixed(1)}%
              </Typography>
            </Box>

            {goal.deadline && (
              <Typography variant="caption" color="text.secondary">
                Срок: {new Date(goal.deadline).toLocaleDateString('ru-RU')}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      {data.goals.length > 5 && (
        <Typography
          variant="body2"
          color="primary"
          textAlign="center"
          sx={{ mt: 2, cursor: 'pointer' }}
        >
          Показать еще {data.goals.length - 5} целей
        </Typography>
      )}
    </Paper>
  );
};

export default GoalsProgressChart;

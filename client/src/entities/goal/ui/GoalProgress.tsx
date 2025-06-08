import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Goal } from '../model/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatCurrencyWithDots } from '../../../shared/utils/formatUtils';

// Регистрируем компоненты Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

interface GoalProgressProps {
  goal: Goal;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal }) => {
  // Рассчитываем процент выполнения и оставшуюся сумму
  const progressAmount = goal.progress;
  const remainingAmount = Math.max(0, goal.targetAmount - goal.progress);
  const progressPercent = Math.min(
    100,
    (progressAmount / goal.targetAmount) * 100
  );

  // Форматируем дату
  const deadlineDate = new Date(goal.deadline);
  const formattedDate = format(deadlineDate, 'dd MMMM yyyy', { locale: ru });

  // Рассчитываем оставшиеся дни
  const today = new Date();
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Данные для графика
  const chartData = {
    labels: ['Собрано', 'Осталось'],
    datasets: [
      {
        data: [progressAmount, remainingAmount],
        backgroundColor: [
          '#BAFFC9', // Собрано (мятный - успешные статусы)
          '#F0F0F0', // Осталось (холодный серый - разделители)
        ],
        borderColor: [
          '#C2E9C3', // Граница для собрано (оливково-пастельный)
          '#E8E8E8', // Граница для осталось (универсальный пастель-серый)
        ],
        borderWidth: 1,
        hoverOffset: 4,
      },
    ],
  };

  // Опции графика
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${formatCurrencyWithDots(value)}`;
          },
        },
      },
    },
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Прогресс цели
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* График */}
        <Box
          sx={{
            position: 'relative',
            height: 180,
            width: { xs: '100%', sm: 180 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Doughnut data={chartData} options={chartOptions} />
          <Typography
            variant="h5"
            sx={{
              position: 'absolute',
              textAlign: 'center',
              color: progressPercent >= 100 ? '#4CAF50' : 'inherit',
            }}
          >
            {progressPercent.toFixed(0)}%
          </Typography>
        </Box>

        {/* Детали прогресса */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Собрано:
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {formatCurrencyWithDots(progressAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Осталось собрать:
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {formatCurrencyWithDots(remainingAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Всего:
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {formatCurrencyWithDots(goal.targetAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Срок:
            </Typography>
            <Typography variant="body1" fontWeight="500">
              {formattedDate}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Осталось дней:
            </Typography>
            <Typography
              variant="body1"
              fontWeight="500"
              color={
                diffDays < 0
                  ? 'error.main'
                  : diffDays < 7
                  ? 'warning.main'
                  : 'inherit'
              }
            >
              {diffDays < 0 ? 'Просрочено' : diffDays}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default GoalProgress;

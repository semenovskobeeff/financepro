import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Flag as GoalIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CompletedIcon,
} from '@mui/icons-material';
import { NotionCard } from '../NotionCard';
import { formatNumber } from '../../utils/formatUtils';
import { differenceInDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progress: number; // в процентах
  status: 'active' | 'completed' | 'overdue';
  monthlyTarget?: number;
}

interface GoalsProgressData {
  hasData?: boolean;
  goals: Goal[];
  totalProgress: number;
  completedGoals: number;
  totalGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  emptyMessage?: string;
}

interface GoalsProgressWidgetProps {
  data: GoalsProgressData;
  maxGoalsVisible?: number;
}

const GoalsProgressWidget: React.FC<GoalsProgressWidgetProps> = ({
  data,
  maxGoalsVisible = 4,
}) => {
  // Если нет данных, показываем пустой интерфейс
  const isEmpty = data.hasData === false;

  // Сортируем цели по прогрессу и статусу
  const goals = isEmpty ? [] : data.goals;
  const sortedGoals = [...goals]
    .sort((a, b) => {
      // Сначала активные цели с наибольшим прогрессом
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      if (a.status === 'overdue' && b.status !== 'overdue') return 1;
      if (b.status === 'overdue' && a.status !== 'overdue') return -1;
      return b.progress - a.progress;
    })
    .slice(0, maxGoalsVisible);

  // Расчет общих метрик
  const totalGoals = isEmpty ? 0 : data.totalGoals;
  const completedGoals = isEmpty ? 0 : data.completedGoals;
  const totalProgress = isEmpty ? 0 : data.totalProgress;
  const totalTargetAmount = isEmpty ? 0 : data.totalTargetAmount;
  const totalCurrentAmount = isEmpty ? 0 : data.totalCurrentAmount;

  const averageProgress = totalGoals > 0 ? totalProgress / totalGoals : 0;
  const completionRate =
    totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
  const remainingAmount = totalTargetAmount - totalCurrentAmount;

  // Функция для получения цвета прогресса
  const getProgressColor = (progress: number, status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'overdue') return 'error';
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 20) return 'warning';
    return 'error';
  };

  // Функция для получения статуса цели
  const getGoalStatusChip = (goal: Goal) => {
    const daysLeft = differenceInDays(new Date(goal.deadline), new Date());

    if (goal.status === 'completed') {
      return <Chip label="Завершена" color="success" size="small" />;
    }

    if (goal.status === 'overdue') {
      return <Chip label="Просрочена" color="error" size="small" />;
    }

    if (daysLeft <= 30) {
      return <Chip label={`${daysLeft} дн.`} color="warning" size="small" />;
    }

    return <Chip label={`${daysLeft} дн.`} color="default" size="small" />;
  };

  // Анализ эффективности
  const getEfficiencyAnalysis = () => {
    const activeGoals = goals.filter(g => g.status === 'active');
    const onTrackGoals = activeGoals.filter(goal => {
      const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
      const totalDays = differenceInDays(new Date(goal.deadline), new Date()); // Приблизительно
      const expectedProgress =
        totalDays > 0 ? (1 - daysLeft / totalDays) * 100 : 0;
      return goal.progress >= expectedProgress * 0.8; // 80% от ожидаемого прогресса
    });

    return {
      onTrack: onTrackGoals.length,
      total: activeGoals.length,
      percentage:
        activeGoals.length > 0
          ? (onTrackGoals.length / activeGoals.length) * 100
          : 0,
    };
  };

  const efficiency = getEfficiencyAnalysis();

  return (
    <NotionCard
      title="Прогресс целей"
      color={isEmpty ? 'gray' : 'green'}
      subtitle="Отслеживание финансовых целей"
      badge={totalGoals.toString()}
    >
      {/* Общая статистика */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Общий прогресс
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {averageProgress.toFixed(1)}%
            </Typography>
          </Box>

          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Завершено
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {completedGoals}/{totalGoals}
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Осталось
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {formatNumber(remainingAmount)} ₽
            </Typography>
          </Box>
        </Box>

        {/* Общий прогресс-бар */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Накоплено всего
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatNumber(totalCurrentAmount)} ₽ из{' '}
              {formatNumber(totalTargetAmount)} ₽
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(
              totalTargetAmount > 0
                ? (totalCurrentAmount / totalTargetAmount) * 100
                : 0,
              100
            )}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: '#22c55e',
              },
            }}
          />
        </Box>

        {/* Эффективность */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Цели в графике
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight="medium"
              color={
                efficiency.percentage >= 70 ? 'success.main' : 'warning.main'
              }
            >
              {efficiency.onTrack}/{efficiency.total}
            </Typography>
            <Chip
              label={`${efficiency.percentage.toFixed(0)}%`}
              size="small"
              color={efficiency.percentage >= 70 ? 'success' : 'warning'}
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      {/* Список целей */}
      <Box>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Активные цели
        </Typography>

        <List dense sx={{ p: 0 }}>
          {isEmpty ? (
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary="Нет активных целей"
                secondary="Создайте финансовые цели для отслеживания прогресса"
                primaryTypographyProps={{
                  variant: 'body2',
                  color: 'text.secondary',
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                  color: 'text.secondary',
                }}
              />
            </ListItem>
          ) : (
            sortedGoals.map(goal => {
              const progressColor = getProgressColor(
                goal.progress,
                goal.status
              );
              const daysLeft = differenceInDays(
                new Date(goal.deadline),
                new Date()
              );

              return (
                <ListItem key={goal.id} sx={{ px: 0, py: 1 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        backgroundColor:
                          goal.status === 'completed'
                            ? 'success.main'
                            : goal.status === 'overdue'
                            ? 'error.main'
                            : 'primary.main',
                        width: 36,
                        height: 36,
                      }}
                    >
                      {goal.status === 'completed' ? (
                        <CompletedIcon fontSize="small" />
                      ) : (
                        <GoalIcon fontSize="small" />
                      )}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {goal.name}
                        </Typography>
                        {getGoalStatusChip(goal)}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {formatNumber(goal.currentAmount)} ₽ из{' '}
                            {formatNumber(goal.targetAmount)} ₽
                          </Typography>
                          <Typography variant="caption" fontWeight="medium">
                            {goal.progress.toFixed(1)}%
                          </Typography>
                        </Box>

                        <LinearProgress
                          variant="determinate"
                          value={Math.min(goal.progress, 100)}
                          color={progressColor as any}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            mb: 1,
                          }}
                        />

                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            до{' '}
                            {format(new Date(goal.deadline), 'dd.MM.yyyy', {
                              locale: ru,
                            })}
                          </Typography>
                          {goal.monthlyTarget && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatNumber(goal.monthlyTarget)} ₽/мес
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              );
            })
          )}
        </List>

        {!isEmpty && goals.length > maxGoalsVisible && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            И еще {goals.length - maxGoalsVisible} целей...
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Tooltip title="Виджет показывает прогресс достижения ваших финансовых целей. Зеленые цели идут по плану, желтые требуют внимания, красные просрочены.">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Отслеживайте прогресс и корректируйте планы
        </Typography>
      </Box>
    </NotionCard>
  );
};

export default GoalsProgressWidget;

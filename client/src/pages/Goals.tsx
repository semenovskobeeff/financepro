import React, { useState } from 'react';
import {
  Box,
  Grid,
  Dialog,
  DialogContent,
  CircularProgress,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { GoalStatus, Goal } from '../entities/goal/model/types';
import GoalCard from '../entities/goal/ui/GoalCard';
import GoalForm from '../features/goals/components/GoalForm';
import TransferToGoalForm from '../features/goals/components/TransferToGoalForm';
import PageContainer from '../shared/ui/PageContainer';
import TabsFilter, { goalStatusOptions } from '../shared/ui/TabsFilter';
import {
  useGetGoalsQuery,
  useArchiveGoalMutation,
  useRestoreGoalMutation,
} from '../entities/goal/api/goalApi';
import { useNavigate } from 'react-router-dom';

const Goals: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [statusFilter, setStatusFilter] = useState<GoalStatus | 'all'>(
    'active'
  );
  const navigate = useNavigate();

  const {
    data: goals = [],
    isLoading,
    error,
  } = useGetGoalsQuery({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  // Получаем все цели для подсчета количества по статусам
  const { data: allGoals = [] } = useGetGoalsQuery({});

  const [archiveGoal] = useArchiveGoalMutation();
  const [restoreGoal] = useRestoreGoalMutation();

  const handleOpenForm = () => {
    setSelectedGoal(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setShowTransferForm(false);
    setSelectedGoal(null);
  };

  const handleOpenTransferForm = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowTransferForm(true);
  };

  const handleCloseTransferForm = () => {
    setShowTransferForm(false);
    setSelectedGoal(null);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowForm(true);
  };

  const handleArchiveGoal = async (goal: Goal) => {
    try {
      await archiveGoal(goal.id).unwrap();
    } catch (error) {
      console.error('Ошибка при архивации цели:', error);
    }
  };

  const handleRestoreGoal = async (goal: Goal) => {
    try {
      await restoreGoal(goal.id).unwrap();
    } catch (error) {
      console.error('Ошибка при восстановлении цели:', error);
    }
  };

  const handleGoalClick = (goal: Goal) => {
    navigate(`/goals/${goal.id}`);
  };

  const handleStatusChange = (newValue: string) => {
    setStatusFilter(newValue as GoalStatus | 'all');
  };

  // Подсчитываем количество целей по статусам
  const getGoalCounts = () => {
    const counts = {
      all: allGoals.length,
      active: allGoals.filter(goal => goal.status === 'active').length,
      completed: allGoals.filter(goal => goal.status === 'completed').length,
      archived: allGoals.filter(goal => goal.status === 'archived').length,
    };
    return counts;
  };

  const goalCounts = getGoalCounts();

  // Опции табов с количеством
  const tabOptions = goalStatusOptions.map(option => ({
    ...option,
    count: goalCounts[option.value as keyof typeof goalCounts],
  }));

  return (
    <PageContainer
      title="Цели накопления"
      action={{
        label: 'Создать цель',
        icon: <AddIcon />,
        onClick: handleOpenForm,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
            Статус цели
          </Typography>
          <TabsFilter
            value={statusFilter}
            onChange={handleStatusChange}
            options={tabOptions}
            size="medium"
          />
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Произошла ошибка при загрузке целей
          </Alert>
        ) : !Array.isArray(goals) || goals.length === 0 ? (
          <Box textAlign="center" my={4}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Нет целей
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="div"
              sx={{ mb: 2 }}
            >
              {statusFilter === 'all'
                ? 'У вас пока нет ни одной цели накопления'
                : statusFilter === 'active'
                ? 'У вас нет активных целей накопления'
                : statusFilter === 'completed'
                ? 'У вас нет завершенных целей'
                : 'В архиве нет целей'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenForm}
            >
              Создать цель
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2} alignItems="stretch">
            {goals.map(goal => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={goal.id}
                sx={{ display: 'flex', height: '100%' }}
              >
                <GoalCard
                  goal={goal}
                  onEdit={handleEditGoal}
                  onArchive={handleArchiveGoal}
                  onRestore={handleRestoreGoal}
                  onTransfer={handleOpenTransferForm}
                  onClick={handleGoalClick}
                  sx={{ width: '100%' }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {showForm && (
        <Dialog open onClose={handleCloseForm} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedGoal ? 'Редактирование цели' : 'Создание цели'}
            <IconButton
              onClick={handleCloseForm}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <GoalForm goal={selectedGoal} onClose={handleCloseForm} />
          </DialogContent>
        </Dialog>
      )}
      {showTransferForm && selectedGoal && (
        <TransferToGoalForm
          goal={selectedGoal}
          onClose={handleCloseTransferForm}
        />
      )}
    </PageContainer>
  );
};

export default Goals;

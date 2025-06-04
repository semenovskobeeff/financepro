import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Paper,
  Dialog,
  DialogContent,
  CircularProgress,
  DialogTitle,
  IconButton,
  Typography,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { GoalStatus, Goal } from '../entities/goal/model/types';
import GoalCard from '../entities/goal/ui/GoalCard';
import GoalForm from '../features/goals/components/GoalForm';
import TransferToGoalForm from '../features/goals/components/TransferToGoalForm';
import PageContainer from '../shared/ui/PageContainer';
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

  const handleStatusChange = (
    _: React.SyntheticEvent,
    newValue: GoalStatus | 'all'
  ) => {
    if (newValue !== null) {
      setStatusFilter(newValue);
    }
  };

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
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Статус цели
          </Typography>
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={handleStatusChange}
            aria-label="goal status filter"
            size="small"
          >
            <ToggleButton value="all">Все</ToggleButton>
            <ToggleButton value="active">Активные</ToggleButton>
            <ToggleButton value="completed">Завершенные</ToggleButton>
            <ToggleButton value="archived">Архивные</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {isLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            Произошла ошибка при загрузке целей
          </Alert>
        ) : goals.length === 0 ? (
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

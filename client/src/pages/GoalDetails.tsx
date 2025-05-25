import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  IconButton,
  Breadcrumbs,
  Link,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import {
  useGetGoalByIdQuery,
  useArchiveGoalMutation,
  useRestoreGoalMutation,
} from 'entities/goal/api/goalApi';
import { useGetAccountsQuery } from 'entities/account/api/accountApi';
import GoalProgress from 'entities/goal/ui/GoalProgress';
import GoalForm from 'features/goals/components/GoalForm';
import TransferToGoalForm from 'features/goals/components/TransferToGoalForm';
import PageContainer from 'shared/ui/PageContainer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../shared/utils/formatUtils';

const GoalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);

  const { data: goal, isLoading, error } = useGetGoalByIdQuery(id || '');
  const { data: accounts } = useGetAccountsQuery();
  const [archiveGoal, { isLoading: isArchiving }] = useArchiveGoalMutation();
  const [restoreGoal, { isLoading: isRestoring }] = useRestoreGoalMutation();

  const handleBackClick = () => {
    navigate('/goals');
  };

  const handleEditClick = () => {
    setShowEditForm(true);
  };

  const handleTransferClick = () => {
    setShowTransferForm(true);
  };

  const handleCloseForm = () => {
    setShowEditForm(false);
    setShowTransferForm(false);
  };

  const handleArchiveClick = async () => {
    if (id) {
      try {
        await archiveGoal(id).unwrap();
      } catch (error) {
        console.error('Ошибка при архивации цели:', error);
      }
    }
  };

  const handleRestoreClick = async () => {
    if (id) {
      try {
        await restoreGoal(id).unwrap();
      } catch (error) {
        console.error('Ошибка при восстановлении цели:', error);
      }
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Завершена';
      case 'active':
        return 'Активна';
      case 'cancelled':
        return 'Отменена';
      case 'archived':
        return 'В архиве';
      default:
        return status;
    }
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'info' | 'error' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'active':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts?.find(acc => acc.id === accountId);
    return account ? account.name : 'Неизвестный счет';
  };

  if (isLoading) {
    return (
      <PageContainer title="Загрузка...">
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={50} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </Box>
      </PageContainer>
    );
  }

  if (error || !goal) {
    return (
      <PageContainer title="Ошибка">
        <Typography color="error" sx={{ p: 3 }}>
          Цель не найдена или произошла ошибка при загрузке данных.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
          Вернуться к списку целей
        </Button>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={goal.name}
      action={
        goal.status === 'active'
          ? {
              label: 'Пополнить',
              icon: <AddIcon />,
              onClick: handleTransferClick,
            }
          : undefined
      }
    >
      <Box sx={{ p: 3 }}>
        {/* Навигация */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBackClick} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              color="inherit"
              onClick={handleBackClick}
              sx={{ cursor: 'pointer' }}
            >
              Цели
            </Link>
            <Typography color="text.primary">{goal.name}</Typography>
          </Breadcrumbs>
        </Box>

        {/* Статус и действия */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Chip
              label={getStatusText(goal.status)}
              color={getStatusColor(goal.status)}
              sx={{ mr: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Привязан к счету: {getAccountName(goal.accountId)}
            </Typography>
          </Box>

          <Box>
            {goal.status === 'active' && (
              <>
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={handleEditClick}
                  sx={{ mr: 1 }}
                >
                  Редактировать
                </Button>
                <Button
                  startIcon={<ArchiveIcon />}
                  variant="outlined"
                  color="warning"
                  onClick={handleArchiveClick}
                  disabled={isArchiving}
                >
                  {isArchiving ? <CircularProgress size={24} /> : 'В архив'}
                </Button>
              </>
            )}
            {goal.status === 'archived' && (
              <Button
                startIcon={<UnarchiveIcon />}
                variant="outlined"
                color="secondary"
                onClick={handleRestoreClick}
                disabled={isRestoring}
              >
                {isRestoring ? <CircularProgress size={24} /> : 'Восстановить'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Прогресс цели */}
        <GoalProgress goal={goal} />

        {/* История переводов */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            История пополнений
          </Typography>

          {goal.transferHistory.length > 0 ? (
            <List>
              {goal.transferHistory.map((transfer, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" color="primary">
                          {formatNumber(transfer.amount)} ₽
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            component="span"
                          >
                            {format(
                              new Date(transfer.date),
                              'dd MMMM yyyy, HH:mm',
                              { locale: ru }
                            )}
                          </Typography>
                          <br />
                          <Typography variant="body2" component="span">
                            Со счета: {getAccountName(transfer.fromAccountId)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  {index < goal.transferHistory.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Пока нет пополнений для этой цели.
            </Typography>
          )}
        </Paper>
      </Box>

      {showEditForm && <GoalForm goal={goal} onClose={handleCloseForm} />}
      {showTransferForm && (
        <TransferToGoalForm goal={goal} onClose={handleCloseForm} />
      )}
    </PageContainer>
  );
};

export default GoalDetails;

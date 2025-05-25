import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../shared/utils/formatUtils';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import RestoreIcon from '@mui/icons-material/Restore';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CategoryIcon from '@mui/icons-material/Category';
import ReplayIcon from '@mui/icons-material/Replay';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';

import PageContainer from '../shared/ui/PageContainer';
import PaymentHistory from '../entities/subscription/ui/PaymentHistory';
import SubscriptionForm from '../features/subscriptions/components/SubscriptionForm';
import PaymentForm from '../features/subscriptions/components/PaymentForm';

import {
  useGetSubscriptionByIdQuery,
  useUpdateSubscriptionMutation,
  useArchiveSubscriptionMutation,
  useRestoreSubscriptionMutation,
  useChangeStatusMutation,
  useMakePaymentMutation,
} from '../entities/subscription/api/subscriptionApi';
import {
  SubscriptionFrequency,
  SubscriptionStatus,
} from '../entities/subscription/model/types';

const SubscriptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // API hooks
  const {
    data: subscription,
    isLoading,
    error,
  } = useGetSubscriptionByIdQuery(id || '');
  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [archiveSubscription] = useArchiveSubscriptionMutation();
  const [restoreSubscription] = useRestoreSubscriptionMutation();
  const [changeStatus] = useChangeStatusMutation();
  const [makePayment] = useMakePaymentMutation();

  // Handlers
  const handleBackClick = () => {
    navigate('/subscriptions');
  };

  const handleEditClick = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleOpenPaymentForm = () => {
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
  };

  const handleArchiveClick = async () => {
    if (!subscription) return;

    try {
      await archiveSubscription(subscription.id).unwrap();
    } catch (error) {
      console.error('Failed to archive subscription:', error);
    }
  };

  const handleRestoreClick = async () => {
    if (!subscription) return;

    try {
      await restoreSubscription(subscription.id).unwrap();
    } catch (error) {
      console.error('Failed to restore subscription:', error);
    }
  };

  const handleChangeStatus = async (status: SubscriptionStatus) => {
    if (!subscription) return;

    try {
      await changeStatus({ id: subscription.id, status }).unwrap();
    } catch (error) {
      console.error(
        `Failed to change subscription status to ${status}:`,
        error
      );
    }
  };

  const handleSubmitPayment = async (paymentData: any) => {
    if (!subscription) return;

    try {
      const response = await makePayment({
        id: subscription.id,
        data: paymentData,
      }).unwrap();

      return response;
    } catch (error) {
      console.error('Failed to make payment:', error);
      throw error;
    }
  };

  const handleSubmitSubscription = async (subscriptionData: any) => {
    if (!subscription) return;

    try {
      await updateSubscription({
        id: subscription.id,
        data: subscriptionData,
      }).unwrap();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  // Helper functions
  const getFrequencyLabel = (
    frequency: SubscriptionFrequency,
    customDays?: number
  ): string => {
    switch (frequency) {
      case 'weekly':
        return 'Еженедельно';
      case 'biweekly':
        return 'Раз в 2 недели';
      case 'monthly':
        return 'Ежемесячно';
      case 'quarterly':
        return 'Ежеквартально';
      case 'yearly':
        return 'Ежегодно';
      case 'custom':
        return customDays ? `Каждые ${customDays} дн.` : 'Пользовательский';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusProps = (
    status: SubscriptionStatus
  ): { color: 'success' | 'info' | 'error' | 'default'; label: string } => {
    switch (status) {
      case 'active':
        return { color: 'success', label: 'Активна' };
      case 'paused':
        return { color: 'info', label: 'Приостановлена' };
      case 'cancelled':
        return { color: 'error', label: 'Отменена' };
      case 'archived':
        return { color: 'default', label: 'В архиве' };
      default:
        return { color: 'default', label: 'Неизвестно' };
    }
  };

  const getAccountName = (accountId: string) => {
    if (typeof accountId === 'string') {
      return accountId;
    }
    return (accountId as any)?.name || 'Счет';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Не указана';
    if (typeof categoryId === 'string') {
      return categoryId;
    }
    return (categoryId as any)?.name || 'Категория';
  };

  if (isLoading) {
    return (
      <PageContainer title="Загрузка...">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !subscription) {
    return (
      <PageContainer title="Ошибка">
        <Alert severity="error" sx={{ mb: 3 }}>
          Не удалось загрузить данные подписки
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBackClick}>
          Вернуться к подпискам
        </Button>
      </PageContainer>
    );
  }

  const statusProps = getStatusProps(subscription.status as SubscriptionStatus);
  const isArchived = subscription.status === 'archived';
  const isPaused = subscription.status === 'paused';
  const isCancelled = subscription.status === 'cancelled';
  const isActive = subscription.status === 'active';

  return (
    <PageContainer
      title={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            onClick={handleBackClick}
            sx={{ mr: 2 }}
            aria-label="назад"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{subscription.name}</Typography>
          <Chip
            label={statusProps.label}
            color={statusProps.color}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
      }
      action={{
        label: isArchived ? 'Восстановить' : 'Редактировать',
        icon: isArchived ? <RestoreIcon /> : <EditIcon />,
        onClick: isArchived ? handleRestoreClick : handleEditClick,
      }}
    >
      <Grid container spacing={3}>
        {/* Main info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                {formatNumber(subscription.amount)} {subscription.currency}
              </Typography>

              {subscription.description && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body1" color="text.secondary">
                    {subscription.description}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <ReplayIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body2">
                      <strong>Периодичность:</strong>{' '}
                      {getFrequencyLabel(
                        subscription.frequency as SubscriptionFrequency,
                        subscription.customFrequencyDays
                      )}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarTodayIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body2">
                      <strong>Дата следующего платежа:</strong>{' '}
                      {format(
                        new Date(subscription.nextPaymentDate),
                        'dd MMMM yyyy',
                        { locale: ru }
                      )}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarTodayIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body2">
                      <strong>Дата начала:</strong>{' '}
                      {format(
                        new Date(subscription.startDate),
                        'dd MMMM yyyy',
                        { locale: ru }
                      )}
                    </Typography>
                  </Box>
                </Grid>

                {subscription.endDate && (
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}
                    >
                      <CalendarTodayIcon
                        fontSize="small"
                        sx={{ mr: 1, color: 'primary.main' }}
                      />
                      <Typography variant="body2">
                        <strong>Дата окончания:</strong>{' '}
                        {format(
                          new Date(subscription.endDate),
                          'dd MMMM yyyy',
                          { locale: ru }
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AccountBalanceIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body2">
                      <strong>Счет списания:</strong>{' '}
                      {getAccountName(subscription.accountId)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CategoryIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body2">
                      <strong>Категория:</strong>{' '}
                      {getCategoryName(subscription.categoryId)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <ReplayIcon
                      fontSize="small"
                      sx={{ mr: 1, color: 'primary.main' }}
                    />
                    <Typography variant="body2">
                      <strong>Автоматический платеж:</strong>{' '}
                      {subscription.autoPayment ? 'Да' : 'Нет'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {!isArchived && (
            <Paper sx={{ mt: 3, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Действия
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {isActive && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PaymentIcon />}
                      onClick={handleOpenPaymentForm}
                    >
                      Записать платеж
                    </Button>

                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<PauseCircleOutlineIcon />}
                      onClick={() => handleChangeStatus('paused')}
                    >
                      Приостановить
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => handleChangeStatus('cancelled')}
                    >
                      Отменить
                    </Button>
                  </>
                )}

                {(isPaused || isCancelled) && (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => handleChangeStatus('active')}
                  >
                    Активировать
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<ArchiveIcon />}
                  onClick={handleArchiveClick}
                >
                  Архивировать
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>

        {/* Payment history */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <PaymentHistory subscription={subscription} />
          </Paper>
        </Grid>
      </Grid>

      {/* Forms */}
      {showForm && (
        <SubscriptionForm
          subscription={subscription}
          open={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitSubscription}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          subscription={subscription}
          open={showPaymentForm}
          onClose={handleClosePaymentForm}
          onSubmit={handleSubmitPayment}
        />
      )}
    </PageContainer>
  );
};

export default SubscriptionDetails;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../shared/utils/formatUtils';

import PageContainer from '../shared/ui/PageContainer';
import SubscriptionCard from '../entities/subscription/ui/SubscriptionCard';
import SubscriptionForm from '../features/subscriptions/components/SubscriptionForm';
import PaymentForm from '../features/subscriptions/components/PaymentForm';
import SubscriptionAnalytics from '../features/subscriptions/components/SubscriptionAnalytics';

import {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useArchiveSubscriptionMutation,
  useRestoreSubscriptionMutation,
  useChangeStatusMutation,
  useMakePaymentMutation,
  useGetUpcomingPaymentsQuery,
  useGetSubscriptionStatsQuery,
} from '../entities/subscription/api/subscriptionApi';
import {
  Subscription,
  SubscriptionStatus,
} from '../entities/subscription/model/types';

const Subscriptions: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [showForm, setShowForm] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [pageTab, setPageTab] = useState<'list' | 'analytics'>('list');

  // API hooks
  const { data, isLoading, error } = useGetSubscriptionsQuery({
    status: filter === 'active' ? 'active,paused' : 'archived',
  });

  // Отладка для понимания что приходит с API
  console.log('Subscriptions page data:', { data, isLoading, error, filter });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGetSubscriptionStatsQuery();
  const { data: upcomingPayments } = useGetUpcomingPaymentsQuery();

  const [createSubscription] = useCreateSubscriptionMutation();
  const [updateSubscription] = useUpdateSubscriptionMutation();
  const [archiveSubscription] = useArchiveSubscriptionMutation();
  const [restoreSubscription] = useRestoreSubscriptionMutation();
  const [changeStatus] = useChangeStatusMutation();
  const [makePayment] = useMakePaymentMutation();

  // Handlers
  const handleOpenForm = () => {
    setSelectedSubscription(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleOpenPaymentForm = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowForm(true);
  };

  const handleArchiveSubscription = async (subscription: Subscription) => {
    try {
      await archiveSubscription(subscription.id).unwrap();
    } catch (error) {
      console.error('Failed to archive subscription:', error);
    }
  };

  const handleRestoreSubscription = async (subscription: Subscription) => {
    try {
      await restoreSubscription(subscription.id).unwrap();
    } catch (error) {
      console.error('Failed to restore subscription:', error);
    }
  };

  const handleChangeSubscriptionStatus = async (
    subscription: Subscription,
    status: SubscriptionStatus
  ) => {
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
    if (!selectedSubscription) return;

    try {
      const response = await makePayment({
        id: selectedSubscription.id,
        data: paymentData,
      }).unwrap();

      return response;
    } catch (error) {
      console.error('Failed to make payment:', error);
      throw error;
    }
  };

  const handleSubmitSubscription = async (subscriptionData: any) => {
    try {
      if (selectedSubscription) {
        // Обновление
        await updateSubscription({
          id: selectedSubscription.id,
          data: subscriptionData,
        }).unwrap();
      } else {
        // Создание
        await createSubscription(subscriptionData).unwrap();
      }
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save subscription:', error);
    }
  };

  const handleSubscriptionClick = (subscription: Subscription) => {
    navigate(`/subscriptions/${subscription.id}`);
  };

  const handleFilterChange = (
    event: React.SyntheticEvent,
    newValue: 'active' | 'archived'
  ) => {
    setFilter(newValue);
  };

  const handlePageTabChange = (
    event: React.SyntheticEvent,
    newValue: 'list' | 'analytics'
  ) => {
    setPageTab(newValue);
  };

  // Format for monthly cost
  const formatMonthlyCost = (amount: number) => {
    return `${formatNumber(amount)} ₽/мес.`;
  };

  // Custom component for upcoming payments list
  const UpcomingPaymentsList = () => {
    if (!upcomingPayments || upcomingPayments.length === 0) {
      return (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ p: 2, textAlign: 'center' }}
        >
          Нет предстоящих платежей
        </Typography>
      );
    }

    return (
      <List dense>
        {upcomingPayments.map(subscription => (
          <ListItem
            key={subscription.id}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
            onClick={() => handleSubscriptionClick(subscription)}
          >
            <ListItemIcon>
              <CalendarTodayIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={subscription.name}
              secondary={format(
                new Date(subscription.nextPaymentDate),
                'dd MMM yyyy',
                { locale: ru }
              )}
            />
            <Typography variant="body2" color="text.secondary">
              {formatNumber(subscription.amount)} ₽
            </Typography>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <PageContainer
      title="Подписки"
      action={{
        label: 'Добавить',
        icon: <AddIcon />,
        onClick: handleOpenForm,
      }}
    >
      {/* Главные вкладки (список/аналитика) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={pageTab}
          onChange={handlePageTabChange}
          aria-label="subscription page tabs"
        >
          <Tab
            icon={<ListAltIcon />}
            iconPosition="start"
            label="Список"
            value="list"
          />
          <Tab
            icon={<InsightsIcon />}
            iconPosition="start"
            label="Аналитика"
            value="analytics"
          />
        </Tabs>
      </Box>

      {/* Список подписок */}
      {pageTab === 'list' && (
        <Grid container spacing={3}>
          {/* Left sidebar with stats */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Сводка
              </Typography>

              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">Активных подписок:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statsData?.activeCount || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">Приостановленных:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {statsData?.pausedCount || 0}
                </Typography>
              </Box>
              <Box
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
              >
                <Typography variant="body2">Ежемесячно:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {formatMonthlyCost(statsData?.totalMonthly || 0)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">В год:</Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {formatMonthlyCost(statsData?.totalYearly || 0)}
                </Typography>
              </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Предстоящие платежи
              </Typography>
              <UpcomingPaymentsList />
            </Paper>
          </Grid>

          {/* Main content */}
          <Grid item xs={12} md={8} lg={9}>
            <Box sx={{ mb: 2 }}>
              <Tabs value={filter} onChange={handleFilterChange}>
                <Tab label="Активные" value="active" />
                <Tab label="Архив" value="archived" />
              </Tabs>
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">
                Произошла ошибка при загрузке подписок
              </Alert>
            ) : data &&
              Array.isArray(data.subscriptions) &&
              data.subscriptions.length > 0 ? (
              <Grid container spacing={2} alignItems="stretch">
                {data.subscriptions.map(subscription => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={6}
                    lg={4}
                    key={subscription.id}
                    sx={{ display: 'flex', height: '100%' }}
                  >
                    <Box
                      sx={{ width: '100%', height: '100%', display: 'flex' }}
                    >
                      <SubscriptionCard
                        subscription={subscription}
                        onEdit={() => handleEditSubscription(subscription)}
                        onArchive={() =>
                          handleArchiveSubscription(subscription)
                        }
                        onRestore={() =>
                          handleRestoreSubscription(subscription)
                        }
                        onChangeStatus={(
                          subscription: Subscription,
                          status: SubscriptionStatus
                        ) =>
                          handleChangeSubscriptionStatus(subscription, status)
                        }
                        onPayment={() => handleOpenPaymentForm(subscription)}
                        onClick={() => handleSubscriptionClick(subscription)}
                        sx={{
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  {filter === 'active'
                    ? 'У вас пока нет активных подписок. Добавьте первую подписку!'
                    : 'В архиве нет подписок.'}
                </Typography>
                {filter === 'active' && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenForm}
                    sx={{ mt: 2 }}
                  >
                    Добавить подписку
                  </Button>
                )}
              </Box>
            )}
          </Grid>
        </Grid>
      )}

      {/* Аналитика подписок */}
      {pageTab === 'analytics' && <SubscriptionAnalytics />}

      {/* Диалоговые окна */}
      {showForm && (
        <SubscriptionForm
          open={showForm}
          onClose={handleCloseForm}
          onSubmit={handleSubmitSubscription}
          subscription={selectedSubscription}
        />
      )}

      {showPaymentForm && selectedSubscription && (
        <PaymentForm
          open={showPaymentForm}
          onClose={handleClosePaymentForm}
          onSubmit={handleSubmitPayment}
          subscription={selectedSubscription}
        />
      )}
    </PageContainer>
  );
};

export default Subscriptions;

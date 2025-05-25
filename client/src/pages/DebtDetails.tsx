import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import PageContainer from 'shared/ui/PageContainer';
import DebtForm from 'features/debts/components/DebtForm';
import PaymentForm from 'features/debts/components/PaymentForm';
import PaymentHistory from 'entities/debt/ui/PaymentHistory';
import { DebtType, DebtStatus } from 'entities/debt/model/types';
import {
  useGetDebtByIdQuery,
  useUpdateDebtMutation,
  useArchiveDebtMutation,
  useRestoreDebtMutation,
  useMakePaymentMutation,
} from 'entities/debt/api/debtApi';
import { useGetAccountByIdQuery } from 'entities/account/api/accountApi';

const DebtDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  const {
    data: debt,
    isLoading,
    error,
  } = useGetDebtByIdQuery(id || '', { skip: !id });

  const { data: linkedAccount } = useGetAccountByIdQuery(
    debt?.linkedAccountId || '',
    { skip: !debt?.linkedAccountId }
  );

  const [updateDebt] = useUpdateDebtMutation();
  const [archiveDebt] = useArchiveDebtMutation();
  const [restoreDebt] = useRestoreDebtMutation();
  const [makePayment] = useMakePaymentMutation();

  const handleBackClick = () => {
    navigate('/debts');
  };

  const handleEditClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleOpenPaymentForm = () => {
    setIsPaymentFormOpen(true);
  };

  const handleClosePaymentForm = () => {
    setIsPaymentFormOpen(false);
  };

  const handleArchiveClick = async () => {
    if (!id) return;

    try {
      await archiveDebt(id).unwrap();
    } catch (error) {
      console.error('Failed to archive debt:', error);
    }
  };

  const handleRestoreClick = async () => {
    if (!id) return;

    try {
      await restoreDebt(id).unwrap();
    } catch (error) {
      console.error('Failed to restore debt:', error);
    }
  };

  const handleUpdateDebt = async (debtData: any) => {
    if (!id) return;

    try {
      await updateDebt({
        id,
        data: debtData,
      }).unwrap();
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to update debt:', error);
    }
  };

  const handleMakePayment = async (paymentData: any) => {
    if (!id) return;

    try {
      await makePayment({
        id,
        data: paymentData,
      }).unwrap();
      setIsPaymentFormOpen(false);
    } catch (error) {
      console.error('Failed to make payment:', error);
    }
  };

  // Функция для получения иконки типа долга
  const getDebtIcon = (type: DebtType) => {
    switch (type) {
      case 'credit':
        return <BankIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
      case 'loan':
        return <PaymentIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
      case 'creditCard':
        return <CreditCardIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
      case 'personalDebt':
        return <PersonIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
      default:
        return <BankIcon sx={{ fontSize: 48, color: 'primary.main' }} />;
    }
  };

  // Функция для получения текстового названия типа долга
  const getDebtTypeLabel = (type: DebtType): string => {
    switch (type) {
      case 'credit':
        return 'Кредит';
      case 'loan':
        return 'Займ';
      case 'creditCard':
        return 'Кредитная карта';
      case 'personalDebt':
        return 'Личный долг';
      default:
        return 'Долг';
    }
  };

  // Функция для получения цвета и текста для статуса
  const getStatusProps = (
    status: DebtStatus
  ): { color: 'success' | 'info' | 'error' | 'default'; label: string } => {
    switch (status) {
      case 'active':
        return { color: 'info', label: 'Активен' };
      case 'paid':
        return { color: 'success', label: 'Погашен' };
      case 'defaulted':
        return { color: 'error', label: 'Просрочен' };
      case 'archived':
        return { color: 'default', label: 'В архиве' };
      default:
        return { color: 'default', label: 'Неизвестно' };
    }
  };

  // Функция для форматирования частоты платежей
  const getPaymentFrequencyLabel = (frequency: string): string => {
    switch (frequency) {
      case 'weekly':
        return 'Еженедельно';
      case 'biweekly':
        return 'Раз в две недели';
      case 'monthly':
        return 'Ежемесячно';
      case 'quarterly':
        return 'Ежеквартально';
      case 'custom':
        return 'Другое';
      default:
        return frequency;
    }
  };

  // Прогресс погашения долга в процентах
  const calculateProgress = () => {
    if (!debt) return 0;
    return 100 - (debt.currentAmount / debt.initialAmount) * 100;
  };

  if (isLoading) {
    return (
      <PageContainer title="Загрузка данных...">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !debt) {
    return (
      <PageContainer title="Ошибка">
        <Alert severity="error" sx={{ mt: 2 }}>
          Долг не найден или произошла ошибка при загрузке
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Вернуться к списку долгов
        </Button>
      </PageContainer>
    );
  }

  const statusProps = getStatusProps(debt.status);
  const isArchived = debt.status === 'archived';
  const isPaid = debt.status === 'paid';
  const progressPercent = calculateProgress();

  return (
    <PageContainer
      title={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            onClick={handleBackClick}
            sx={{ mr: 1 }}
            aria-label="назад"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            {debt.name}
          </Typography>
        </Box>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ mr: 2 }}>{getDebtIcon(debt.type)}</Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box>
                      <Typography variant="h5" component="h1">
                        {debt.name}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {getDebtTypeLabel(debt.type)}
                        {debt.lenderName && ` — ${debt.lenderName}`}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusProps.label}
                      color={statusProps.color}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Начальная сумма
                  </Typography>
                  <Typography variant="h6">
                    {debt.initialAmount.toLocaleString()} ₽
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Текущий остаток
                  </Typography>
                  <Typography
                    variant="h6"
                    color={isPaid ? 'success.main' : undefined}
                  >
                    {debt.currentAmount.toLocaleString()} ₽
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Прогресс погашения
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 8,
                        width: '100%',
                        bgcolor: 'background.paper',
                        borderRadius: 5,
                        mr: 1,
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          bgcolor: 'primary.main',
                          borderRadius: 5,
                          width: `${progressPercent}%`,
                          transition: 'width 0.5s ease-in-out',
                        }}
                      />
                    </Box>
                    <Typography variant="body2">
                      {progressPercent.toFixed(0)}%
                    </Typography>
                  </Box>
                </Grid>

                {debt.interestRate > 0 && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Процентная ставка
                    </Typography>
                    <Typography variant="body1">
                      {debt.interestRate}%
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Дата открытия
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(debt.startDate), 'PPP', { locale: ru })}
                  </Typography>
                </Grid>

                {debt.endDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Дата закрытия
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(debt.endDate), 'PPP', { locale: ru })}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Частота платежей
                  </Typography>
                  <Typography variant="body1">
                    {getPaymentFrequencyLabel(debt.paymentFrequency)}
                  </Typography>
                </Grid>

                {debt.nextPaymentDate && debt.status === 'active' && (
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, bgcolor: theme.palette.background.default }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2">
                            Следующий платеж:{' '}
                            {format(new Date(debt.nextPaymentDate), 'PPP', {
                              locale: ru,
                            })}
                          </Typography>
                          {debt.nextPaymentAmount && (
                            <Typography variant="body2" color="text.secondary">
                              Сумма: {debt.nextPaymentAmount.toLocaleString()} ₽
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {linkedAccount && (
                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, bgcolor: theme.palette.background.default }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCardIcon color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="subtitle2">
                            Привязанный счет: {linkedAccount.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Баланс: {linkedAccount.balance.toLocaleString()} ₽
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: 1,
                }}
              >
                {!isArchived && !isPaid && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PaymentIcon />}
                    onClick={handleOpenPaymentForm}
                  >
                    Внести платеж
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  disabled={isArchived}
                >
                  Редактировать
                </Button>

                {isArchived ? (
                  <Button
                    variant="outlined"
                    startIcon={<UnarchiveIcon />}
                    onClick={handleRestoreClick}
                  >
                    Восстановить
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ArchiveIcon />}
                    onClick={handleArchiveClick}
                  >
                    В архив
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <PaymentHistory debt={debt} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <TimelineIcon sx={{ mr: 1 }} />
                Статистика долга
              </Typography>

              <List disablePadding>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Общая сумма выплат"
                    secondary={
                      debt.paymentHistory
                        .reduce((sum, payment) => sum + payment.amount, 0)
                        .toLocaleString() + ' ₽'
                    }
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Прогресс погашения"
                    secondary={`${progressPercent.toFixed(0)}%`}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Осталось выплатить"
                    secondary={`${debt.currentAmount.toLocaleString()} ₽`}
                  />
                </ListItem>

                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Количество платежей"
                    secondary={debt.paymentHistory.length}
                  />
                </ListItem>

                {debt.status === 'active' && debt.nextPaymentAmount && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Рекомендуемый платеж"
                      secondary={`${debt.nextPaymentAmount.toLocaleString()} ₽`}
                    />
                  </ListItem>
                )}

                {debt.interestRate > 0 && debt.currentAmount > 0 && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Ориентировочная переплата"
                      secondary={`${(
                        (debt.currentAmount * debt.interestRate) /
                        100
                      ).toFixed(2)} ₽ / год`}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isFormOpen && (
        <DebtForm
          debt={debt}
          onClose={handleCloseForm}
          onSubmit={handleUpdateDebt}
        />
      )}

      {isPaymentFormOpen && (
        <PaymentForm
          debt={debt}
          onClose={handleClosePaymentForm}
          onSubmit={handleMakePayment}
        />
      )}
    </PageContainer>
  );
};

export default DebtDetails;

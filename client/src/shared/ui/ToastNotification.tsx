import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Button,
  Stack,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useGetUpcomingPaymentsQuery } from '../../entities/subscription/api/subscriptionApi';
import { differenceInDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../utils/formatUtils';

interface ToastNotificationProps {
  onPaymentClick: (subscriptionId: string) => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  onPaymentClick,
}) => {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState<string[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const navigate = useNavigate();

  const { data: upcomingPayments } = useGetUpcomingPaymentsQuery();

  // Проверяем наличие платежей, которые должны произойти сегодня или завтра
  useEffect(() => {
    if (!upcomingPayments || upcomingPayments.length === 0) return;

    // Находим платежи на сегодня/завтра, которые еще не были показаны
    const today = new Date();
    const urgent = upcomingPayments.filter(subscription => {
      const paymentDate = new Date(subscription.nextPaymentDate);
      const days = differenceInDays(paymentDate, today);
      return days <= 1 && days >= 0 && !shown.includes(subscription.id);
    });

    if (urgent.length > 0) {
      // Показываем только первый из них
      setCurrentSubscription(urgent[0]);
      setOpen(true);
      setShown(prev => [...prev, urgent[0].id]);
    }
  }, [upcomingPayments, shown]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setCurrentSubscription(null);
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/subscriptions');
  };

  // Если нет текущего платежа или не открыто уведомление, не показываем ничего
  if (!currentSubscription || !open) {
    return null;
  }

  const today = new Date();
  const daysLeft = differenceInDays(
    new Date(currentSubscription.nextPaymentDate),
    today
  );

  const message =
    daysLeft === 0
      ? `Сегодня платеж по подписке "${currentSubscription.name}"`
      : `Завтра платеж по подписке "${currentSubscription.name}"`;

  return (
    <Snackbar
      open={open}
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity="warning"
        variant="filled"
        sx={{ width: '100%', mb: 2 }}
        action={
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                handleClose();
                onPaymentClick(currentSubscription.id);
              }}
            >
              Оплатить
            </Button>
            <IconButton size="small" color="inherit" onClick={handleClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      >
        <Typography variant="subtitle2">{message}</Typography>
        <Typography variant="body2">
          Сумма: {formatNumber(currentSubscription.amount)}{' '}
          {currentSubscription.currency}, дата:{' '}
          {format(new Date(currentSubscription.nextPaymentDate), 'dd MMMM', {
            locale: ru,
          })}
        </Typography>
        <Button
          color="inherit"
          size="small"
          onClick={handleViewAll}
          sx={{ mt: 1 }}
        >
          Все платежи
        </Button>
      </Alert>
    </Snackbar>
  );
};

export default ToastNotification;

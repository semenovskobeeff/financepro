import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../utils/formatUtils';
import { Subscription } from '../../entities/subscription/model/types';

interface SubscriptionNotificationProps {
  subscriptions: Subscription[];
  onClose: () => void;
  onPaymentClick: (subscription: Subscription) => void;
}

const SubscriptionNotification: React.FC<SubscriptionNotificationProps> = ({
  subscriptions,
  onClose,
  onPaymentClick,
}) => {
  const navigate = useNavigate();

  const getStatusText = (date: string) => {
    const today = new Date();
    const paymentDate = new Date(date);
    const daysLeft = differenceInDays(paymentDate, today);

    if (daysLeft < 0) {
      return {
        text: 'Просрочено',
        color: 'error' as 'error',
      };
    } else if (daysLeft === 0) {
      return {
        text: 'Сегодня',
        color: 'warning' as 'warning',
      };
    } else if (daysLeft <= 2) {
      return {
        text: `Через ${daysLeft} ${daysLeft === 1 ? 'день' : 'дня'}`,
        color: 'warning' as 'warning',
      };
    } else {
      return {
        text: `Через ${daysLeft} дней`,
        color: 'info' as 'info',
      };
    }
  };

  const handleViewAllClick = () => {
    navigate('/subscriptions');
    onClose();
  };

  if (subscriptions.length === 0) {
    return (
      <Card sx={{ minWidth: 300, maxWidth: 400 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6" component="div">
              Уведомления
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Alert severity="info">Нет предстоящих платежей по подпискам</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ minWidth: 300, maxWidth: 400 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NotificationsIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Предстоящие платежи
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <List dense sx={{ mb: 2 }}>
          {subscriptions.map(subscription => {
            const status = getStatusText(subscription.nextPaymentDate);

            return (
              <ListItem
                key={subscription.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onPaymentClick(subscription)}
                    title="Оплатить"
                  >
                    <PaymentIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <SubscriptionsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={subscription.name}
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" component="span">
                        {formatNumber(subscription.amount)}{' '}
                        {subscription.currency}
                      </Typography>
                      <br />
                      <Typography variant="body2" component="span">
                        {format(
                          new Date(subscription.nextPaymentDate),
                          'dd MMMM',
                          { locale: ru }
                        )}
                      </Typography>
                    </React.Fragment>
                  }
                />
                <Chip
                  label={status.text}
                  color={status.color}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="outlined" size="small" onClick={handleViewAllClick}>
            Просмотреть все
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SubscriptionNotification;

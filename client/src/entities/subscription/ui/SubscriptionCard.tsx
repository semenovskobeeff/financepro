import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  CardActionArea,
  SxProps,
  Theme,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentIcon from '@mui/icons-material/Payment';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import WeekendIcon from '@mui/icons-material/Weekend';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../../../shared/utils/formatUtils';
import {
  Subscription,
  SubscriptionFrequency,
  SubscriptionStatus,
} from '../model/types';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit?: (subscription: Subscription) => void;
  onArchive?: (subscription: Subscription) => void;
  onRestore?: (subscription: Subscription) => void;
  onChangeStatus?: (
    subscription: Subscription,
    status: SubscriptionStatus
  ) => void;
  onPayment?: (subscription: Subscription) => void;
  onClick?: (subscription: Subscription) => void;
  sx?: SxProps<Theme>;
}

const getFrequencyIcon = (frequency: SubscriptionFrequency) => {
  switch (frequency) {
    case 'weekly':
      return <AutorenewIcon fontSize="small" />;
    case 'biweekly':
      return <AutorenewIcon fontSize="small" />;
    case 'monthly':
      return <CalendarTodayIcon fontSize="small" />;
    case 'quarterly':
      return <CalendarTodayIcon fontSize="small" />;
    case 'yearly':
      return <CalendarTodayIcon fontSize="small" />;
    case 'custom':
      return <AutorenewIcon fontSize="small" />;
    default:
      return <AutorenewIcon fontSize="small" />;
  }
};

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

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onArchive,
  onRestore,
  onChangeStatus,
  onPayment,
  onClick,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onEdit) {
      onEdit(subscription);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onArchive) {
      onArchive(subscription);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onRestore) {
      onRestore(subscription);
    }
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onChangeStatus) {
      onChangeStatus(subscription, 'paused');
    }
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onChangeStatus) {
      onChangeStatus(subscription, 'active');
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onChangeStatus) {
      onChangeStatus(subscription, 'cancelled');
    }
  };

  const handlePayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onPayment) {
      onPayment(subscription);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(subscription);
    }
  };

  const { status } = subscription;
  const statusProps = getStatusProps(status as SubscriptionStatus);
  const isArchived = status === 'archived';
  const isPaused = status === 'paused';
  const isCancelled = status === 'cancelled';
  const isActive = status === 'active';

  return (
    <Card
      sx={{
        mb: 2,
        opacity: isArchived || isCancelled ? 0.7 : 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        ...(sx || {}),
      }}
    >
      <Box
        sx={{
          position: 'relative',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardActionArea
          onClick={handleCardClick}
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            height: '100%',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <CardContent
            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
                pr: 4,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SubscriptionsIcon
                  sx={{
                    mr: 1,
                    color: isArchived ? 'text.disabled' : 'primary.main',
                  }}
                />
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ fontWeight: 500 }}
                >
                  {subscription.name}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  size="small"
                  label={statusProps.label}
                  color={statusProps.color}
                />
              </Box>
            </Box>

            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color:
                  isArchived || isCancelled ? 'text.secondary' : 'text.primary',
                fontWeight: 'bold',
              }}
            >
              {formatNumber(subscription.amount)} {subscription.currency}
            </Typography>

            {subscription.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                {subscription.description}
              </Typography>
            )}

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getFrequencyIcon(
                  subscription.frequency as SubscriptionFrequency
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 0.5 }}
                >
                  {getFrequencyLabel(
                    subscription.frequency as SubscriptionFrequency,
                    subscription.customFrequencyDays
                  )}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon fontSize="small" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 0.5 }}
                >
                  Следующий:{' '}
                  {format(
                    new Date(subscription.nextPaymentDate),
                    'dd MMM yyyy',
                    {
                      locale: ru,
                    }
                  )}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceIcon fontSize="small" />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 0.5 }}
                >
                  {subscription.accountId
                    ? typeof subscription.accountId === 'string'
                      ? subscription.accountId
                      : (subscription.accountId as any)?.name || 'Счет'
                    : 'Счет'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </CardActionArea>

        <IconButton
          aria-label="опции"
          onClick={handleClick}
          sx={{
            padding: 0.5,
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {!isArchived && <MenuItem onClick={handleEdit}>Редактировать</MenuItem>}

        {isActive && (
          <>
            <MenuItem onClick={handlePayment}>
              <PaymentIcon fontSize="small" sx={{ mr: 1 }} />
              Записать платеж
            </MenuItem>
            <MenuItem onClick={handlePause}>
              <PauseCircleOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              Приостановить
            </MenuItem>
            <MenuItem onClick={handleCancel}>
              <CancelIcon fontSize="small" sx={{ mr: 1 }} />
              Отменить
            </MenuItem>
          </>
        )}

        {isPaused && (
          <MenuItem onClick={handleActivate}>
            <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />
            Активировать
          </MenuItem>
        )}

        {isCancelled && (
          <MenuItem onClick={handleActivate}>
            <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />
            Возобновить
          </MenuItem>
        )}

        {!isArchived && (
          <MenuItem onClick={handleArchive}>
            <WeekendIcon fontSize="small" sx={{ mr: 1 }} />
            Архивировать
          </MenuItem>
        )}

        {isArchived && (
          <MenuItem onClick={handleRestore}>
            <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />
            Восстановить
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default SubscriptionCard;

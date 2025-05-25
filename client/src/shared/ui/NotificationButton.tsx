import React, { useState } from 'react';
import { IconButton, Badge, Popover, Tooltip, styled } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useGetUpcomingPaymentsQuery } from '../../entities/subscription/api/subscriptionApi';
import SubscriptionNotification from './SubscriptionNotification';
import { Subscription } from '../../entities/subscription/model/types';

interface NotificationButtonProps {
  onPaymentClick: (subscription: Subscription) => void;
}

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--icon-primary)',
  padding: 8,
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'var(--bg-accent)',
  },
  transition: 'var(--transition-default)',
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: 'var(--error-color)',
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    padding: '0 4px',
    minWidth: 18,
    height: 18,
  },
}));

const NotificationButton: React.FC<NotificationButtonProps> = ({
  onPaymentClick,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  // Получаем предстоящие платежи на 7 дней
  const { data: upcomingPayments, isLoading } = useGetUpcomingPaymentsQuery();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  // Считаем количество уведомлений
  const notificationCount =
    !isLoading && upcomingPayments ? upcomingPayments.length : 0;

  return (
    <>
      <Tooltip title="Уведомления">
        <StyledIconButton aria-describedby={id} onClick={handleClick}>
          <StyledBadge badgeContent={notificationCount} color="error">
            <NotificationsIcon fontSize="small" />
          </StyledBadge>
        </StyledIconButton>
      </Tooltip>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            boxShadow: 'var(--shadow)',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
          },
        }}
      >
        <SubscriptionNotification
          subscriptions={upcomingPayments || []}
          onClose={handleClose}
          onPaymentClick={subscription => {
            handleClose();
            onPaymentClick(subscription);
          }}
        />
      </Popover>
    </>
  );
};

export default NotificationButton;

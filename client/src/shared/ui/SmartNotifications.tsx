import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Notifications,
  Warning,
  Info,
  CheckCircle,
  Error,
  Close,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  category: string;
  read?: boolean;
}

interface SmartNotificationsProps {
  data: {
    hasData: boolean;
    notifications: Notification[];
    totalUnread: number;
    categories: Array<{ name: string; count: number; color: string }>;
    emptyMessage?: string;
  };
  onDismiss?: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  data,
  onDismiss,
  onAction,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'success':
        return <CheckCircle color="success" />;
      case 'info':
      default:
        return <Info color="info" />;
    }
  };

  if (!data.hasData) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Notifications sx={{ mr: 1 }} />
          <Typography variant="h6">Уведомления</Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={4}
        >
          {data.emptyMessage || 'Нет новых уведомлений'}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box display="flex" alignItems="center">
          <Badge badgeContent={data.totalUnread} color="error">
            <Notifications sx={{ mr: 1 }} />
          </Badge>
          <Typography variant="h6">Уведомления</Typography>
        </Box>

        <Box display="flex" gap={1}>
          {data.categories.map(category => (
            <Chip
              key={category.name}
              label={`${category.name} (${category.count})`}
              size="small"
              sx={{
                backgroundColor: category.color,
                color: 'white',
              }}
            />
          ))}
        </Box>
      </Box>

      <List>
        {data.notifications.slice(0, 5).map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItem
              sx={{
                borderRadius: 1,
                mb: 1,
                backgroundColor: notification.read
                  ? 'transparent'
                  : 'action.hover',
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
                primaryTypographyProps={{
                  fontWeight: notification.read ? 'normal' : 'bold',
                }}
              />
              {onDismiss && (
                <IconButton
                  size="small"
                  onClick={() => onDismiss(notification.id)}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </ListItem>
            {index < data.notifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      {data.notifications.length > 5 && (
        <Typography
          variant="body2"
          color="primary"
          textAlign="center"
          sx={{ mt: 2, cursor: 'pointer' }}
          onClick={() => onAction?.('view-all', 'notifications')}
        >
          Показать еще {data.notifications.length - 5} уведомлений
        </Typography>
      )}
    </Paper>
  );
};

export default SmartNotifications;

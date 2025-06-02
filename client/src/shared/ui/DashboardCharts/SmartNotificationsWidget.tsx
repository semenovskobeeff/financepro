import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Collapse,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Lightbulb as TipIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Notifications as NotificationIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { NotionCard } from '../NotionCard';
import { formatNumber } from '../../utils/formatUtils';

interface SmartNotification {
  id: string;
  type: 'tip' | 'warning' | 'success' | 'error' | 'info';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
  category:
    | 'spending'
    | 'saving'
    | 'goal'
    | 'debt'
    | 'subscription'
    | 'general';
  timestamp: string;
  amount?: number;
}

interface SmartNotificationsData {
  notifications: SmartNotification[];
  totalUnread: number;
  categories: Array<{
    name: string;
    count: number;
    color: string;
  }>;
}

interface SmartNotificationsWidgetProps {
  data: SmartNotificationsData;
  onDismiss?: (notificationId: string) => void;
  onAction?: (notificationId: string, action: string) => void;
  maxVisible?: number;
}

const SmartNotificationsWidget: React.FC<SmartNotificationsWidgetProps> = ({
  data,
  onDismiss,
  onAction,
  maxVisible = 5,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Фильтрация уведомлений
  const activeNotifications = data.notifications.filter(
    notif => !dismissedIds.has(notif.id)
  );

  const visibleNotifications = showAll
    ? activeNotifications
    : activeNotifications.slice(0, maxVisible);

  // Получение иконки для типа уведомления
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <TipIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'success':
        return <SuccessIcon />;
      case 'error':
        return <ErrorIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  // Получение цвета для типа уведомления
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'tip':
        return 'info';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Получение приоритета
  const getPriorityChip = (priority: string) => {
    const colors = {
      high: 'error',
      medium: 'warning',
      low: 'default',
    };

    const labels = {
      high: 'Важно',
      medium: 'Средне',
      low: 'Низко',
    };

    return (
      <Chip
        label={labels[priority as keyof typeof labels]}
        size="small"
        color={colors[priority as keyof typeof colors] as any}
        variant="outlined"
      />
    );
  };

  // Обработка отклонения уведомления
  const handleDismiss = (notificationId: string) => {
    setDismissedIds(prev => new Set([...prev, notificationId]));
    onDismiss?.(notificationId);
  };

  // Обработка действий
  const handleAction = (notification: SmartNotification) => {
    if (notification.action) {
      notification.action.onClick();
      onAction?.(notification.id, 'action');
    }
  };

  // Форматирование времени
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} дн. назад`;
    } else if (diffHours > 0) {
      return `${diffHours} ч. назад`;
    } else {
      return 'Только что';
    }
  };

  return (
    <NotionCard
      title="Умные уведомления"
      color="yellow"
      subtitle="Персонализированные рекомендации"
      badge={data.totalUnread.toString()}
    >
      {/* Категории уведомлений */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {data.categories.map((category, index) => (
            <Chip
              key={index}
              label={`${category.name} (${category.count})`}
              size="small"
              variant="outlined"
              sx={{
                backgroundColor: `${category.color}20`,
                borderColor: category.color,
                color: category.color,
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Список уведомлений */}
      {visibleNotifications.length > 0 ? (
        <List dense sx={{ p: 0 }}>
          {visibleNotifications.map((notification, index) => (
            <ListItem
              key={notification.id}
              sx={{
                px: 0,
                py: 1,
                borderRadius: 1,
                mb: 1,
                backgroundColor: 'rgba(0,0,0,0.02)',
                border: `1px solid ${
                  notification.priority === 'high'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(0,0,0,0.1)'
                }`,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: `${getNotificationColor(
                      notification.type
                    )}.main`,
                    color: '#fff',
                  }}
                >
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {notification.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getPriorityChip(notification.priority)}
                      {notification.dismissible && (
                        <IconButton
                          size="small"
                          onClick={() => handleDismiss(notification.id)}
                          sx={{ p: 0.5 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {notification.message}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.timestamp)}
                        {notification.amount && (
                          <span style={{ marginLeft: 8 }}>
                            • {formatNumber(notification.amount)} ₽
                          </span>
                        )}
                      </Typography>

                      {notification.action && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleAction(notification)}
                          sx={{ fontSize: '0.75rem', py: 0.5, px: 1 }}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <SuccessIcon color="success" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Отличная работа! Нет активных уведомлений
          </Typography>
        </Box>
      )}

      {/* Кнопка показать все */}
      {activeNotifications.length > maxVisible && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            onClick={() => setShowAll(!showAll)}
            endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            size="small"
            variant="text"
          >
            {showAll
              ? 'Скрыть'
              : `Показать еще ${activeNotifications.length - maxVisible}`}
          </Button>
        </Box>
      )}

      {/* Сводка по отклоненным */}
      {dismissedIds.size > 0 && (
        <Box
          sx={{
            mt: 2,
            p: 1,
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Отклонено уведомлений: {dismissedIds.size}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Tooltip title="Умные уведомления анализируют ваше финансовое поведение и предлагают персонализированные рекомендации.">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Обновляется в реальном времени
        </Typography>
      </Box>
    </NotionCard>
  );
};

export default SmartNotificationsWidget;

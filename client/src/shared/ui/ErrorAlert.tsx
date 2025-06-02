import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  NetworkCheck as NetworkIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';
import { config } from '../../config/environment';

interface ErrorAlertProps {
  error: string;
  originalError?: any;
  showTitle?: boolean;
  showDetails?: boolean;
  showMockSwitch?: boolean;
  onSwitchToMocks?: () => void;
  sx?: object;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  originalError,
  showTitle = true,
  showDetails = false,
  showMockSwitch = false,
  onSwitchToMocks,
  sx = {},
}) => {
  const [showDetailsExpanded, setShowDetailsExpanded] = React.useState(false);

  const getErrorIcon = () => {
    if (originalError?.status === 'FETCH_ERROR') {
      return <NetworkIcon />;
    }
    if (originalError?.status >= 500) {
      return <ErrorIcon />;
    }
    if (originalError?.status >= 400) {
      return <WarningIcon />;
    }
    return <InfoIcon />;
  };

  const getErrorSeverity = () => {
    if (
      originalError?.status === 'FETCH_ERROR' ||
      originalError?.status >= 500
    ) {
      return 'error';
    }
    if (originalError?.status >= 400) {
      return 'warning';
    }
    return 'info';
  };

  const getErrorTitle = () => {
    if (originalError?.status === 'FETCH_ERROR') {
      return 'Ошибка сети';
    }
    if (originalError?.status >= 500) {
      return 'Ошибка сервера';
    }
    if (originalError?.status === 404) {
      return 'Ресурс не найден';
    }
    if (originalError?.status === 403) {
      return 'Доступ запрещен';
    }
    if (originalError?.status === 401) {
      return 'Требуется авторизация';
    }
    return 'Ошибка';
  };

  const getRecommendations = () => {
    if (originalError?.status === 'FETCH_ERROR') {
      return [
        'Проверьте подключение к интернету',
        'Убедитесь, что сервер запущен на localhost:3001',
        'Попробуйте перезагрузить страницу',
        'Или переключитесь на тестовые данные',
      ];
    }
    if (originalError?.status >= 500) {
      return [
        'Проблема на стороне сервера',
        'Попробуйте повторить запрос позже',
        'Или переключитесь на тестовые данные',
      ];
    }
    return [];
  };

  const handleSwitchToMocks = () => {
    config.updateUseMocks(true);
    if (onSwitchToMocks) {
      onSwitchToMocks();
    }
  };

  return (
    <Alert
      severity={getErrorSeverity() as 'error' | 'warning' | 'info'}
      icon={getErrorIcon()}
      sx={sx}
      action={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {showMockSwitch && !config.useMocks && (
            <Button
              color="inherit"
              size="small"
              onClick={handleSwitchToMocks}
              variant="outlined"
            >
              Использовать моки
            </Button>
          )}
          {(showDetails || originalError) && (
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setShowDetailsExpanded(!showDetailsExpanded)}
            >
              {showDetailsExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}
        </Box>
      }
    >
      {showTitle && <AlertTitle>{getErrorTitle()}</AlertTitle>}

      <Typography variant="body2">{error}</Typography>

      {/* Рекомендации */}
      {getRecommendations().length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography
            variant="caption"
            color="textSecondary"
            sx={{ display: 'block' }}
          >
            💡 Возможные решения:
          </Typography>
          {getRecommendations().map((recommendation, index) => (
            <Typography
              key={index}
              variant="caption"
              color="textSecondary"
              sx={{ display: 'block' }}
            >
              • {recommendation}
            </Typography>
          ))}
        </Box>
      )}

      {/* Детали ошибки */}
      <Collapse in={showDetailsExpanded}>
        <Box sx={{ mt: 2, p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Техническая информация:
          </Typography>
          <Typography
            variant="caption"
            component="pre"
            sx={{
              display: 'block',
              mt: 1,
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
            }}
          >
            {originalError
              ? JSON.stringify(originalError, null, 2)
              : 'Нет дополнительной информации'}
          </Typography>
        </Box>
      </Collapse>
    </Alert>
  );
};

export default ErrorAlert;

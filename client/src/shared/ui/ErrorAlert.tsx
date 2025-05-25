import React from 'react';
import { Alert, AlertTitle, Box } from '@mui/material';
import {
  WifiOff as NetworkIcon,
  Error as ServerIcon,
  Warning as ValidationIcon,
  Security as AuthIcon,
} from '@mui/icons-material';
import { isNetworkError, isServerError, isClientError } from '../utils/errorUtils';

interface ErrorAlertProps {
  error: string;
  originalError?: any;
  showTitle?: boolean;
  sx?: object;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  error,
  originalError,
  showTitle = true,
  sx = {}
}) => {
  const getErrorIcon = () => {
    if (originalError) {
      if (isNetworkError(originalError)) {
        return <NetworkIcon />;
      }
      if (isServerError(originalError)) {
        return <ServerIcon />;
      }
      if (isClientError(originalError)) {
        if (originalError.status === 401 || originalError.status === 403) {
          return <AuthIcon />;
        }
        return <ValidationIcon />;
      }
    }
    return null;
  };

  const getErrorTitle = () => {
    if (!showTitle || !originalError) return null;

    if (isNetworkError(originalError)) {
      return 'Проблема с подключением';
    }
    if (isServerError(originalError)) {
      return 'Ошибка сервера';
    }
    if (originalError.status === 401 || originalError.status === 403) {
      return 'Ошибка доступа';
    }
    if (isClientError(originalError)) {
      return 'Ошибка валидации';
    }

    return 'Ошибка';
  };

  const errorIcon = getErrorIcon();
  const errorTitle = getErrorTitle();

  return (
    <Alert
      severity="error"
      sx={{ mb: 2, ...sx }}
      icon={errorIcon}
    >
      {errorTitle && <AlertTitle>{errorTitle}</AlertTitle>}
      <Box component="span">{error}</Box>
    </Alert>
  );
};

export default ErrorAlert;

import React, { useState } from 'react';
import {
  Alert,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
  Collapse,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountIcon,
  Bolt as BoltIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDataSync } from '../hooks/useDataSync';
import BalanceInconsistencyDetails from './BalanceInconsistencyDetails';

interface DataSyncAlertProps {
  showOnlyWhenNeeded?: boolean;
  compact?: boolean;
}

const DataSyncAlert: React.FC<DataSyncAlertProps> = ({
  showOnlyWhenNeeded = true,
  compact = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isSyncingAccounts, setIsSyncingAccounts] = useState<Set<string>>(
    new Set()
  );

  const {
    isChecking,
    hasMismatch,
    isSyncing,
    lastSyncTime,
    syncError,
    errorType,
    inconsistencies,
    syncBalances,
    syncSingleAccount,
  } = useDataSync();

  // Если показывать только при необходимости и нет проблем
  if (showOnlyWhenNeeded && !hasMismatch && !syncError && !isSyncing) {
    return null;
  }

  const getSeverity = () => {
    if (syncError) return 'error';
    if (hasMismatch) return 'warning';
    if (isSyncing) return 'info';
    return 'success';
  };

  const getTitle = () => {
    if (syncError) return 'Ошибка синхронизации';
    if (hasMismatch) return 'Обнаружены несоответствия';
    if (isSyncing) return 'Синхронизация данных...';
    return 'Данные синхронизированы';
  };

  const getMessage = () => {
    if (syncError) {
      // Для ошибок показываем краткое сообщение
      if (syncError.includes('транзакци')) {
        return 'Ошибка при получении транзакций. Нажмите для просмотра деталей.';
      }
      return 'Произошла ошибка синхронизации. Нажмите для просмотра деталей.';
    }
    if (hasMismatch) {
      return `Балансы ${inconsistencies.length} счет${
        inconsistencies.length === 1 ? 'а' : 'ов'
      } не соответствуют операциям. Рекомендуется пересчитать.`;
    }
    if (isSyncing)
      return 'Выполняется интеллектуальный пересчет балансов на основе операций...';
    if (lastSyncTime) {
      return `Балансы автоматически синхронизированы: ${lastSyncTime.toLocaleString()}`;
    }
    return 'Все данные корректны';
  };

  const getIcon = () => {
    if (isChecking || isSyncing) return <CircularProgress size={20} />;
    if (syncError || hasMismatch) return <WarningIcon />;
    return <CheckIcon />;
  };

  // Теперь используем errorType из хука
  const currentErrorType = errorType;

  const getErrorRecommendations = () => {
    switch (currentErrorType) {
      case 'transaction_error':
        return [
          'Проверьте подключение к интернету',
          'Попробуйте обновить страницу',
          'Если ошибка повторяется, обратитесь в поддержку',
        ];
      case 'balance_error':
        return [
          'Используйте кнопку "Обновить баланс" для синхронизации',
          'Проверьте корректность последних операций',
          'При необходимости синхронизируйте отдельные счета',
        ];
      case 'network_error':
        return [
          'Проверьте подключение к интернету',
          'Дождитесь восстановления соединения',
          'Повторите попытку через несколько минут',
        ];
      default:
        return [
          'Попробуйте обновить страницу',
          'Проверьте подключение к интернету',
          'Если проблема повторяется, обратитесь в поддержку',
        ];
    }
  };

  const canFixAutomatically = () => {
    return currentErrorType === 'balance_error' || hasMismatch;
  };

  const handleSyncSingleAccount = async (accountId: string) => {
    try {
      setIsSyncingAccounts(prev => new Set(prev).add(accountId));
      await syncSingleAccount(accountId);
    } catch (error) {
      console.error('Ошибка синхронизации отдельного счета:', error);
    } finally {
      setIsSyncingAccounts(prev => {
        const newSet = new Set(prev);
        newSet.delete(accountId);
        return newSet;
      });
    }
  };

  const handleSyncAndCloseDetails = async () => {
    await syncBalances();
    setShowDetails(false);
  };

  const handleFixError = async () => {
    if (canFixAutomatically()) {
      await syncBalances();
      setShowErrorDetails(false);
    }
  };

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getIcon()}
        <Typography variant="caption" color="text.secondary">
          {getMessage()}
        </Typography>
        {(hasMismatch || syncError) && !isSyncing && (
          <>
            <Button
              size="small"
              onClick={() =>
                syncError ? setShowErrorDetails(true) : setShowDetails(true)
              }
              variant="outlined"
              startIcon={<VisibilityIcon />}
            >
              Детали
            </Button>
            {canFixAutomatically() && (
              <Tooltip
                title={
                  hasMismatch
                    ? 'Быстрая интеллектуальная синхронизация'
                    : 'Обновить баланс'
                }
              >
                <Button
                  size="small"
                  onClick={handleFixError}
                  disabled={isSyncing}
                  variant="outlined"
                  color="warning"
                  startIcon={<BoltIcon />}
                >
                  {hasMismatch ? 'Синхронизировать' : 'Обновить баланс'}
                </Button>
              </Tooltip>
            )}
          </>
        )}

        <BalanceInconsistencyDetails
          open={showDetails}
          onClose={() => setShowDetails(false)}
          inconsistencies={inconsistencies}
          onSync={handleSyncAndCloseDetails}
          onSyncSingle={handleSyncSingleAccount}
          isSyncing={isSyncing}
          isSyncingAccounts={isSyncingAccounts}
        />
      </Box>
    );
  }

  return (
    <>
      <Alert
        severity={getSeverity()}
        icon={getIcon()}
        sx={{ mb: 2 }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {syncError && (
              <IconButton
                size="small"
                onClick={() => setShowErrorDetails(!showErrorDetails)}
                color="inherit"
              >
                {showErrorDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            {(hasMismatch || syncError) && !isSyncing && (
              <>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() =>
                    syncError ? setShowErrorDetails(true) : setShowDetails(true)
                  }
                  startIcon={<VisibilityIcon />}
                >
                  Подробнее
                </Button>
                {canFixAutomatically() && (
                  <Tooltip
                    title={
                      hasMismatch
                        ? 'Быстрая интеллектуальная синхронизация всех счетов'
                        : 'Обновить баланс счетов'
                    }
                  >
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleFixError}
                      disabled={isSyncing}
                      startIcon={hasMismatch ? <BoltIcon /> : <RefreshIcon />}
                    >
                      {hasMismatch ? 'Синхронизировать' : 'Обновить баланс'}
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Box>
        }
      >
        <Typography variant="subtitle2" component="div">
          {getTitle()}
        </Typography>
        <Typography variant="body2">{getMessage()}</Typography>
        {isChecking && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label="Проверка данных..."
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
        )}
        {isSyncing && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label="Интеллектуальная синхронизация..."
              size="small"
              color="info"
              variant="filled"
              icon={<BoltIcon />}
            />
          </Box>
        )}
      </Alert>

      {/* Выпадающий блок с деталями ошибки */}
      <Collapse in={showErrorDetails && !!syncError}>
        <Card sx={{ mb: 2, border: '1px solid', borderColor: 'error.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <ErrorIcon color="error" />
              <Typography variant="h6" color="error">
                Детали ошибки
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}
            >
              {syncError}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Рекомендуемые действия:
            </Typography>
            <List dense>
              {getErrorRecommendations().map((recommendation, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <InfoIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setShowErrorDetails(false)}
                size="small"
              >
                Скрыть детали
              </Button>
              {canFixAutomatically() && (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleFixError}
                  disabled={isSyncing}
                  startIcon={
                    isSyncing ? <CircularProgress size={16} /> : <RefreshIcon />
                  }
                  size="small"
                >
                  {isSyncing ? 'Обновляется...' : 'Обновить баланс'}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      <BalanceInconsistencyDetails
        open={showDetails}
        onClose={() => setShowDetails(false)}
        inconsistencies={inconsistencies}
        onSync={handleSyncAndCloseDetails}
        onSyncSingle={handleSyncSingleAccount}
        isSyncing={isSyncing}
        isSyncingAccounts={isSyncingAccounts}
      />
    </>
  );
};

export default DataSyncAlert;

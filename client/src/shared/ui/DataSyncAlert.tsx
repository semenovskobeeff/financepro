import React, { useState } from 'react';
import {
  Alert,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Visibility as VisibilityIcon,
  AccountBalance as AccountIcon,
  Bolt as BoltIcon,
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
  const [isSyncingAccounts, setIsSyncingAccounts] = useState<Set<string>>(
    new Set()
  );

  const {
    isChecking,
    hasMismatch,
    isSyncing,
    lastSyncTime,
    syncError,
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
    if (syncError) return syncError;
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

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {getIcon()}
        <Typography variant="caption" color="text.secondary">
          {getMessage()}
        </Typography>
        {hasMismatch && !isSyncing && (
          <>
            <Button
              size="small"
              onClick={() => setShowDetails(true)}
              variant="outlined"
              startIcon={<VisibilityIcon />}
            >
              Детали
            </Button>
            <Tooltip title="Быстрая интеллектуальная синхронизация">
              <Button
                size="small"
                onClick={syncBalances}
                disabled={isSyncing}
                variant="outlined"
                color="warning"
                startIcon={<BoltIcon />}
              >
                Синхронизировать
              </Button>
            </Tooltip>
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
            {hasMismatch && !isSyncing && (
              <>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowDetails(true)}
                  startIcon={<VisibilityIcon />}
                >
                  Подробнее
                </Button>
                <Tooltip title="Быстрая интеллектуальная синхронизация всех счетов">
                  <Button
                    color="inherit"
                    size="small"
                    onClick={syncBalances}
                    disabled={isSyncing}
                    startIcon={<BoltIcon />}
                  >
                    Синхронизировать
                  </Button>
                </Tooltip>
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

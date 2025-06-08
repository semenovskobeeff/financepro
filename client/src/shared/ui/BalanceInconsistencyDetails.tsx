import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Sync as SyncIcon,
  Warning as WarningIcon,
  AccountBalance as AccountIcon,
  Bolt as BoltIcon,
} from '@mui/icons-material';
import { formatCurrencyWithDots } from '../utils/formatUtils';

interface BalanceInconsistencyDetailsProps {
  open: boolean;
  onClose: () => void;
  inconsistencies: Array<{
    accountId: string;
    accountName: string;
    storedBalance: number;
    calculatedBalance: number;
    difference: number;
  }>;
  onSync: () => void;
  onSyncSingle?: (accountId: string) => void;
  isSyncing: boolean;
  isSyncingAccounts?: Set<string>;
}

const BalanceInconsistencyDetails: React.FC<
  BalanceInconsistencyDetailsProps
> = ({
  open,
  onClose,
  inconsistencies,
  onSync,
  onSyncSingle,
  isSyncing,
  isSyncingAccounts = new Set(),
}) => {
  const totalDifference = inconsistencies.reduce(
    (sum, item) => sum + Math.abs(item.difference),
    0
  );

  const handleSyncSingle = async (accountId: string) => {
    if (onSyncSingle) {
      await onSyncSingle(accountId);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Несоответствия балансов
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Обнаружены несоответствия между сохраненными балансами счетов и
            рассчитанными на основе операций. Вы можете синхронизировать все
            счета сразу или исправить отдельные счета.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Chip
              label={`${inconsistencies.length} счетов с ошибками`}
              color="warning"
              variant="outlined"
            />
            <Chip
              label={`Общая разница: ${formatCurrencyWithDots(
                totalDifference
              )}`}
              color="error"
              variant="outlined"
            />
          </Box>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Счет</TableCell>
                <TableCell align="right">Сохраненный баланс</TableCell>
                <TableCell align="right">Расчетный баланс</TableCell>
                <TableCell align="right">Разница</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inconsistencies.map(item => {
                const isAccountSyncing = isSyncingAccounts.has(item.accountId);

                return (
                  <TableRow key={item.accountId}>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <AccountIcon color="primary" fontSize="small" />
                        <Typography variant="body2" fontWeight="medium">
                          {item.accountName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrencyWithDots(item.storedBalance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        {formatCurrencyWithDots(item.calculatedBalance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color="error.main"
                        fontWeight="medium"
                      >
                        {item.difference > 0 ? '+' : ''}
                        {formatCurrencyWithDots(item.difference)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center',
                        }}
                      >
                        <Chip
                          label="Требует исправления"
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                        {onSyncSingle && (
                          <Tooltip title="Синхронизировать только этот счет">
                            <Button
                              size="small"
                              variant="outlined"
                              color="warning"
                              onClick={() => handleSyncSingle(item.accountId)}
                              disabled={isSyncing || isAccountSyncing}
                              startIcon={
                                isAccountSyncing ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <BoltIcon />
                                )
                              }
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              {isAccountSyncing ? '' : 'Синхр.'}
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark">
            <strong>Рекомендация:</strong> Используйте "Синхронизировать все"
            для быстрого исправления всех балансов сразу или синхронизируйте
            отдельные счета для точечного контроля. Все счета будут пересчитаны
            на основе фактических операций.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        {onSyncSingle && inconsistencies.length > 0 && (
          <Button
            onClick={() => {
              inconsistencies.forEach(item => handleSyncSingle(item.accountId));
            }}
            variant="outlined"
            color="warning"
            disabled={isSyncing || isSyncingAccounts.size > 0}
            startIcon={<AccountIcon />}
          >
            Синхр. по одному
          </Button>
        )}
        <Button
          onClick={onSync}
          variant="contained"
          color="warning"
          disabled={isSyncing}
          startIcon={isSyncing ? null : <BoltIcon />}
        >
          {isSyncing ? 'Синхронизация...' : 'Синхронизировать все'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BalanceInconsistencyDetails;

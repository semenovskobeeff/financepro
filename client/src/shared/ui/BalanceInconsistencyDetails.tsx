import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { formatCurrencyWithDots } from '../utils/formatUtils';

interface BalanceInconsistency {
  accountId: string;
  accountName: string;
  storedBalance: number;
  calculatedBalance: number;
  difference: number;
}

interface BalanceInconsistencyDetailsProps {
  open: boolean;
  onClose: () => void;
  inconsistencies: BalanceInconsistency[];
  onSync: () => void;
  isSyncing: boolean;
}

const BalanceInconsistencyDetails: React.FC<
  BalanceInconsistencyDetailsProps
> = ({ open, onClose, inconsistencies, onSync, isSyncing }) => {
  const totalDifference = inconsistencies.reduce(
    (sum, item) => sum + Math.abs(item.difference),
    0
  );

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
            рассчитанными на основе операций.
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
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Счет</TableCell>
                <TableCell align="right">Текущий баланс</TableCell>
                <TableCell align="right">Расчетный баланс</TableCell>
                <TableCell align="right">Разница</TableCell>
                <TableCell align="center">Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inconsistencies.map(item => (
                <TableRow key={item.accountId}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {item.accountName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={
                        item.storedBalance >= 0 ? 'success.main' : 'error.main'
                      }
                    >
                      {formatCurrencyWithDots(item.storedBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={
                        item.calculatedBalance >= 0
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
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
                    <Chip
                      label="Требует исправления"
                      color="warning"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark">
            <strong>Рекомендация:</strong> Нажмите "Синхронизировать", чтобы
            автоматически исправить балансы на основе фактических операций. Все
            счета будут пересчитаны корректно.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={onSync}
          variant="contained"
          color="warning"
          disabled={isSyncing}
          startIcon={isSyncing ? null : <SyncIcon />}
        >
          {isSyncing ? 'Синхронизация...' : 'Синхронизировать балансы'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BalanceInconsistencyDetails;

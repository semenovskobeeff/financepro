import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Link,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../../../shared/utils/formatUtils';
import { Subscription } from '../model/types';

interface PaymentHistoryProps {
  subscription: Subscription;
  maxItems?: number;
}

const getStatusColor = (
  status: string
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'success':
      return 'Выполнен';
    case 'pending':
      return 'В обработке';
    case 'failed':
      return 'Ошибка';
    default:
      return status;
  }
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  subscription,
  maxItems,
}) => {
  const paymentHistory = [...subscription.paymentHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems);

  if (paymentHistory.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          История платежей отсутствует
        </Typography>
      </Box>
    );
  }

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'dd MMM yyyy', { locale: ru });
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        История платежей
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell align="center">Транзакция</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.map((payment, index) => (
              <TableRow key={payment.id || index}>
                <TableCell component="th" scope="row">
                  {formatDate(payment.date)}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(payment.amount)} {subscription.currency}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={getStatusLabel(payment.status)}
                    color={getStatusColor(payment.status)}
                  />
                </TableCell>
                <TableCell>{payment.description || '-'}</TableCell>
                <TableCell align="center">
                  {payment.transactionId ? (
                    <Link
                      component={RouterLink}
                      to={`/transactions/${payment.transactionId}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ReceiptIcon fontSize="small" color="primary" />
                    </Link>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PaymentHistory;

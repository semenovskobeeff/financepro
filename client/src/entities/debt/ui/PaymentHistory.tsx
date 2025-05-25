import React from 'react';
import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Debt, DebtHistoryItem } from '../model/types';

interface PaymentHistoryProps {
  debt: Debt;
  maxItems?: number;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ debt, maxItems }) => {
  const theme = useTheme();

  // Сортируем платежи по дате в обратном порядке (сначала новые)
  const sortedHistory = [...debt.paymentHistory].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Ограничиваем количество отображаемых платежей, если указан maxItems
  const historyToShow = maxItems
    ? sortedHistory.slice(0, maxItems)
    : sortedHistory;

  // Если история платежей пуста
  if (historyToShow.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          История платежей
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: theme.palette.background.default,
          }}
        >
          <Typography color="text.secondary">
            Платежи по долгу отсутствуют
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Форматируем дату
  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'PPP', { locale: ru });
  };

  // Расчет общей суммы платежей
  const totalPaid = sortedHistory.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle1">История платежей</Typography>
        <Typography variant="subtitle2" color="primary">
          Всего выплачено: {totalPaid.toLocaleString()} ₽
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow
              sx={{ backgroundColor: theme.palette.background.default }}
            >
              <TableCell>Дата</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Описание</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historyToShow.map((payment, index) => (
              <TableRow key={index} hover>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="success.main"
                  >
                    {payment.amount.toLocaleString()} ₽
                  </Typography>
                </TableCell>
                <TableCell>
                  {payment.description || 'Платеж по долгу'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {maxItems && sortedHistory.length > maxItems && (
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ mt: 1 }}
        >
          Показаны последние {maxItems} из {sortedHistory.length} платежей
        </Typography>
      )}
    </Box>
  );
};

export default PaymentHistory;

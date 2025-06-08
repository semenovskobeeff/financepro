import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ru } from 'date-fns/locale';

interface Debt {
  id: string;
  creditorName: string;
  amount: number;
  remainingAmount: number;
  description?: string;
}

interface DebtPaymentFormProps {
  open: boolean;
  onClose: () => void;
  debt?: Debt;
  onSubmit?: (data: {
    debtId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod: string;
    description?: string;
  }) => void;
}

const DebtPaymentForm: React.FC<DebtPaymentFormProps> = ({
  open,
  onClose,
  debt,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    setError('');

    if (!debt) {
      setError('Не выбран долг для погашения');
      return;
    }

    if (amount <= 0) {
      setError('Сумма платежа должна быть больше 0');
      return;
    }

    if (amount > debt.remainingAmount) {
      setError('Сумма платежа не может превышать остаток долга');
      return;
    }

    onSubmit?.({
      debtId: debt.id,
      amount,
      paymentDate,
      paymentMethod,
      description: description.trim() || undefined,
    });

    handleClose();
  };

  const handleClose = () => {
    setAmount(0);
    setPaymentDate(new Date());
    setPaymentMethod('cash');
    setDescription('');
    setError('');
    onClose();
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setAmount(numValue);
    if (numValue > (debt?.remainingAmount || 0)) {
      setError('Сумма платежа не может превышать остаток долга');
    } else {
      setError('');
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Наличные' },
    { value: 'card', label: 'Банковская карта' },
    { value: 'transfer', label: 'Банковский перевод' },
    { value: 'electronic', label: 'Электронные деньги' },
    { value: 'other', label: 'Другое' },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box display="flex" alignItems="center">
              <PaymentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Погашение долга</Typography>
            </Box>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {debt && (
            <Box mb={3} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="subtitle1" gutterBottom>
                Информация о долге:
              </Typography>
              <Typography variant="body2">
                <strong>Кредитор:</strong> {debt.creditorName}
              </Typography>
              <Typography variant="body2">
                <strong>Общая сумма:</strong> {debt.amount.toLocaleString()} ₽
              </Typography>
              <Typography variant="body2">
                <strong>Остаток к погашению:</strong>{' '}
                {debt.remainingAmount.toLocaleString()} ₽
              </Typography>
              {debt.description && (
                <Typography variant="body2">
                  <strong>Описание:</strong> {debt.description}
                </Typography>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Сумма платежа"
            type="number"
            fullWidth
            value={amount || ''}
            onChange={e => handleAmountChange(e.target.value)}
            margin="normal"
            required
            inputProps={{
              min: 0,
              max: debt?.remainingAmount || 0,
              step: 0.01,
            }}
            helperText={`Максимальная сумма: ${
              debt?.remainingAmount?.toLocaleString() || 0
            } ₽`}
          />

          <Box mt={2}>
            <DatePicker
              label="Дата платежа"
              value={paymentDate}
              onChange={newValue => {
                if (newValue) {
                  setPaymentDate(newValue);
                }
              }}
              slots={{
                textField: TextField,
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                },
              }}
            />
          </Box>

          <FormControl fullWidth margin="normal">
            <InputLabel>Способ платежа</InputLabel>
            <Select
              value={paymentMethod}
              label="Способ платежа"
              onChange={e => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map(method => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Комментарий (необязательно)"
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            margin="normal"
            placeholder="Дополнительная информация о платеже"
          />

          {debt && amount > 0 && (
            <Box mt={2} p={2} bgcolor="success.light" borderRadius={1}>
              <Typography variant="body2" color="success.contrastText">
                После платежа остаток долга составит:{' '}
                <strong>
                  {(debt.remainingAmount - amount).toLocaleString()} ₽
                </strong>
              </Typography>
              {debt.remainingAmount - amount === 0 && (
                <Typography
                  variant="body2"
                  color="success.contrastText"
                  fontWeight="bold"
                >
                  🎉 Долг будет полностью погашен!
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !debt || amount <= 0 || amount > (debt?.remainingAmount || 0)
            }
            startIcon={<PaymentIcon />}
          >
            Внести платеж
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default DebtPaymentForm;

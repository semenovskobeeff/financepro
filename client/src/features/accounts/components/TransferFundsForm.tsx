import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  FormHelperText,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { TransferFundsRequest } from '../../../entities/account/model/types';
import {
  useGetAccountsQuery,
  useTransferFundsMutation,
} from '../../../entities/account/api/accountApi';

interface TransferFundsFormProps {
  onClose: () => void;
  initialFromAccountId?: string;
}

const TransferFundsForm: React.FC<TransferFundsFormProps> = ({
  onClose,
  initialFromAccountId,
}) => {
  const [formData, setFormData] = useState<TransferFundsRequest>({
    fromAccountId: initialFromAccountId || '',
    toAccountId: '',
    amount: 0,
    description: '',
    date: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: accounts, isLoading: accountsLoading } = useGetAccountsQuery({
    status: 'active',
  });

  const [transferFunds, { isLoading: isTransferring, error: transferError }] =
    useTransferFundsMutation();

  const isLoading = isTransferring || accountsLoading;
  const error = transferError;

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | any
  ) => {
    const { name, value } = e.target;
    if (!name) return;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      date: date ? date.toISOString() : new Date().toISOString(),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fromAccountId) {
      newErrors.fromAccountId = 'Выберите счет-источник';
    }

    if (!formData.toAccountId) {
      newErrors.toAccountId = 'Выберите счет-получатель';
    }

    if (formData.fromAccountId === formData.toAccountId) {
      newErrors.toAccountId =
        'Счет-получатель должен отличаться от счета-источника';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Сумма должна быть больше нуля';
    }

    const sourceAccount = accounts?.find(
      acc => acc.id === formData.fromAccountId
    );
    if (sourceAccount && formData.amount > sourceAccount.balance) {
      newErrors.amount = 'Недостаточно средств на счете-источнике';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await transferFunds(formData).unwrap();
      onClose();
    } catch (err) {
      console.error('Failed to transfer funds:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при переводе средств. Пожалуйста, попробуйте снова.
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl
            fullWidth
            error={!!errors.fromAccountId}
            disabled={isLoading}
          >
            <InputLabel id="from-account-label">Счет-источник</InputLabel>
            <Select
              labelId="from-account-label"
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleChange}
              label="Счет-источник"
              required
            >
              {accounts
                ?.filter(
                  acc =>
                    acc.status === 'active' && acc.id !== formData.toAccountId
                )
                .map(account => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.balance.toFixed(2)}{' '}
                    {account.currency})
                  </MenuItem>
                ))}
            </Select>
            {errors.fromAccountId && (
              <FormHelperText>{errors.fromAccountId}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl
            fullWidth
            error={!!errors.toAccountId}
            disabled={isLoading}
          >
            <InputLabel id="to-account-label">Счет-получатель</InputLabel>
            <Select
              labelId="to-account-label"
              name="toAccountId"
              value={formData.toAccountId}
              onChange={handleChange}
              label="Счет-получатель"
              required
            >
              {accounts
                ?.filter(
                  acc =>
                    acc.status === 'active' && acc.id !== formData.fromAccountId
                )
                .map(account => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.balance.toFixed(2)}{' '}
                    {account.currency})
                  </MenuItem>
                ))}
            </Select>
            {errors.toAccountId && (
              <FormHelperText>{errors.toAccountId}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Сумма перевода"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            disabled={isLoading}
            required
            InputProps={{
              inputProps: { min: 0, step: '0.01' },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
            <DatePicker
              label="Дата"
              value={formData.date ? new Date(formData.date) : null}
              onChange={handleDateChange}
              disabled={isLoading}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Описание (опционально)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isLoading}
            multiline
            rows={2}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 3,
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={onClose}
          disabled={isLoading}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Добавить перевод'}
        </Button>
      </Box>
    </Box>
  );
};

export default TransferFundsForm;

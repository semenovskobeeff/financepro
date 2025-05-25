import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  InputAdornment,
  Divider,
  Box,
  Alert,
} from '@mui/material';
import { Debt } from 'entities/debt/model/types';
import { useGetAccountsQuery } from 'entities/account/api/accountApi';

interface PaymentFormProps {
  debt: Debt;
  onClose: () => void;
  onSubmit: (paymentData: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  debt,
  onClose,
  onSubmit,
}) => {
  const { data: accounts } = useGetAccountsQuery({ status: 'active' });

  const [formData, setFormData] = useState({
    amount: debt.nextPaymentAmount?.toString() || '',
    description: `Платеж по ${debt.name}`,
    accountId: debt.linkedAccountId || '',
  });

  const [errors, setErrors] = useState({
    amount: '',
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | any
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));

    if (name === 'amount') {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { amount: '' };
    let isValid = true;

    if (!formData.amount.trim()) {
      newErrors.amount = 'Укажите сумму платежа';
      isValid = false;
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = 'Сумма должна быть больше нуля';
      isValid = false;
    } else if (Number(formData.amount) > debt.currentAmount) {
      newErrors.amount = `Сумма не может превышать остаток долга (${debt.currentAmount.toLocaleString()} ₽)`;
      isValid = false;
    }

    if (formData.accountId) {
      const selectedAccount = accounts?.find(a => a.id === formData.accountId);
      if (
        selectedAccount &&
        Number(formData.amount) > selectedAccount.balance
      ) {
        newErrors.amount = `Недостаточно средств на счете (доступно ${selectedAccount.balance.toLocaleString()} ₽)`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      accountId: formData.accountId || undefined,
    };

    onSubmit(submitData);
  };

  // Определяем, какая сумма рекомендуется для платежа
  const recommendedAmount =
    debt.nextPaymentAmount || Math.ceil(debt.currentAmount * 0.1);
  const fullAmount = debt.currentAmount;

  // Функция для предзаполнения поля суммы
  const setRecommendedAmount = () => {
    setFormData(prev => ({ ...prev, amount: recommendedAmount.toString() }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  const setFullAmount = () => {
    setFormData(prev => ({ ...prev, amount: fullAmount.toString() }));
    setErrors(prev => ({ ...prev, amount: '' }));
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Внести платеж по долгу</DialogTitle>
      <Divider />

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">{debt.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            Текущий остаток: {debt.currentAmount.toLocaleString()} ₽
          </Typography>
          {debt.nextPaymentDate && (
            <Typography variant="body2" color="text.secondary">
              Следующий платеж:{' '}
              {new Date(debt.nextPaymentDate).toLocaleDateString('ru-RU')}
            </Typography>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Сумма платежа"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            margin="normal"
            InputProps={{
              endAdornment: <InputAdornment position="end">₽</InputAdornment>,
            }}
            required
            autoFocus
          />

          <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 2 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={setRecommendedAmount}
            >
              Рекомендуемый ({recommendedAmount.toLocaleString()} ₽)
            </Button>

            <Button size="small" variant="outlined" onClick={setFullAmount}>
              Полное погашение ({fullAmount.toLocaleString()} ₽)
            </Button>
          </Box>

          <TextField
            fullWidth
            label="Описание платежа"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Счет списания (опционально)</InputLabel>
            <Select
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              label="Счет списания (опционально)"
            >
              <MenuItem value="">Без списания со счета</MenuItem>
              {accounts?.map(account => (
                <MenuItem
                  key={account.id}
                  value={account.id}
                  disabled={account.balance < Number(formData.amount)}
                >
                  {account.name} ({account.balance.toLocaleString()} ₽)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {formData.accountId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Сумма будет автоматически списана с выбранного счета
            </Alert>
          )}
        </form>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Внести платеж
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;

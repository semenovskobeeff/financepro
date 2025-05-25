import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import { useGetAccountsQuery } from 'entities/account/api/accountApi';
import { useTransferToGoalMutation } from 'entities/goal/api/goalApi';
import { Goal } from 'entities/goal/model/types';

interface TransferToGoalFormProps {
  goal: Goal;
  onClose: () => void;
}

const TransferToGoalForm: React.FC<TransferToGoalFormProps> = ({
  goal,
  onClose,
}) => {
  const [fromAccountId, setFromAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: accounts = [] } = useGetAccountsQuery();
  const [transferToGoal, { isLoading }] = useTransferToGoalMutation();

  // Счета, которые можно использовать для перевода (только активные и не цели)
  const availableAccounts = accounts.filter(
    account => account.status === 'active' && account.type !== 'goal'
  );

  // Расчет оставшейся суммы до цели
  const remainingAmount = goal.targetAmount - goal.progress;

  const handleAccountChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }> | any
  ) => {
    setFromAccountId(e.target.value as string);
    if (errors.fromAccountId) {
      setErrors(prev => ({ ...prev, fromAccountId: '' }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только числа с двумя знаками после запятой
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value);
      if (errors.amount) {
        setErrors(prev => ({ ...prev, amount: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (!fromAccountId) {
      newErrors.fromAccountId = 'Выберите счет';
      isValid = false;
    }

    if (!amount) {
      newErrors.amount = 'Введите сумму';
      isValid = false;
    } else {
      const numAmount = parseFloat(amount);
      const account = accounts.find(acc => acc.id === fromAccountId);

      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Сумма должна быть положительным числом';
        isValid = false;
      } else if (account && numAmount > account.balance) {
        newErrors.amount = 'Недостаточно средств на счете';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await transferToGoal({
        id: goal.id,
        data: {
          fromAccountId,
          amount: parseFloat(amount),
        },
      }).unwrap();

      onClose();
    } catch (error) {
      console.error('Ошибка при переводе средств на цель:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Ошибка при переводе средств. Пожалуйста, попробуйте еще раз.',
      }));
    }
  };

  // Расчет процента выполнения цели
  const progressPercent = Math.min(
    Math.round((goal.progress / goal.targetAmount) * 100),
    100
  );

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Пополнение цели "{goal.name}"</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Прогресс: {goal.progress.toFixed(2)} /{' '}
            {goal.targetAmount.toFixed(2)} ₽
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary">
            Осталось собрать: {remainingAmount.toFixed(2)} ₽
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" error={!!errors.fromAccountId}>
            <InputLabel id="from-account-label">Счет списания</InputLabel>
            <Select
              labelId="from-account-label"
              value={fromAccountId}
              onChange={handleAccountChange}
              label="Счет списания"
              disabled={isLoading}
            >
              {availableAccounts.map(account => (
                <MenuItem key={account.id} value={account.id}>
                  {account.name} ({account.balance.toFixed(2)} ₽)
                </MenuItem>
              ))}
            </Select>
            {errors.fromAccountId && (
              <FormHelperText>{errors.fromAccountId}</FormHelperText>
            )}
          </FormControl>

          <TextField
            margin="normal"
            label="Сумма"
            type="text"
            fullWidth
            value={amount}
            onChange={handleAmountChange}
            error={!!errors.amount}
            helperText={errors.amount}
            disabled={isLoading}
            InputProps={{
              endAdornment: <Typography variant="body1">₽</Typography>,
            }}
          />

          {errors.submit && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {errors.submit}
            </Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
          {isLoading ? 'Перевод...' : 'Перевести'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferToGoalForm;

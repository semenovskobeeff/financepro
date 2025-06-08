import React, { useState, useEffect } from 'react';
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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';
import { Goal, CreateGoalRequest } from '../../../entities/goal/model/types';
import { Account } from '../../../entities/account/model/types';
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
} from '../../../entities/goal/api/goalApi';
import { useGetAccountsQuery } from '../../../entities/account/api/accountApi';
import { formatCurrencyWithDots } from '../../../shared/utils/formatUtils';

interface GoalFormProps {
  goal?: Goal | null;
  onClose: () => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ goal, onClose }) => {
  const [formData, setFormData] = useState<CreateGoalRequest>({
    name: goal?.name || '',
    accountId: goal?.accountId || '',
    targetAmount: goal ? goal.targetAmount : 0,
    deadline: goal?.deadline || new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: accounts, isLoading: isLoadingAccounts } =
    useGetAccountsQuery();
  const [createGoal, { isLoading: isCreating, error: createError }] =
    useCreateGoalMutation();
  const [updateGoal, { isLoading: isUpdating, error: updateError }] =
    useUpdateGoalMutation();

  const isLoading = isCreating || isUpdating || isLoadingAccounts;
  const error = createError || updateError;

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
    if (date) {
      setFormData(prev => ({
        ...prev,
        deadline: date.toISOString(),
      }));

      if (errors.deadline) {
        setErrors(prev => ({
          ...prev,
          deadline: '',
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название цели обязательно';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Выберите счет';
    }

    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Целевая сумма должна быть положительной';
    }

    const deadlineDate = new Date(formData.deadline);
    if (isNaN(deadlineDate.getTime())) {
      newErrors.deadline = 'Укажите корректную дату';
    } else if (deadlineDate < new Date()) {
      newErrors.deadline = 'Дата должна быть в будущем';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (goal) {
        // Обновляем существующую цель
        await updateGoal({
          id: goal.id,
          data: {
            name: formData.name,
            targetAmount: formData.targetAmount,
            deadline: formData.deadline,
          },
        }).unwrap();
      } else {
        // Создаем новую цель
        await createGoal(formData).unwrap();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  const activeAccounts = accounts?.filter(
    account => account.status === 'active'
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Ошибка при сохранении цели. Пожалуйста, попробуйте снова.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название цели"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isLoading}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!!goal || isLoading}
              error={!!errors.accountId}
            >
              <InputLabel id="account-label">Счет</InputLabel>
              <Select
                labelId="account-label"
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                label="Счет"
              >
                {activeAccounts?.map(account => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} (
                    {formatCurrencyWithDots(account.balance, account.currency)})
                  </MenuItem>
                ))}
              </Select>
              {errors.accountId && (
                <FormHelperText>{errors.accountId}</FormHelperText>
              )}
              {goal && (
                <FormHelperText>
                  Счет нельзя изменить после создания
                </FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Целевая сумма"
              name="targetAmount"
              type="number"
              value={formData.targetAmount}
              onChange={handleChange}
              error={!!errors.targetAmount}
              helperText={errors.targetAmount}
              disabled={isLoading}
              InputProps={{
                inputProps: { step: '0.01', min: '0.01' },
              }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <DatePicker
              label="Срок достижения"
              value={new Date(formData.deadline)}
              onChange={handleDateChange}
              disabled={isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.deadline,
                  helperText: errors.deadline,
                },
              }}
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
            {isLoading ? (
              <CircularProgress size={24} />
            ) : goal ? (
              'Сохранить'
            ) : (
              'Создать'
            )}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default GoalForm;

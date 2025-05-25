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
import {
  Account,
  AccountType,
  CreateAccountRequest,
} from '../../../entities/account/model/types';
import {
  useCreateAccountMutation,
  useUpdateAccountMutation,
} from '../../../entities/account/api/accountApi';

interface AccountFormProps {
  account?: Account | null;
  onClose: () => void;
}

const accountTypes: { value: AccountType; label: string }[] = [
  { value: 'bank', label: 'Банковский счет' },
  { value: 'deposit', label: 'Вклад' },
];

const currencies = ['RUB', 'USD', 'EUR', 'GBP'];

const AccountForm: React.FC<AccountFormProps> = ({ account, onClose }) => {
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: account?.name || '',
    type: account?.type || 'bank',
    cardInfo: account?.cardInfo || '',
    balance: account ? account.balance : 0,
    currency: account?.currency || 'RUB',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createAccount, { isLoading: isCreating, error: createError }] =
    useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating, error: updateError }] =
    useUpdateAccountMutation();

  const isLoading = isCreating || isUpdating;
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Название счета обязательно';
    }

    if (formData.name && formData.name.trim().length > 100) {
      newErrors.name = 'Название счета не может быть длиннее 100 символов';
    }

    if (formData.balance !== undefined && formData.balance < 0) {
      newErrors.balance = 'Баланс не может быть отрицательным';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (account) {
        // Обновляем существующий счет
        console.log('Updating account:', {
          id: account.id,
          data: {
            name: formData.name,
            cardInfo: formData.cardInfo,
          },
        });

        const result = await updateAccount({
          id: account.id,
          data: {
            name: formData.name.trim(),
            cardInfo: formData.cardInfo?.trim() || '',
          },
        }).unwrap();

        console.log('Account updated successfully:', result);
      } else {
        // Создаем новый счет
        console.log('Creating new account:', formData);
        const result = await createAccount(formData).unwrap();
        console.log('Account created successfully:', result);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save account:', err);
      console.error('Error details:', {
        status: (err as any)?.status,
        data: (err as any)?.data,
        message: (err as any)?.message,
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as any)?.data?.message ||
            'Ошибка при сохранении счета. Пожалуйста, попробуйте снова.'}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Название счета"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth disabled={isLoading}>
            <InputLabel id="type-label">Тип счета</InputLabel>
            <Select
              labelId="type-label"
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Тип счета"
            >
              {accountTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth disabled={isLoading}>
            <InputLabel id="currency-label">Валюта</InputLabel>
            <Select
              labelId="currency-label"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              label="Валюта"
            >
              {currencies.map(currency => (
                <MenuItem key={currency} value={currency}>
                  {currency}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Номер карты или счета (опционально)"
            name="cardInfo"
            value={formData.cardInfo}
            onChange={handleChange}
            disabled={isLoading}
          />
        </Grid>

        {!account && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Начальный баланс"
              name="balance"
              type="number"
              value={formData.balance}
              onChange={handleChange}
              error={!!errors.balance}
              helperText={errors.balance}
              disabled={isLoading}
              InputProps={{
                inputProps: { step: '0.01' },
              }}
            />
          </Grid>
        )}
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
          ) : account ? (
            'Сохранить'
          ) : (
            'Создать'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default AccountForm;

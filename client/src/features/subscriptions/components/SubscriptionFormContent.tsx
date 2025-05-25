import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  InputAdornment,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';
import { useGetAccountsQuery } from '../../../entities/account/api/accountApi';
import { useGetCategoriesQuery } from '../../../entities/category/api/categoryApi';
import { useCreateSubscriptionMutation } from '../../../entities/subscription/api/subscriptionApi';
import {
  Subscription,
  SubscriptionFrequency,
} from '../../../entities/subscription/model/types';

interface SubscriptionFormContentProps {
  subscription?: Subscription | null;
  onClose: () => void;
}

const SubscriptionFormContent: React.FC<SubscriptionFormContentProps> = ({
  subscription,
  onClose,
}) => {
  const isEdit = Boolean(subscription);
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'RUB',
    frequency: 'monthly' as SubscriptionFrequency,
    customFrequencyDays: '',
    startDate: new Date(),
    endDate: null as Date | null,
    accountId: '',
    categoryId: '',
    autoPayment: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: accountsData } = useGetAccountsQuery({});
  const { data: categoriesData } = useGetCategoriesQuery({ type: 'expense' });

  // Инициализация формы при редактировании
  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        description: subscription.description || '',
        amount: subscription.amount.toString(),
        currency: subscription.currency,
        frequency: subscription.frequency as SubscriptionFrequency,
        customFrequencyDays: subscription.customFrequencyDays?.toString() || '',
        startDate: new Date(subscription.startDate),
        endDate: subscription.endDate ? new Date(subscription.endDate) : null,
        accountId: subscription.accountId,
        categoryId: subscription.categoryId || '',
        autoPayment: subscription.autoPayment,
      });
    }
  }, [subscription]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | any
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });

    // Очистка ошибки при изменении поля
    if (errors[name as string]) {
      setErrors({
        ...errors,
        [name as string]: '',
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setFormData({
        ...formData,
        startDate: date,
      });

      if (errors.startDate) {
        setErrors({
          ...errors,
          startDate: '',
        });
      }
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      endDate: date,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Введите корректную сумму';
    }

    if (!formData.accountId) {
      newErrors.accountId = 'Выберите счет';
    }

    if (
      formData.frequency === 'custom' &&
      (!formData.customFrequencyDays ||
        parseInt(formData.customFrequencyDays) <= 0)
    ) {
      newErrors.customFrequencyDays = 'Укажите количество дней';
    }

    const startDate = new Date(formData.startDate);
    if (isNaN(startDate.getTime())) {
      newErrors.startDate = 'Введите корректную дату';
    }

    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      if (isNaN(endDate.getTime())) {
        newErrors.endDate = 'Введите корректную дату';
      } else if (endDate <= startDate) {
        newErrors.endDate = 'Дата окончания должна быть позже даты начала';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const subscriptionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      customFrequencyDays: formData.customFrequencyDays
        ? parseInt(formData.customFrequencyDays)
        : undefined,
      categoryId: formData.categoryId || undefined,
    };

    try {
      await createSubscription(subscriptionData).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create subscription:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Название"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="description"
              label="Описание"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              name="amount"
              label="Сумма"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
              required
              type="number"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₽</InputAdornment>
                ),
              }}
              error={!!errors.amount}
              helperText={errors.amount}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl
              fullWidth
              required
              error={!!errors.accountId}
              disabled={isLoading}
            >
              <InputLabel>Счет списания</InputLabel>
              <Select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                label="Счет списания"
              >
                {(accountsData ?? [])
                  .filter(account => account.status === 'active')
                  .map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.name} ({account.balance.toFixed(2)}{' '}
                      {account.currency})
                    </MenuItem>
                  ))}
              </Select>
              {errors.accountId && (
                <FormHelperText>{errors.accountId}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Категория (опционально)</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Категория (опционально)"
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {(categoriesData ?? [])
                  .filter(category => category.type === 'expense')
                  .map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Частота</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Частота"
              >
                <MenuItem value="daily">Ежедневно</MenuItem>
                <MenuItem value="weekly">Еженедельно</MenuItem>
                <MenuItem value="monthly">Ежемесячно</MenuItem>
                <MenuItem value="quarterly">Ежеквартально</MenuItem>
                <MenuItem value="yearly">Ежегодно</MenuItem>
                <MenuItem value="custom">Пользовательский</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {formData.frequency === 'custom' && (
            <Grid item xs={12}>
              <TextField
                name="customFrequencyDays"
                label="Интервал в днях"
                value={formData.customFrequencyDays}
                onChange={handleChange}
                fullWidth
                type="number"
                error={!!errors.customFrequencyDays}
                helperText={errors.customFrequencyDays}
                disabled={isLoading}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата начала"
              value={formData.startDate}
              onChange={handleStartDateChange}
              disabled={isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.startDate,
                  helperText: errors.startDate,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <DatePicker
              label="Дата окончания (опционально)"
              value={formData.endDate}
              onChange={handleEndDateChange}
              disabled={isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!errors.endDate,
                  helperText: errors.endDate,
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="autoPayment"
                  checked={formData.autoPayment}
                  onChange={handleCheckboxChange}
                  disabled={isLoading}
                />
              }
              label="Автоматический платеж"
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
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default SubscriptionFormContent;

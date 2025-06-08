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
  Grid,
  InputAdornment,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ru } from 'date-fns/locale';
import { useGetAccountsQuery } from '../../../entities/account/api/accountApi';
import { useGetCategoriesQuery } from '../../../entities/category/api/categoryApi';
import { formatCurrencyWithDots } from '../../../shared/utils/formatUtils';
import {
  Subscription,
  SubscriptionFrequency,
} from '../../../entities/subscription/model/types';

interface SubscriptionFormProps {
  subscription?: Subscription | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (subscriptionData: any) => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscription,
  open,
  onClose,
  onSubmit,
}) => {
  const isEdit = Boolean(subscription);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const subscriptionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        customFrequencyDays: formData.customFrequencyDays
          ? parseInt(formData.customFrequencyDays)
          : undefined,
        categoryId: formData.categoryId || undefined,
      };

      onSubmit(subscriptionData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? 'Редактирование подписки' : 'Новая подписка'}
      </DialogTitle>
      <DialogContent dividers>
        <form onSubmit={handleSubmit}>
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!!errors.accountId}>
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
                        {account.name} (
                        {formatCurrencyWithDots(
                          account.balance,
                          account.currency
                        )}
                        )
                      </MenuItem>
                    ))}
                </Select>
                {errors.accountId && (
                  <FormHelperText>{errors.accountId}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Категория (опционально)</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Категория (опционально)"
                >
                  <MenuItem value="">Нет категории</MenuItem>
                  {(categoriesData ?? [])
                    .filter(
                      (category: any) =>
                        category.status === 'active' &&
                        category.type === 'expense'
                    )
                    .map((category: any) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Периодичность</InputLabel>
                <Select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  label="Периодичность"
                >
                  <MenuItem value="weekly">Еженедельно</MenuItem>
                  <MenuItem value="biweekly">Раз в 2 недели</MenuItem>
                  <MenuItem value="monthly">Ежемесячно</MenuItem>
                  <MenuItem value="quarterly">Ежеквартально</MenuItem>
                  <MenuItem value="yearly">Ежегодно</MenuItem>
                  <MenuItem value="custom">Собственный период</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.frequency === 'custom' && (
              <Grid item xs={12} md={6}>
                <TextField
                  name="customFrequencyDays"
                  label="Количество дней между платежами"
                  value={formData.customFrequencyDays}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="number"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">дней</InputAdornment>
                    ),
                  }}
                  error={!!errors.customFrequencyDays}
                  helperText={errors.customFrequencyDays}
                />
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ru}
              >
                <DatePicker
                  label="Дата начала"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ru}
              >
                <DatePicker
                  label="Дата окончания (опционально)"
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="autoPayment"
                      checked={formData.autoPayment}
                      onChange={handleCheckboxChange}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Автоматический платеж (будет создан автоматически в дату
                      платежа)
                    </Typography>
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionForm;

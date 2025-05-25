import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  InputAdornment,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import {
  Debt,
  DebtType,
  PaymentFrequency,
} from '../../../entities/debt/model/types';
import { useGetAccountsQuery } from '../../../entities/account/api/accountApi';
import { useCreateDebtMutation } from '../../../entities/debt/api/debtApi';

interface DebtFormContentProps {
  debt?: Debt | null;
  onClose: () => void;
}

const DebtFormContent: React.FC<DebtFormContentProps> = ({ debt, onClose }) => {
  const isEditing = !!debt;
  const { data: accounts } = useGetAccountsQuery({ status: 'active' });
  const [createDebt, { isLoading }] = useCreateDebtMutation();

  const [formData, setFormData] = useState({
    name: '',
    type: 'loan' as DebtType,
    initialAmount: '',
    interestRate: '',
    startDate: new Date(),
    endDate: null as Date | null,
    paymentFrequency: 'monthly' as PaymentFrequency,
    lenderName: '',
    linkedAccountId: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    initialAmount: '',
  });

  // При редактировании заполняем форму данными долга
  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        type: debt.type,
        initialAmount: debt.initialAmount.toString(),
        interestRate: debt.interestRate.toString(),
        startDate: new Date(debt.startDate),
        endDate: debt.endDate ? new Date(debt.endDate) : null,
        paymentFrequency: debt.paymentFrequency,
        lenderName: debt.lenderName || '',
        linkedAccountId: debt.linkedAccountId || '',
      });
    }
  }, [debt]);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
      | any
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));

    // Очищаем ошибки при изменении поля
    if (name === 'name' || name === 'initialAmount') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: DebtType | null
  ) => {
    if (newType) {
      setFormData(prev => ({ ...prev, type: newType }));
    }
  };

  const handleStartDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, startDate: date }));
    }
  };

  const handleEndDateChange = (date: Date | null) => {
    setFormData(prev => ({ ...prev, endDate: date }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      initialAmount: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
      isValid = false;
    }

    if (!formData.initialAmount.trim()) {
      newErrors.initialAmount = 'Укажите сумму долга';
      isValid = false;
    } else if (Number(formData.initialAmount) <= 0) {
      newErrors.initialAmount = 'Сумма должна быть больше нуля';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      initialAmount: parseFloat(formData.initialAmount),
      interestRate: formData.interestRate
        ? parseFloat(formData.interestRate)
        : 0,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate ? formData.endDate.toISOString() : undefined,
    };

    try {
      await createDebt(submitData).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to create debt:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название"
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
            <Typography variant="subtitle2" gutterBottom>
              Тип долга
            </Typography>
            <ToggleButtonGroup
              value={formData.type}
              exclusive
              onChange={handleTypeChange}
              aria-label="тип долга"
              fullWidth
              disabled={isLoading}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="credit" aria-label="кредит">
                <BankIcon sx={{ mr: 1 }} />
                Кредит
              </ToggleButton>
              <ToggleButton value="loan" aria-label="займ">
                <PaymentIcon sx={{ mr: 1 }} />
                Займ
              </ToggleButton>
              <ToggleButton value="creditCard" aria-label="кредитная карта">
                <CreditCardIcon sx={{ mr: 1 }} />
                Карта
              </ToggleButton>
              <ToggleButton value="personalDebt" aria-label="личный долг">
                <PersonIcon sx={{ mr: 1 }} />
                Личный
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Сумма"
              name="initialAmount"
              type="number"
              value={formData.initialAmount}
              onChange={handleChange}
              error={!!errors.initialAmount}
              helperText={errors.initialAmount}
              disabled={isLoading || isEditing}
              InputProps={{
                endAdornment: <InputAdornment position="end">₽</InputAdornment>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Процентная ставка"
              name="interestRate"
              type="number"
              value={formData.interestRate}
              onChange={handleChange}
              disabled={isLoading}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Дата открытия"
              value={formData.startDate}
              onChange={handleStartDateChange}
              disabled={isLoading || isEditing}
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Дата закрытия (опционально)"
              value={formData.endDate}
              onChange={handleEndDateChange}
              disabled={isLoading}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Частота платежей</InputLabel>
              <Select
                name="paymentFrequency"
                value={formData.paymentFrequency}
                onChange={handleChange}
                label="Частота платежей"
              >
                <MenuItem value="weekly">Еженедельно</MenuItem>
                <MenuItem value="biweekly">Раз в две недели</MenuItem>
                <MenuItem value="monthly">Ежемесячно</MenuItem>
                <MenuItem value="quarterly">Ежеквартально</MenuItem>
                <MenuItem value="custom">Другое</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Кредитор / Банк"
              name="lenderName"
              value={formData.lenderName}
              onChange={handleChange}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth disabled={isLoading}>
              <InputLabel>Привязанный счет (опционально)</InputLabel>
              <Select
                name="linkedAccountId"
                value={formData.linkedAccountId}
                onChange={handleChange}
                label="Привязанный счет (опционально)"
              >
                <MenuItem value="">Не выбрано</MenuItem>
                {accounts?.map(account => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} ({account.balance.toLocaleString()} ₽)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {isEditing && (
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 1 }}>
                Некоторые поля недоступны для редактирования после создания
                долга.
              </Alert>
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
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default DebtFormContent;

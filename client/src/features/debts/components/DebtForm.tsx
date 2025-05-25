import React, { useState, useEffect } from 'react';
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
  Grid,
  Typography,
  InputAdornment,
  Divider,
  Box,
  ToggleButtonGroup,
  ToggleButton,
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

import { Debt, DebtType, PaymentFrequency } from 'entities/debt/model/types';
import { useGetAccountsQuery } from 'entities/account/api/accountApi';

interface DebtFormProps {
  debt?: Debt | null;
  onClose: () => void;
  onSubmit: (debtData: any) => void;
}

const DebtForm: React.FC<DebtFormProps> = ({ debt, onClose, onSubmit }) => {
  const isEditing = !!debt;
  const { data: accounts } = useGetAccountsQuery({ status: 'active' });

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

  const handleSubmit = (e: React.FormEvent) => {
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
    };

    onSubmit(submitData);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditing ? 'Редактировать долг' : 'Добавить новый долг'}
      </DialogTitle>
      <Divider />

      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <form onSubmit={handleSubmit}>
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
                  margin="normal"
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
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">₽</InputAdornment>
                    ),
                  }}
                  required
                  disabled={isEditing}
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
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Дата открытия"
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                      required: true,
                    },
                  }}
                  disabled={isEditing}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Дата закрытия (опционально)"
                  value={formData.endDate}
                  onChange={handleEndDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
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
                  margin="normal"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
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
                  <Box
                    sx={{
                      mt: 2,
                      bgcolor: 'background.default',
                      p: 2,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary">
                      Примечание: некоторые поля недоступны для редактирования
                      после создания долга.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </LocalizationProvider>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEditing ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DebtForm;

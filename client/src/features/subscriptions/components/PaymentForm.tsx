import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  InputAdornment,
  Typography,
  Box,
  Paper,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Subscription } from '../../../entities/subscription/model/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../../../shared/utils/formatUtils';

interface PaymentFormProps {
  subscription: Subscription;
  open: boolean;
  onClose: () => void;
  onSubmit: (paymentData: any) => Promise<any>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  subscription,
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    amount: subscription.amount.toString(),
    description: `Платеж за ${subscription.name} (${format(
      new Date(),
      'dd.MM.yyyy'
    )})`,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Введите корректную сумму';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        const paymentData = {
          ...formData,
          amount: parseFloat(formData.amount),
        };

        const response = await onSubmit(paymentData);
        setResult(response);
      } catch (error) {
        console.error('Error submitting payment:', error);
        setErrors({
          submit: 'Ошибка при создании платежа. Пожалуйста, попробуйте снова.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Запись платежа по подписке</DialogTitle>
      <DialogContent dividers>
        {!result ? (
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Paper
                variant="outlined"
                sx={{ p: 2, backgroundColor: 'background.default' }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Информация о подписке:
                </Typography>
                <Typography variant="body2">
                  <strong>Название:</strong> {subscription.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Сумма по расписанию:</strong>{' '}
                  {formatNumber(subscription.amount)} {subscription.currency}
                </Typography>
                <Typography variant="body2">
                  <strong>Дата следующего платежа:</strong>{' '}
                  {format(
                    new Date(subscription.nextPaymentDate),
                    'dd MMMM yyyy',
                    { locale: ru }
                  )}
                </Typography>
              </Paper>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="amount"
                  label="Сумма платежа"
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
                  helperText={
                    errors.amount ||
                    'Вы можете изменить сумму платежа, если она отличается от запланированной'
                  }
                  disabled={isSubmitting}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="description"
                  label="Комментарий к платежу"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isSubmitting}
                />
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <Alert severity="error">{errors.submit}</Alert>
                </Grid>
              )}
            </Grid>
          </form>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Платеж успешно записан!
            </Alert>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Информация о платеже
              </Typography>
              <Typography variant="body2">
                <strong>Сумма:</strong> {formatNumber(result.payment.amount)} ₽
              </Typography>
              <Typography variant="body2">
                <strong>Дата:</strong>{' '}
                {format(new Date(result.payment.date), 'dd MMMM yyyy', {
                  locale: ru,
                })}
              </Typography>
              <Typography variant="body2">
                <strong>Статус:</strong>{' '}
                {result.payment.status === 'success'
                  ? 'Выполнен'
                  : result.payment.status}
              </Typography>
              {result.payment.description && (
                <Typography variant="body2">
                  <strong>Комментарий:</strong> {result.payment.description}
                </Typography>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Информация о счете
              </Typography>
              <Typography variant="body2">
                <strong>Новый баланс:</strong>{' '}
                {result.account.balance.toFixed(2)} ₽
              </Typography>
            </Paper>

            <Typography variant="body2" color="text.secondary">
              Следующий платеж по этой подписке запланирован на{' '}
              {format(
                new Date(result.subscription.nextPaymentDate),
                'dd MMMM yyyy',
                { locale: ru }
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{result ? 'Закрыть' : 'Отмена'}</Button>
        {!result && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Записать платеж'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PaymentForm;

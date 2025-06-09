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
import { formatCurrencyWithDots } from '../../../shared/utils/formatUtils';
import {
  Transaction,
  TransactionType,
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from '../../../entities/transaction/model/types';
import { useGetAccountsQuery } from '../../../entities/account/api/accountApi';
import { useGetCategoriesQuery } from '../../../entities/category/api/categoryApi';
import {
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
} from '../../../entities/transaction/api/transactionApi';
import { useAccountsRefresh } from '../../../shared/hooks/useAccountsRefresh';

interface TransactionFormProps {
  transaction?: Transaction | null;
  onClose: () => void;
  initialType?: TransactionType;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onClose,
  initialType,
}) => {
  const [type, setType] = useState<TransactionType>(
    transaction?.type || initialType || 'expense'
  );

  const [formData, setFormData] = useState<CreateTransactionRequest>(() => {
    if (transaction) {
      // Извлекаем ID из объектов, если они populate
      const accountId =
        typeof transaction.accountId === 'object' &&
        (transaction.accountId as any)?._id
          ? (transaction.accountId as any)._id
          : transaction.accountId || '';

      const categoryId =
        typeof transaction.categoryId === 'object' &&
        (transaction.categoryId as any)?._id
          ? (transaction.categoryId as any)._id
          : transaction.categoryId || '';

      const toAccountId =
        typeof transaction.toAccountId === 'object' &&
        (transaction.toAccountId as any)?._id
          ? (transaction.toAccountId as any)._id
          : transaction.toAccountId || '';

      return {
        type: transaction.type,
        amount: transaction.amount,
        categoryId: categoryId,
        accountId: accountId,
        toAccountId: toAccountId,
        date: transaction.date,
        description: transaction.description || '',
      };
    }

    return {
      type: type,
      amount: 0,
      categoryId: '',
      accountId: '',
      toAccountId: '',
      date: new Date().toISOString(),
      description: '',
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Обновляем форму при изменении transaction
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);

      // Извлекаем ID из объектов, если они populate
      const accountId =
        typeof transaction.accountId === 'object' &&
        (transaction.accountId as any)?._id
          ? (transaction.accountId as any)._id
          : transaction.accountId || '';

      const categoryId =
        typeof transaction.categoryId === 'object' &&
        (transaction.categoryId as any)?._id
          ? (transaction.categoryId as any)._id
          : transaction.categoryId || '';

      const toAccountId =
        typeof transaction.toAccountId === 'object' &&
        (transaction.toAccountId as any)?._id
          ? (transaction.toAccountId as any)._id
          : transaction.toAccountId || '';

      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        categoryId: categoryId,
        accountId: accountId,
        toAccountId: toAccountId,
        date: transaction.date,
        description: transaction.description || '',
      });
    }
  }, [transaction]);

  // Обновляем formData.type при изменении type
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: type,
    }));
  }, [type]);

  const { data: accounts, isLoading: accountsLoading } = useGetAccountsQuery();
  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoriesQuery({
      type: type !== 'transfer' ? type : undefined,
      status: 'active',
    });

  const [createTransaction, { isLoading: isCreating, error: createError }] =
    useCreateTransactionMutation();
  const [updateTransaction, { isLoading: isUpdating, error: updateError }] =
    useUpdateTransactionMutation();

  const { refreshAccounts, refreshAccountById } = useAccountsRefresh();

  const isLoading =
    isCreating || isUpdating || accountsLoading || categoriesLoading;
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
    setFormData(prev => ({
      ...prev,
      date: date ? date.toISOString() : new Date().toISOString(),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Сумма должна быть больше нуля';
    }

    if (!formData.accountId) {
      newErrors.accountId =
        type === 'transfer' ? 'Выберите счет списания' : 'Выберите счет';
    }

    if (type === 'transfer' && !formData.toAccountId) {
      newErrors.toAccountId = 'Выберите счет зачисления';
    }

    if (
      type === 'transfer' &&
      formData.accountId === formData.toAccountId &&
      formData.accountId
    ) {
      newErrors.toAccountId = 'Счета должны быть разными';
    }

    if (type !== 'transfer' && !formData.categoryId) {
      newErrors.categoryId = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (transaction) {
        // Обновляем существующую транзакцию
        await updateTransaction({
          id: transaction.id,
          data: {
            type: formData.type,
            amount: formData.amount,
            categoryId: formData.categoryId || undefined,
            accountId: formData.accountId,
            toAccountId: formData.toAccountId || undefined,
            date: formData.date,
            description: formData.description,
          },
        }).unwrap();

        // Принудительно обновляем данные счетов
        refreshAccountById(formData.accountId);
        if (formData.toAccountId) {
          refreshAccountById(formData.toAccountId);
        }
      } else {
        // Создаем новую транзакцию
        await createTransaction(formData).unwrap();

        // Принудительно обновляем данные счетов
        refreshAccountById(formData.accountId);
        if (formData.toAccountId) {
          refreshAccountById(formData.toAccountId);
        }
      }

      // Дополнительная задержка для синхронизации
      setTimeout(() => {
        refreshAccounts();
      }, 500);

      onClose();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при сохранении транзакции:{' '}
          {(error as any)?.data?.message ||
            (error as any)?.message ||
            'Попробуйте снова'}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Сумма"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={!!errors.amount}
            helperText={errors.amount}
            disabled={isLoading}
            required
            InputProps={{ inputProps: { min: 0, step: '0.01' } }}
            sx={{
              '& input[type=number]': {
                MozAppearance: 'textfield',
              },
              '& input[type=number]::-webkit-outer-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
              '& input[type=number]::-webkit-inner-spin-button': {
                WebkitAppearance: 'none',
                margin: 0,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
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

        <Grid item xs={type === 'transfer' ? 6 : 12}>
          <FormControl
            fullWidth
            error={!!errors.accountId}
            disabled={isLoading}
          >
            <InputLabel id="account-label">
              {type === 'transfer' ? 'Счет списания' : 'Счет'}
            </InputLabel>
            <Select
              labelId="account-label"
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              label={type === 'transfer' ? 'Счет списания' : 'Счет'}
              required
            >
              {accounts
                ?.filter(acc => acc.status === 'active')
                .map(account => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name} (
                    {formatCurrencyWithDots(account.balance, account.currency)})
                  </MenuItem>
                ))}
            </Select>
            {errors.accountId && (
              <FormHelperText>{errors.accountId}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        {type === 'transfer' && (
          <Grid item xs={6}>
            <FormControl
              fullWidth
              error={!!errors.toAccountId}
              disabled={isLoading}
            >
              <InputLabel id="to-account-label">Счет зачисления</InputLabel>
              <Select
                labelId="to-account-label"
                name="toAccountId"
                value={formData.toAccountId}
                onChange={handleChange}
                label="Счет зачисления"
                required
              >
                {accounts
                  ?.filter(acc => acc.status === 'active')
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
              {errors.toAccountId && (
                <FormHelperText>{errors.toAccountId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        )}

        {type !== 'transfer' && (
          <Grid item xs={12}>
            <FormControl
              fullWidth
              error={!!errors.categoryId}
              disabled={isLoading}
            >
              <InputLabel id="category-label">Категория</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Категория"
                required
              >
                {categories
                  ?.filter(cat => cat.type === type)
                  .map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
              </Select>
              {errors.categoryId && (
                <FormHelperText>{errors.categoryId}</FormHelperText>
              )}
            </FormControl>
          </Grid>
        )}

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
          {isLoading ? (
            <CircularProgress size={24} />
          ) : transaction ? (
            'Сохранить'
          ) : (
            'Создать'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default TransactionForm;

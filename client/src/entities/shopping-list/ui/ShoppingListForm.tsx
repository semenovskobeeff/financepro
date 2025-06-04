import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import {
  ShoppingList,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  ShoppingListStatus,
} from '../model/types';
import {
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
} from '../api/shoppingListApi';

interface ShoppingListFormProps {
  list?: ShoppingList | null;
  onClose: () => void;
  onSuccess?: (list: ShoppingList) => void;
}

const ShoppingListForm: React.FC<ShoppingListFormProps> = ({
  list,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    deadline: null as Date | null,
    totalBudget: '',
    status: 'draft' as ShoppingListStatus,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createShoppingList, { isLoading: isCreating }] =
    useCreateShoppingListMutation();
  const [updateShoppingList, { isLoading: isUpdating }] =
    useUpdateShoppingListMutation();

  const isEditing = Boolean(list);
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (list) {
      setFormData({
        name: list.name,
        description: list.description || '',
        deadline: list.deadline ? new Date(list.deadline) : null,
        totalBudget: list.totalBudget.toString(),
        status: list.status,
      });
    }
  }, [list]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }

    if (
      !formData.totalBudget ||
      isNaN(Number(formData.totalBudget)) ||
      Number(formData.totalBudget) <= 0
    ) {
      newErrors.totalBudget = 'Бюджет должен быть положительным числом';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        deadline: formData.deadline?.toISOString(),
        totalBudget: Number(formData.totalBudget),
        ...(isEditing && { status: formData.status }),
      };

      let result;

      if (isEditing && list) {
        result = await updateShoppingList({
          id: list.id,
          data: requestData as UpdateShoppingListRequest,
        }).unwrap();
      } else {
        result = await createShoppingList(
          requestData as CreateShoppingListRequest
        ).unwrap();
      }

      onSuccess?.(result);
      onClose();
    } catch (error) {
      console.error('Error saving shopping list:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
      <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {isEditing
            ? 'Редактировать список покупок'
            : 'Создать список покупок'}
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Название списка"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              multiline
              rows={2}
              placeholder="Краткое описание списка покупок..."
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Бюджет"
              value={formData.totalBudget}
              onChange={e => handleChange('totalBudget', e.target.value)}
              error={!!errors.totalBudget}
              helperText={errors.totalBudget}
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Дедлайн"
              value={formData.deadline}
              onChange={value => handleChange('deadline', value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: 'Выберите дату',
                },
              }}
              minDate={new Date()}
            />
          </Grid>

          {isEditing && (
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                  label="Статус"
                >
                  <MenuItem value="draft">Черновик</MenuItem>
                  <MenuItem value="active">Активный</MenuItem>
                  <MenuItem value="completed">Завершен</MenuItem>
                  <MenuItem value="cancelled">Отменен</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          )}
        </Grid>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 3, justifyContent: 'flex-end' }}
        >
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? 'Сохранение...'
                : 'Создание...'
              : isEditing
              ? 'Сохранить'
              : 'Создать'}
          </Button>
        </Stack>
      </Box>
    </LocalizationProvider>
  );
};

export default ShoppingListForm;

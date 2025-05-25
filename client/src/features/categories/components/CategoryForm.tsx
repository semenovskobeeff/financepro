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
  Grid,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Category,
  CategoryType,
  CreateCategoryRequest,
} from '../../../entities/category/model/types';
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '../../../entities/category/api/categoryApi';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// Доступные иконки для категорий
const iconOptions = [
  { value: 'category', label: 'Категория' },
  { value: 'shopping', label: 'Покупки' },
  { value: 'food', label: 'Еда' },
  { value: 'home', label: 'Дом' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'health', label: 'Здоровье' },
  { value: 'sport', label: 'Спорт' },
  { value: 'education', label: 'Образование' },
  { value: 'work', label: 'Работа' },
  { value: 'income', label: 'Доход' },
  { value: 'tag', label: 'Тег' },
];

interface CategoryFormProps {
  category?: Category | null;
  initialType?: CategoryType;
  onClose: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  initialType = 'expense',
  onClose,
}) => {
  const [type, setType] = useState<CategoryType>(category?.type || initialType);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: category?.name || '',
    type: type,
    icon: category?.icon || 'category',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [createCategory, { isLoading: isCreating, error: createError }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, error: updateError }] =
    useUpdateCategoryMutation();

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;

  const handleTypeChange = (
    _: React.MouseEvent<HTMLElement>,
    newType: CategoryType | null
  ) => {
    if (newType) {
      setType(newType);
      setFormData(prev => ({
        ...prev,
        type: newType,
      }));
    }
  };

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

    if (!formData.name.trim()) {
      newErrors.name = 'Название категории обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (category) {
        // Обновляем существующую категорию
        await updateCategory({
          id: category.id,
          data: {
            name: formData.name,
            icon: formData.icon,
          },
        }).unwrap();
      } else {
        // Создаем новую категорию
        await createCategory(formData).unwrap();
      }
      onClose();
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Ошибка при сохранении категории. Пожалуйста, попробуйте снова.
        </Alert>
      )}

      <Grid container spacing={2}>
        {!category && (
          <Grid item xs={12}>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={handleTypeChange}
              aria-label="тип категории"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="expense" aria-label="расход">
                <ArrowDownwardIcon sx={{ mr: 1 }} />
                Расход
              </ToggleButton>
              <ToggleButton value="income" aria-label="доход">
                <ArrowUpwardIcon sx={{ mr: 1 }} />
                Доход
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Название категории"
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
          <FormControl fullWidth disabled={isLoading}>
            <InputLabel id="icon-label">Иконка</InputLabel>
            <Select
              labelId="icon-label"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              label="Иконка"
            >
              {iconOptions.map(icon => (
                <MenuItem key={icon.value} value={icon.value}>
                  {icon.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          ) : category ? (
            'Сохранить'
          ) : (
            'Создать'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default CategoryForm;

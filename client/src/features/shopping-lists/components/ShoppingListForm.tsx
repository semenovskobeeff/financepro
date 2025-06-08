import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category?: string;
}

interface ShoppingListFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: { name: string; items: ShoppingItem[] }) => void;
  initialData?: {
    name: string;
    items: ShoppingItem[];
  };
}

const ShoppingListForm: React.FC<ShoppingListFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [listName, setListName] = useState(initialData?.name || '');
  const [items, setItems] = useState<ShoppingItem[]>(initialData?.items || []);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    estimatedPrice: 0,
    category: '',
  });

  const handleAddItem = () => {
    if (newItem.name.trim()) {
      const item: ShoppingItem = {
        id: Date.now().toString(),
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        estimatedPrice: newItem.estimatedPrice,
        category: newItem.category.trim() || undefined,
      };
      setItems([...items, item]);
      setNewItem({
        name: '',
        quantity: 1,
        estimatedPrice: 0,
        category: '',
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = () => {
    if (listName.trim() && items.length > 0) {
      onSubmit?.({
        name: listName.trim(),
        items,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setListName('');
    setItems([]);
    setNewItem({
      name: '',
      quantity: 1,
      estimatedPrice: 0,
      category: '',
    });
    onClose();
  };

  const totalEstimatedPrice = items.reduce(
    (sum, item) => sum + item.estimatedPrice * item.quantity,
    0
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">
            {initialData
              ? 'Редактировать список покупок'
              : 'Новый список покупок'}
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <TextField
            label="Название списка"
            fullWidth
            value={listName}
            onChange={e => setListName(e.target.value)}
            margin="normal"
            required
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Добавить товар
        </Typography>

        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Название товара"
              fullWidth
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Количество"
              type="number"
              fullWidth
              value={newItem.quantity}
              onChange={e =>
                setNewItem({ ...newItem, quantity: Number(e.target.value) })
              }
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Примерная цена"
              type="number"
              fullWidth
              value={newItem.estimatedPrice}
              onChange={e =>
                setNewItem({
                  ...newItem,
                  estimatedPrice: Number(e.target.value),
                })
              }
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Категория"
              fullWidth
              value={newItem.category}
              onChange={e =>
                setNewItem({ ...newItem, category: e.target.value })
              }
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={1}>
            <Button
              variant="contained"
              onClick={handleAddItem}
              fullWidth
              sx={{ height: '40px' }}
              disabled={!newItem.name.trim()}
            >
              <AddIcon />
            </Button>
          </Grid>
        </Grid>

        {items.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Товары в списке ({items.length})
            </Typography>

            {items.map(item => (
              <Box
                key={item.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                mb={1}
                bgcolor="grey.50"
                borderRadius={1}
              >
                <Box flex={1}>
                  <Typography variant="subtitle2">{item.name}</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="body2" color="text.secondary">
                      Количество: {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Цена: {item.estimatedPrice} ₽
                    </Typography>
                    {item.category && (
                      <Chip label={item.category} size="small" />
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight="bold" mr={1}>
                    {(item.estimatedPrice * item.quantity).toFixed(2)} ₽
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={2}
              p={2}
              bgcolor="primary.light"
              borderRadius={1}
            >
              <Typography variant="h6" color="primary.contrastText">
                Итого:
              </Typography>
              <Typography variant="h6" color="primary.contrastText">
                {totalEstimatedPrice.toFixed(2)} ₽
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Отмена</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!listName.trim() || items.length === 0}
        >
          {initialData ? 'Сохранить' : 'Создать список'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShoppingListForm;

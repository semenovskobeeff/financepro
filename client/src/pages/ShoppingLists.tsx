import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import PageContainer from '../shared/ui/PageContainer';
import { NotionCard } from '../shared/ui/NotionCard';
import { formatNumber } from '../shared/utils/formatUtils';
import ShoppingListModal from '../features/shopping-lists/components/ShoppingListModal';
import {
  useGetShoppingListsQuery,
  useDeleteShoppingListMutation,
  useGetShoppingListStatisticsQuery,
} from '../entities/shopping-list/api/shoppingListApi';
import {
  ShoppingList,
  ShoppingListStatus,
} from '../entities/shopping-list/model/types';

const ShoppingLists: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const { data: lists = [], isLoading, error } = useGetShoppingListsQuery();
  const { data: stats } = useGetShoppingListStatisticsQuery();
  const [deleteShoppingList, { isLoading: isDeleting }] =
    useDeleteShoppingListMutation();

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    listId: string
  ) => {
    setMenuAnchor(event.currentTarget);
    setSelectedListId(listId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedListId(null);
  };

  const handleEdit = () => {
    const list = lists.find(l => l.id === selectedListId);
    if (list) {
      setEditingList(list);
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (selectedListId) {
      try {
        await deleteShoppingList(selectedListId).unwrap();
      } catch (error) {
        console.error('Error deleting shopping list:', error);
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: ShoppingListStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: ShoppingListStatus) => {
    switch (status) {
      case 'draft':
        return 'Черновик';
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };

  const calculateProgress = (list: ShoppingList) => {
    if (list.items.length === 0) return 0;
    const purchased = list.items.filter(item => item.isPurchased).length;
    return (purchased / list.items.length) * 100;
  };

  const isOverBudget = (list: ShoppingList) => {
    return list.spentAmount > list.totalBudget;
  };

  if (error) {
    return (
      <PageContainer title="Списки покупок">
        <Alert severity="error">Ошибка при загрузке списков покупок</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Списки покупок"
      subtitle="Планирование и контроль покупок"
      action={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
        >
          Создать список
        </Button>
      }
    >
      {/* Статистика */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <NotionCard
              title="Всего списков"
              icon={<ShoppingCartIcon />}
              color="blue"
            >
              <Typography variant="h4" fontWeight="bold">
                {stats.totalLists}
              </Typography>
            </NotionCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NotionCard
              title="Активных"
              icon={<ShoppingCartIcon />}
              color="green"
            >
              <Typography variant="h4" fontWeight="bold">
                {stats.activeLists}
              </Typography>
            </NotionCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NotionCard
              title="Общий бюджет"
              icon={<MoneyIcon />}
              color="yellow"
            >
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(stats.totalBudget)} ₽
              </Typography>
            </NotionCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <NotionCard title="Потрачено" icon={<MoneyIcon />} color="red">
              <Typography variant="h5" fontWeight="bold">
                {formatNumber(stats.totalSpent)} ₽
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Выполнено: {stats.completionRate.toFixed(1)}%
              </Typography>
            </NotionCard>
          </Grid>
        </Grid>
      )}

      {/* Список покупок */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : !Array.isArray(lists) || lists.length === 0 ? (
        <NotionCard title="Нет списков покупок" color="gray">
          <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
            Создайте свой первый список покупок для лучшего планирования бюджета
          </Typography>
          <Box display="flex" justifyContent="center">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowCreateModal(true)}
            >
              Создать список
            </Button>
          </Box>
        </NotionCard>
      ) : (
        <Grid container spacing={3}>
          {lists.map(list => (
            <Grid item xs={12} sm={6} md={4} key={list.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                  >
                    <Typography variant="h6" noWrap sx={{ maxWidth: '80%' }}>
                      {list.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={e => handleMenuOpen(e, list.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Box mb={2}>
                    <Chip
                      label={getStatusLabel(list.status)}
                      color={getStatusColor(list.status) as any}
                      size="small"
                    />
                  </Box>

                  {list.description && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {list.description}
                    </Typography>
                  )}

                  <Box mb={2}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Прогресс покупок
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress(list)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {list.items.filter(item => item.isPurchased).length} из{' '}
                      {list.items.length} товаров
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Бюджет:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {formatNumber(list.totalBudget)} ₽
                    </Typography>
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Потрачено:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      color={isOverBudget(list) ? 'error.main' : 'text.primary'}
                    >
                      {formatNumber(list.spentAmount)} ₽
                    </Typography>
                  </Box>

                  {list.deadline && (
                    <Box display="flex" alignItems="center" mt={2}>
                      <CalendarIcon
                        fontSize="small"
                        sx={{ mr: 1, color: 'text.secondary' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        До {new Date(list.deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  {isOverBudget(list) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      Превышен бюджет на{' '}
                      {formatNumber(list.spentAmount - list.totalBudget)} ₽
                    </Alert>
                  )}
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={() => setEditingList(list)}>
                    Управление
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Меню действий */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Редактировать
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={isDeleting}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Удалить
        </MenuItem>
      </Menu>

      {/* Модальные окна */}
      <ShoppingListModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <ShoppingListModal
        open={Boolean(editingList)}
        onClose={() => setEditingList(null)}
        list={editingList}
      />
    </PageContainer>
  );
};

export default ShoppingLists;

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
  Alert,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  RestoreFromTrash as RestoreIcon,
  AccountBalanceWallet as AccountIcon,
  Category as CategoryIcon,
  Savings as GoalIcon,
  CreditCard as DebtIcon,
  Subscriptions as SubscriptionIcon,
  FilterAlt as FilterIcon,
  DateRange as DateRangeIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumberWithDots } from '../shared/utils/formatUtils';
import PageContainer from 'shared/ui/PageContainer';
import {
  useGetArchivedItemsQuery,
  useGetArchiveStatsQuery,
  useRestoreFromArchiveMutation,
  useDeleteFromArchiveMutation,
  ArchiveItemType,
} from 'entities/archive/api/archiveApi';

// Компонент для отображения карточки архивного объекта
interface ArchiveItemCardProps {
  item: any;
  type: string;
  onRestore: () => void;
  onDelete: () => void;
}

const ArchiveItemCard: React.FC<ArchiveItemCardProps> = ({
  item,
  type,
  onRestore,
  onDelete,
}) => {
  // Определяем тип объекта для отображения соответствующей иконки
  const getItemIcon = () => {
    const itemType = item.itemType || type;
    switch (itemType) {
      case 'account':
      case 'accounts':
        return <AccountIcon />;
      case 'category':
      case 'categories':
        return <CategoryIcon />;
      case 'goal':
      case 'goals':
        return <GoalIcon />;
      case 'debt':
      case 'debts':
        return <DebtIcon />;
      case 'subscription':
      case 'subscriptions':
        return <SubscriptionIcon />;
      default:
        return <RestoreIcon />;
    }
  };

  // Отображаем специфические поля в зависимости от типа объекта
  const renderSpecificInfo = () => {
    const itemType = item.itemType || type;

    switch (itemType) {
      case 'account':
      case 'accounts':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Тип: {item.type}
            </Typography>
            <Typography
              variant="body2"
              color={item.balance < 0 ? 'error.main' : 'text.secondary'}
              sx={{ fontWeight: item.balance < 0 ? 'bold' : 'normal' }}
            >
              Баланс: {formatNumberWithDots(item.balance, 0)} ₽
            </Typography>
          </>
        );
      case 'category':
      case 'categories':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Тип: {item.type === 'income' ? 'Доход' : 'Расход'}
            </Typography>
          </>
        );
      case 'goal':
      case 'goals':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Цель: {formatNumberWithDots(item.targetAmount, 0)} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Собрано: {formatNumberWithDots(item.currentAmount, 0)} ₽
            </Typography>
          </>
        );
      case 'debt':
      case 'debts':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Сумма: {formatNumberWithDots(item.amount, 0)} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Тип: {item.type === 'owe' ? 'Должен я' : 'Должны мне'}
            </Typography>
          </>
        );
      case 'subscription':
      case 'subscriptions':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Стоимость: {formatNumberWithDots(item.amount, 0)} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Периодичность: {item.frequency}
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {getItemIcon()}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {item.name}
          </Typography>
        </Box>
        {renderSpecificInfo()}
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Архивирован:{' '}
          {format(new Date(item.updatedAt), 'dd/MM/yyyy', { locale: ru })}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          startIcon={<RestoreIcon />}
          onClick={onRestore}
        >
          Восстановить
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Удалить
        </Button>
      </CardActions>
    </Card>
  );
};

const Archive: React.FC = () => {
  // Текущий тип архивных объектов
  const [currentType, setCurrentType] = useState<ArchiveItemType>('accounts');

  // Состояние для фильтров
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Запрос архивных данных
  const {
    data: archiveData,
    isLoading,
    isFetching,
    refetch,
  } = useGetArchivedItemsQuery({
    type: currentType,
    page,
    search: searchQuery,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
  });

  // Запрос статистики архива
  const { data: statsData } = useGetArchiveStatsQuery();

  // Мутация для восстановления из архива
  const [restoreFromArchive, { isLoading: isRestoring }] =
    useRestoreFromArchiveMutation();
  const [deleteFromArchive, { isLoading: isDeleting }] =
    useDeleteFromArchiveMutation();

  // Состояние для диалога подтверждения удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    item: any;
    type: string;
  } | null>(null);

  // Обработчик смены типа архивных объектов
  const handleTypeChange = (
    event: React.SyntheticEvent,
    newType: ArchiveItemType
  ) => {
    setCurrentType(newType);
    setPage(1);
  };

  // Обработчик смены страницы пагинации
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // Обработчик поиска
  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    refetch();
  };

  // Обработчик восстановления объекта
  const handleRestore = async (item: any, type: string) => {
    try {
      await restoreFromArchive({
        type,
        id: item.id,
      }).unwrap();

      // Обновляем данные после восстановления
      refetch();
    } catch (error) {
      console.error('Ошибка восстановления:', error);
    }
  };

  // Сброс фильтров
  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  // Получаем количество архивных объектов по типу
  const getCountByType = (type: ArchiveItemType): number => {
    if (!statsData) return 0;
    return statsData.byType[type];
  };

  // Обработчик открытия диалога подтверждения удаления
  const handleDeleteClick = (item: any, type: string) => {
    setItemToDelete({ item, type });
    setDeleteDialogOpen(true);
  };

  // Обработчик закрытия диалога подтверждения удаления
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Обработчик удаления объекта
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteFromArchive({
        type: itemToDelete.type,
        id: itemToDelete.item.id,
      }).unwrap();

      // Обновляем данные после удаления
      refetch();

      // Закрываем диалог
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  return (
    <PageContainer
      title="Архив"
      action={{
        label: 'Фильтры',
        icon: <FilterIcon />,
        onClick: () => setShowFilters(!showFilters),
      }}
    >
      {/* Табы для выбора типа архивных объектов */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentType}
          onChange={handleTypeChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="archive tabs"
        >
          <Tab
            icon={<AccountIcon />}
            iconPosition="start"
            label={`Счета (${getCountByType('accounts')})`}
            value="accounts"
          />
          <Tab
            icon={<CategoryIcon />}
            iconPosition="start"
            label={`Категории (${getCountByType('categories')})`}
            value="categories"
          />
          <Tab
            icon={<GoalIcon />}
            iconPosition="start"
            label={`Цели (${getCountByType('goals')})`}
            value="goals"
          />
          <Tab
            icon={<DebtIcon />}
            iconPosition="start"
            label={`Долги (${getCountByType('debts')})`}
            value="debts"
          />
          <Tab
            icon={<SubscriptionIcon />}
            iconPosition="start"
            label={`Подписки (${getCountByType('subscriptions')})`}
            value="subscriptions"
          />
        </Tabs>
      </Paper>

      {/* Фильтры */}
      {showFilters && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Поиск"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ru}
              >
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Начальная дата"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRangeIcon />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Конечная дата"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <DateRangeIcon />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                </Grid>
              </LocalizationProvider>
              <Grid item xs={12} sm={6} md={2}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ height: '56px' }}
                  >
                    Найти
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleResetFilters}
                    sx={{ height: '56px' }}
                  >
                    Сброс
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Содержимое архива */}
      <Paper sx={{ p: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress />
          </Box>
        ) : !archiveData?.items ||
          !Array.isArray(archiveData.items) ||
          archiveData.items.length === 0 ? (
          <Alert severity="info">
            Архив пуст. Архивированные объекты будут отображаться здесь.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {archiveData?.items.map(item => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={`${item.itemType || currentType}-${item.id}`}
              >
                <ArchiveItemCard
                  item={item}
                  type={currentType}
                  onRestore={() => handleRestore(item, currentType)}
                  onDelete={() => handleDeleteClick(item, currentType)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Пагинация */}
        {archiveData && archiveData.pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={archiveData.pagination.totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы действительно хотите полностью удалить "{itemToDelete?.item.name}
            "?
            <br />
            Эта операция не может быть отменена. В связанных записях объект
            будет отмечен как "(в архиве)".
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose} color="primary">
            Отмена
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={isDeleting}
            startIcon={
              isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />
            }
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Archive;

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
  Receipt as TransactionIcon,
  Category as CategoryIcon,
  Savings as GoalIcon,
  CreditCard as DebtIcon,
  Subscriptions as SubscriptionIcon,
  FilterAlt as FilterIcon,
  DateRange as DateRangeIcon,
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CompareArrows as CompareArrowsIcon,
  AccountBalanceOutlined as AccountBalanceOutlinedIcon,
  CategoryOutlined as CategoryOutlinedIcon,
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
import { useGetAccountsQuery } from 'entities/account/api/accountApi';

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
  // Получаем список счетов для отображения имен счетов в транзакциях
  const { data: accounts } = useGetAccountsQuery();

  // Находим имя счета по его ID
  const getAccountName = (accountId?: string) => {
    if (!accountId) return 'Неизвестный счет';

    // Проверяем, есть ли сохраненное имя в самой транзакции (для удаленных счетов)
    if (item.itemType === 'transactions') {
      // Для основного счета транзакции
      if (accountId === item.accountId && item.accountName) {
        return item.accountName;
      }
      // Для счета назначения (при переводе)
      if (accountId === item.toAccountId && item.toAccountName) {
        return item.toAccountName;
      }
    }

    // Ищем счет в списке активных счетов
    const account = accounts?.find(a => a.id === accountId);

    // Если счет найден, возвращаем его имя, иначе "Неизвестный счет"
    return account?.name || 'Неизвестный счет';
  };

  // Определяем тип объекта для отображения соответствующей иконки
  const getItemIcon = () => {
    const itemType = item.itemType || type;
    switch (itemType) {
      case 'account':
      case 'accounts':
        return <AccountIcon />;
      case 'transaction':
      case 'transactions':
        return <TransactionIcon />;
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
            <Typography variant="body2" color="text.secondary">
              Баланс: {formatNumberWithDots(item.balance, 0)} ₽
            </Typography>
          </>
        );
      case 'transaction':
      case 'transactions':
        let typeLabel = '';
        let typeIcon: React.ReactElement | null = null;
        let typeColor = 'text.secondary';

        // Определяем тип транзакции на основе данных
        const transactionType = item.type || '';
        const actualType =
          transactionType === 'transfer' ||
          item.toAccountId ||
          (item.description &&
            (item.description.toLowerCase().includes('перевод') ||
              item.description.toLowerCase().includes('transfer') ||
              item.description.toLowerCase().includes('на счет') ||
              item.description.toLowerCase().includes('со счета')))
            ? 'transfer'
            : transactionType;

        switch (actualType) {
          case 'income':
            typeLabel = 'Доход';
            typeIcon = <ArrowUpwardIcon fontSize="small" />;
            typeColor = 'success.main';
            break;
          case 'expense':
            typeLabel = 'Расход';
            typeIcon = <ArrowDownwardIcon fontSize="small" />;
            typeColor = 'error.main';
            break;
          case 'transfer':
            typeLabel = 'Перевод';
            typeIcon = <CompareArrowsIcon fontSize="small" />;
            typeColor = 'info.main';
            break;
          default:
            typeLabel = transactionType;
        }

        return (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Box
                sx={{
                  color: typeColor,
                  display: 'flex',
                  alignItems: 'center',
                  mr: 1,
                }}
              >
                {typeIcon}
              </Box>
              <Typography variant="body2" color={typeColor} fontWeight="medium">
                {typeLabel}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color={
                actualType === 'income'
                  ? 'success.main'
                  : actualType === 'expense'
                  ? 'error.main'
                  : 'text.secondary'
              }
              fontWeight="500"
            >
              Сумма:{' '}
              {actualType === 'income'
                ? '+'
                : actualType === 'expense'
                ? '-'
                : ''}
              {item.amount?.toFixed(2)} ₽
            </Typography>

            {/* Информация о счетах в зависимости от типа транзакции */}
            {actualType === 'income' && (
              <Typography variant="body2" color="text.secondary">
                Счет: {getAccountName(item.accountId)}
              </Typography>
            )}

            {actualType === 'expense' && (
              <Typography variant="body2" color="text.secondary">
                Счет: {getAccountName(item.accountId)}
              </Typography>
            )}

            {actualType === 'transfer' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Со счета: {getAccountName(item.accountId)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  На счет: {getAccountName(item.toAccountId)}
                </Typography>
              </>
            )}

            {item.description && (
              <Typography variant="body2" color="text.secondary">
                Описание: {item.description}
              </Typography>
            )}
          </>
        );
      case 'category':
      case 'categories':
        return (
          <Typography variant="body2" color="text.secondary">
            Тип: {item.type}
          </Typography>
        );
      case 'goal':
      case 'goals':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Цель: {formatNumberWithDots(item.targetAmount, 0)} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Прогресс: {formatNumberWithDots(item.progress, 0)} ₽
            </Typography>
          </>
        );
      case 'debt':
      case 'debts':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Тип: {item.type}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Сумма: {formatNumberWithDots(item.initialAmount, 0)} ₽
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Остаток: {formatNumberWithDots(item.currentAmount, 0)} ₽
            </Typography>
          </>
        );
      case 'subscription':
      case 'subscriptions':
        return (
          <>
            <Typography variant="body2" color="text.secondary">
              Сумма: {formatNumberWithDots(item.amount, 0)} ₽
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
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1 }}>{getItemIcon()}</Box>
          <Typography variant="subtitle1">{item.name}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        {renderSpecificInfo()}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Архивировано: {new Date(item.updatedAt).toLocaleDateString()}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button startIcon={<RestoreIcon />} size="small" onClick={onRestore}>
          Восстановить
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          size="small"
          color="error"
          onClick={onDelete}
        >
          Удалить
        </Button>
      </CardActions>
    </Card>
  );
};

// Компонент для отображения списка архивных транзакций
const ArchiveTransactionsList: React.FC<{
  items: any[];
  onRestore: (item: any) => void;
  onDelete: (item: any) => void;
  transactionFilterType: string;
}> = ({ items, onRestore, onDelete, transactionFilterType }) => {
  const { data: accounts } = useGetAccountsQuery();

  // Находим имя счета по его ID
  const getAccountName = (item: any, accountId?: string) => {
    if (!accountId) return 'Неизвестный счет';

    // Проверяем, есть ли сохраненное имя в самой транзакции (для удаленных счетов)
    // Для основного счета транзакции
    if (accountId === item.accountId && item.accountName) {
      return item.accountName;
    }
    // Для счета назначения (при переводе)
    if (accountId === item.toAccountId && item.toAccountName) {
      return item.toAccountName;
    }

    // Ищем счет в списке активных счетов
    const account = accounts?.find(a => a.id === accountId);

    // Если счет найден, возвращаем его имя, иначе "Неизвестный счет"
    return account?.name || 'Неизвестный счет';
  };

  // Определяем тип транзакции с учетом описания
  const getTransactionType = (item: any) => {
    const transactionType = item.type;

    // Проверяем описание на наличие ключевых слов, указывающих на перевод
    const isTransferByDescription =
      item.description &&
      (item.description.toLowerCase().includes('перевод') ||
        item.description.toLowerCase().includes('transfer') ||
        item.description.toLowerCase().includes('на счет') ||
        item.description.toLowerCase().includes('со счета'));

    // Проверяем наличие toAccountId, что является прямым признаком перевода
    const hasToAccount = !!item.toAccountId;

    // Если в базе тип transfer или по описанию определили что это перевод или есть toAccountId
    return transactionType === 'transfer' ||
      isTransferByDescription ||
      hasToAccount
      ? 'transfer'
      : transactionType;
  };

  // Формат даты для вывода
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', mb: 0 }}>
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width="12%">Тип</TableCell>
              <TableCell width="23%">Описание</TableCell>
              <TableCell width="15%">Категория</TableCell>
              <TableCell width="20%">Счет</TableCell>
              <TableCell width="15%" align="right">
                Сумма
              </TableCell>
              <TableCell width="10%">Дата</TableCell>
              <TableCell width="5%" align="center">
                Действия
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => {
              const actualType = getTransactionType(item);

              // Определяем свойства для отображения типа
              let typeIcon;
              let typeColor;
              let typeLabel;

              switch (actualType) {
                case 'income':
                  typeIcon = <ArrowUpwardIcon fontSize="small" />;
                  typeColor = 'success.main';
                  typeLabel = 'Доход';
                  break;
                case 'expense':
                  typeIcon = <ArrowDownwardIcon fontSize="small" />;
                  typeColor = 'error.main';
                  typeLabel = 'Расход';
                  break;
                case 'transfer':
                  typeIcon = <CompareArrowsIcon fontSize="small" />;
                  typeColor = 'info.main';
                  typeLabel = 'Перевод';
                  break;
                default:
                  typeIcon = <TransactionIcon fontSize="small" />;
                  typeColor = 'text.secondary';
                  typeLabel = item.type;
              }

              // Формируем информацию о счетах
              let accountInfo = getAccountName(item, item.accountId);
              if (actualType === 'transfer') {
                accountInfo = `${getAccountName(
                  item,
                  item.accountId
                )} → ${getAccountName(item, item.toAccountId)}`;
              }

              // Категория транзакции
              let categoryDisplay = '-';

              // Для переводов не показываем категорию
              if (actualType === 'transfer') {
                categoryDisplay = '-';
              } else if (
                actualType === 'income' &&
                item.categoryId === 'category1'
              ) {
                categoryDisplay = 'Зарплата';
              } else if (
                actualType === 'income' &&
                item.categoryId === 'category5'
              ) {
                categoryDisplay = 'Подработка';
              } else if (
                actualType === 'expense' &&
                item.categoryId === 'category2'
              ) {
                categoryDisplay = 'Продукты';
              } else if (
                actualType === 'expense' &&
                item.categoryId === 'category3'
              ) {
                categoryDisplay = 'Развлечения';
              } else if (
                actualType === 'expense' &&
                item.categoryId === 'category4'
              ) {
                categoryDisplay = 'Коммунальные услуги';
              } else if (
                actualType === 'expense' &&
                item.categoryId === 'category6'
              ) {
                categoryDisplay = 'Техника';
              } else if (item.categoryName) {
                categoryDisplay = item.categoryName;
              }

              return (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          color: typeColor,
                          mr: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {typeIcon}
                      </Box>
                      <Typography variant="body2" color={typeColor}>
                        {typeLabel}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CategoryOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="body2">{categoryDisplay}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccountBalanceOutlinedIcon
                        fontSize="small"
                        color="action"
                      />
                      <Typography variant="body2">{accountInfo}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={
                        actualType === 'income'
                          ? 'success.main'
                          : actualType === 'expense'
                          ? 'error.main'
                          : 'text.secondary'
                      }
                      fontWeight="500"
                    >
                      {actualType === 'income'
                        ? '+'
                        : actualType === 'expense'
                        ? '-'
                        : ''}
                      {formatNumberWithDots(item.amount, 0)} ₽
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(item.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box
                      sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}
                    >
                      <Tooltip title="Восстановить">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => onRestore(item)}
                        >
                          <RestoreIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Удалить">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(item)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
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

  // Добавляем состояние для типа транзакции (для фильтрации среди архивных транзакций)
  const [transactionFilterType, setTransactionFilterType] =
    useState<string>('all');

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

  // Фильтруем транзакции по выбранному типу
  const filteredItems = useMemo(() => {
    if (!archiveData?.items || archiveData.items.length === 0) {
      return [];
    }

    if (transactionFilterType === 'all') {
      return archiveData.items;
    }

    return archiveData.items.filter(item => {
      // Для transfer проверяем дополнительно наличие поля toAccountId или ключевых слов
      if (transactionFilterType === 'transfer') {
        return (
          item.type === 'transfer' ||
          !!item.toAccountId ||
          (item.description &&
            (item.description.toLowerCase().includes('перевод') ||
              item.description.toLowerCase().includes('transfer') ||
              item.description.toLowerCase().includes('на счет') ||
              item.description.toLowerCase().includes('со счета')))
        );
      }

      // Для остальных типов просто сравниваем тип
      return item.type === transactionFilterType;
    });
  }, [archiveData?.items, transactionFilterType]);

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
      // Используем тип напрямую, так как больше нет типа 'all'
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
            icon={<TransactionIcon />}
            iconPosition="start"
            label={`Транзакции (${getCountByType('transactions')})`}
            value="transactions"
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

              {/* Добавляем фильтр по типам транзакций, если выбраны транзакции */}
              {currentType === 'transactions' && (
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Тип транзакции</InputLabel>
                    <Select
                      value={transactionFilterType}
                      onChange={e => {
                        const value = e.target.value;
                        setTransactionFilterType(value || 'all');

                        // Обновляем и searchQuery для совместимости с API
                        let newQuery = searchQuery
                          .replace(/type:[^ ]+ ?/g, '')
                          .trim();
                        if (value && value !== 'all') {
                          newQuery = `${
                            newQuery ? newQuery + ' ' : ''
                          }type:${value}`;
                        }
                        setSearchQuery(newQuery);

                        // Немедленно вызываем refetch для обновления данных
                        refetch();
                      }}
                      label="Тип транзакции"
                    >
                      <MenuItem value="all">Все типы</MenuItem>
                      <MenuItem value="income">Доходы</MenuItem>
                      <MenuItem value="expense">Расходы</MenuItem>
                      <MenuItem value="transfer">Переводы</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

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
        ) : !archiveData?.items || archiveData.items.length === 0 ? (
          <Alert severity="info">
            Архив пуст. Архивированные объекты будут отображаться здесь.
          </Alert>
        ) : currentType === 'transactions' ? (
          <Box sx={{ p: 0, m: 0 }}>
            {/* Вкладки для транзакций */}
            <Tabs
              value={transactionFilterType}
              onChange={(e, newValue) => {
                setTransactionFilterType(newValue);

                // Синхронизируем строку поиска с выбранным типом
                let newQuery = searchQuery.replace(/type:[^ ]+ ?/g, '').trim();
                if (newValue && newValue !== 'all') {
                  newQuery = `${
                    newQuery ? newQuery + ' ' : ''
                  }type:${newValue}`;
                }
                setSearchQuery(newQuery);

                // Немедленно обновляем данные
                refetch();
              }}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="transaction type tabs"
              sx={{ mb: 2 }}
            >
              <Tab
                icon={<FilterIcon />}
                iconPosition="start"
                label="Все"
                value="all"
              />
              <Tab
                icon={<ArrowUpwardIcon sx={{ color: 'success.main' }} />}
                iconPosition="start"
                label="Доходы"
                value="income"
              />
              <Tab
                icon={<ArrowDownwardIcon sx={{ color: 'error.main' }} />}
                iconPosition="start"
                label="Расходы"
                value="expense"
              />
              <Tab
                icon={<CompareArrowsIcon sx={{ color: 'info.main' }} />}
                iconPosition="start"
                label="Переводы"
                value="transfer"
              />
            </Tabs>

            {/* Проверяем, есть ли отфильтрованные транзакции */}
            {filteredItems && filteredItems.length > 0 ? (
              // Если есть - показываем таблицу
              <ArchiveTransactionsList
                items={filteredItems}
                onRestore={item => handleRestore(item, currentType)}
                onDelete={item => handleDeleteClick(item, currentType)}
                transactionFilterType={transactionFilterType}
              />
            ) : (
              // Если нет - показываем сообщение
              <Alert severity="info">
                {`Нет ${
                  transactionFilterType === 'income'
                    ? 'доходов'
                    : transactionFilterType === 'expense'
                    ? 'расходов'
                    : transactionFilterType === 'transfer'
                    ? 'переводов'
                    : 'транзакций'
                } в архиве`}
              </Alert>
            )}
          </Box>
        ) : (
          // Для других типов (не транзакции)
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

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  CircularProgress,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Tooltip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Transaction,
  TransactionType,
} from '../entities/transaction/model/types';
import PageContainer from '../shared/ui/PageContainer';
import {
  useGetTransactionsQuery,
  useDeleteTransactionMutation,
} from '../entities/transaction/api/transactionApi';
import { useGetAccountsQuery } from '../entities/account/api/accountApi';
import { useGetCategoriesQuery } from '../entities/category/api/categoryApi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  formatNumber,
  formatNumberWithDots,
} from '../shared/utils/formatUtils';
import { useModal } from '../shared/contexts/ModalContext';

const Transactions: React.FC = () => {
  // Глобальный контекст модалов
  const { openModal } = useModal();

  // Состояние фильтров
  const [filters, setFilters] = useState({
    type: '',
    accountId: '',
    categoryId: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Состояние активного фильтра по типу (для кнопок)
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('');

  // Состояние пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Состояние панели фильтров
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Получение данных - только активные операции
  const {
    data: transactionsData,
    isLoading,
    error,
  } = useGetTransactionsQuery({
    status: 'active',
    page: page + 1,
    limit: rowsPerPage,
    type:
      (activeTypeFilter as TransactionType) ||
      (filters.type as TransactionType) ||
      undefined,
    accountId: filters.accountId || undefined,
    categoryId: filters.categoryId || undefined,
    startDate: filters.startDate
      ? format(filters.startDate, 'yyyy-MM-dd')
      : undefined,
    endDate: filters.endDate
      ? format(filters.endDate, 'yyyy-MM-dd')
      : undefined,
  });

  const { data: accounts } = useGetAccountsQuery({});
  const { data: categories } = useGetCategoriesQuery({});

  const [deleteTransaction] = useDeleteTransactionMutation();

  // Обработчики для фильтрации по типу операции
  const handleTypeFilter = (type: TransactionType) => {
    if (activeTypeFilter === type) {
      // Если кликнули на уже активную кнопку - сбрасываем фильтр
      setActiveTypeFilter('');
    } else {
      setActiveTypeFilter(type);
    }
    setFilters(prev => ({ ...prev, type: '' })); // Сбрасываем фильтр в панели
    setPage(0);
  };

  // Обработчики для пагинации
  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Обработчики для фильтров
  const handleFilterReset = () => {
    setFilters({
      type: '',
      accountId: '',
      categoryId: '',
      startDate: null,
      endDate: null,
    });
    setActiveTypeFilter(''); // Сбрасываем фильтр кнопок
    setPage(0);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTypeFilter(''); // Сбрасываем фильтр кнопок при использовании панели
    setPage(0);
  };

  const handleFilterInputChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    // Если изменяется тип в панели фильтров, сбрасываем фильтр кнопок
    if (name === 'type') {
      setActiveTypeFilter('');
    }
  };

  // Функции для получения данных
  const getAccountName = (account: any) => {
    if (!account) return 'Неизвестный счет';

    if (typeof account === 'object' && account.name) {
      return account.name;
    }

    if (typeof account === 'string') {
      const foundAccount = accounts?.find(a => a.id === account);
      return foundAccount?.name || 'Неизвестный счет';
    }

    return 'Неизвестный счет';
  };

  const getCategoryName = (category?: any) => {
    if (!category) return 'Без категории';

    if (typeof category === 'object' && category.name) {
      return category.name;
    }

    if (typeof category === 'string') {
      const foundCategory = categories?.find(c => c.id === category);
      return foundCategory?.name || 'Неизвестная категория';
    }

    return 'Неизвестная категория';
  };

  const getTransactionTypeText = (type: TransactionType) => {
    switch (type) {
      case 'income':
        return 'Доход';
      case 'expense':
        return 'Расход';
      case 'transfer':
        return 'Перевод';
      default:
        return type;
    }
  };

  const getFormattedDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  // Обработчики для операций
  const handleEditTransaction = (transaction: Transaction) => {
    openModal('edit-transaction', transaction);
  };

  const handleDeleteTransaction = async (transaction: Transaction) => {
    try {
      await deleteTransaction(transaction.id).unwrap();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  if (error) {
    return (
      <PageContainer title="Операции">
        <Typography color="error">
          Ошибка при загрузке операций. Пожалуйста, попробуйте позже.
        </Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Операции">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Доходы">
            <Button
              variant={activeTypeFilter === 'income' ? 'contained' : 'outlined'}
              color="success"
              startIcon={<ArrowUpwardIcon />}
              onClick={() => handleTypeFilter('income')}
            >
              Доходы
            </Button>
          </Tooltip>
          <Tooltip title="Расходы">
            <Button
              variant={
                activeTypeFilter === 'expense' ? 'contained' : 'outlined'
              }
              color="error"
              startIcon={<ArrowDownwardIcon />}
              onClick={() => handleTypeFilter('expense')}
            >
              Расходы
            </Button>
          </Tooltip>
          <Tooltip title="Переводы">
            <Button
              variant={
                activeTypeFilter === 'transfer' ? 'contained' : 'outlined'
              }
              color="info"
              startIcon={<CompareArrowsIcon />}
              onClick={() => handleTypeFilter('transfer')}
            >
              Переводы
            </Button>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip
            title={isFilterPanelOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
          >
            <Button
              variant={isFilterPanelOpen ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<FilterListIcon />}
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            >
              Фильтры
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {isFilterPanelOpen && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box component="form" onSubmit={handleFilterSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="transaction-type-label">
                    Тип операции
                  </InputLabel>
                  <Select
                    labelId="transaction-type-label"
                    id="transaction-type"
                    value={filters.type}
                    label="Тип операции"
                    onChange={e =>
                      handleFilterInputChange('type', e.target.value)
                    }
                  >
                    <MenuItem value="">Все</MenuItem>
                    <MenuItem value="income">Доход</MenuItem>
                    <MenuItem value="expense">Расход</MenuItem>
                    <MenuItem value="transfer">Перевод</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="account-label">Счет</InputLabel>
                  <Select
                    labelId="account-label"
                    id="account"
                    value={filters.accountId}
                    label="Счет"
                    onChange={e =>
                      handleFilterInputChange('accountId', e.target.value)
                    }
                  >
                    <MenuItem value="">Все</MenuItem>
                    {accounts &&
                      Array.isArray(accounts) &&
                      accounts.map(account => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel id="category-label">Категория</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={filters.categoryId}
                    label="Категория"
                    onChange={e =>
                      handleFilterInputChange('categoryId', e.target.value)
                    }
                  >
                    <MenuItem value="">Все</MenuItem>
                    {categories &&
                      Array.isArray(categories) &&
                      categories.map(category => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ru}
                >
                  <DatePicker
                    label="С даты"
                    value={filters.startDate}
                    onChange={date =>
                      handleFilterInputChange('startDate', date)
                    }
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <LocalizationProvider
                  dateAdapter={AdapterDateFns}
                  adapterLocale={ru}
                >
                  <DatePicker
                    label="По дату"
                    value={filters.endDate}
                    onChange={date => handleFilterInputChange('endDate', date)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    startIcon={<SearchIcon />}
                    fullWidth
                  >
                    Поиск
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleFilterReset}
                    fullWidth
                  >
                    Сброс
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      <Box sx={{ flexGrow: 1 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">
            Ошибка при загрузке операций. Пожалуйста, попробуйте позже.
          </Typography>
        ) : !transactionsData?.transactions ||
          !Array.isArray(transactionsData.transactions) ||
          transactionsData.transactions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Операции не найдены
            </Typography>
            <Typography color="textSecondary" component="div" sx={{ mb: 2 }}>
              У вас пока нет операций или они не соответствуют выбранным
              фильтрам.
            </Typography>
          </Paper>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Дата</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Сумма</TableCell>
                    <TableCell>Счет</TableCell>
                    <TableCell>Категория</TableCell>
                    <TableCell>Описание</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionsData.transactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {getFormattedDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTransactionTypeText(transaction.type)}
                          color={
                            transaction.type === 'income'
                              ? 'success'
                              : transaction.type === 'expense'
                              ? 'error'
                              : 'info'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          color={
                            transaction.type === 'income'
                              ? 'success.main'
                              : transaction.type === 'expense'
                              ? 'error.main'
                              : 'text.primary'
                          }
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatNumberWithDots(transaction.amount, 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getAccountName(transaction.accountId)}
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'transfer'
                          ? '-'
                          : getCategoryName(transaction.categoryId)}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => handleEditTransaction(transaction)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTransaction(transaction)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={transactionsData.total || 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              labelRowsPerPage="Строк на странице:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} из ${count}`
              }
            />
          </Paper>
        )}
      </Box>
    </PageContainer>
  );
};

export default Transactions;

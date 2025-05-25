import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
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
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import {
  Transaction,
  TransactionType,
} from '../entities/transaction/model/types';
import TransactionForm from '../features/transactions/components/TransactionForm';
import PageContainer from '../shared/ui/PageContainer';
import {
  useGetTransactionsQuery,
  useArchiveTransactionMutation,
  useRestoreTransactionMutation,
} from '../entities/transaction/api/transactionApi';
import { useGetAccountsQuery } from '../entities/account/api/accountApi';
import { useGetCategoriesQuery } from '../entities/category/api/categoryApi';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../shared/utils/formatUtils';

const Transactions: React.FC = () => {
  // Состояние табов и формы
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [formType, setFormType] = useState<TransactionType>('expense');

  // Состояние фильтров
  const [filters, setFilters] = useState({
    type: '',
    accountId: '',
    categoryId: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Состояние пагинации
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Состояние панели фильтров
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Получение данных
  const {
    data: transactionsData,
    isLoading,
    error,
  } = useGetTransactionsQuery({
    status,
    page: page + 1,
    limit: rowsPerPage,
    type: (filters.type as TransactionType) || undefined,
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

  const [archiveTransaction] = useArchiveTransactionMutation();
  const [restoreTransaction] = useRestoreTransactionMutation();

  // Обработчики для формы
  const handleOpenForm = (type?: TransactionType) => {
    setSelectedTransaction(null);
    if (type) setFormType(type);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setFormType(transaction.type);
    setIsFormOpen(true);
  };

  const handleArchiveTransaction = async (transaction: Transaction) => {
    try {
      await archiveTransaction(transaction.id).unwrap();
    } catch (error) {
      console.error('Failed to archive transaction:', error);
    }
  };

  const handleRestoreTransaction = async (transaction: Transaction) => {
    try {
      await restoreTransaction(transaction.id).unwrap();
    } catch (error) {
      console.error('Failed to restore transaction:', error);
    }
  };

  // Обработчики для табов и пагинации
  const handleFilterChange = (
    event: React.SyntheticEvent,
    newValue: 'active' | 'archived'
  ) => {
    setStatus(newValue);
    setPage(0);
  };

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
    setPage(0);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
  };

  const handleFilterInputChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Вспомогательные функции для отображения данных
  const getAccountName = (accountId: string) => {
    const account = accounts?.find(a => a.id === accountId);
    return account?.name || 'Неизвестный счет';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '-';

    const category = categories?.find(c => c.id === categoryId);
    return category?.name || 'Неизвестная категория';
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
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ru });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <PageContainer
      title="Операции"
      actions={[
        {
          label: 'Доход',
          icon: <ArrowUpwardIcon />,
          onClick: () => handleOpenForm('income'),
          color: 'success',
        },
        {
          label: 'Расход',
          icon: <ArrowDownwardIcon />,
          onClick: () => handleOpenForm('expense'),
          color: 'error',
        },
        {
          label: 'Перевод',
          icon: <CompareArrowsIcon />,
          onClick: () => handleOpenForm('transfer'),
          color: 'info',
        },
      ]}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Paper>
            <Tabs
              value={status}
              onChange={handleFilterChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab label="Активные" value="active" />
              <Tab label="Архив" value="archived" />
            </Tabs>
          </Paper>
        </Box>
        <Tooltip
          title={isFilterPanelOpen ? 'Скрыть фильтры' : 'Показать фильтры'}
        >
          <Button
            variant={isFilterPanelOpen ? 'contained' : 'outlined'}
            color="primary"
            startIcon={<FilterListIcon />}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            sx={{ ml: 2 }}
          >
            Фильтры
          </Button>
        </Tooltip>
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
                    {accounts?.map(account => (
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
                    {categories?.map(category => (
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
          transactionsData.transactions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Операции не найдены
            </Typography>
            <Typography color="textSecondary" paragraph>
              {status === 'active'
                ? 'У вас пока нет операций или они не соответствуют выбранным фильтрам.'
                : 'В архиве нет операций, соответствующих выбранным фильтрам.'}
            </Typography>
            {status === 'active' && (
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenForm('income')}
                >
                  Добавить доход
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenForm('expense')}
                >
                  Добавить расход
                </Button>
              </Box>
            )}
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
                          {formatNumber(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getAccountName(transaction.accountId)}
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'transfer'
                          ? '-'
                          : transaction.type === 'income' &&
                            transaction.categoryId === 'category1'
                          ? 'Зарплата'
                          : transaction.type === 'income' &&
                            transaction.categoryId === 'category5'
                          ? 'Подработка'
                          : transaction.type === 'expense' &&
                            transaction.categoryId === 'category2'
                          ? 'Продукты'
                          : transaction.type === 'expense' &&
                            transaction.categoryId === 'category3'
                          ? 'Развлечения'
                          : transaction.type === 'expense' &&
                            transaction.categoryId === 'category4'
                          ? 'Коммунальные услуги'
                          : transaction.type === 'expense' &&
                            transaction.categoryId === 'category6'
                          ? 'Техника'
                          : getCategoryName(transaction.categoryId)}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell align="right">
                        {status === 'active' ? (
                          <>
                            <Tooltip title="Редактировать">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleEditTransaction(transaction)
                                }
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Архивировать">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleArchiveTransaction(transaction)
                                }
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Восстановить">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleRestoreTransaction(transaction)
                              }
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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

      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTransaction
            ? 'Редактирование операции'
            : `Новая операция: ${
                formType === 'income'
                  ? 'Доход'
                  : formType === 'expense'
                  ? 'Расход'
                  : 'Перевод'
              }`}
          <IconButton
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TransactionForm
            transaction={selectedTransaction}
            onClose={handleCloseForm}
            initialType={formType}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Transactions;

import React, { useState, useMemo } from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  TextField,
  IconButton,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Collapse,
  Button,
  Badge,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatNumber } from '../../../shared/utils/formatUtils';
import { AccountHistoryItem } from '../model/types';
import {
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
} from '../../transaction/api/transactionApi';
import InfoIcon from '@mui/icons-material/Info';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGetAccountHistoryQuery } from '../api/accountApi';
import { useGetTransactionsQuery } from '../../transaction/api/transactionApi';

interface AccountHistoryListProps {
  accountId: string;
  maxItems?: number;
  onTransactionClick?: (transaction: any) => void;
}

const getOperationTypeText = (type: string): string => {
  switch (type) {
    case 'income':
      return 'Пополнение';
    case 'expense':
      return 'Списание';
    case 'transfer':
      return 'Перевод';
    default:
      return type;
  }
};

const AccountHistoryList: React.FC<AccountHistoryListProps> = ({
  accountId,
  maxItems = 5,
  onTransactionClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [updateTransaction] = useUpdateTransactionMutation();
  const [deleteTransaction] = useDeleteTransactionMutation();

  // Получаем транзакции для данного счета вместо истории счета
  const {
    data: transactionsData,
    isLoading,
    error,
  } = useGetTransactionsQuery({
    accountId: accountId,
    limit: 50, // Получаем больше данных для фильтрации
    sort: 'date',
    order: 'desc',
  });

  // Извлекаем массив транзакций из ответа
  const history = transactionsData?.transactions || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypesChange = (
    _: React.MouseEvent<HTMLElement>,
    newTypes: string[]
  ) => {
    setSelectedTypes(newTypes);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  // Получаем количество активных фильтров
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedTypes.length > 0) count++;
    return count;
  }, [searchQuery, selectedTypes]);

  // Фильтруем и сортируем историю операций
  const filteredHistory = useMemo(() => {
    if (!history) return [];

    let filtered = [...history];

    // Фильтрация по типу операции
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(item => selectedTypes.includes(item.type));
    }

    // Поиск по описанию, типу и сумме
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      // Проверяем, содержит ли запрос числа для поиска по сумме
      const numericQuery = query.replace(/[^\d.,]/g, '');
      const hasNumericPart = numericQuery.length > 0;

      filtered = filtered.filter(item => {
        // Поиск по описанию
        const descriptionMatch = item.description
          ?.toLowerCase()
          .includes(query);

        // Поиск по типу операции
        const typeText = getOperationTypeText(item.type).toLowerCase();
        const typeMatch = typeText.includes(query);

        // Поиск по сумме (только если в запросе есть числа)
        let amountMatch = false;
        if (hasNumericPart) {
          // Форматируем сумму разными способами для поиска
          const amountStr = item.amount.toString();
          const amountFixed = formatNumber(item.amount);
          const amountLocale = item.amount.toLocaleString();

          // Проверяем, содержат ли форматированные суммы числовую часть запроса
          amountMatch =
            amountStr.includes(numericQuery) ||
            amountFixed.includes(numericQuery) ||
            amountLocale.includes(numericQuery);
        }

        return descriptionMatch || typeMatch || amountMatch;
      });
    }

    // Сортировка по дате (сначала новые)
    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [history, searchQuery, selectedTypes]);

  // Функция для подсветки совпадений в тексте
  const highlightMatches = (text: string, query: string) => {
    if (!query.trim() || !text) return text;

    try {
      const parts = text.split(new RegExp(`(${query})`, 'gi'));
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} style={{ backgroundColor: '#fff59d', padding: 0 }}>
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch (error) {
      // Если регулярное выражение некорректно, вернуть исходный текст
      return text;
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const updatedData = {
        /* данные для обновления */
      };
      await updateTransaction({ id, ...updatedData }).unwrap();
      console.log('Операция обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении операции', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id).unwrap();
      console.log('Операция удалена');
    } catch (error) {
      console.error('Ошибка при удалении операции', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ mt: 2 }}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon />}
          sx={{
            borderRadius: 0,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <AlertTitle>Не удалось загрузить историю операций</AlertTitle>
          <Typography variant="body2">
            Произошла ошибка при получении данных. Пожалуйста, попробуйте
            обновить страницу.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Paper elevation={0} variant="outlined" sx={{ mt: 2 }}>
        <Alert
          severity="info"
          icon={<InfoIcon />}
          sx={{
            borderRadius: 0,
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <AlertTitle>История операций пуста</AlertTitle>
          <Typography variant="body2">
            По данному счету еще не было операций. Операции будут отображаться
            здесь после проведения.
          </Typography>
        </Alert>
      </Paper>
    );
  }

  // Определяем, какие операции показывать
  const displayedHistory = showAll
    ? filteredHistory
    : filteredHistory.slice(0, maxItems);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', {
        locale: ru,
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Paper elevation={0} variant="outlined" sx={{ mt: 2 }}>
      <Box
        sx={{
          p: 2,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">История операций</Typography>
        <Box>
          <Badge
            badgeContent={activeFiltersCount}
            color="primary"
            invisible={activeFiltersCount === 0}
          >
            <IconButton
              size="small"
              onClick={toggleFilters}
              color={showFilters ? 'primary' : 'default'}
              sx={{ mr: 1 }}
            >
              <FilterListIcon />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Box sx={{ px: 2, py: 1 }}>
          <TextField
            placeholder="Поиск по описанию, типу операции или сумме"
            fullWidth
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => setSearchQuery('')}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Тип операции:
            </Typography>
            <ToggleButtonGroup
              value={selectedTypes}
              onChange={handleTypesChange}
              size="small"
              aria-label="Тип операции"
              sx={{ flexGrow: 1 }}
            >
              <ToggleButton value="income" aria-label="Доход">
                Доход
              </ToggleButton>
              <ToggleButton value="expense" aria-label="Расход">
                Расход
              </ToggleButton>
              <ToggleButton value="transfer" aria-label="Перевод">
                Перевод
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {(searchQuery || selectedTypes.length > 0) && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1,
              }}
            >
              <Button
                size="small"
                onClick={handleClearFilters}
                startIcon={<CloseIcon fontSize="small" />}
              >
                Сбросить фильтры
              </Button>

              <Typography variant="body2" color="text.secondary">
                Найдено: {filteredHistory.length}
              </Typography>
            </Box>
          )}
        </Box>
        <Divider />
      </Collapse>

      {filteredHistory.length === 0 ? (
        <Box p={2}>
          <Typography variant="body2" color="text.secondary" align="center">
            Нет операций, соответствующих фильтрам
          </Typography>
        </Box>
      ) : (
        <>
          <List
            sx={{
              p: 0,
              maxHeight: '400px',
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#bdbdbd',
                borderRadius: '4px',
                '&:hover': {
                  background: '#9e9e9e',
                },
              },
            }}
          >
            {displayedHistory.map((item, index) => (
              <React.Fragment key={item.id || index}>
                {index > 0 && <Divider component="li" />}
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Chip
                            label={getOperationTypeText(item.type)}
                            color={
                              item.type === 'income'
                                ? 'success'
                                : item.type === 'expense'
                                ? 'error'
                                : 'primary'
                            }
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {searchQuery.trim()
                              ? highlightMatches(
                                  item.description || 'Без описания',
                                  searchQuery
                                )
                              : item.description || 'Без описания'}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              fontWeight: 'bold',
                              color:
                                item.type === 'income'
                                  ? 'success.main'
                                  : item.type === 'expense'
                                  ? 'error.main'
                                  : 'text.primary',
                              mr: 1,
                            }}
                          >
                            {item.type === 'income' ? '+' : '-'}
                            {formatNumber(item.amount)}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => onTransactionClick?.(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={formatDate(item.date)}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>

          {filteredHistory.length > maxItems && (
            <Box textAlign="center" p={1}>
              <Button size="small" color="primary" onClick={toggleShowAll}>
                {showAll
                  ? 'Показать меньше'
                  : `Показать все (${filteredHistory.length})`}
              </Button>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default AccountHistoryList;

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import {
  TrendingDown as ExpenseIcon,
  Category as CategoryIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
} from '@mui/icons-material';
import { formatNumber } from '../utils/formatUtils';
import { getCategoryIcon } from '../../entities/category/ui/CategoryChip';

interface CategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
  percentage?: number;
}

interface ExpenseStructureChartProps {
  data: CategoryData[];
  title?: string;
  period?: string;
  showPercentages?: boolean;
  showLegend?: boolean;
  interactive?: boolean;
  minSlicePercentage?: number;
}

// Расширенная палитра цветов для категорий
const EXPENSE_COLORS = [
  '#FF6B6B', // Красный (еда)
  '#4ECDC4', // Бирюзовый (транспорт)
  '#45B7D1', // Голубой (жилье)
  '#FFA07A', // Лососевый (развлечения)
  '#98D8C8', // Мятный (здоровье)
  '#F7DC6F', // Желтый (образование)
  '#BB8FCE', // Фиолетовый (одежда)
  '#85C1E9', // Светло-голубой (подарки)
  '#F8C471', // Оранжевый (техника)
  '#82E0AA', // Зеленый (спорт)
  '#F1948A', // Розовый (красота)
  '#AED6F1', // Бледно-голубой (прочее)
];

const ExpenseStructureChart: React.FC<ExpenseStructureChartProps> = ({
  data,
  title = 'Структура расходов',
  period = 'месяц',
  showPercentages = true,
  showLegend = true,
  interactive = true,
  minSlicePercentage = 2,
}) => {
  const theme = useTheme();
  const [sortBy, setSortBy] = useState<'amount' | 'count' | 'name'>('amount');
  const viewMode = 'both';
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Подготовка данных для диаграммы
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const totalAmount = data.reduce((sum, item) => sum + item.total, 0);

    // Добавляем проценты и сортируем
    const dataWithPercentages = data.map((item, index) => ({
      ...item,
      percentage: totalAmount > 0 ? (item.total / totalAmount) * 100 : 0,
      color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
      displayName: item.categoryName || 'Без категории',
    }));

    // Группируем мелкие категории в "Прочее"
    const mainCategories = dataWithPercentages.filter(
      item => item.percentage >= minSlicePercentage
    );
    const smallCategories = dataWithPercentages.filter(
      item => item.percentage < minSlicePercentage
    );

    let result = [...mainCategories];

    if (smallCategories.length > 0) {
      const othersTotal = smallCategories.reduce(
        (sum, item) => sum + item.total,
        0
      );
      const othersCount = smallCategories.reduce(
        (sum, item) => sum + item.count,
        0
      );
      const othersPercentage =
        totalAmount > 0 ? (othersTotal / totalAmount) * 100 : 0;

      result.push({
        categoryId: 'others',
        categoryName: 'Прочее',
        categoryIcon: 'more_horiz',
        total: othersTotal,
        count: othersCount,
        percentage: othersPercentage,
        color: '#95A5A6',
        displayName: `Прочее (${smallCategories.length} категорий)`,
      });
    }

    // Сортировка
    return result.sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.total - a.total;
        case 'count':
          return b.count - a.count;
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        default:
          return b.total - a.total;
      }
    });
  }, [data, sortBy, minSlicePercentage]);

  const totalAmount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0);
  }, [data]);

  const totalTransactions = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  // Обработчик клика по сегменту диаграммы
  const handlePieClick = (entry: any) => {
    if (!interactive) return;
    setSelectedCategory(
      selectedCategory === entry.categoryId ? null : entry.categoryId
    );
  };

  // Кастомный tooltip для диаграммы
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            zIndex: 100,
            position: 'relative',
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {data.displayName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Сумма: <strong>{formatNumber(data.total)} ₽</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Операций: <strong>{data.count}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Доля: <strong>{data.percentage.toFixed(1)}%</strong>
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  // Кастомная легенда
  const CustomLegend = ({ payload }: any) => {
    if (!showLegend || !payload) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={1}>
          {payload.map((entry: any, index: number) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: interactive ? 'pointer' : 'default',
                  p: 0.5,
                  borderRadius: 1,
                  backgroundColor:
                    selectedCategory === entry.payload.categoryId
                      ? 'action.selected'
                      : 'transparent',
                  '&:hover': interactive
                    ? { backgroundColor: 'action.hover' }
                    : {},
                }}
                onClick={() => interactive && handlePieClick(entry.payload)}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: entry.color,
                    borderRadius: '2px',
                    mr: 1,
                    flexShrink: 0,
                  }}
                />
                <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                  {entry.payload.displayName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {entry.payload.percentage.toFixed(1)}%
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  if (!data || data.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <ExpenseIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Нет данных о расходах
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Добавьте транзакции расходов для отображения структуры
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        height: 'auto',
        overflow: 'hidden',
        minHeight: 600,
        mb: 3,
      }}
    >
      {/* Заголовок и контролы */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2,
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Box>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            За {period} • {formatNumber(totalAmount)} ₽ • {totalTransactions}{' '}
            операций
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Сортировка</InputLabel>
          <Select
            value={sortBy}
            label="Сортировка"
            onChange={e => setSortBy(e.target.value as any)}
          >
            <MenuItem value="amount">По сумме</MenuItem>
            <MenuItem value="count">По количеству</MenuItem>
            <MenuItem value="name">По названию</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Круговая диаграмма */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 400,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'visible',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                minWidth: 300,
                minHeight: 300,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 60, left: 20 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={1}
                    dataKey="total"
                    onClick={handlePieClick}
                    style={{ cursor: interactive ? 'pointer' : 'default' }}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={
                          selectedCategory === entry.categoryId
                            ? theme.palette.error.main
                            : 'none'
                        }
                        strokeWidth={
                          selectedCategory === entry.categoryId ? 3 : 0
                        }
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  {showLegend && (
                    <Legend
                      content={<CustomLegend />}
                      layout="horizontal"
                      align="center"
                      verticalAlign="bottom"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>

              {/* Центральная информация */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  backgroundColor: 'background.default',
                  borderRadius: '50%',
                  width: 120,
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  fontWeight="bold"
                  sx={{ fontSize: '1rem' }}
                >
                  {formatNumber(totalAmount)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ₽ расходов
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Список категорий */}
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 400,
              overflow: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'action.hover',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'action.disabled',
                borderRadius: '3px',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              },
            }}
          >
            <List dense>
              {chartData.map((category, index) => {
                const isSelected = selectedCategory === category.categoryId;
                return (
                  <ListItem
                    key={category.categoryId || index}
                    sx={{
                      cursor: interactive ? 'pointer' : 'default',
                      borderRadius: 1,
                      mb: 0.5,
                      py: 1,
                      px: 1.5,
                      backgroundColor: isSelected
                        ? 'action.selected'
                        : 'transparent',
                      '&:hover': interactive
                        ? { backgroundColor: 'action.hover' }
                        : {},
                      border: isSelected
                        ? `1px solid ${theme.palette.primary.main}`
                        : '1px solid transparent',
                    }}
                    onClick={() => interactive && handlePieClick(category)}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          backgroundColor: category.color,
                          borderRadius: '50%',
                          border: isSelected
                            ? `2px solid ${theme.palette.primary.main}`
                            : 'none',
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {category.displayName}
                        </Typography>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="text.primary"
                          >
                            {formatNumber(category.total)} ₽
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {category.count} операций
                          </Typography>
                        </Box>
                      }
                      sx={{ flexGrow: 1, minWidth: 0 }}
                    />
                    {showPercentages && (
                      <Chip
                        label={`${category.percentage.toFixed(1)}%`}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          fontWeight: 'medium',
                          '& .MuiChip-label': {
                            px: 1,
                          },
                        }}
                      />
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Grid>
      </Grid>

      {/* Дополнительная статистика */}
      {selectedCategory && selectedCategory !== 'others' && (
        <Box sx={{ mt: 3 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Детали категории:{' '}
                {
                  chartData.find(c => c.categoryId === selectedCategory)
                    ?.displayName
                }
              </Typography>
              {/* Здесь можно добавить дополнительную детализацию */}
            </CardContent>
          </Card>
        </Box>
      )}
    </Paper>
  );
};

export default ExpenseStructureChart;

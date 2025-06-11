import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import { Doughnut } from 'react-chartjs-2';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { NotionCard } from '../NotionCard';
import { formatNumber } from '../../utils/formatUtils';
import { useTheme } from '../../config/ThemeContext';

interface CategoryIncome {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon?: string;
  trend?: number; // изменение по сравнению с прошлым месяцем в %
}

interface IncomeStructureData {
  hasData?: boolean;
  totalIncome: number;
  categories: CategoryIncome[];
  period: string;
  emptyMessage?: string;
}

interface IncomeStructureWidgetProps {
  data: IncomeStructureData;
  maxCategoriesVisible?: number;
}

const IncomeStructureWidget: React.FC<IncomeStructureWidgetProps> = ({
  data,
  maxCategoriesVisible = 5,
}) => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Если нет данных, используем пустые данные
  const isEmpty = data.hasData === false;

  // Для пустого состояния создаем минимальные данные для отображения структуры
  const displayData = isEmpty
    ? {
        categories: [],
        totalIncome: 0,
        period: data.period || 'текущий месяц',
      }
    : data;

  // Предопределенные цвета для категорий
  const categoryColors = [
    '#22c55e',
    '#3b82f6',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#ec4899',
    '#6366f1',
    '#ef4444',
  ];

  // Подготовка данных для графика
  const chartData = {
    labels: displayData.categories.map(cat => cat.name),
    datasets: [
      {
        data: displayData.categories.map(cat => cat.amount),
        backgroundColor: displayData.categories.map(
          (_, index) => categoryColors[index % categoryColors.length]
        ),
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: isDarkMode ? '#ffffff' : '#000000',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#f3f4f6' : '#111827',
        bodyColor: isDarkMode ? '#d1d5db' : '#374151',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const percentage = (
              (context.parsed / data.totalIncome) *
              100
            ).toFixed(1);
            return `${context.label}: ${formatNumber(
              context.parsed
            )} ₽ (${percentage}%)`;
          },
        },
      },
    },
    onHover: (event: any, elements: any[]) => {
      if (elements.length > 0) {
        const categoryIndex = elements[0].index;
        setSelectedCategory(data.categories[categoryIndex]?.id || null);
      } else {
        setSelectedCategory(null);
      }
    },
  };

  // Категории для отображения в списке
  const visibleCategories = showAllCategories
    ? displayData.categories
    : displayData.categories.slice(0, maxCategoriesVisible);

  const hiddenCategoriesCount = Math.max(
    0,
    displayData.categories.length - maxCategoriesVisible
  );

  // Общая сумма доходов
  const totalIncome = displayData.totalIncome || 0;

  return (
    <NotionCard
      title="Структура доходов"
      color={isEmpty ? 'gray' : 'green'}
      subtitle={`Распределение доходов за ${displayData.period}`}
    >
      {/* График и список категорий */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 3,
          mb: 3,
          width: '100%',
          flexWrap: 'nowrap',
          '@media (max-width: 768px)': {
            flexDirection: 'column',
          },
        }}
      >
        {/* График */}
        <Box
          sx={{
            flex: '0 0 250px',
            height: 250,
            position: 'relative',
            minWidth: 250,
            maxWidth: 250,
          }}
        >
          <Doughnut data={chartData} options={chartOptions} />

          {/* Центральная информация в графике */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Всего
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatNumber(totalIncome)} ₽
            </Typography>
          </Box>
        </Box>

        {/* Список категорий */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: 'auto',
            overflow: 'hidden',
          }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Детализация по категориям
          </Typography>

          <List dense sx={{ p: 0 }}>
            {isEmpty ? (
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemText
                  primary="Нет данных о доходах"
                  secondary="Добавьте транзакции для анализа структуры доходов"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            ) : (
              visibleCategories.map((category, index) => (
                <ListItem
                  key={category.id}
                  sx={{
                    px: 0,
                    py: 1,
                    backgroundColor:
                      selectedCategory === category.id
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'transparent',
                    borderRadius: 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor:
                        categoryColors[index % categoryColors.length],
                      mr: 2,
                      flexShrink: 0,
                    }}
                  />

                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" fontWeight="medium">
                          {category.name}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {category.trend !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {category.trend >= 0 ? (
                                <TrendingUpIcon
                                  fontSize="small"
                                  color="success"
                                />
                              ) : (
                                <TrendingDownIcon
                                  fontSize="small"
                                  color={
                                    category.trend < -10 ? 'error' : 'warning'
                                  }
                                />
                              )}
                              <Typography
                                variant="caption"
                                color={
                                  category.trend >= 0
                                    ? 'success.main'
                                    : category.trend < -10
                                    ? 'error.main'
                                    : 'warning.main'
                                }
                                sx={{ ml: 0.5 }}
                              >
                                {category.trend >= 0 ? '+' : ''}
                                {category.trend.toFixed(1)}%
                              </Typography>
                            </Box>
                          )}

                          <Chip
                            label={`${formatNumber(category.amount)} ₽`}
                            size="small"
                            variant="outlined"
                            color={
                              category.percentage > 50 ? 'success' : 'default'
                            }
                          />
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            height: 4,
                            backgroundColor: 'rgba(0,0,0,0.1)',
                            borderRadius: 2,
                            mr: 2,
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${category.percentage}%`,
                              backgroundColor:
                                categoryColors[index % categoryColors.length],
                              borderRadius: 2,
                            }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {category.percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>

          {/* Кнопка показать все */}
          {!isEmpty && hiddenCategoriesCount > 0 && (
            <Button
              onClick={() => setShowAllCategories(!showAllCategories)}
              endIcon={
                showAllCategories ? <ExpandLessIcon /> : <ExpandMoreIcon />
              }
              size="small"
              variant="text"
              sx={{ mt: 1 }}
            >
              {showAllCategories
                ? 'Скрыть категории'
                : `Показать еще ${hiddenCategoriesCount} категорий`}
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
        <Tooltip title="Структура доходов показывает, откуда вы получаете больше всего денег. Анализируйте источники доходов для планирования бюджета.">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">
          Наведите на график для детальной информации
        </Typography>
      </Box>
    </NotionCard>
  );
};

export default IncomeStructureWidget;

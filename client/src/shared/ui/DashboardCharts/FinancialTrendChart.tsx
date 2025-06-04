import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Info as InfoIcon } from '@mui/icons-material';
import { NotionCard } from '../NotionCard';
import { formatNumber } from '../../utils/formatUtils';
import { useTheme } from '../../config/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

interface FinancialTrendData {
  hasData?: boolean;
  labels: string[];
  income: number[];
  expense: number[];
  balance: number[];
  emptyMessage?: string;
}

interface FinancialTrendChartProps {
  data: FinancialTrendData;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
}

const FinancialTrendChart: React.FC<FinancialTrendChartProps> = ({
  data,
  height = 300,
  showLegend = true,
  showTooltip = true,
}) => {
  const { themeMode } = useTheme();
  const isDarkMode = themeMode === 'dark';

  // Если нет данных, используем пустой график
  const isEmpty = data.hasData === false;

  // Для пустого состояния создаем минимальные данные для отображения структуры
  const displayData = isEmpty
    ? {
        labels: ['Текущий месяц'],
        income: [0],
        expense: [0],
        balance: [0],
      }
    : data;

  const chartData = {
    labels: displayData.labels,
    datasets: [
      {
        label: 'Доходы',
        data: displayData.income,
        borderColor: isDarkMode ? '#4ade80' : '#22c55e',
        backgroundColor: isDarkMode ? '#4ade8020' : '#22c55e20',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Расходы',
        data: displayData.expense.map(val => Math.abs(val)),
        borderColor: isDarkMode ? '#f87171' : '#ef4444',
        backgroundColor: isDarkMode ? '#f8717120' : '#ef444420',
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Чистый баланс',
        data: displayData.balance,
        borderColor: isDarkMode ? '#60a5fa' : '#3b82f6',
        backgroundColor: isDarkMode ? '#60a5fa20' : '#3b82f620',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#d1d5db' : '#374151',
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: showTooltip,
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        titleColor: isDarkMode ? '#f3f4f6' : '#111827',
        bodyColor: isDarkMode ? '#d1d5db' : '#374151',
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label;
            const value = context.parsed.y;
            return `${label}: ${formatNumber(value)} ₽`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: isDarkMode ? '#374151' : '#f3f4f6',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: true,
          color: isDarkMode ? '#374151' : '#f3f4f6',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: {
            size: 11,
          },
          callback: (value: any) => {
            return `${formatNumber(value)} ₽`;
          },
        },
      },
    },
  };

  // Расчет ключевых метрик
  const currentMonth = displayData.income[displayData.income.length - 1] || 0;
  const previousMonth = displayData.income[displayData.income.length - 2] || 0;
  const incomeGrowth =
    previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0;

  const currentExpense = Math.abs(
    displayData.expense[displayData.expense.length - 1] || 0
  );
  const previousExpense = Math.abs(
    displayData.expense[displayData.expense.length - 2] || 0
  );
  const expenseGrowth =
    previousExpense > 0
      ? ((currentExpense - previousExpense) / previousExpense) * 100
      : 0;

  return (
    <NotionCard
      title="Финансовые тренды"
      color={isEmpty ? 'gray' : 'blue'}
      subtitle="Динамика доходов и расходов за последние месяцы"
    >
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Рост доходов
            </Typography>
            <Typography
              variant="body2"
              color={incomeGrowth >= 0 ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {incomeGrowth >= 0 ? '+' : ''}
              {incomeGrowth.toFixed(1)}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Изменение расходов
            </Typography>
            <Typography
              variant="body2"
              color={expenseGrowth <= 0 ? 'success.main' : 'error.main'}
              fontWeight="medium"
            >
              {expenseGrowth >= 0 ? '+' : ''}
              {expenseGrowth.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ height, position: 'relative' }}>
        <Line data={chartData} options={options} />
      </Box>

      {showTooltip && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Tooltip title="График показывает динамику ваших доходов, расходов и чистого баланса за последние месяцы. Зеленая линия - доходы, красная - расходы, синяя - разница между ними.">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography variant="caption" color="text.secondary">
            Наведите на точки для подробной информации
          </Typography>
        </Box>
      )}
    </NotionCard>
  );
};

export default FinancialTrendChart;

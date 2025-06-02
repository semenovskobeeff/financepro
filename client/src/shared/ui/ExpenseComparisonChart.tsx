import React from 'react';
import { Box, Typography, Paper, Chip, Grid } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatNumber } from '../utils/formatUtils';
import { getCategoryIcon } from '../../entities/category/ui/CategoryChip';

interface CategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
}

interface ExpenseComparisonChartProps {
  data: CategoryData[];
  previousPeriodData?: CategoryData[];
  period: string;
  title?: string;
}

const ExpenseComparisonChart: React.FC<ExpenseComparisonChartProps> = ({
  data,
  previousPeriodData = [],
  period,
  title = 'Сравнение расходов по категориям',
}) => {
  // Подготавливаем данные для гистограммы
  const chartData = data
    .map(current => {
      const previous = previousPeriodData.find(
        p => p.categoryId === current.categoryId
      );

      const change = previous
        ? ((current.total - previous.total) / previous.total) * 100
        : 100;

      return {
        name: current.categoryName,
        icon: current.categoryIcon,
        current: current.total,
        previous: previous?.total || 0,
        change: isFinite(change) ? change : 0,
        categoryId: current.categoryId,
      };
    })
    .sort((a, b) => b.current - a.current);

  // Кастомный компонент для подписей оси X
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const category = chartData.find(c => c.name === payload.value);
    const icon = category ? getCategoryIcon(category.icon) : null;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill="var(--text-secondary)"
          fontSize="12"
          style={{ maxWidth: '60px' }}
        >
          {payload.value.length > 8
            ? payload.value.substring(0, 8) + '...'
            : payload.value}
        </text>
        {icon && (
          <foreignObject x={-10} y={-35} width={20} height={20}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '16px',
              }}
            >
              {icon}
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  // Кастомный тултип
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const category = chartData.find(c => c.name === label);
      const current =
        payload.find((p: any) => p.dataKey === 'current')?.value || 0;
      const previous =
        payload.find((p: any) => p.dataKey === 'previous')?.value || 0;
      const change = category?.change || 0;

      return (
        <Paper
          sx={{
            p: 2,
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {label}
          </Typography>

          <Box sx={{ mb: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: 'var(--chart-color-expense)' }}
            >
              Текущий период: {formatNumber(current)} ₽
            </Typography>
          </Box>

          {previous > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: 'var(--chart-color-income)' }}
              >
                Предыдущий период: {formatNumber(previous)} ₽
              </Typography>
            </Box>
          )}

          {previous > 0 && (
            <Box>
              <Chip
                label={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                size="small"
                color={change > 0 ? 'error' : 'success'}
                variant="outlined"
              />
            </Box>
          )}
        </Paper>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Нет данных для отображения гистограммы
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

      <Box sx={{ height: 400, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="name"
              tick={<CustomXAxisTick />}
              axisLine={false}
              tickLine={false}
              interval={0}
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={value => formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '14px',
              }}
            />
            <Bar
              dataKey="current"
              name={`Текущий ${period}`}
              fill="var(--chart-color-expense)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
            {previousPeriodData.length > 0 && (
              <Bar
                dataKey="previous"
                name={`Предыдущий ${period}`}
                fill="var(--chart-color-income)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Статистика изменений */}
      {previousPeriodData.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Изменения по категориям:
          </Typography>
          <Grid container spacing={2}>
            {chartData
              .filter(item => item.previous > 0)
              .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
              .slice(0, 6)
              .map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid var(--border)',
                      borderRadius: 1,
                      backgroundColor: 'var(--bg-secondary)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      {item.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {formatNumber(item.current - item.previous)} ₽
                      </Typography>
                      <Chip
                        label={`${
                          item.change > 0 ? '+' : ''
                        }${item.change.toFixed(1)}%`}
                        size="small"
                        color={item.change > 0 ? 'error' : 'success'}
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default ExpenseComparisonChart;

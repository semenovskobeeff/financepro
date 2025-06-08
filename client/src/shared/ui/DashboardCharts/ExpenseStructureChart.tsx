import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ExpenseStructureChartProps {
  data: {
    hasData: boolean;
    expenses: ExpenseData[];
    total: number;
    emptyMessage?: string;
  };
}

const ExpenseStructureChart: React.FC<ExpenseStructureChartProps> = ({
  data,
}) => {
  if (!data.hasData) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Структура расходов
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          py={4}
        >
          {data.emptyMessage || 'Нет данных о расходах'}
        </Typography>
      </Paper>
    );
  }

  const chartData = {
    labels: data.expenses.map(expense => expense.category),
    datasets: [
      {
        data: data.expenses.map(expense => expense.amount),
        backgroundColor: data.expenses.map(expense => expense.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const expense = data.expenses[context.dataIndex];
            return `${expense.category}: ${Math.abs(
              expense.amount
            ).toLocaleString()} ₽ (${expense.percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Структура расходов
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Box height={300}>
            <Pie data={chartData} options={options} />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Детализация:
            </Typography>
            {data.expenses.slice(0, 5).map((expense, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                py={1}
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Box display="flex" alignItems="center">
                  <Box
                    width={12}
                    height={12}
                    bgcolor={expense.color}
                    borderRadius="50%"
                    mr={1}
                  />
                  <Typography variant="body2">{expense.category}</Typography>
                </Box>
                <Typography variant="body2" fontWeight="bold">
                  {Math.abs(expense.amount).toLocaleString()} ₽
                </Typography>
              </Box>
            ))}

            <Box mt={2} pt={2} borderTop="1px solid" borderColor="divider">
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle2">Итого:</Typography>
                <Typography variant="subtitle2" fontWeight="bold">
                  {Math.abs(data.total).toLocaleString()} ₽
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ExpenseStructureChart;

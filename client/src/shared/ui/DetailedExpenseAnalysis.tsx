import React from 'react';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import ExpenseStructureChart from './ExpenseStructureChart';
import ExpenseInsights from './ExpenseInsights';
import ExpenseComparisonChart from './ExpenseComparisonChart';

interface CategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
}

interface DetailedExpenseAnalysisProps {
  data: CategoryData[];
  previousPeriodData?: CategoryData[];
  period: string;
  open: boolean;
  onClose: () => void;
}

const DetailedExpenseAnalysis: React.FC<DetailedExpenseAnalysisProps> = ({
  data,
  previousPeriodData,
  period,
  open,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
          zIndex: 1300,
        },
      }}
      sx={{
        zIndex: 1300,
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5" component="div">
            💸 Детальный анализ расходов
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: theme => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Полная диаграмма структуры расходов */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <ExpenseStructureChart
                data={data}
                title={`Детальная структура расходов за ${period}`}
                period={period}
                showPercentages={true}
                showLegend={true}
                interactive={true}
                minSlicePercentage={0.5}
              />
            </Grid>
          </Grid>

          {/* Гистограмма сравнения расходов */}
          {data && data.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <ExpenseComparisonChart
                  data={data}
                  previousPeriodData={previousPeriodData}
                  period={period}
                  title={`Сравнение расходов по категориям за ${period}`}
                />
              </Grid>
            </Grid>
          )}

          {/* Аналитические инсайты по расходам */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <ExpenseInsights
                data={data}
                period={period}
                previousPeriodData={previousPeriodData}
                showRecommendations={true}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default DetailedExpenseAnalysis;

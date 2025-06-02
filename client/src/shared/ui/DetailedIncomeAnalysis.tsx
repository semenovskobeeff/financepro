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
import IncomeStructureChart from './IncomeStructureChart';
import IncomeInsights from './IncomeInsights';

interface CategoryData {
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string;
  total: number;
  count: number;
}

interface DetailedIncomeAnalysisProps {
  data: CategoryData[];
  previousPeriodData?: CategoryData[];
  period: string;
  open: boolean;
  onClose: () => void;
}

const DetailedIncomeAnalysis: React.FC<DetailedIncomeAnalysisProps> = ({
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
            💰 Детальный анализ доходов
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
          {/* Полная диаграмма структуры доходов */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <IncomeStructureChart
                data={data}
                title={`Детальная структура доходов за ${period}`}
                period={period}
                showPercentages={true}
                showLegend={true}
                interactive={true}
                minSlicePercentage={0.5}
              />
            </Grid>
          </Grid>

          {/* Аналитические инсайты по доходам */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <IncomeInsights
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

export default DetailedIncomeAnalysis;

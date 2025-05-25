import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Grid,
} from '@mui/material';
import PastelPalettePreview from '../shared/ui/PastelPalettePreview';
import usePastelColors from '../shared/hooks/usePastelColors';
import { pastelColorPalettes } from '../shared/utils/pastelChartUtils';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
} from 'chart.js';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';

// Регистрация компонентов Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title
);

/**
 * Страница для демонстрации пастельных цветов в приложении
 */
const PastelColorDemo: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showHex, setShowHex] = useState(true);
  const pastelColors = usePastelColors();

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleShowHexChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowHex(event.target.checked);
  };

  // Данные для демонстрации графиков
  const pieData = {
    labels: [
      'Продукты',
      'Транспорт',
      'Развлечения',
      'Бытовые расходы',
      'Здоровье',
      'Прочее',
    ],
    datasets: [
      {
        data: [35, 15, 20, 10, 12, 8],
        backgroundColor: pastelColorPalettes.expense,
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'Доходы',
        data: [65, 59, 80, 81, 56, 75],
        backgroundColor: pastelColors.entityTransactionIncome,
        borderWidth: 1,
      },
      {
        label: 'Расходы',
        data: [45, 39, 60, 51, 36, 55],
        backgroundColor: pastelColors.entityTransactionExpense,
        borderWidth: 1,
      },
    ],
  };

  const lineData = {
    labels: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь'],
    datasets: [
      {
        label: 'Накопления',
        data: [12, 19, 25, 32, 45, 60],
        borderColor: pastelColors.entityGoal,
        backgroundColor: 'rgba(255, 245, 186, 0.2)',
        tension: 0.3,
      },
      {
        label: 'Подписки',
        data: [5, 8, 8, 12, 15, 15],
        borderColor: pastelColors.entitySubscription,
        backgroundColor: 'rgba(255, 179, 186, 0.2)',
        tension: 0.3,
      },
    ],
  };

  const statusData = {
    labels: [
      'Активные',
      'В процессе',
      'Предупреждения',
      'Ошибки',
      'Информация',
      'Заблокировано',
    ],
    datasets: [
      {
        data: [40, 20, 15, 10, 10, 5],
        backgroundColor: [
          pastelColors.statusSuccess,
          pastelColors.statusProcessing,
          pastelColors.statusWarning,
          pastelColors.statusError,
          pastelColors.statusInfo,
          pastelColors.statusBlocked,
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Демонстрация пастельных цветов Notion
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={<Switch checked={showHex} onChange={handleShowHexChange} />}
          label="Показывать HEX-коды"
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Палитра цветов" />
          <Tab label="Графики с пастельными цветами" />
          <Tab label="Статусы и теги" />
        </Tabs>
      </Box>

      {tabValue === 0 && <PastelPalettePreview showHex={showHex} />}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Графики с пастельными цветами
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Круговая диаграмма
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Pie
                    data={pieData}
                    options={{ maintainAspectRatio: false }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Кольцевая диаграмма
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut
                    data={statusData}
                    options={{ maintainAspectRatio: false }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Столбчатая диаграмма
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={barData}
                    options={{ maintainAspectRatio: false }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Линейная диаграмма
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={lineData}
                    options={{ maintainAspectRatio: false }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Статусы и теги с пастельными цветами
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Статусы
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    bgcolor: pastelColors.statusSuccess,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Успех</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.statusSuccess === 'string'
                        ? pastelColors.statusSuccess
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    bgcolor: pastelColors.statusProcessing,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">В процессе</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.statusProcessing === 'string'
                        ? pastelColors.statusProcessing
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    bgcolor: pastelColors.statusWarning,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Предупреждение</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.statusWarning === 'string'
                        ? pastelColors.statusWarning
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    bgcolor: pastelColors.statusError,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Ошибка</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.statusError === 'string'
                        ? pastelColors.statusError
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    bgcolor: pastelColors.statusInfo,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Информация</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.statusInfo === 'string'
                        ? pastelColors.statusInfo
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box
                  sx={{
                    bgcolor: pastelColors.statusBlocked,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Заблокировано</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.statusBlocked === 'string'
                        ? pastelColors.statusBlocked
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Типы сущностей
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entityAccount,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Счет</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entityAccount === 'string'
                        ? pastelColors.entityAccount
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entityCategory,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Категория</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entityCategory === 'string'
                        ? pastelColors.entityCategory
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entityTransactionIncome,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Доход</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entityTransactionIncome === 'string'
                        ? pastelColors.entityTransactionIncome
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entityTransactionExpense,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Расход</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entityTransactionExpense === 'string'
                        ? pastelColors.entityTransactionExpense
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entityGoal,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Цель</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entityGoal === 'string'
                        ? pastelColors.entityGoal
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entitySubscription,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Подписка</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entitySubscription === 'string'
                        ? pastelColors.entitySubscription
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={3}>
                <Box
                  sx={{
                    bgcolor: pastelColors.entityDebt,
                    p: 2,
                    borderRadius: 1,
                    textAlign: 'center',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="body2">Долг</Typography>
                  {showHex && (
                    <Typography variant="caption">
                      {typeof pastelColors.entityDebt === 'string'
                        ? pastelColors.entityDebt
                        : 'rgba'}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default PastelColorDemo;

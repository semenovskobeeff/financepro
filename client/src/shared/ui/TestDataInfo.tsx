import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Info, Settings, Person, Analytics } from '@mui/icons-material';
import { config } from '../config/environment';
import {
  getCurrentDataMode,
  getTestAccounts,
  getTestDataStats,
  validateTestData,
  testDataProfiles,
} from '../api/mocks/testDataProfiles';

interface TestDataInfoProps {
  variant?: 'compact' | 'detailed';
}

const TestDataInfo: React.FC<TestDataInfoProps> = ({ variant = 'compact' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);

  // Показываем только в режиме разработки
  if (!config.isDevelopment || !config.useMocks) {
    return null;
  }

  const currentMode = getCurrentDataMode();
  const testAccounts = getTestAccounts();
  const stats = getTestDataStats();
  const validation = validateTestData();

  const handleToggleMocks = () => {
    const newValue = !config.useMocks;
    config.updateUseMocks(newValue);
    window.location.reload();
  };

  const handleToggleDataType = () => {
    const newType = config.mockDataType === 'filled' ? 'empty' : 'filled';
    config.updateMockDataType(newType);
    window.location.reload();
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
        <Card
          sx={{
            minWidth: 200,
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
          }}
        >
          <CardContent sx={{ padding: '8px 12px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Info color="primary" fontSize="small" />
              <Typography variant="caption" fontWeight="bold">
                Режим разработки
              </Typography>
            </Box>
            <Typography variant="caption" display="block">
              {currentMode}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setDialogOpen(true)}
                sx={{ fontSize: '0.6rem', padding: '2px 6px' }}
              >
                Аккаунты
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setStatsDialogOpen(true)}
                sx={{ fontSize: '0.6rem', padding: '2px 6px' }}
              >
                Статистика
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Диалог с тестовыми аккаунтами */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person />
              Тестовые аккаунты
            </Box>
          </DialogTitle>
          <DialogContent>
            {!validation.isValid && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Обнаружены проблемы с тестовыми данными:
                <ul>
                  {validation.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Доступные профили:
            </Typography>

            {testDataProfiles.map((profile, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {profile.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {profile.description}
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}
                  >
                    {profile.features.map((feature, idx) => (
                      <Chip
                        key={idx}
                        label={feature}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Данные для входа:
            </Typography>
            <List>
              {testAccounts.map((account, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Box>
                        <strong>{account.email}</strong> /{' '}
                        <code>{account.password}</code>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Chip
                          label={account.profile}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        {account.description}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={handleToggleMocks}
                startIcon={<Settings />}
              >
                {config.useMocks ? 'Отключить' : 'Включить'} моки
              </Button>
              <Button
                variant="outlined"
                onClick={handleToggleDataType}
                startIcon={<Analytics />}
              >
                Переключить на{' '}
                {config.mockDataType === 'filled' ? 'пустые' : 'полные'} данные
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>

        {/* Диалог со статистикой */}
        <Dialog
          open={statsDialogOpen}
          onClose={() => setStatsDialogOpen(false)}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Analytics />
              Статистика тестовых данных
            </Box>
          </DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Сущность</TableCell>
                    <TableCell align="right">Количество</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Пользователи</TableCell>
                    <TableCell align="right">{stats.users}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Счета</TableCell>
                    <TableCell align="right">{stats.accounts}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Категории</TableCell>
                    <TableCell align="right">{stats.categories}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Транзакции</TableCell>
                    <TableCell align="right">{stats.transactions}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Цели</TableCell>
                    <TableCell align="right">{stats.goals}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Долги</TableCell>
                    <TableCell align="right">{stats.debts}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Подписки</TableCell>
                    <TableCell align="right">{stats.subscriptions}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Списки покупок</TableCell>
                    <TableCell align="right">{stats.shoppingLists}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {validation.isValid ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                Все тестовые данные в порядке!
              </Alert>
            ) : (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Проблемы: {validation.issues.join(', ')}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatsDialogOpen(false)}>Закрыть</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return null;
};

export default TestDataInfo;

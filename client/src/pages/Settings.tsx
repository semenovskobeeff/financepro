import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useTheme } from '../shared/config/ThemeContext';
import PageContainer from '../shared/ui/PageContainer';
import NotionCard from '../shared/ui/NotionCard';
import { config } from '../config/environment';
import { useRecalculateBalancesMutation } from '../entities/transaction/api/transactionApi';

const Settings: React.FC = () => {
  const { themeMode, themeToggleEnabled, setThemeToggleEnabled } = useTheme();
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateMessage, setRecalculateMessage] = useState<string | null>(
    null
  );
  const [recalculateError, setRecalculateError] = useState<string | null>(null);

  const [recalculateBalancesMutation] = useRecalculateBalancesMutation();

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeToggleEnabled(event.target.checked);
  };

  const handleRecalculateBalances = async () => {
    try {
      setIsRecalculating(true);
      setRecalculateMessage(null);
      setRecalculateError(null);

      const result = await recalculateBalancesMutation().unwrap();
      setRecalculateMessage(
        `Пересчитано балансов: ${result.data.accountsProcessed}. Обновление данных...`
      );

      // Перезагружаем страницу через 3 секунды для обновления данных
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      console.error('Ошибка пересчета балансов:', error);
      setRecalculateError(
        error?.data?.message ||
          error?.message ||
          'Неизвестная ошибка при пересчете балансов'
      );
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <PageContainer title="Настройки">
      <NotionCard title="Персонализация">
        <List>
          <ListItem>
            <ListItemText
              primary="Функция смены темы"
              secondary="Включение возможности переключения между светлой и темной темой через панель навигации"
            />
            <ListItemSecondaryAction>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label="в доработке"
                  size="small"
                  color="info"
                  sx={{ mr: 2, opacity: 0.8 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={themeToggleEnabled}
                      onChange={handleToggleChange}
                      color="primary"
                    />
                  }
                  label=""
                  labelPlacement="start"
                />
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component="li" />
        </List>
      </NotionCard>

      {/* Утилиты для разработки */}
      {config.debug && (
        <NotionCard title="Утилиты разработчика">
          <List>
            <ListItem>
              <ListItemText
                primary="Пересчет балансов счетов"
                secondary="Исправляет ошибки в балансах, пересчитывая их на основе всех транзакций"
              />
              <ListItemSecondaryAction>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleRecalculateBalances}
                  disabled={isRecalculating}
                  startIcon={
                    isRecalculating ? <CircularProgress size={16} /> : undefined
                  }
                >
                  {isRecalculating ? 'Пересчет...' : 'Пересчитать'}
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>

          {recalculateMessage && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {recalculateMessage}. Страница перезагрузится через 3 секунды...
            </Alert>
          )}

          {recalculateError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {recalculateError}
            </Alert>
          )}
        </NotionCard>
      )}
    </PageContainer>
  );
};

export default Settings;

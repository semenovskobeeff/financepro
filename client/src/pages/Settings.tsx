import React from 'react';
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
} from '@mui/material';
import { useTheme } from '../shared/config/ThemeContext';
import PageContainer from '../shared/ui/PageContainer';
import NotionCard from '../shared/ui/NotionCard';

const Settings: React.FC = () => {
  const { themeMode, themeToggleEnabled, setThemeToggleEnabled } = useTheme();

  const handleToggleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThemeToggleEnabled(event.target.checked);
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
    </PageContainer>
  );
};

export default Settings;

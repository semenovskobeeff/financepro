import React, { useState } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Info,
  Refresh,
  VpnKey,
  Cloud,
  Storage,
} from '@mui/icons-material';
import { config } from '../../config/environment';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
}

const AuthDiagnostics: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: DiagnosticResult[] = [];

    // 1. Проверка режима данных
    results.push({
      name: 'Режим данных',
      status: config.useMocks ? 'info' : 'success',
      message: config.useMocks ? 'Тестовые данные (MSW)' : 'Реальный API',
      details: config.useMocks
        ? 'В режиме тестовых данных авторизация автоматическая'
        : 'В режиме реального API требуется авторизация',
    });

    // 2. Проверка localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    results.push({
      name: 'Локальное хранилище',
      status: token && user ? 'success' : 'warning',
      message:
        token && user
          ? 'Токен и данные пользователя найдены'
          : 'Нет сохраненных данных авторизации',
      details: `Токен: ${token ? 'есть' : 'нет'}, Пользователь: ${
        user ? 'есть' : 'нет'
      }`,
    });

    // 3. Проверка доступности API
    if (!config.useMocks) {
      try {
        const response = await fetch(`${config.apiUrl}/health`);
        if (response.ok) {
          results.push({
            name: 'Доступность API',
            status: 'success',
            message: 'Сервер доступен',
            details: `URL: ${config.apiUrl}`,
          });

          // 4. Проверка endpoint авторизации
          try {
            const loginResponse = await fetch(`${config.apiUrl}/users/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'test', password: 'test' }),
            });

            results.push({
              name: 'Endpoint авторизации',
              status: loginResponse.status === 401 ? 'success' : 'warning',
              message:
                loginResponse.status === 401
                  ? 'Endpoint работает (ожидаемая ошибка 401)'
                  : `Неожиданный статус: ${loginResponse.status}`,
              details: 'Тестовый запрос с неверными данными',
            });
          } catch (error: unknown) {
            results.push({
              name: 'Endpoint авторизации',
              status: 'error',
              message: 'Ошибка при проверке endpoint',
              details:
                error instanceof Error ? error.message : 'Неизвестная ошибка',
            });
          }
        } else {
          results.push({
            name: 'Доступность API',
            status: 'error',
            message: `Сервер недоступен (статус: ${response.status})`,
            details: `URL: ${config.apiUrl}`,
          });
        }
      } catch (error: unknown) {
        results.push({
          name: 'Доступность API',
          status: 'error',
          message: 'Не удалось подключиться к серверу',
          details: error instanceof Error ? error.message : 'Сетевая ошибка',
        });
      }
    }

    // 5. Проверка конфигурации
    results.push({
      name: 'Конфигурация',
      status: 'info',
      message: 'Текущие настройки',
      details: `API URL: ${config.apiUrl}, Debug: ${config.debug}`,
    });

    setDiagnostics(results);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'info':
        return <Info color="info" />;
      default:
        return <Info />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 2 }}>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" component="h2">
            Диагностика авторизации
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={runDiagnostics}
            disabled={isLoading}
          >
            {isLoading ? 'Проверка...' : 'Запустить диагностику'}
          </Button>
        </Box>

        {diagnostics.length === 0 && (
          <Alert severity="info">
            Нажмите "Запустить диагностику" для проверки системы авторизации
          </Alert>
        )}

        {diagnostics.length > 0 && (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Результаты проверки:
            </Typography>
            <List>
              {diagnostics.map((result, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>{getStatusIcon(result.status)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography component="span">
                            {result.name}
                          </Typography>
                          <Chip
                            label={result.message}
                            color={getStatusColor(result.status) as any}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={result.details}
                    />
                  </ListItem>
                  {index < diagnostics.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Box mt={2}>
              <Alert severity="info">
                <Typography variant="subtitle2" gutterBottom>
                  Данные для входа в реальный API:
                </Typography>
                <Typography variant="body2">
                  📧 Email: test@example.com
                  <br />
                  🔑 Пароль: password
                </Typography>
              </Alert>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDiagnostics;

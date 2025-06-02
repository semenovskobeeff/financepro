import React, { useState, useEffect } from 'react';
import {
  Box,
  Switch,
  FormControlLabel,
  Paper,
  Typography,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Button,
} from '@mui/material';
import {
  CloudDone as CloudIcon,
  BugReport as MockIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { config } from '../../config/environment';
import { useAppDispatch } from '../../app/store/hooks';
import { reinitializeAuth } from '../../features/auth/model/authSlice';

const ApiModeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const [useMocks, setUseMocks] = useState(config.useMocks);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>(
    'checking'
  );
  const [expanded, setExpanded] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [hasApiError, setHasApiError] = useState(false);

  // Проверка статуса API
  const checkApiStatus = async () => {
    setApiStatus('checking');
    setApiError(null);
    try {
      const response = await fetch(
        `${config.apiUrl.replace('/api', '')}/api/health`,
        {
          signal: AbortSignal.timeout(5000), // Таймаут 5 секунд
        }
      );
      if (response.ok) {
        setApiStatus('online');
        setHasApiError(false);
      } else {
        setApiStatus('offline');
        setApiError(`Сервер недоступен (статус: ${response.status})`);
        setHasApiError(true);
      }
    } catch (error) {
      setApiStatus('offline');
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          setApiError('Превышено время ожидания ответа от сервера');
        } else if (
          error.message.includes('NetworkError') ||
          error.message.includes('fetch')
        ) {
          setApiError(
            'Ошибка сети. Проверьте подключение к интернету или убедитесь, что сервер запущен'
          );
        } else {
          setApiError(`Ошибка: ${error.message}`);
        }
      } else {
        setApiError('Неизвестная ошибка при подключении к API');
      }
      setHasApiError(true);
    }
  };

  useEffect(() => {
    if (!useMocks) {
      checkApiStatus();
    } else {
      setApiStatus('checking');
      setApiError(null);
      setHasApiError(false);
    }
  }, [useMocks]);

  const handleToggle = () => {
    const newUseMocks = !useMocks;

    setUseMocks(newUseMocks);

    // Обновляем конфигурацию используя новый API
    config.updateUseMocks(newUseMocks);

    // Переинициализируем авторизацию при смене режима
    dispatch(reinitializeAuth());

    console.log(
      `[ApiModeToggle] Режим изменен на: ${
        newUseMocks ? 'тестовые данные' : 'реальный API'
      }`
    );

    // Перезагружаем страницу для гарантированного применения изменений
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleSwitchToMocks = () => {
    setUseMocks(true);
    config.updateUseMocks(true);

    // Переинициализируем авторизацию
    dispatch(reinitializeAuth());

    setApiError(null);
    setHasApiError(false);
    console.log(
      '[ApiModeToggle] Переключение на тестовые данные из-за ошибки API'
    );

    // Перезагружаем страницу для гарантированного применения изменений
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const getStatusColor = () => {
    if (useMocks) return 'info';
    if (hasApiError) return 'error';
    switch (apiStatus) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = () => {
    if (useMocks) return 'Тестовые данные';
    if (hasApiError) return 'Ошибка API';
    switch (apiStatus) {
      case 'online':
        return 'API онлайн';
      case 'offline':
        return 'API недоступен';
      default:
        return 'Проверка...';
    }
  };

  // Скрываем в production
  if (config.isProduction) {
    return null;
  }

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 1000,
        minWidth: 320,
        maxWidth: 400,
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="subtitle2" color="textSecondary">
            Режим данных
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              size="small"
              color={getStatusColor()}
              label={getStatusText()}
              icon={
                useMocks ? (
                  <MockIcon />
                ) : hasApiError ? (
                  <WarningIcon />
                ) : (
                  <CloudIcon />
                )
              }
            />
            <IconButton size="small" onClick={() => setExpanded(!expanded)}>
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useMocks}
                  onChange={handleToggle}
                  color="primary"
                />
              }
              label={useMocks ? 'Тестовые данные' : 'Реальный API'}
            />

            {!useMocks && (
              <Box
                sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Typography variant="caption" color="textSecondary">
                  API: {config.apiUrl}
                </Typography>
                <IconButton size="small" onClick={checkApiStatus}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {/* Показываем ошибку API */}
            {hasApiError && !useMocks && (
              <Box sx={{ mt: 1 }}>
                <Alert
                  severity="error"
                  sx={{ mb: 1 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleSwitchToMocks}
                    >
                      Использовать моки
                    </Button>
                  }
                >
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Ошибка подключения к API
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {apiError}
                  </Typography>
                </Alert>

                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  💡 Возможные решения:
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block' }}
                >
                  • Запустите сервер командой:{' '}
                  <code>cd server && npm start</code>
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block' }}
                >
                  • Проверьте подключение к интернету
                </Typography>
                <Typography
                  variant="caption"
                  color="textSecondary"
                  sx={{ display: 'block' }}
                >
                  • Или используйте тестовые данные
                </Typography>
              </Box>
            )}

            {/* Стандартное сообщение о статусе */}
            {!hasApiError && (
              <Alert
                severity={
                  useMocks
                    ? 'info'
                    : apiStatus === 'online'
                    ? 'success'
                    : 'warning'
                }
                sx={{ mt: 1 }}
              >
                {useMocks
                  ? 'Используются тестовые данные (MSW)'
                  : apiStatus === 'online'
                  ? 'Подключен к реальной базе данных'
                  : 'Проверяется доступность сервера...'}
              </Alert>
            )}
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
};

export default ApiModeToggle;

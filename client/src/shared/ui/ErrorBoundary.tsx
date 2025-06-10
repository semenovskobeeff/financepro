import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReportProblem, Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorType?: 'hooks' | 'network' | 'render' | 'unknown';
}

const ErrorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--spacing-5)',
  margin: 'var(--spacing-4)',
  backgroundColor: 'var(--bg-secondary)',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  textAlign: 'center',
  minHeight: '200px',
}));

const ErrorIcon = styled(ReportProblem)(({ theme }) => ({
  fontSize: 48,
  color: '#E03E3E',
  marginBottom: 'var(--spacing-3)',
}));

const ErrorTitle = styled(Typography)(({ theme }) => ({
  fontSize: 'var(--font-size-lg)',
  fontWeight: 'var(--font-weight-semibold)',
  marginBottom: 'var(--spacing-2)',
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  fontSize: 'var(--font-size-md)',
  color: 'var(--text-secondary)',
  marginBottom: 'var(--spacing-4)',
  maxWidth: '600px',
}));

const ErrorDetails = styled(Box)(({ theme }) => ({
  backgroundColor: 'var(--bg-accent)',
  padding: 'var(--spacing-3)',
  borderRadius: 'var(--border-radius-sm)',
  width: '100%',
  maxWidth: '600px',
  marginBottom: 'var(--spacing-4)',
  textAlign: 'left',
  overflow: 'auto',
  maxHeight: '200px',
  fontFamily: 'monospace',
  fontSize: '14px',
  color: 'var(--text-secondary)',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--text-accent)',
  color: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  textTransform: 'none',
  padding: '8px 16px',
  borderRadius: 'var(--border-radius-sm)',
  margin: '4px',
  '&:hover': {
    backgroundColor: 'var(--text-accent)',
    opacity: 0.9,
  },
}));

// Функция для классификации типа ошибки
const classifyError = (
  error: Error
): 'hooks' | 'network' | 'render' | 'unknown' => {
  const message = error.message.toLowerCase();
  const stack = error.stack?.toLowerCase() || '';

  // Ошибки хуков (включая #310)
  if (
    message.includes('hook') ||
    message.includes('rendered more hooks') ||
    message.includes('invalid hook call') ||
    stack.includes('hook')
  ) {
    return 'hooks';
  }

  // Сетевые ошибки
  if (
    message.includes('fetch') ||
    message.includes('network') ||
    message.includes('xhr') ||
    message.includes('fetch_error')
  ) {
    return 'network';
  }

  // Ошибки рендеринга
  if (
    message.includes('render') ||
    message.includes('component') ||
    message.includes('jsx') ||
    stack.includes('render')
  ) {
    return 'render';
  }

  return 'unknown';
};

// Функция для получения пользовательского сообщения об ошибке
const getErrorMessage = (
  errorType: 'hooks' | 'network' | 'render' | 'unknown',
  error: Error
) => {
  switch (errorType) {
    case 'hooks':
      return 'Произошла ошибка в логике компонента. Попробуйте обновить страницу или обратитесь к разработчику.';
    case 'network':
      return 'Произошла ошибка сети. Проверьте подключение к интернету и попробуйте снова.';
    case 'render':
      return 'Произошла ошибка при отображении компонента. Попробуйте обновить страницу.';
    default:
      return 'Произошла неожиданная ошибка. Попробуйте обновить страницу или сообщите об ошибке.';
  }
};

// Функция для получения рекомендаций по устранению
const getErrorRecommendations = (
  errorType: 'hooks' | 'network' | 'render' | 'unknown'
) => {
  switch (errorType) {
    case 'hooks':
      return [
        'Обновите страницу',
        'Проверьте работу браузера',
        'Очистите кеш браузера',
      ];
    case 'network':
      return [
        'Проверьте интернет-соединение',
        'Переключитесь на тестовые данные',
        'Попробуйте позже',
      ];
    case 'render':
      return [
        'Обновите страницу',
        'Проверьте консоль браузера',
        'Попробуйте другой браузер',
      ];
    default:
      return ['Обновите страницу', 'Сообщите об ошибке разработчику'];
  }
};

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorType = classifyError(error);
    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Детальная диагностика для ошибки хуков
    if (this.state.errorType === 'hooks') {
      console.error('🔧 ДИАГНОСТИКА ОШИБКИ ХУКОВ:');
      console.error('- Проверьте условное выполнение хуков');
      console.error('- Убедитесь что хуки вызываются в одном порядке');
      console.error('- Проверьте early returns в компонентах');
    }

    this.setState({ error, errorInfo });
    this.saveErrorLog(error, errorInfo);
  }

  saveErrorLog(error: Error, errorInfo: ErrorInfo): void {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        type: this.state.errorType,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.push(errorLog);
      if (logs.length > 10) logs.shift();
      localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorType: undefined,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  handleSwitchToMocks = (): void => {
    // Переключаемся на тестовые данные при сетевых ошибках
    localStorage.setItem('useMocks', 'true');
    localStorage.setItem('mockDataType', 'filled');
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorType = 'unknown' } = this.state;
      const userMessage = getErrorMessage(errorType, error!);
      const recommendations = getErrorRecommendations(errorType);

      return (
        <ErrorContainer>
          <ErrorIcon />
          <ErrorTitle variant="h5">Что-то пошло не так</ErrorTitle>
          <ErrorMessage>{userMessage}</ErrorMessage>

          {/* Рекомендации для пользователя */}
          <Box sx={{ mb: 3, textAlign: 'left', maxWidth: '600px' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Рекомендации:
            </Typography>
            {recommendations.map((rec, index) => (
              <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                • {rec}
              </Typography>
            ))}
          </Box>

          {/* Техническая информация для разработчиков */}
          {import.meta.env.DEV && this.state.error && (
            <ErrorDetails>
              <strong>Тип ошибки:</strong> {errorType}
              <br />
              <strong>Сообщение:</strong> {this.state.error.toString()}
              {this.state.errorInfo && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Стек компонентов:</strong>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </ErrorDetails>
          )}

          {/* Кнопки действий */}
          <Box>
            <ActionButton startIcon={<Refresh />} onClick={this.handleReset}>
              Попробовать снова
            </ActionButton>

            <ActionButton startIcon={<Refresh />} onClick={this.handleReload}>
              Обновить страницу
            </ActionButton>

            {errorType === 'network' && (
              <ActionButton
                startIcon={<BugReport />}
                onClick={this.handleSwitchToMocks}
              >
                Тестовые данные
              </ActionButton>
            )}
          </Box>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

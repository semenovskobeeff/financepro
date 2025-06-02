import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ReportProblem, Refresh } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
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

const ResetButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--text-accent)',
  color: '#FFFFFF',
  fontFamily: 'Inter, sans-serif',
  textTransform: 'none',
  padding: '8px 16px',
  borderRadius: 'var(--border-radius-sm)',
  '&:hover': {
    backgroundColor: 'var(--text-accent)',
    opacity: 0.9,
  },
}));

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Можно отправить ошибку в сервис аналитики
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });

    // Сохраняем снимок в /logs (если нужно)
    this.saveErrorLog(error, errorInfo);
  }

  saveErrorLog(error: Error, errorInfo: ErrorInfo): void {
    // Здесь можно реализовать сохранение лога в IndexedDB или localStorage
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          message: error.message,
          stack: error.stack,
        },
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // Сохраняем в localStorage (временное решение)
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.push(errorLog);
      // Ограничиваем количество сохраненных логов
      if (logs.length > 10) logs.shift();
      localStorage.setItem('errorLogs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save error log:', e);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Если у нас есть пользовательский fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе отображаем стандартный UI ошибки в стиле Notion
      return (
        <ErrorContainer>
          <ErrorIcon />
          <ErrorTitle variant="h5">Что-то пошло не так</ErrorTitle>
          <ErrorMessage>
            Произошла ошибка при отображении этого компонента. Пожалуйста,
            попробуйте обновить страницу или сообщите об ошибке.
          </ErrorMessage>

          {import.meta.env.DEV && this.state.error && (
            <ErrorDetails>
              <strong>{this.state.error.toString()}</strong>
              {this.state.errorInfo && (
                <div style={{ marginTop: '10px' }}>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </ErrorDetails>
          )}

          <ResetButton startIcon={<Refresh />} onClick={this.handleReset}>
            Попробовать снова
          </ResetButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

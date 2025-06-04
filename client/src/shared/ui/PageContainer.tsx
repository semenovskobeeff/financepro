import React, { ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
} from '@mui/material';

interface PageContainerProps {
  children: ReactNode;
  title?: string | ReactNode;
  subtitle?: string | ReactNode;
  action?:
    | ReactNode
    | {
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
      };
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  }>;
}

/**
 * Универсальный контейнер для страниц приложения
 */
const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  subtitle,
  action,
  actions,
}) => {
  const renderAction = () => {
    if (!action) return null;

    // Если action - это ReactNode (JSX), возвращаем как есть
    if (React.isValidElement(action)) {
      return action;
    }

    // Если action - это объект с полями, создаем кнопку
    if (typeof action === 'object' && 'label' in action) {
      return (
        <Button
          variant="contained"
          color="primary"
          startIcon={action.icon}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        padding: 3,
        flexGrow: 1,
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {(title || subtitle || action || actions) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
          }}
        >
          <Box>
            {title && (
              <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="subtitle1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {renderAction()}
            {actions &&
              actions.map((actionItem, index) => (
                <Button
                  key={index}
                  variant="contained"
                  color={actionItem.color || 'primary'}
                  startIcon={actionItem.icon}
                  onClick={actionItem.onClick}
                >
                  {actionItem.label}
                </Button>
              ))}
          </Box>
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
};

export default PageContainer;

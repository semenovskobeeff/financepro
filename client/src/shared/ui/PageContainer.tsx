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
  action?: {
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
  action,
  actions,
}) => {
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
      {(title || action || actions) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          {title && (
            <Typography variant="h4" component="h1">
              {title}
            </Typography>
          )}
          {action && (
            <Button
              variant="contained"
              color="primary"
              startIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {actions && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {actions.map((actionItem, index) => (
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
          )}
        </Box>
      )}

      <Box sx={{ flexGrow: 1 }}>{children}</Box>
    </Box>
  );
};

export default PageContainer;

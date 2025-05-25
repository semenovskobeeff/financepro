import React, { ReactNode } from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme as useMuiTheme } from '@mui/material/styles';

// Интерфейс для пропсов
interface NotionButtonProps extends Omit<MuiButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'text' | 'outline';
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Стилизованная кнопка в стиле Notion
const StyledButton = styled(MuiButton, {
  shouldForwardProp: prop => prop !== 'notionVariant' && prop !== 'buttonSize',
})<{
  notionVariant: 'primary' | 'secondary' | 'text' | 'outline';
  buttonSize: 'small' | 'medium' | 'large';
}>(({ notionVariant, buttonSize }) => ({
  fontFamily: 'Inter, sans-serif',
  fontWeight: 500,
  borderRadius: 'var(--border-radius-sm)',
  transition: 'var(--transition-default)',
  textTransform: 'none',
  boxShadow: 'none',
  padding:
    buttonSize === 'small'
      ? '4px 10px'
      : buttonSize === 'medium'
      ? '6px 16px'
      : '8px 22px',
  fontSize:
    buttonSize === 'small' ? '14px' : buttonSize === 'medium' ? '16px' : '18px',
  // Стили для разных вариантов
  ...(notionVariant === 'primary' && {
    backgroundColor: 'var(--text-accent)',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: 'var(--text-accent)',
      opacity: 0.9,
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: 'var(--text-accent)',
      opacity: 0.8,
    },
    '&:disabled': {
      backgroundColor: 'var(--text-accent)',
      opacity: 0.5,
      color: '#FFFFFF',
    },
  }),
  // Вторичная кнопка
  ...(notionVariant === 'secondary' && {
    backgroundColor: 'var(--bg-accent)',
    color: 'var(--text-primary)',
    '&:hover': {
      backgroundColor: 'var(--bg-accent)',
      opacity: 0.8,
      boxShadow: 'none',
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: 'var(--bg-accent)',
      opacity: 0.7,
    },
    '&:disabled': {
      backgroundColor: 'var(--bg-accent)',
      opacity: 0.5,
      color: 'var(--text-primary)',
    },
  }),
  // Текстовая кнопка
  ...(notionVariant === 'text' && {
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    '&:hover': {
      backgroundColor: 'var(--bg-accent)',
      opacity: 0.8,
    },
    '&:active': {
      backgroundColor: 'var(--bg-accent)',
      opacity: 0.7,
    },
    '&:disabled': {
      color: 'var(--text-secondary)',
      opacity: 0.5,
    },
  }),
  // Контурная кнопка
  ...(notionVariant === 'outline' && {
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    '&:hover': {
      backgroundColor: 'var(--bg-accent)',
      borderColor: 'var(--border-dark)',
    },
    '&:active': {
      backgroundColor: 'var(--bg-accent)',
      borderColor: 'var(--border-dark)',
      opacity: 0.9,
    },
    '&:disabled': {
      borderColor: 'var(--border)',
      color: 'var(--text-secondary)',
      opacity: 0.5,
    },
  }),
}));

// Компонент кнопки в стиле Notion
const NotionButton: React.FC<NotionButtonProps> = ({
  children,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  size = 'medium',
  ...props
}) => {
  const muiTheme = useMuiTheme();
  const isDarkMode = muiTheme.palette.mode === 'dark';

  // Цветовые варианты кнопки в зависимости от типа
  const getButtonColor = (variant: string) => {
    const colors = {
      primary: {
        bg: 'var(--accent-blue)',
        bgHover: '#B0D8FF',
        text: isDarkMode ? '#1A1A1A' : '#1A1A1A',
        border: 'transparent',
      },
      secondary: {
        bg: 'var(--bg-secondary)',
        bgHover: 'var(--bg-accent)',
        text: 'var(--text-primary)',
        border: 'var(--border)',
      },
      text: {
        bg: 'transparent',
        bgHover: 'var(--bg-accent)',
        text: 'var(--text-primary)',
        border: 'transparent',
      },
      outline: {
        bg: 'transparent',
        bgHover: 'rgba(176, 216, 255, 0.1)',
        text: 'var(--text-primary)',
        border: 'var(--border)',
      },
    };

    return colors[variant as keyof typeof colors] || colors.primary;
  };

  return (
    <StyledButton
      notionVariant={variant}
      buttonSize={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      startIcon={
        loading ? <CircularProgress size={16} color="inherit" /> : icon
      }
      {...props}
    >
      {children}
    </StyledButton>
  );
};

export default NotionButton;

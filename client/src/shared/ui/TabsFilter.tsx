import React from 'react';
import { Box, styled, Typography } from '@mui/material';
import {
  AllInclusive as AllIcon,
  PlayArrow as ActiveIcon,
  CheckCircle as CompletedIcon,
  Archive as ArchivedIcon,
} from '@mui/icons-material';

interface TabOption {
  value: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface TabsFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: TabOption[];
  size?: 'small' | 'medium' | 'large';
}

const StyledTabsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  backgroundColor: 'var(--bg-secondary)',
  padding: '4px',
  borderRadius: 'var(--border-radius-md)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow)',
  width: 'fit-content',
  maxWidth: '100%',

  [theme.breakpoints.down('sm')]: {
    width: '100%',
    justifyContent: 'center',
  },
}));

const StyledTab = styled(Box, {
  shouldForwardProp: prop => !['isActive', 'tabSize'].includes(prop as string),
})<{ isActive?: boolean; tabSize?: string }>(({ isActive, tabSize, theme }) => {
  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '13px', minHeight: '32px' },
    medium: { padding: '8px 16px', fontSize: '14px', minHeight: '36px' },
    large: { padding: '10px 20px', fontSize: '15px', minHeight: '40px' },
  };

  const size =
    sizeStyles[tabSize as keyof typeof sizeStyles] || sizeStyles.medium;

  return {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: size.padding,
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'var(--transition-default)',
    fontSize: size.fontSize,
    fontWeight: 500,
    minHeight: size.minHeight,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    position: 'relative',
    flexShrink: 0,

    ...(isActive
      ? {
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow)',
          transform: 'translateY(-1px)',
          zIndex: 1,
        }
      : {
          backgroundColor: 'transparent',
          color: 'var(--text-secondary)',
          '&:hover': {
            backgroundColor: 'var(--bg-accent)',
            color: 'var(--text-primary)',
          },
        }),

    '& .tab-icon': {
      fontSize: '16px',
      transition: 'var(--transition-default)',
      ...(isActive && {
        transform: 'scale(1.05)',
      }),
    },

    '& .tab-count': {
      backgroundColor: isActive ? 'var(--bg-accent)' : 'var(--bg-secondary)',
      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: isActive ? 'none' : '1px solid var(--border)',
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: 600,
      minWidth: '18px',
      height: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      transition: 'var(--transition-default)',
    },
  };
});

const TabsFilter: React.FC<TabsFilterProps> = ({
  value,
  onChange,
  options,
  size = 'medium',
}) => {
  return (
    <StyledTabsContainer>
      {options.map(option => (
        <StyledTab
          key={option.value}
          isActive={value === option.value}
          tabSize={size}
          onClick={() => onChange(option.value)}
        >
          <Box className="tab-icon">{option.icon}</Box>
          <Typography
            component="span"
            sx={{ fontSize: 'inherit', fontWeight: 'inherit' }}
          >
            {option.label}
          </Typography>
          {typeof option.count === 'number' && (
            <Box className="tab-count">{option.count}</Box>
          )}
        </StyledTab>
      ))}
    </StyledTabsContainer>
  );
};

// Готовые опции для статусов целей
export const goalStatusOptions: TabOption[] = [
  {
    value: 'all',
    label: 'Все',
    icon: <AllIcon />,
  },
  {
    value: 'active',
    label: 'Активные',
    icon: <ActiveIcon />,
  },
  {
    value: 'completed',
    label: 'Завершенные',
    icon: <CompletedIcon />,
  },
  {
    value: 'archived',
    label: 'Архивные',
    icon: <ArchivedIcon />,
  },
];

export default TabsFilter;

import React, { ReactNode } from 'react';
import { Chip, Tooltip, ChipProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface NotionTagProps {
  label: string;
  color?:
    | 'default'
    | 'blue'
    | 'yellow'
    | 'red'
    | 'green'
    | 'orange'
    | 'purple'
    | 'pink'
    | 'gray';
  icon?: ReactNode;
  onClick?: () => void;
  tooltip?: string;
  size?: 'small' | 'medium';
}

// Цветовые схемы для тегов
const getTagColors = (color: string) => {
  const muiTheme = useMuiTheme();
  const isDarkMode = muiTheme.palette.mode === 'dark';
  // Для темной темы делаем цвета с прозрачностью для лучшего восприятия
  const alpha = isDarkMode ? '80' : '';

  // Основные цвета по категориям
  const colorMap: {
    [key: string]: { color: string; border: string; bg: string };
  } = {
    blue: {
      color: '#BAE1FF',
      border: '#B0D8FF',
      bg: 'rgba(186, 225, 255, 0.2)',
    },
    yellow: {
      color: '#FFF5BA',
      border: '#FFEEB4',
      bg: 'rgba(255, 245, 186, 0.2)',
    },
    red: {
      color: '#FFB3BA',
      border: '#FFCCBC',
      bg: 'rgba(255, 179, 186, 0.2)',
    },
    green: {
      color: '#BAFFC9',
      border: '#C2E9C3',
      bg: 'rgba(186, 255, 201, 0.2)',
    },
    orange: {
      color: '#FFDFBA',
      border: '#FFDAB9',
      bg: 'rgba(255, 223, 186, 0.2)',
    },
    purple: {
      color: '#D0B0FF',
      border: '#C7A3FF',
      bg: 'rgba(208, 176, 255, 0.2)',
    },
    pink: {
      color: '#FFD7DA',
      border: '#F8C6D0',
      bg: 'rgba(255, 215, 218, 0.2)',
    },
    gray: {
      color: '#E8E8E8',
      border: '#F0F0F0',
      bg: 'rgba(232, 232, 232, 0.2)',
    },
    default: {
      color: '#F0F0F0',
      border: '#E8E8E8',
      bg: 'rgba(240, 240, 240, 0.2)',
    },
  };

  return colorMap[color as keyof typeof colorMap] || colorMap.default;
};

// Стилизованный тег
const StyledChip = styled(Chip, {
  shouldForwardProp: prop =>
    !['tagColor', 'isClickable'].includes(prop as string),
})<{
  tagColor: string;
  isClickable?: boolean;
}>(({ tagColor, isClickable }) => {
  const colors = getTagColors(tagColor);

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontFamily: 'Inter, sans-serif',
    transition: 'var(--transition-default)',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: 500,

    ...(isClickable && {
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: colors.bg,
        opacity: 0.8,
      },
      '&:active': {
        backgroundColor: colors.bg,
        opacity: 0.7,
      },
    }),

    '& .MuiChip-icon': {
      color: 'inherit',
    },
  };
});

// Компонент тега в стиле Notion
export const NotionTag: React.FC<NotionTagProps> = ({
  label,
  color = 'default',
  icon,
  onClick,
  tooltip,
  size = 'small',
}) => {
  const chip = (
    <StyledChip
      label={label}
      icon={icon as React.ReactElement<any> | undefined}
      tagColor={color}
      isClickable={!!onClick}
      onClick={onClick}
      size={size}
    />
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{chip}</Tooltip>;
  }

  return chip;
};

export default NotionTag;

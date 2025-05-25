import React, { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Box,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface NotionCardProps {
  title?: string;
  icon?: ReactNode;
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
  children: ReactNode;
  hover?: boolean;
  onClick?: () => void;
  badge?: string;
  subtitle?: string;
}

/**
 * Получает цвета для карточки в зависимости от выбранного типа
 */
const getCardColors = (color: string) => {
  const isDarkMode = useMuiTheme().palette.mode === 'dark';
  const alpha = isDarkMode ? '80' : '';

  const colorMap: Record<
    string,
    { bg: string; borderHover: string; accent: string }
  > = {
    blue: {
      bg: isDarkMode ? `rgba(176, 216, 255, 0.1)` : `rgba(176, 216, 255, 0.2)`,
      borderHover: '#B0D8FF',
      accent: '#BAE1FF',
    },
    yellow: {
      bg: isDarkMode ? `rgba(255, 245, 186, 0.1)` : `rgba(255, 245, 186, 0.2)`,
      borderHover: '#FFEEB4',
      accent: '#FFF5BA',
    },
    red: {
      bg: isDarkMode ? `rgba(255, 179, 186, 0.1)` : `rgba(255, 179, 186, 0.2)`,
      borderHover: '#FFCCBC',
      accent: '#FFB3BA',
    },
    green: {
      bg: isDarkMode ? `rgba(186, 255, 201, 0.1)` : `rgba(186, 255, 201, 0.2)`,
      borderHover: '#C2E9C3',
      accent: '#BAFFC9',
    },
    orange: {
      bg: isDarkMode ? `rgba(255, 223, 186, 0.1)` : `rgba(255, 223, 186, 0.2)`,
      borderHover: '#FFDAB9',
      accent: '#FFDFBA',
    },
    purple: {
      bg: isDarkMode ? `rgba(208, 176, 255, 0.1)` : `rgba(208, 176, 255, 0.2)`,
      borderHover: '#C7A3FF',
      accent: '#D0B0FF',
    },
    pink: {
      bg: isDarkMode ? `rgba(248, 198, 208, 0.1)` : `rgba(248, 198, 208, 0.2)`,
      borderHover: '#F8C6D0',
      accent: '#FFD7DA',
    },
    gray: {
      bg: isDarkMode ? `rgba(232, 232, 232, 0.1)` : `rgba(232, 232, 232, 0.2)`,
      borderHover: '#F0F0F0',
      accent: '#E8E8E8',
    },
    default: {
      bg: 'transparent',
      borderHover: 'var(--border)',
      accent: 'var(--text-secondary)',
    },
  };

  return colorMap[color] || colorMap.default;
};

// Стилизованная карточка
const StyledCard = styled(Card, {
  shouldForwardProp: prop =>
    !['cardColor', 'isHoverable', 'isClickable'].includes(prop as string),
})<{
  cardColor: string;
  isHoverable?: boolean;
  isClickable?: boolean;
}>(({ cardColor, isHoverable, isClickable }) => {
  const colors = getCardColors(cardColor);

  return {
    backgroundColor: colors.bg,
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--border-radius-md)',
    padding: 'var(--spacing-3)',
    transition: 'var(--transition-default)',
    boxShadow: 'var(--shadow)',
    position: 'relative',
    overflow: 'visible',

    ...(isHoverable && {
      '&:hover': {
        border: `1px solid ${colors.borderHover}`,
        boxShadow: 'var(--shadow)',
      },
    }),

    ...(isClickable && {
      cursor: 'pointer',
    }),

    '&:before':
      cardColor !== 'default'
        ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: colors.accent,
            borderTopLeftRadius: 'var(--border-radius-md)',
            borderBottomLeftRadius: 'var(--border-radius-md)',
          }
        : {},
  };
});

// Компонент карточки в стиле Notion
export const NotionCard: React.FC<NotionCardProps> = ({
  title,
  icon,
  color = 'default',
  children,
  hover = true,
  onClick,
  badge,
  subtitle,
}) => {
  return (
    <StyledCard
      cardColor={color}
      isHoverable={hover}
      isClickable={!!onClick}
      onClick={onClick}
    >
      {(title || icon || badge) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box
                sx={{
                  color: getCardColors(color).accent,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 20,
                }}
              >
                {icon}
              </Box>
            )}
            {title && (
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  fontSize: '16px',
                  color: 'var(--text-primary)',
                }}
              >
                {title}
              </Typography>
            )}
          </Box>

          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                backgroundColor: getCardColors(color).bg,
                color: getCardColors(color).accent,
                borderColor: getCardColors(color).borderHover,
                fontWeight: 500,
                fontSize: '12px',
              }}
            />
          )}
        </Box>
      )}

      {subtitle && (
        <Typography
          variant="body2"
          color="var(--text-secondary)"
          sx={{ mb: 2, fontSize: '14px' }}
        >
          {subtitle}
        </Typography>
      )}

      {children}
    </StyledCard>
  );
};

export default NotionCard;

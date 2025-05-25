import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../config/ThemeContext';
import { styled } from '@mui/material/styles';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--icon-primary)',
  padding: 8,
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: 'var(--bg-accent)',
  },
  transition: 'var(--transition-default)',
}));

const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme, themeToggleEnabled } = useTheme();

  // Не отображаем компонент, если функциональность отключена
  if (!themeToggleEnabled) {
    return null;
  }

  return (
    <Tooltip title={themeMode === 'light' ? 'Темная тема' : 'Светлая тема'}>
      <StyledIconButton onClick={toggleTheme} aria-label="Переключить тему">
        {themeMode === 'light' ? (
          <Brightness4 fontSize="small" />
        ) : (
          <Brightness7 fontSize="small" />
        )}
      </StyledIconButton>
    </Tooltip>
  );
};

export default ThemeToggle;

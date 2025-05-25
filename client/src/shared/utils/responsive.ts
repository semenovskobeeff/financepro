import { Theme } from '@mui/material';

/**
 * Проверяет, является ли текущее устройство мобильным
 * @param theme Тема Material UI для доступа к брейкпоинтам
 * @returns true, если устройство мобильное
 */
export const isMobile = (theme: Theme): boolean => {
  return window.innerWidth < theme.breakpoints.values.sm;
};

/**
 * Проверяет, является ли текущее устройство планшетом
 * @param theme Тема Material UI для доступа к брейкпоинтам
 * @returns true, если устройство планшет
 */
export const isTablet = (theme: Theme): boolean => {
  const width = window.innerWidth;
  return width >= theme.breakpoints.values.sm && width < theme.breakpoints.values.lg;
};

/**
 * Проверяет, является ли текущее устройство десктопом
 * @param theme Тема Material UI для доступа к брейкпоинтам
 * @returns true, если устройство десктоп
 */
export const isDesktop = (theme: Theme): boolean => {
  return window.innerWidth >= theme.breakpoints.values.lg;
}; 
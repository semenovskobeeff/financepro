import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { createTheme } from '@mui/material/styles';
import { pastelColorPalettes } from '../utils/pastelChartUtils';

// Типы тем
type ThemeMode = 'light' | 'dark';

// Интерфейс для контекста темы
interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  themeToggleEnabled: boolean;
  setThemeToggleEnabled: (enabled: boolean) => void;
}

// Создание контекста
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Добавляем пастельные цвета в тему
declare module '@mui/material/styles' {
  interface Theme {
    pastelColors: {
      pink: string[];
      blue: string[];
      green: string[];
      purple: string[];
      yellow: string[];
      coral: string[];
      gray: string[];
      statusSuccess: string;
      statusProcessing: string;
      statusWarning: string;
      statusError: string;
      statusInfo: string;
      statusBlocked: string;
      entityAccount: string;
      entityCategory: string;
      entityTransactionIncome: string;
      entityTransactionExpense: string;
      entityGoal: string;
      entitySubscription: string;
      entityDebt: string;
    };
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    pastelColors?: {
      pink?: string[];
      blue?: string[];
      green?: string[];
      purple?: string[];
      yellow?: string[];
      coral?: string[];
      gray?: string[];
      statusSuccess?: string;
      statusProcessing?: string;
      statusWarning?: string;
      statusError?: string;
      statusInfo?: string;
      statusBlocked?: string;
      entityAccount?: string;
      entityCategory?: string;
      entityTransactionIncome?: string;
      entityTransactionExpense?: string;
      entityGoal?: string;
      entitySubscription?: string;
      entityDebt?: string;
    };
  }
}

// Провайдер темы
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Получаем тему из localStorage или используем темную по умолчанию
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeMode) || 'dark';
  });

  // Состояние для включения/выключения функциональности переключения темы
  const [themeToggleEnabled, setThemeToggleEnabled] = useState<boolean>(false);

  // Функция для переключения темы
  const toggleTheme = () => {
    setThemeMode(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Применяем тему к body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const getLightTheme = () => {
    return createTheme({
      palette: {
        mode: 'light',
        // ... существующие настройки светлой темы
      },
      // Добавляем пастельные цвета в тему
      pastelColors: {
        pink: pastelColorPalettes.pink,
        blue: pastelColorPalettes.blue,
        green: pastelColorPalettes.green,
        purple: pastelColorPalettes.purple,
        yellow: pastelColorPalettes.yellow,
        coral: pastelColorPalettes.coral,
        gray: pastelColorPalettes.gray,
        statusSuccess: '#BAFFC9',
        statusProcessing: '#BAE1FF',
        statusWarning: '#FFF5BA',
        statusError: '#FFCCBC',
        statusInfo: '#D0B0FF',
        statusBlocked: '#F0F0F0',
        entityAccount: '#BAE1FF',
        entityCategory: '#D0B0FF',
        entityTransactionIncome: '#BAFFC9',
        entityTransactionExpense: '#FFCCBC',
        entityGoal: '#FFF5BA',
        entitySubscription: '#FFB3BA',
        entityDebt: '#FFEBD6',
      },
      // ... остальные настройки без изменений
    });
  };

  const getDarkTheme = () => {
    return createTheme({
      palette: {
        mode: 'dark',
        // ... существующие настройки темной темы
      },
      // Добавляем пастельные цвета в темную тему (с прозрачностью)
      pastelColors: {
        pink: pastelColorPalettes.pink.map(color => hexToRgba(color, 0.8)),
        blue: pastelColorPalettes.blue.map(color => hexToRgba(color, 0.8)),
        green: pastelColorPalettes.green.map(color => hexToRgba(color, 0.8)),
        purple: pastelColorPalettes.purple.map(color => hexToRgba(color, 0.8)),
        yellow: pastelColorPalettes.yellow.map(color => hexToRgba(color, 0.8)),
        coral: pastelColorPalettes.coral.map(color => hexToRgba(color, 0.8)),
        gray: pastelColorPalettes.gray.map(color => hexToRgba(color, 0.8)),
        statusSuccess: hexToRgba('#BAFFC9', 0.8),
        statusProcessing: hexToRgba('#BAE1FF', 0.8),
        statusWarning: hexToRgba('#FFF5BA', 0.8),
        statusError: hexToRgba('#FFCCBC', 0.8),
        statusInfo: hexToRgba('#D0B0FF', 0.8),
        statusBlocked: hexToRgba('#F0F0F0', 0.8),
        entityAccount: hexToRgba('#BAE1FF', 0.8),
        entityCategory: hexToRgba('#D0B0FF', 0.8),
        entityTransactionIncome: hexToRgba('#BAFFC9', 0.8),
        entityTransactionExpense: hexToRgba('#FFCCBC', 0.8),
        entityGoal: hexToRgba('#FFF5BA', 0.8),
        entitySubscription: hexToRgba('#FFB3BA', 0.8),
        entityDebt: hexToRgba('#FFEBD6', 0.8),
      },
      // ... остальные настройки без изменений
    });
  };

  // Вспомогательная функция для преобразования HEX в RGBA
  const hexToRgba = (hex: string, alpha = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleTheme,
        themeToggleEnabled,
        setThemeToggleEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Хук для использования темы
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Экспорт функции useTheme для использования в Navbar и других компонентах
export { useTheme as useAppTheme };

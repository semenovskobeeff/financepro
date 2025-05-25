/**
 * Утилиты для работы с пастельными цветами Notion в графиках
 */
import { ChartOptions } from 'chart.js';

/**
 * Группы пастельных цветов для разных типов данных
 */
export const pastelColorPalettes = {
  // Основные палитры по категориям
  pink: ['#FFB3BA', '#FFD7DA', '#FFEBEE', '#F8C6D0'],
  blue: ['#BAE1FF', '#D4EFFF', '#B0D8FF', '#E3F2FD'],
  green: ['#BAFFC9', '#D8F5E2', '#C2E9C3', '#E6FFE9'],
  purple: ['#D0B0FF', '#E8D5FF', '#F2EBFF', '#C7A3FF'],
  yellow: ['#FFF5BA', '#FFEEB4', '#FFEBD6', '#FFDFBA'],
  coral: ['#FFCCBC', '#FFDAB9', '#FFE4CC'],
  gray: ['#F0F0F0', '#F5E6E8', '#E8E8E8'],

  // Тематические палитры по бизнес-сущностям
  income: ['#BAFFC9', '#D8F5E2', '#C2E9C3', '#E6FFE9'],
  expense: ['#FFCCBC', '#FFDAB9', '#FFE4CC'],
  accounts: ['#BAE1FF', '#D4EFFF', '#B0D8FF', '#E3F2FD'],
  goals: ['#FFF5BA', '#FFEEB4', '#FFEBD6', '#FFDFBA'],
  debts: ['#FFCCBC', '#FFDAB9', '#FFE4CC', '#F8C6D0'],
  subscriptions: ['#D0B0FF', '#E8D5FF', '#F2EBFF', '#C7A3FF'],
};

/**
 * Возвращает палитру цветов с учетом темной темы
 * @param palette название палитры
 * @param isDarkMode флаг темной темы
 * @returns массив цветов
 */
export const getPastelPalette = (
  palette: keyof typeof pastelColorPalettes,
  isDarkMode = false
): string[] => {
  const colors = pastelColorPalettes[palette] || pastelColorPalettes.blue;

  if (!isDarkMode) {
    return colors;
  }

  // Для темной темы добавляем прозрачность
  return colors.map(color => {
    const rgba = hexToRgba(color, 0.8);
    return rgba;
  });
};

/**
 * Преобразует HEX цвет в формат RGBA
 * @param hex HEX цвет
 * @param alpha прозрачность (0-1)
 * @returns строка RGBA
 */
export const hexToRgba = (hex: string, alpha = 1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Генерирует массив пастельных цветов с чередованием из разных палитр
 * @param count количество цветов
 * @param palette основная палитра
 * @param isDarkMode флаг темной темы
 * @returns массив цветов
 */
export const generatePastelColors = (
  count: number,
  palette: keyof typeof pastelColorPalettes = 'blue',
  isDarkMode = false
): string[] => {
  const primaryColors = getPastelPalette(palette, isDarkMode);

  // Если нужно меньше цветов, чем есть в основной палитре
  if (count <= primaryColors.length) {
    return primaryColors.slice(0, count);
  }

  // Добавляем цвета из других палитр для достижения нужного количества
  const allColors: string[] = [...primaryColors];
  const additionalPalettes: (keyof typeof pastelColorPalettes)[] = [
    'green',
    'purple',
    'yellow',
    'coral',
    'pink',
    'gray',
  ];

  for (const additionalPalette of additionalPalettes) {
    if (additionalPalette === palette) continue;

    const colors = getPastelPalette(additionalPalette, isDarkMode);
    allColors.push(...colors);

    if (allColors.length >= count) {
      break;
    }
  }

  return allColors.slice(0, count);
};

/**
 * Создает параметры для графика Chart.js с пастельными цветами
 * @param type тип данных для графика
 * @param isDarkMode флаг темной темы
 * @param count количество элементов в наборе данных
 * @returns параметры для Chart.js
 */
export const getPastelChartOptions = (
  type:
    | 'income'
    | 'expense'
    | 'accounts'
    | 'goals'
    | 'debts'
    | 'subscriptions' = 'income',
  isDarkMode = false,
  count = 6
): ChartOptions<'pie' | 'doughnut' | 'bar'> => {
  const colors = generatePastelColors(
    count,
    type as keyof typeof pastelColorPalettes,
    isDarkMode
  );
  const borderColors = isDarkMode
    ? colors.map(color => hexToRgba('#FFFFFF', 0.3))
    : colors.map(color => hexToRgba('#FFFFFF', 0.7));

  return {
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#E8E8E8' : '#2D3436',
          font: {
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: borderColors,
      },
      bar: {
        borderWidth: 1,
        borderColor: borderColors,
        borderRadius: 4,
      },
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#E8E8E8' : '#2D3436',
        },
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#E8E8E8' : '#2D3436',
        },
      },
    },
  };
};

/**
 * Возвращает готовый набор цветов для графика с соответствующим типом данных
 */
export const getDataTypeColors = (
  dataType:
    | 'income'
    | 'expense'
    | 'accounts'
    | 'goals'
    | 'debts'
    | 'subscriptions',
  isDarkMode = false,
  count = 1
): string[] => {
  // Получаем основной цвет для типа данных
  let baseColor: string;
  switch (dataType) {
    case 'income':
      baseColor = '#BAFFC9'; // Мятный
      break;
    case 'expense':
      baseColor = '#FFCCBC'; // Коралловый
      break;
    case 'accounts':
      baseColor = '#BAE1FF'; // Голубой
      break;
    case 'goals':
      baseColor = '#FFF5BA'; // Желтый
      break;
    case 'debts':
      baseColor = '#FFEBD6'; // Персиковый
      break;
    case 'subscriptions':
      baseColor = '#D0B0FF'; // Фиолетовый
      break;
  }

  // Если нужен только один цвет, возвращаем основной
  if (count === 1) {
    return [isDarkMode ? hexToRgba(baseColor, 0.8) : baseColor];
  }

  // Иначе возвращаем массив цветов соответствующей палитры
  return getPastelPalette(dataType, isDarkMode).slice(0, count);
};

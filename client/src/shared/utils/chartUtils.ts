import { Chart as ChartJS, ChartOptions } from 'chart.js';

/**
 * Получает цвета графика для текущей темы (светлая/темная)
 */
export const getChartColors = (isDarkMode = false): string[] => {
  // Если темная тема, делаем цвета с прозрачностью для контраста
  const opacity = isDarkMode ? '80' : '';
  return [
    `#BAE1FF${opacity}`, // голубой (ледяной акцент)
    `#BAFFC9${opacity}`, // мятный (успешные статусы)
    `#D0B0FF${opacity}`, // лавандовый (креативные блоки)
    `#FFB3BA${opacity}`, // нежно-розовый (клубничный йогурт)
    `#FFDFBA${opacity}`, // песочный (нейтральные элементы)
    `#FFF5BA${opacity}`, // лимонный крем (предупреждения)
    `#D8F5E2${opacity}`, // светлая зелень (природа)
    `#D4EFFF${opacity}`, // прозрачно-голубой (небо)
    `#E8D5FF${opacity}`, // бледно-сиреневый (иконки)
    `#FFDAB9${opacity}`, // персиково-оранжевый (теги)
    `#F8C6D0${opacity}`, // пудрово-розовый (для диаграмм)
    `#FFEEB4${opacity}`, // теплый желтый (акценты)
    `#C2E9C3${opacity}`, // оливково-пастельный
    `#F5E6E8${opacity}`, // розовато-серый (фон)
  ];
};

/**
 * Получает общие настройки для графиков в стиле Notion
 */
export const getNotionChartOptions = (
  isDarkMode = false,
  options: Partial<ChartOptions<any>> = {}
): ChartOptions<any> => {
  const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : '#2D2D2D';
  const gridColor = isDarkMode ? '#404040' : '#E0E0E0';
  const borderColor = isDarkMode ? '#4D4D4D' : '#D9D9D9';

  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 10,
        right: 20,
        bottom: 10,
        left: 10,
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 15,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          color: textColor,
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#2D2D2D' : 'white',
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: borderColor,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        boxPadding: 4,
        bodyFont: {
          family: 'Inter, sans-serif',
        },
        titleFont: {
          family: 'Inter, sans-serif',
          weight: 'bold',
        },
      },
      ...options.plugins,
    },
    scales: {
      x: {
        grid: {
          color: gridColor,
          drawBorder: true,
          borderColor: borderColor,
          borderWidth: 1,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        ...options.scales?.x,
      },
      y: {
        grid: {
          color: gridColor,
          drawBorder: true,
          borderColor: borderColor,
          borderWidth: 1,
        },
        ticks: {
          color: textColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
        ...options.scales?.y,
      },
    },
  };
};

/**
 * Применение настроек Notion к графикам Chart.js
 * (Рекомендуется вызывать этот метод один раз при инициализации приложения)
 */
export const applyNotionChartDefaults = (): void => {
  // Проверяем, инициализирован ли ChartJS и его свойства
  if (!ChartJS || !ChartJS.defaults) {
    console.warn('Chart.js не инициализирован должным образом');
    return;
  }

  // Устанавливаем дефолтные настройки для всех графиков
  if (ChartJS.defaults.font) {
    ChartJS.defaults.font.family = 'Inter, sans-serif';
  }

  if (ChartJS.defaults.animation) {
    ChartJS.defaults.animation.duration = 1000;
  }

  if (ChartJS.defaults.plugins?.tooltip) {
    ChartJS.defaults.plugins.tooltip.cornerRadius = 6;
  }

  // Удаляем тени
  if (ChartJS.defaults.elements?.bar) {
    ChartJS.defaults.elements.bar.borderRadius = 4;
  }

  if (ChartJS.defaults.elements?.line) {
    ChartJS.defaults.elements.line.tension = 0.3; // Легкое сглаживание
  }

  if (ChartJS.defaults.elements?.point) {
    ChartJS.defaults.elements.point.radius = 3;
    ChartJS.defaults.elements.point.borderWidth = 2;
  }
};

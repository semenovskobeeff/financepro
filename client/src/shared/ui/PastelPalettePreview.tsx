import React from 'react';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { pastelColorPalettes } from '../utils/pastelChartUtils';

interface ColorSampleProps {
  color: string;
  name?: string;
  showHex?: boolean;
}

/**
 * Компонент, показывающий образец цвета с его названием и/или значением
 */
const ColorSample: React.FC<ColorSampleProps> = ({
  color,
  name,
  showHex = false,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Определяем контраст текста (белый/черный) в зависимости от яркости фона
  const getContrastText = (hexColor: string) => {
    // Убираем # из начала строки, если есть
    const color = hexColor.charAt(0) === '#' ? hexColor.substring(1) : hexColor;

    // Конвертируем в RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Вычисляем яркость
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Возвращаем белый или черный в зависимости от яркости
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  return (
    <Paper
      sx={{
        bgcolor: color,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1,
        boxShadow: isDarkMode
          ? '0 0 0 1px rgba(255,255,255,0.2)'
          : '0 0 0 1px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: isDarkMode
            ? '0 0 0 2px rgba(255,255,255,0.4)'
            : '0 0 0 2px rgba(0,0,0,0.2)',
        },
      }}
    >
      {name && (
        <Typography
          variant="subtitle2"
          sx={{
            color: getContrastText(color),
            fontWeight: 'medium',
            mb: showHex ? 0.5 : 0,
          }}
        >
          {name}
        </Typography>
      )}
      {showHex && (
        <Typography
          variant="caption"
          sx={{
            color: getContrastText(color),
            opacity: 0.8,
          }}
        >
          {color}
        </Typography>
      )}
    </Paper>
  );
};

interface PaletteSectionProps {
  title: string;
  colors: string[];
  showHex?: boolean;
}

/**
 * Секция с группой цветов одной палитры
 */
const PaletteSection: React.FC<PaletteSectionProps> = ({
  title,
  colors,
  showHex = true,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Grid container spacing={2}>
        {colors.map((color, index) => (
          <Grid item xs={6} sm={4} md={3} key={`${title}-${index}`}>
            <ColorSample
              color={color}
              name={`Оттенок ${index + 1}`}
              showHex={showHex}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

interface PastelPalettePreviewProps {
  showHex?: boolean;
}

/**
 * Компонент для отображения всей пастельной палитры
 */
const PastelPalettePreview: React.FC<PastelPalettePreviewProps> = ({
  showHex = true,
}) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Пастельная палитра Notion
      </Typography>

      <PaletteSection
        title="Розовые оттенки"
        colors={pastelColorPalettes.pink}
        showHex={showHex}
      />

      <PaletteSection
        title="Голубые и синие"
        colors={pastelColorPalettes.blue}
        showHex={showHex}
      />

      <PaletteSection
        title="Зеленые"
        colors={pastelColorPalettes.green}
        showHex={showHex}
      />

      <PaletteSection
        title="Фиолетовые и сиреневые"
        colors={pastelColorPalettes.purple}
        showHex={showHex}
      />

      <PaletteSection
        title="Желтые и персиковые"
        colors={pastelColorPalettes.yellow}
        showHex={showHex}
      />

      <PaletteSection
        title="Коралловые и оранжевые"
        colors={pastelColorPalettes.coral}
        showHex={showHex}
      />

      <PaletteSection
        title="Серые и нейтральные"
        colors={pastelColorPalettes.gray}
        showHex={showHex}
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Тематические палитры
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Доходы
              </Typography>
              <Grid container spacing={1}>
                {pastelColorPalettes.income.map((color, index) => (
                  <Grid item xs={3} key={`income-${index}`}>
                    <ColorSample color={color} showHex={showHex} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Расходы
              </Typography>
              <Grid container spacing={1}>
                {pastelColorPalettes.expense.map((color, index) => (
                  <Grid item xs={3} key={`expense-${index}`}>
                    <ColorSample color={color} showHex={showHex} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Счета
              </Typography>
              <Grid container spacing={1}>
                {pastelColorPalettes.accounts.map((color, index) => (
                  <Grid item xs={3} key={`accounts-${index}`}>
                    <ColorSample color={color} showHex={showHex} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Цели
              </Typography>
              <Grid container spacing={1}>
                {pastelColorPalettes.goals.map((color, index) => (
                  <Grid item xs={3} key={`goals-${index}`}>
                    <ColorSample color={color} showHex={showHex} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Долги
              </Typography>
              <Grid container spacing={1}>
                {pastelColorPalettes.debts.map((color, index) => (
                  <Grid item xs={3} key={`debts-${index}`}>
                    <ColorSample color={color} showHex={showHex} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Подписки
              </Typography>
              <Grid container spacing={1}>
                {pastelColorPalettes.subscriptions.map((color, index) => (
                  <Grid item xs={3} key={`subscriptions-${index}`}>
                    <ColorSample color={color} showHex={showHex} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PastelPalettePreview;

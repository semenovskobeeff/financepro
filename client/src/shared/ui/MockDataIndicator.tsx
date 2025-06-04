import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { DataObject, Inbox } from '@mui/icons-material';
import { config } from '../../config/environment';

const MockDataIndicator: React.FC = () => {
  // Скрываем в production или если не используем моки
  if (config.isProduction || !config.useMocks) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 999,
      }}
    >
      <Chip
        size="small"
        color={config.mockDataType === 'filled' ? 'primary' : 'secondary'}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {config.mockDataType === 'filled' ? (
              <DataObject fontSize="small" />
            ) : (
              <Inbox fontSize="small" />
            )}
            <Typography variant="caption">
              {config.mockDataType === 'filled'
                ? 'Заполненные данные'
                : 'Пустые данные'}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default MockDataIndicator;

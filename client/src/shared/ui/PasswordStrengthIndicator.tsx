import React from 'react';
import { Box, LinearProgress, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

interface PasswordStrengthIndicatorProps {
  password: string;
  showCriteria?: boolean;
}

interface PasswordCriteria {
  label: string;
  test: (password: string) => boolean;
}

const passwordCriteria: PasswordCriteria[] = [
  {
    label: 'Минимум 8 символов',
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: 'Содержит заглавную букву',
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    label: 'Содержит строчную букву',
    test: (pwd) => /[a-z]/.test(pwd),
  },
  {
    label: 'Содержит цифру',
    test: (pwd) => /\d/.test(pwd),
  },
  {
    label: 'Содержит специальный символ',
    test: (pwd) => /[@$!%*?&]/.test(pwd),
  },
];

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  const metCriteria = passwordCriteria.filter(criteria => criteria.test(password)).length;

  if (metCriteria === 0 || password.length === 0) {
    return { score: 0, label: 'Не указан', color: '#f44336' };
  }
  if (metCriteria <= 2) {
    return { score: 25, label: 'Слабый', color: '#f44336' };
  }
  if (metCriteria === 3) {
    return { score: 50, label: 'Средний', color: '#ff9800' };
  }
  if (metCriteria === 4) {
    return { score: 75, label: 'Хороший', color: '#2196f3' };
  }
  return { score: 100, label: 'Отличный', color: '#4caf50' };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  showCriteria = true,
}) => {
  const strength = getPasswordStrength(password);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ mr: 1 }}>
          Сила пароля:
        </Typography>
        <Typography variant="caption" sx={{ color: strength.color, fontWeight: 'bold' }}>
          {strength.label}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={strength.score}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: strength.color,
          },
        }}
      />

      {showCriteria && password.length > 0 && (
        <List dense sx={{ mt: 1 }}>
          {passwordCriteria.map((criteria, index) => {
            const isValid = criteria.test(password);
            return (
              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 30 }}>
                  {isValid ? (
                    <Check sx={{ fontSize: 16, color: '#4caf50' }} />
                  ) : (
                    <Close sx={{ fontSize: 16, color: '#f44336' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={criteria.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.75rem',
                      color: isValid ? '#4caf50' : '#666',
                    },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator;

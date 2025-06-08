import React from 'react';
import { Box, Button, Grid } from '@mui/material';
import {
  Add as AddIcon,
  Payment as PaymentIcon,
  ShoppingCart as ShoppingIcon,
  AccountBalance as AccountIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

interface QuickActionButtonsProps {
  onAction: (actionType: string) => void;
}

const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({
  onAction,
}) => {
  const actions = [
    {
      type: 'transaction',
      label: 'Операция',
      icon: <MoneyIcon />,
      color: 'primary' as const,
    },
    {
      type: 'goal',
      label: 'Цель',
      icon: <AddIcon />,
      color: 'success' as const,
    },
    {
      type: 'payment',
      label: 'Платеж',
      icon: <PaymentIcon />,
      color: 'warning' as const,
    },
    {
      type: 'shopping',
      label: 'Покупки',
      icon: <ShoppingIcon />,
      color: 'info' as const,
    },
    {
      type: 'account',
      label: 'Счет',
      icon: <AccountIcon />,
      color: 'inherit' as const,
    },
  ];

  return (
    <Box>
      <Grid container spacing={2}>
        {actions.map(action => (
          <Grid item xs={12} sm={6} md={2.4} key={action.type}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={action.icon}
              color={action.color}
              onClick={() => onAction(action.type)}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                justifyContent: 'flex-start',
                '& .MuiButton-startIcon': {
                  marginRight: 1,
                  marginLeft: 0,
                },
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActionButtons;

import React from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  CompareArrows as TransferIcon,
} from '@mui/icons-material';

interface AddActionMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onAction: (action: string, data?: any) => void;
}

const AddActionMenu: React.FC<AddActionMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onAction,
}) => {
  // Всегда показываем базовые действия с транзакциями
  const actions = [
    {
      key: 'income',
      label: 'Доход',
      icon: <IncomeIcon />,
      color: 'success',
    },
    {
      key: 'expense',
      label: 'Расход',
      icon: <ExpenseIcon />,
      color: 'error',
    },
    {
      key: 'transfer',
      label: 'Перевод',
      icon: <TransferIcon />,
      color: 'info',
    },
  ];

  const handleActionClick = (actionKey: string, actionData?: any) => {
    onAction(actionKey, actionData);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
          mt: 1.5,
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: '6px',
          border: '1px solid var(--border)',
          minWidth: 200,
          '& .MuiMenuItem-root': {
            fontSize: 14,
            padding: '8px 16px',
            '&:hover': {
              backgroundColor: 'var(--bg-accent)',
            },
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {actions.map(action => {
        const { key, label, icon, color } = action;

        return (
          <MenuItem
            key={key}
            onClick={() => handleActionClick(key)}
            sx={{
              color: color ? `var(--text-${color})` : 'inherit',
            }}
          >
            <ListItemIcon
              sx={{
                color: color ? `var(--text-${color})` : 'var(--icon-secondary)',
                minWidth: '32px !important',
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
          </MenuItem>
        );
      })}
    </Menu>
  );
};

export default AddActionMenu;

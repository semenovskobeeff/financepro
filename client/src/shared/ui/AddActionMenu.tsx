import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountBalance as AccountIcon,
  Category as CategoryIcon,
  Savings as GoalIcon,
  CreditCard as DebtIcon,
  Subscriptions as SubscriptionIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  CompareArrows as TransferIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

  // Определяем доступные действия в зависимости от текущей страницы
  const getAvailableActions = () => {
    const path = location.pathname;

    switch (path) {
      case '/':
        // Главная страница - показываем основные действия
        return [
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

      case '/accounts':
        return [
          { key: 'account', label: 'Новый счет', icon: <AccountIcon /> },
          'divider',
          {
            key: 'transfer',
            label: 'Перевод между счетами',
            icon: <TransferIcon />,
          },
        ];

      case '/transactions':
        return [
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

      case '/categories':
        return [
          {
            key: 'category-income',
            label: 'Категория доходов',
            icon: <CategoryIcon />,
            data: { type: 'income' },
          },
          {
            key: 'category-expense',
            label: 'Категория расходов',
            icon: <CategoryIcon />,
            data: { type: 'expense' },
          },
        ];

      case '/goals':
        return [{ key: 'goal', label: 'Новая цель', icon: <GoalIcon /> }];

      case '/debts':
        return [{ key: 'debt', label: 'Новый долг', icon: <DebtIcon /> }];

      case '/subscriptions':
        return [
          {
            key: 'subscription',
            label: 'Новая подписка',
            icon: <SubscriptionIcon />,
          },
        ];

      default:
        // Универсальные действия для остальных страниц
        return [
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
    }
  };

  const actions = getAvailableActions();

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
      {actions.map((action, index) => {
        if (action === 'divider') {
          return <Divider key={`divider-${index}`} />;
        }

        const { key, label, icon, color, data } = action as any;

        return (
          <MenuItem
            key={key}
            onClick={() => handleActionClick(key, data)}
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

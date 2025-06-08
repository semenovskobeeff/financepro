import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  SxProps,
  Theme,
} from '@mui/material';
import { Account, AccountType } from '../model/types';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import EditIcon from '@mui/icons-material/Edit';
import { formatCurrencyWithDots } from '../../../shared/utils/formatUtils';

interface AccountCardProps {
  account: Account;
  onEdit?: (account: Account) => void;
  onArchive?: (account: Account) => void;
  onRestore?: (account: Account) => void;
  onClick?: (account: Account) => void;
  sx?: SxProps<Theme>;
}

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return <AccountBalanceIcon />;
    case 'deposit':
      return <SavingsIcon />;
    case 'goal':
      return <SavingsIcon />;
    case 'credit':
      return <CreditScoreIcon />;
    case 'subscription':
      return <SubscriptionsIcon />;
    default:
      return <CreditCardIcon />;
  }
};

const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case 'bank':
      return 'Банковский счет';
    case 'deposit':
      return 'Вклад';
    case 'goal':
      return 'Цель';
    case 'credit':
      return 'Кредит';
    case 'subscription':
      return 'Подписка';
    default:
      return 'Счет';
  }
};

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onEdit,
  onArchive,
  onRestore,
  onClick,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onEdit) onEdit(account);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onArchive) onArchive(account);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onRestore) onRestore(account);
  };

  const handleCardClick = () => {
    if (onClick) onClick(account);
  };

  return (
    <Card
      sx={{
        minWidth: 275,
        minHeight: 200,
        cursor: onClick ? 'pointer' : 'default',
        opacity: account.status === 'archived' ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: onClick ? 3 : 1,
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        ...sx,
      }}
      onClick={handleCardClick}
    >
      <CardContent
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            {getAccountIcon(account.type)}
            <Typography variant="h6" component="div">
              {account.name}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={handleClick} size="small">
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              onClick={e => e.stopPropagation()}
            >
              {onEdit && (
                <MenuItem onClick={handleEdit}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} /> Редактировать
                </MenuItem>
              )}
              {onArchive && account.status === 'active' && (
                <MenuItem onClick={handleArchive}>
                  <ArchiveIcon fontSize="small" sx={{ mr: 1 }} /> Архивировать
                </MenuItem>
              )}
              {onRestore && account.status === 'archived' && (
                <MenuItem onClick={handleRestore}>
                  <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} /> Восстановить
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography color="text.secondary">
              {getAccountTypeLabel(account.type)}
            </Typography>
            <Chip
              label={`${formatCurrencyWithDots(
                account.balance,
                account.currency
              )}`}
              color={account.balance > 0 ? 'primary' : 'default'}
              variant="outlined"
            />
          </Box>

          {account.cardInfo && (
            <Box mt={1}>
              <Typography variant="body2" color="text.secondary">
                Номер карты или счета: {account.cardInfo}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountCard;

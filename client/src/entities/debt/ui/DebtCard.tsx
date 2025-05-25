import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Grid,
  Box,
  LinearProgress,
  SxProps,
  Theme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Debt, DebtType, DebtStatus } from '../model/types';

interface DebtCardProps {
  debt: Debt;
  onEdit?: (debt: Debt) => void;
  onArchive?: (debt: Debt) => void;
  onRestore?: (debt: Debt) => void;
  onPayment?: (debt: Debt) => void;
  onClick?: (debt: Debt) => void;
  sx?: SxProps<Theme>;
}

// Функция для получения иконки типа долга
const getDebtIcon = (type: DebtType) => {
  switch (type) {
    case 'credit':
      return <BankIcon />;
    case 'loan':
      return <PaymentIcon />;
    case 'creditCard':
      return <CreditCardIcon />;
    case 'personalDebt':
      return <PersonIcon />;
    default:
      return <BankIcon />;
  }
};

// Функция для получения текстового названия типа долга
const getDebtTypeLabel = (type: DebtType): string => {
  switch (type) {
    case 'credit':
      return 'Кредит';
    case 'loan':
      return 'Займ';
    case 'creditCard':
      return 'Кредитная карта';
    case 'personalDebt':
      return 'Личный долг';
    default:
      return 'Долг';
  }
};

// Функция для получения цвета и текста для статуса
const getStatusProps = (
  status: DebtStatus
): { color: 'success' | 'info' | 'error' | 'default'; label: string } => {
  switch (status) {
    case 'active':
      return { color: 'info', label: 'Активен' };
    case 'paid':
      return { color: 'success', label: 'Погашен' };
    case 'defaulted':
      return { color: 'error', label: 'Просрочен' };
    case 'archived':
      return { color: 'default', label: 'В архиве' };
    default:
      return { color: 'default', label: 'Неизвестно' };
  }
};

// Компонент прогресса погашения долга
const DebtProgress: React.FC<{ debt: Debt }> = ({ debt }) => {
  const progressPercent = 100 - (debt.currentAmount / debt.initialAmount) * 100;

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" color="text.secondary">
          Прогресс погашения
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {progressPercent.toFixed(0)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progressPercent}
        sx={{ height: 8, borderRadius: 5 }}
      />
    </Box>
  );
};

const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  onEdit,
  onArchive,
  onRestore,
  onPayment,
  onClick,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
    if (onEdit) onEdit(debt);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onArchive) onArchive(debt);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onRestore) onRestore(debt);
  };

  const handlePayment = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onPayment) onPayment(debt);
  };

  const handleCardClick = () => {
    if (onClick) onClick(debt);
  };

  const statusProps = getStatusProps(debt.status);
  const isArchived = debt.status === 'archived';
  const isPaid = debt.status === 'paid';

  return (
    <Card
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        opacity: isArchived ? 0.7 : 1,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 3,
            }
          : {},
        ...sx,
      }}
      onClick={handleCardClick}
      variant="outlined"
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                mr: 1.5,
                color: 'primary.main',
                display: 'flex',
              }}
            >
              {getDebtIcon(debt.type)}
            </Box>
            <Box>
              <Typography variant="h6" component="h2" noWrap>
                {debt.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getDebtTypeLabel(debt.type)}
                {debt.lenderName && ` — ${debt.lenderName}`}
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            label={statusProps.label}
            color={statusProps.color}
          />
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Начальная сумма
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {debt.initialAmount.toLocaleString()} ₽
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Текущий остаток
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {debt.currentAmount.toLocaleString()} ₽
            </Typography>
          </Grid>

          {debt.interestRate > 0 && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Процентная ставка
              </Typography>
              <Typography variant="body1">{debt.interestRate}%</Typography>
            </Grid>
          )}

          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Дата открытия
            </Typography>
            <Typography variant="body1">
              {format(new Date(debt.startDate), 'dd MMM yyyy', { locale: ru })}
            </Typography>
          </Grid>

          {debt.nextPaymentDate && debt.status === 'active' && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Следующий платеж:{' '}
                  {format(new Date(debt.nextPaymentDate), 'dd MMM yyyy', {
                    locale: ru,
                  })}
                  {debt.nextPaymentAmount &&
                    ` — ${debt.nextPaymentAmount.toLocaleString()} ₽`}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {debt.status !== 'archived' && <DebtProgress debt={debt} />}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between' }}>
        {debt.status === 'active' && (
          <Button
            size="small"
            color="primary"
            onClick={handlePayment}
            startIcon={<PaymentIcon />}
          >
            Внести платеж
          </Button>
        )}

        <IconButton
          aria-label="действия"
          size="small"
          onClick={handleClick}
          sx={{ ml: 'auto' }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleEdit} disabled={isArchived}>
            Редактировать
          </MenuItem>
          {isArchived ? (
            <MenuItem onClick={handleRestore}>Восстановить из архива</MenuItem>
          ) : (
            <MenuItem onClick={handleArchive}>
              {isPaid ? 'Архивировать' : 'Переместить в архив'}
            </MenuItem>
          )}
          <MenuItem onClick={handlePayment} disabled={isArchived || isPaid}>
            Внести платеж
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
};

export default DebtCard;

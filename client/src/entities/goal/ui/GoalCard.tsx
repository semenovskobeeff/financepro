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
  LinearProgress,
  Box,
  Chip,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  FlagOutlined,
  Flag,
  MoveToInbox,
  CheckCircle,
} from '@mui/icons-material';
import { Goal } from '../model/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onArchive?: (goal: Goal) => void;
  onRestore?: (goal: Goal) => void;
  onTransfer?: (goal: Goal) => void;
  onClick?: (goal: Goal) => void;
  sx?: SxProps<Theme>;
}

const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Завершена';
    case 'active':
      return 'Активна';
    case 'cancelled':
      return 'Отменена';
    case 'archived':
      return 'В архиве';
    default:
      return status;
  }
};

const getStatusColor = (
  status: string
): 'success' | 'info' | 'error' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'active':
      return 'info';
    case 'cancelled':
      return 'error';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
};

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onArchive,
  onRestore,
  onTransfer,
  onClick,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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
    if (onEdit) onEdit(goal);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onArchive) onArchive(goal);
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onRestore) onRestore(goal);
  };

  const handleTransfer = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onTransfer) onTransfer(goal);
  };

  const handleCardClick = () => {
    if (onClick) onClick(goal);
  };

  // Расчет процента выполнения цели
  const progress = Math.min(100, (goal.progress / goal.targetAmount) * 100);
  const formattedProgress = progress.toFixed(1);
  const formattedDate = format(new Date(goal.deadline), 'dd MMMM yyyy', {
    locale: ru,
  });

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        opacity: goal.status === 'archived' ? 0.7 : 1,
        position: 'relative',
        ...sx,
      }}
      onClick={handleCardClick}
      variant="outlined"
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography variant="h6" component="div" gutterBottom>
            {goal.name}
          </Typography>
          <IconButton
            aria-label="more"
            id={`goal-menu-${goal.id}`}
            aria-controls={open ? `goal-menu-${goal.id}` : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={getStatusText(goal.status)}
            color={getStatusColor(goal.status)}
            size="small"
            sx={{ mr: 1 }}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Прогресс: {formattedProgress}% ({goal.progress} /{' '}
            {goal.targetAmount} ₽)
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            color={progress >= 100 ? 'success' : 'primary'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary">
          Срок: {formattedDate}
        </Typography>
      </CardContent>

      <CardActions>
        {goal.status === 'active' && (
          <Button
            size="small"
            startIcon={<MoveToInbox />}
            onClick={handleTransfer}
          >
            Пополнить
          </Button>
        )}
      </CardActions>

      <Menu
        id={`goal-menu-${goal.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': `goal-menu-button-${goal.id}`,
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Редактировать
        </MenuItem>
        {goal.status !== 'archived' ? (
          <MenuItem onClick={handleArchive}>
            <ArchiveIcon fontSize="small" sx={{ mr: 1 }} /> В архив
          </MenuItem>
        ) : (
          <MenuItem onClick={handleRestore}>
            <UnarchiveIcon fontSize="small" sx={{ mr: 1 }} /> Восстановить
          </MenuItem>
        )}
        {goal.status === 'active' && (
          <MenuItem onClick={handleTransfer}>
            <MoveToInbox fontSize="small" sx={{ mr: 1 }} /> Пополнить
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

export default GoalCard;

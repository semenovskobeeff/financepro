import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Box,
  Chip,
  SxProps,
  Theme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Category } from '../model/types';
import { getCategoryIcon } from './CategoryChip';

interface CategoryCardProps {
  category: Category;
  onEdit?: (category: Category) => void;
  onArchive?: (category: Category) => void;
  onRestore?: (category: Category) => void;
  sx?: SxProps<Theme>;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onArchive,
  onRestore,
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onEdit) {
      onEdit(category);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onArchive) {
      onArchive(category);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleClose();
    if (onRestore) {
      onRestore(category);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: category.status === 'archived' ? 0.7 : 1,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: 3,
        },
        ...sx,
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 1 }}>{getCategoryIcon(category.icon)}</Box>
          <Typography variant="h6" component="div">
            {category.name}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={category.type === 'income' ? 'Доход' : 'Расход'}
          color={category.type === 'income' ? 'success' : 'error'}
          sx={{ mb: 1 }}
        />
        {category.status === 'archived' && (
          <Chip size="small" label="Архив" color="default" sx={{ ml: 1 }} />
        )}
      </CardContent>
      <CardActions disableSpacing>
        <Box sx={{ ml: 'auto' }}>
          <IconButton aria-label="actions" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {onEdit && (
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <Typography>Редактировать</Typography>
            </MenuItem>
          )}
          {onArchive && (
            <MenuItem onClick={handleArchive}>
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <Typography>В архив</Typography>
            </MenuItem>
          )}
          {onRestore && (
            <MenuItem onClick={handleRestore}>
              <ListItemIcon>
                <RestoreIcon fontSize="small" />
              </ListItemIcon>
              <Typography>Восстановить</Typography>
            </MenuItem>
          )}
        </Menu>
      </CardActions>
    </Card>
  );
};

export default CategoryCard;

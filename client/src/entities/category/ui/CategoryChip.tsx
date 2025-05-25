import React from 'react';
import { Chip, Box, Typography } from '@mui/material';
import { Category } from '../model/types';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SportsIcon from '@mui/icons-material/Sports';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface CategoryChipProps {
  category: Category;
  onClick?: (category: Category) => void;
  selected?: boolean;
}

// Экспортируем функцию getCategoryIcon для использования в других компонентах
export const getCategoryIcon = (iconName: string) => {
  switch (iconName) {
    case 'shopping':
      return <ShoppingCartIcon fontSize="small" />;
    case 'food':
      return <RestaurantIcon fontSize="small" />;
    case 'home':
      return <HomeIcon fontSize="small" />;
    case 'transport':
      return <DirectionsCarIcon fontSize="small" />;
    case 'health':
      return <LocalHospitalIcon fontSize="small" />;
    case 'sport':
      return <SportsIcon fontSize="small" />;
    case 'education':
      return <SchoolIcon fontSize="small" />;
    case 'work':
      return <WorkIcon fontSize="small" />;
    case 'income':
      return <AttachMoneyIcon fontSize="small" />;
    case 'tag':
      return <LocalOfferIcon fontSize="small" />;
    default:
      return <CategoryIcon fontSize="small" />;
  }
};

const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  onClick,
  selected = false,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(category);
    }
  };

  return (
    <Chip
      icon={getCategoryIcon(category.icon)}
      label={category.name}
      color={category.type === 'income' ? 'success' : 'primary'}
      variant={selected ? 'filled' : 'outlined'}
      onClick={onClick ? handleClick : undefined}
      sx={{
        m: 0.5,
        cursor: onClick ? 'pointer' : 'default',
      }}
    />
  );
};

interface CategoryListProps {
  categories?: Category[];
  selectedId?: string;
  onSelect?: (category: Category) => void;
  type?: 'income' | 'expense';
  emptyText?: string;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  categories = [],
  selectedId,
  onSelect,
  type,
  emptyText = 'Категории не найдены',
}) => {
  const filteredCategories = type
    ? categories.filter(cat => cat.type === type)
    : categories;

  if (filteredCategories.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyText}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, p: 1 }}>
      {filteredCategories.map(category => (
        <CategoryChip
          key={category.id}
          category={category}
          onClick={onSelect}
          selected={selectedId === category.id}
        />
      ))}
    </Box>
  );
};

export default CategoryChip;

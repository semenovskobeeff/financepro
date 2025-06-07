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
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import MovieIcon from '@mui/icons-material/Movie';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlightIcon from '@mui/icons-material/Flight';
import HotelIcon from '@mui/icons-material/Hotel';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import SpaIcon from '@mui/icons-material/Spa';
import PetsIcon from '@mui/icons-material/Pets';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AppleIcon from '@mui/icons-material/Apple';

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
    case 'fruits':
      return <AppleIcon fontSize="small" />;
    case 'restaurant':
      return <RestaurantMenuIcon fontSize="small" />;
    case 'fastfood':
      return <FastfoodIcon fontSize="small" />;
    case 'coffee':
      return <LocalCafeIcon fontSize="small" />;
    case 'grocery':
      return <LocalGroceryStoreIcon fontSize="small" />;
    case 'home':
      return <HomeIcon fontSize="small" />;
    case 'transport':
      return <DirectionsCarIcon fontSize="small" />;
    case 'fuel':
      return <LocalGasStationIcon fontSize="small" />;
    case 'health':
      return <LocalHospitalIcon fontSize="small" />;
    case 'pharmacy':
      return <LocalPharmacyIcon fontSize="small" />;
    case 'sport':
      return <SportsIcon fontSize="small" />;
    case 'fitness':
      return <FitnessCenterIcon fontSize="small" />;
    case 'education':
      return <SchoolIcon fontSize="small" />;
    case 'books':
      return <MenuBookIcon fontSize="small" />;
    case 'work':
      return <WorkIcon fontSize="small" />;
    case 'income':
      return <AttachMoneyIcon fontSize="small" />;
    case 'entertainment':
      return <TheaterComedyIcon fontSize="small" />;
    case 'movie':
      return <MovieIcon fontSize="small" />;
    case 'music':
      return <MusicNoteIcon fontSize="small" />;
    case 'gaming':
      return <SportsEsportsIcon fontSize="small" />;
    case 'travel':
      return <FlightIcon fontSize="small" />;
    case 'hotel':
      return <HotelIcon fontSize="small" />;
    case 'clothing':
      return <CheckroomIcon fontSize="small" />;
    case 'beauty':
      return <SpaIcon fontSize="small" />;
    case 'pets':
      return <PetsIcon fontSize="small" />;
    case 'gifts':
      return <CardGiftcardIcon fontSize="small" />;
    case 'charity':
      return <VolunteerActivismIcon fontSize="small" />;
    case 'bills':
      return <ReceiptIcon fontSize="small" />;
    case 'insurance':
      return <SecurityIcon fontSize="small" />;
    case 'investment':
      return <TrendingUpIcon fontSize="small" />;
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

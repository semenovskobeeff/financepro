import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { CategoryType, Category } from '../entities/category/model/types';
import CategoryCard from '../entities/category/ui/CategoryCard';
import CategoryForm from '../features/categories/components/CategoryForm';
import PageContainer from '../shared/ui/PageContainer';
import {
  useGetCategoriesQuery,
  useArchiveCategoryMutation,
  useRestoreCategoryMutation,
} from '../entities/category/api/categoryApi';

const Categories: React.FC = () => {
  const [categoryType, setCategoryType] = useState<CategoryType>('expense');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const {
    data: categories,
    isLoading,
    error,
  } = useGetCategoriesQuery({
    type: categoryType,
    status,
  });

  const [archiveCategory] = useArchiveCategoryMutation();
  const [restoreCategory] = useRestoreCategoryMutation();

  const handleOpenForm = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleArchiveCategory = async (category: Category) => {
    try {
      await archiveCategory(category.id).unwrap();
    } catch (error) {
      console.error('Failed to archive category:', error);
    }
  };

  const handleRestoreCategory = async (category: Category) => {
    try {
      await restoreCategory(category.id).unwrap();
    } catch (error) {
      console.error('Failed to restore category:', error);
    }
  };

  const handleCategoryTypeChange = (
    event: React.SyntheticEvent,
    newValue: CategoryType
  ) => {
    setCategoryType(newValue);
  };

  const handleFilterChange = (
    event: React.SyntheticEvent,
    newValue: 'active' | 'archived'
  ) => {
    setStatus(newValue);
  };

  return (
    <PageContainer
      title="Категории"
      action={{
        label: 'Новая категория',
        icon: <AddIcon />,
        onClick: handleOpenForm,
      }}
    >
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={categoryType}
          onChange={handleCategoryTypeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Расходы" value="expense" />
          <Tab label="Доходы" value="income" />
        </Tabs>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={status}
          onChange={handleFilterChange}
          indicatorColor="secondary"
          textColor="secondary"
          variant="fullWidth"
        >
          <Tab label="Активные" value="active" />
          <Tab label="Архив" value="archived" />
        </Tabs>
      </Paper>

      <Box sx={{ flexGrow: 1 }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">
            Ошибка при загрузке категорий. Пожалуйста, попробуйте позже.
          </Typography>
        ) : !categories ||
          !Array.isArray(categories) ||
          categories.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Нет категорий для отображения</Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton
                color="primary"
                onClick={handleOpenForm}
                sx={{ border: '1px dashed', borderRadius: 2, p: 1 }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {categories.map(category => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={category.id}
                sx={{ display: 'flex', height: '100%' }}
              >
                <CategoryCard
                  category={category}
                  onEdit={status === 'active' ? handleEditCategory : undefined}
                  onArchive={
                    status === 'active' ? handleArchiveCategory : undefined
                  }
                  onRestore={
                    status === 'archived' ? handleRestoreCategory : undefined
                  }
                  sx={{ width: '100%' }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory ? 'Редактирование категории' : 'Новая категория'}
          <IconButton
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <CategoryForm
            category={selectedCategory}
            initialType={categoryType}
            onClose={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Categories;

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Typography,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

import PageContainer from 'shared/ui/PageContainer';
import DebtCard from 'entities/debt/ui/DebtCard';
import DebtForm from 'features/debts/components/DebtForm';
import PaymentForm from 'features/debts/components/PaymentForm';
import { Debt } from 'entities/debt/model/types';
import {
  useGetActiveDebtsQuery,
  useGetArchivedDebtsQuery,
  useCreateDebtMutation,
  useArchiveDebtMutation,
  useRestoreDebtMutation,
  useMakePaymentMutation,
} from 'entities/debt/api/debtApi';

const Debts: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  // Используем соответствующий хук в зависимости от выбранного фильтра
  const {
    data: activeDebts,
    isLoading: isActiveLoading,
    error: activeError,
  } = useGetActiveDebtsQuery();

  const {
    data: archivedDebts,
    isLoading: isArchivedLoading,
    error: archivedError,
  } = useGetArchivedDebtsQuery();

  // Выбираем данные в зависимости от текущего фильтра
  const debts = filter === 'active' ? activeDebts : archivedDebts;
  const isLoading = filter === 'active' ? isActiveLoading : isArchivedLoading;
  const error = filter === 'active' ? activeError : archivedError;

  // Расчет общей суммы долга
  const totalDebtAmount = useMemo(() => {
    if (!activeDebts) return 0;
    return activeDebts.reduce((sum, debt) => sum + debt.currentAmount, 0);
  }, [activeDebts]);

  // Форматирование суммы как валюты
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);

  const [createDebt, { isLoading: isCreating }] = useCreateDebtMutation();
  const [archiveDebt, { isLoading: isArchiving }] = useArchiveDebtMutation();
  const [restoreDebt, { isLoading: isRestoring }] = useRestoreDebtMutation();
  const [makePayment, { isLoading: isPaying }] = useMakePaymentMutation();

  const handleOpenForm = () => {
    setSelectedDebt(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleOpenPaymentForm = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsPaymentFormOpen(true);
  };

  const handleClosePaymentForm = () => {
    setIsPaymentFormOpen(false);
  };

  const handleEditDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setIsFormOpen(true);
  };

  const handleArchiveDebt = async (debt: Debt) => {
    try {
      await archiveDebt(debt.id).unwrap();
    } catch (error) {
      console.error('Failed to archive debt:', error);
    }
  };

  const handleRestoreDebt = async (debt: Debt) => {
    try {
      await restoreDebt(debt.id).unwrap();
    } catch (error) {
      console.error('Failed to restore debt:', error);
    }
  };

  const handleDebtClick = (debt: Debt) => {
    navigate(`/debts/${debt.id}`);
  };

  const handleCreateDebt = async (debtData: any) => {
    try {
      await createDebt(debtData).unwrap();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to create debt:', error);
    }
  };

  const handleMakePayment = async (paymentData: any) => {
    if (!selectedDebt) return;

    try {
      await makePayment({
        id: selectedDebt.id,
        data: paymentData,
      }).unwrap();
      handleClosePaymentForm();
    } catch (error) {
      console.error('Failed to make payment:', error);
    }
  };

  const handleFilterChange = (
    _: React.SyntheticEvent,
    newValue: 'active' | 'archived'
  ) => {
    setFilter(newValue);
  };

  return (
    <PageContainer
      title="Долги и кредиты"
      action={{
        label: 'Добавить долг',
        icon: <AddIcon />,
        onClick: handleOpenForm,
      }}
    >
      {/* Карточка с общей суммой долга */}
      {!isLoading && !error && activeDebts && (
        <Card
          sx={{
            mb: 3,
            backgroundColor: '#f5f5f5',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <CardContent>
            <Typography variant="subtitle1" color="text.secondary">
              Общая сумма долга
            </Typography>
            <Typography variant="h4" component="div" color="primary">
              {formatCurrency(totalDebtAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Активных долгов: {activeDebts.length}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={filter}
          onChange={handleFilterChange}
          aria-label="фильтр долгов"
        >
          <Tab label="Активные" value="active" />
          <Tab label="Архив" value="archived" />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">
          Произошла ошибка при загрузке данных
        </Typography>
      ) : debts && debts.length > 0 ? (
        <Grid container spacing={3} alignItems="stretch">
          {debts.map(debt => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={debt.id}
              sx={{ display: 'flex', height: '100%' }}
            >
              <DebtCard
                debt={debt}
                onEdit={handleEditDebt}
                onArchive={handleArchiveDebt}
                onRestore={handleRestoreDebt}
                onPayment={handleOpenPaymentForm}
                onClick={handleDebtClick}
                sx={{ width: '100%' }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography sx={{ mt: 2 }}>
          {filter === 'active'
            ? 'Активные долги не найдены'
            : 'Архивные долги не найдены'}
        </Typography>
      )}

      {isFormOpen && (
        <DebtForm
          debt={selectedDebt}
          onClose={handleCloseForm}
          onSubmit={handleCreateDebt}
        />
      )}

      {isPaymentFormOpen && selectedDebt && (
        <PaymentForm
          debt={selectedDebt}
          onClose={handleClosePaymentForm}
          onSubmit={handleMakePayment}
        />
      )}
    </PageContainer>
  );
};

export default Debts;

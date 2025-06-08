import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import { formatCurrencyWithDots } from '../shared/utils/formatUtils';
import CloseIcon from '@mui/icons-material/Close';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

import { AccountType } from '../entities/account/model/types';
import AccountForm from '../features/accounts/components/AccountForm';
import TransferFundsForm from '../features/accounts/components/TransferFundsForm';
import AccountHistoryList from '../entities/account/ui/AccountHistoryList';
import AccountStatistics from '../entities/account/ui/AccountStatistics';
import PageContainer from '../shared/ui/PageContainer';
import {
  useGetAccountByIdQuery,
  useArchiveAccountMutation,
  useRestoreAccountMutation,
} from '../entities/account/api/accountApi';
import TransactionDetailsModal from '../entities/transaction/ui/TransactionDetailsModal';
import { useUpdateTransactionMutation } from '../entities/transaction/api/transactionApi';

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return <AccountBalanceIcon fontSize="large" />;
    case 'deposit':
      return <SavingsIcon fontSize="large" />;
    case 'goal':
      return <SavingsIcon fontSize="large" />;
    case 'credit':
      return <CreditScoreIcon fontSize="large" />;
    case 'subscription':
      return <SubscriptionsIcon fontSize="large" />;
    default:
      return <CreditCardIcon fontSize="large" />;
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

const AccountDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data: account, isLoading, error } = useGetAccountByIdQuery(id || '');

  const [archiveAccount] = useArchiveAccountMutation();
  const [restoreAccount] = useRestoreAccountMutation();
  const [updateTransaction] = useUpdateTransactionMutation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '300px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !account) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Ошибка при загрузке счета
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/accounts')}
          sx={{ mt: 2 }}
        >
          Вернуться к списку счетов
        </Button>
      </Box>
    );
  }

  const handleBackClick = () => {
    navigate('/accounts');
  };

  const handleEditClick = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleOpenTransferForm = () => {
    setIsTransferFormOpen(true);
  };

  const handleCloseTransferForm = () => {
    setIsTransferFormOpen(false);
  };

  const handleArchiveClick = async () => {
    try {
      await archiveAccount(account.id).unwrap();
    } catch (err) {
      console.error('Failed to archive account:', err);
    }
  };

  const handleRestoreClick = async () => {
    try {
      await restoreAccount(account.id).unwrap();
    } catch (err) {
      console.error('Failed to restore account:', err);
    }
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionModalClose = () => {
    setIsTransactionModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionSave = async (updatedTransaction: any) => {
    if (!updatedTransaction?.id) {
      console.error('Нет ID транзакции');
      alert('Ошибка: не удается определить ID операции');
      return;
    }

    try {
      await updateTransaction({
        id: updatedTransaction.id,
        data: {
          amount: updatedTransaction.amount,
          description: updatedTransaction.description,
          categoryId: updatedTransaction.categoryId,
          date: updatedTransaction.date,
        },
      }).unwrap();

      // Закрыть модальное окно после успешного сохранения
      handleTransactionModalClose();
      // Можно добавить toast/уведомление об успехе
      console.log('Операция успешно обновлена');
    } catch (error) {
      // Можно добавить toast/уведомление об ошибке
      console.error('Ошибка при обновлении операции:', error);
      alert(
        'Ошибка при сохранении операции: ' + (error as any)?.data?.message ||
          'Неизвестная ошибка'
      );
    }
  };

  const handleTransactionDelete = (transactionId: string) => {
    // TODO: Implement delete logic
  };

  return (
    <PageContainer
      title={
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackClick}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          {account.name}
        </Box>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ mr: 2 }}>{getAccountIcon(account.type)}</Box>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {account.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {getAccountTypeLabel(account.type)}
                      {account.cardInfo && ` • ${account.cardInfo}`}
                    </Typography>
                    {account.status === 'archived' && (
                      <Chip
                        label="В архиве"
                        color="default"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h4" color="primary">
                    {formatCurrencyWithDots(account.balance, account.currency)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                {account.status === 'active' ? (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={handleEditClick}
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<CompareArrowsIcon />}
                      onClick={handleOpenTransferForm}
                    >
                      Перевести
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<ArchiveIcon />}
                      onClick={handleArchiveClick}
                    >
                      В архив
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<UnarchiveIcon />}
                    onClick={handleRestoreClick}
                  >
                    Восстановить
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

          <AccountHistoryList
            accountId={account.id}
            onTransactionClick={handleTransactionClick}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <AccountStatistics accountId={account.id} />
        </Grid>
      </Grid>

      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Редактирование счета
          <IconButton
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AccountForm account={account} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isTransferFormOpen}
        onClose={handleCloseTransferForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Перевод средств
          <IconButton
            onClick={handleCloseTransferForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TransferFundsForm
            onClose={handleCloseTransferForm}
            initialFromAccountId={account.id}
          />
        </DialogContent>
      </Dialog>

      <TransactionDetailsModal
        open={isTransactionModalOpen}
        transaction={selectedTransaction}
        onClose={handleTransactionModalClose}
        onSave={handleTransactionSave}
        onDelete={handleTransactionDelete}
      />
    </PageContainer>
  );
};

export default AccountDetails;

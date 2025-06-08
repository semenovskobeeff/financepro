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
  Button,
  Chip,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance as BankIcon,
  Savings as SavingsIcon,
  CreditCard as CreditIcon,
  CompareArrows as TransferIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { Account } from '../entities/account/model/types';
import AccountCard from '../entities/account/ui/AccountCard';
import AccountForm from '../features/accounts/components/AccountForm';
import TransferFundsForm from '../features/accounts/components/TransferFundsForm';
import { useAuthRedirect } from '../shared/utils/authUtils';
import PageContainer from '../shared/ui/PageContainer';
import {
  useGetAccountsQuery,
  useArchiveAccountMutation,
  useRestoreAccountMutation,
} from '../entities/account/api/accountApi';
import { useNavigate } from 'react-router-dom';
import DataSyncAlert from '../shared/ui/DataSyncAlert';
import { formatCurrencyWithDots } from '../shared/utils/formatUtils';

const Accounts: React.FC = () => {
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { data: accounts, isLoading, error } = useGetAccountsQuery({ status });

  const [archiveAccount] = useArchiveAccountMutation();
  const [restoreAccount] = useRestoreAccountMutation();

  const navigate = useNavigate();

  // Автоматическое перенаправление при ошибке авторизации
  useAuthRedirect(error, 'Accounts');

  const handleOpenForm = () => {
    setSelectedAccount(null);
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

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleArchiveAccount = async (account: Account) => {
    try {
      await archiveAccount(account.id).unwrap();
    } catch (error) {
      console.error('Failed to archive account:', error);
    }
  };

  const handleRestoreAccount = async (account: Account) => {
    try {
      await restoreAccount(account.id).unwrap();
    } catch (error) {
      console.error('Failed to restore account:', error);
    }
  };

  const handleClickAccount = (account: Account) => {
    navigate(`/accounts/${account.id}`);
  };

  const handleFilterChange = (
    event: React.SyntheticEvent,
    newValue: 'active' | 'archived'
  ) => {
    setStatus(newValue);
  };

  return (
    <PageContainer
      title="Счета"
      action={{
        label: 'Новый счет',
        icon: <AddIcon />,
        onClick: handleOpenForm,
      }}
    >
      {/* Уведомление о синхронизации данных */}
      <DataSyncAlert />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Paper sx={{ flexGrow: 1 }}>
          <Tabs
            value={status}
            onChange={handleFilterChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="Активные" value="active" />
            <Tab label="Архив" value="archived" />
          </Tabs>
        </Paper>

        {status === 'active' &&
          accounts &&
          Array.isArray(accounts) &&
          accounts.length >= 2 && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<TransferIcon />}
              onClick={handleOpenTransferForm}
              sx={{ ml: 2 }}
            >
              Перевести
            </Button>
          )}
      </Box>

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
            Ошибка при загрузке счетов. Пожалуйста, попробуйте позже.
          </Typography>
        ) : !accounts || !Array.isArray(accounts) || accounts.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Нет счетов для отображения</Typography>
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
            {accounts
              ?.filter(
                account => account.type === 'bank' || account.type === 'deposit'
              )
              .map(account => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={account.id}
                  sx={{ display: 'flex', height: '100%' }}
                >
                  <AccountCard
                    account={account}
                    onEdit={status === 'active' ? handleEditAccount : undefined}
                    onArchive={
                      status === 'active' ? handleArchiveAccount : undefined
                    }
                    onRestore={
                      status === 'archived' ? handleRestoreAccount : undefined
                    }
                    onClick={handleClickAccount}
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
          {selectedAccount ? 'Редактирование счета' : 'Новый счет'}
          <IconButton
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AccountForm account={selectedAccount} onClose={handleCloseForm} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isTransferFormOpen}
        onClose={handleCloseTransferForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Перевод между счетами
          <IconButton
            onClick={handleCloseTransferForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TransferFundsForm onClose={handleCloseTransferForm} />
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
};

export default Accounts;

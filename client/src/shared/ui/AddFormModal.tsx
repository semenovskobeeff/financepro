import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Импорты форм
import TransactionForm from '../../features/transactions/components/TransactionForm';
import { useAccountsRefresh } from '../hooks/useAccountsRefresh';
import AccountForm from '../../features/accounts/components/AccountForm';
import CategoryForm from '../../features/categories/components/CategoryForm';
import GoalForm from '../../features/goals/components/GoalForm';
import DebtFormContent from '../../features/debts/components/DebtFormContent';
import SubscriptionFormContent from '../../features/subscriptions/components/SubscriptionFormContent';
import TransferFundsForm from '../../features/accounts/components/TransferFundsForm';
import ShoppingListForm from '../../entities/shopping-list/ui/ShoppingListForm';

// Импорт для обновления аналитических данных
import { analyticsApi } from '../../entities/analytics/api/analyticsApi';
import { useDispatch } from 'react-redux';

import { TransactionType } from '../../entities/transaction/model/types';
import { CategoryType } from '../../entities/category/model/types';

interface AddFormModalProps {
  type: string | null;
  data?: any;
  open: boolean;
  onClose: () => void;
}

const AddFormModal: React.FC<AddFormModalProps> = ({
  type,
  data,
  open,
  onClose,
}) => {
  const { refreshAccounts } = useAccountsRefresh();
  const dispatch = useDispatch();

  const handleClose = () => {
    // Обновляем счета при закрытии формы транзакций
    if (
      ['income', 'expense', 'transfer', 'edit-transaction'].includes(type || '')
    ) {
      setTimeout(() => {
        refreshAccounts();
        // Принудительно инвалидируем аналитические данные
        dispatch(
          analyticsApi.util.invalidateTags([
            'Analytics',
            'DashboardAnalytics',
            'TransactionAnalytics',
          ])
        );
        console.log(
          '[AddFormModal] Invalidated analytics data after transaction operation'
        );
      }, 300);
    }
    onClose();
  };
  if (!type || !open) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'income':
        return 'Новый доход';
      case 'expense':
        return 'Новый расход';
      case 'transfer':
        return 'Перевод между счетами';
      case 'edit-transaction':
        return 'Редактировать операцию';
      case 'account':
        return 'Новый счет';
      case 'category-income':
        return 'Новая категория доходов';
      case 'category-expense':
        return 'Новая категория расходов';
      case 'goal':
        return 'Новая цель';
      case 'debt':
        return 'Новый долг';
      case 'subscription':
        return 'Новая подписка';
      case 'shopping-list':
        return 'Новый список покупок';
      default:
        return 'Добавить';
    }
  };

  const getModalContent = () => {
    switch (type) {
      case 'income':
        return <TransactionForm onClose={handleClose} initialType="income" />;

      case 'expense':
        return <TransactionForm onClose={handleClose} initialType="expense" />;

      case 'transfer':
        return <TransferFundsForm onClose={handleClose} />;

      case 'edit-transaction':
        return <TransactionForm onClose={handleClose} transaction={data} />;

      case 'account':
        return <AccountForm onClose={onClose} />;

      case 'category-income':
        return <CategoryForm onClose={onClose} initialType="income" />;

      case 'category-expense':
        return <CategoryForm onClose={onClose} initialType="expense" />;

      case 'goal':
        return <GoalForm onClose={onClose} />;

      case 'debt':
        return <DebtFormContent onClose={onClose} />;

      case 'subscription':
        return <SubscriptionFormContent onClose={onClose} />;

      case 'shopping-list':
        return <ShoppingListForm onClose={onClose} />;

      default:
        return null;
    }
  };

  const getMaxWidth = () => {
    switch (type) {
      case 'debt':
      case 'subscription':
      case 'shopping-list':
        return 'md';
      default:
        return 'sm';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={getMaxWidth()}
      fullWidth
    >
      <DialogTitle>
        {getModalTitle()}
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'var(--icon-secondary)',
            '&:hover': {
              backgroundColor: 'var(--bg-accent)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>{getModalContent()}</DialogContent>
    </Dialog>
  );
};

export default AddFormModal;

import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// Импорты форм
import TransactionForm from '../../features/transactions/components/TransactionForm';
import AccountForm from '../../features/accounts/components/AccountForm';
import CategoryForm from '../../features/categories/components/CategoryForm';
import GoalForm from '../../features/goals/components/GoalForm';
import DebtFormContent from '../../features/debts/components/DebtFormContent';
import SubscriptionFormContent from '../../features/subscriptions/components/SubscriptionFormContent';
import TransferFundsForm from '../../features/accounts/components/TransferFundsForm';
import ShoppingListForm from '../../entities/shopping-list/ui/ShoppingListForm';

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
  if (!type || !open) return null;

  const getModalTitle = () => {
    switch (type) {
      case 'income':
        return 'Новый доход';
      case 'expense':
        return 'Новый расход';
      case 'transfer':
        return 'Перевод между счетами';
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
        return <TransactionForm onClose={onClose} initialType="income" />;

      case 'expense':
        return <TransactionForm onClose={onClose} initialType="expense" />;

      case 'transfer':
        return <TransferFundsForm onClose={onClose} />;

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
    <Dialog open={open} onClose={onClose} maxWidth={getMaxWidth()} fullWidth>
      <DialogTitle>
        {getModalTitle()}
        <IconButton
          onClick={onClose}
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

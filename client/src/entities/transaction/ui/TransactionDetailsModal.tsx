import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

interface TransactionDetailsModalProps {
  open: boolean;
  transaction: any;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSave: (transaction: any) => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  open,
  transaction,
  onClose,
  onDelete,
  onSave,
}) => {
  const [editedTransaction, setEditedTransaction] = useState<any>({
    description: '',
    amount: '',
  });

  React.useEffect(() => {
    if (transaction) {
      setEditedTransaction({
        ...transaction,
        // Убеждаемся, что поля description и amount имеют значения
        description: transaction.description || '',
        amount: transaction.amount || '',
      });
    } else {
      setEditedTransaction({
        description: '',
        amount: '',
      });
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Нет данных для операции</DialogTitle>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Специальная обработка для поля amount
    if (name === 'amount') {
      // Разрешаем только цифры и точку/запятую для десятичных дробей
      const numericValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      setEditedTransaction({ ...editedTransaction, [name]: numericValue });
    } else {
      setEditedTransaction({ ...editedTransaction, [name]: value });
    }
  };

  const handleSave = () => {
    // Валидация данных перед сохранением
    const amountValue = editedTransaction.amount;
    const numericAmount = Number(amountValue);

    if (!amountValue || isNaN(numericAmount) || numericAmount <= 0) {
      alert('Пожалуйста, введите корректную сумму больше нуля');
      return;
    }

    // Преобразуем amount в число
    const transactionToSave = {
      ...editedTransaction,
      amount: numericAmount,
    };

    onSave(transactionToSave);
  };

  const handleDelete = () => {
    onDelete(transaction.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Редактировать операцию</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Описание"
          type="text"
          fullWidth
          name="description"
          value={editedTransaction.description || ''}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Сумма"
          type="number"
          fullWidth
          name="amount"
          value={editedTransaction.amount || ''}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDelete} color="error">
          Удалить
        </Button>
        <Button onClick={onClose} color="primary">
          Отмена
        </Button>
        <Button onClick={handleSave} color="primary">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionDetailsModal;

import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingListForm from '../../../entities/shopping-list/ui/ShoppingListForm';
import { ShoppingList } from '../../../entities/shopping-list/model/types';

interface ShoppingListModalProps {
  open: boolean;
  onClose: () => void;
  list?: ShoppingList | null;
}

const ShoppingListModal: React.FC<ShoppingListModalProps> = ({
  open,
  onClose,
  list,
}) => {
  const handleSuccess = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {list ? 'Редактировать список покупок' : 'Создать список покупок'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ShoppingListForm
          list={list}
          onClose={onClose}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ShoppingListModal;

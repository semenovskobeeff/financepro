import React, { createContext, useContext, ReactNode } from 'react';
import { usePaymentModal } from '../hooks/usePaymentModal';

interface PaymentModalContextType {
  subscriptionId: string | null;
  isOpen: boolean;
  openPaymentModal: (id: string) => void;
  closePaymentModal: () => void;
}

const PaymentModalContext = createContext<PaymentModalContextType | undefined>(
  undefined
);

export const usePaymentModalContext = () => {
  const context = useContext(PaymentModalContext);
  if (!context) {
    throw new Error(
      'usePaymentModalContext must be used within a PaymentModalProvider'
    );
  }
  return context;
};

interface PaymentModalProviderProps {
  children: ReactNode;
}

export const PaymentModalProvider: React.FC<PaymentModalProviderProps> = ({
  children,
}) => {
  const paymentModal = usePaymentModal();

  return (
    <PaymentModalContext.Provider value={paymentModal}>
      {children}
    </PaymentModalContext.Provider>
  );
};

import React from 'react';
import { usePaymentModalContext } from '../contexts/PaymentModalContext';
import {
  useGetSubscriptionByIdQuery,
  useMakePaymentMutation,
} from '../../entities/subscription/api/subscriptionApi';
import PaymentForm from '../../features/subscriptions/components/PaymentForm';

const PaymentModalManager: React.FC = () => {
  const { subscriptionId, isOpen, closePaymentModal } =
    usePaymentModalContext();

  // Получаем данные подписки, если указан ID
  const { data: subscription } = useGetSubscriptionByIdQuery(
    subscriptionId || '',
    { skip: !subscriptionId }
  );

  // Мутация для выполнения платежа
  const [makePayment] = useMakePaymentMutation();

  const handleSubmitPayment = async (paymentData: any) => {
    if (!subscriptionId) return null;

    try {
      const response = await makePayment({
        id: subscriptionId,
        data: paymentData,
      }).unwrap();

      closePaymentModal();
      return response;
    } catch (error) {
      console.error('Payment error:', error);
      return null;
    }
  };

  if (!subscription || !isOpen) {
    return null;
  }

  return (
    <PaymentForm
      subscription={subscription}
      open={isOpen}
      onClose={closePaymentModal}
      onSubmit={handleSubmitPayment}
    />
  );
};

export default PaymentModalManager;

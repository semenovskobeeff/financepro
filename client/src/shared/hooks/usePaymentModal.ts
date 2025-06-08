import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePaymentModal = () => {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const location = useLocation();

  // Очищаем subscriptionId при изменении маршрута
  useEffect(() => {
    setSubscriptionId(null);
  }, [location.pathname]);

  const openPaymentModal = (id: string) => {
    setSubscriptionId(id);
  };

  const closePaymentModal = () => {
    setSubscriptionId(null);
  };

  return {
    subscriptionId,
    isOpen: Boolean(subscriptionId),
    openPaymentModal,
    closePaymentModal,
  };
};

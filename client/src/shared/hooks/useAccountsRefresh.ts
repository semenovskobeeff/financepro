import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { accountApi } from '../../entities/account/api/accountApi';

/**
 * Хук для принудительного обновления данных счетов
 * Используется после операций с транзакциями для обеспечения актуальности балансов
 */
export const useAccountsRefresh = () => {
  const dispatch = useDispatch();

  const refreshAccounts = () => {
    // Принудительно инвалидируем кэш счетов
    dispatch(accountApi.util.invalidateTags(['Account', 'AccountHistory']));

    // Принудительно перезапрашиваем данные
    dispatch(
      accountApi.endpoints.getAccounts.initiate({}, { forceRefetch: true })
    );
  };

  const refreshAccountById = (accountId: string) => {
    // Инвалидируем конкретный счет
    dispatch(
      accountApi.util.invalidateTags([{ type: 'Account', id: accountId }])
    );

    // Принудительно перезапрашиваем данные
    dispatch(
      accountApi.endpoints.getAccounts.initiate({}, { forceRefetch: true })
    );
  };

  return {
    refreshAccounts,
    refreshAccountById,
  };
};

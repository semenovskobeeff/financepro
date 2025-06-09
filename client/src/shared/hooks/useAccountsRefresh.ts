import { useAppDispatch } from '../../app/store/hooks';
import { accountApi } from '../../entities/account/api/accountApi';

/**
 * Хук для принудительного обновления данных счетов
 * Используется после операций с транзакциями для обеспечения актуальности балансов
 */
export const useAccountsRefresh = () => {
  const dispatch = useAppDispatch();

  const refreshAccounts = () => {
    // Принудительно инвалидируем кэш счетов и связанных данных
    dispatch(
      accountApi.util.invalidateTags(['Account', 'AccountHistory', 'Analytics'])
    );
  };

  const refreshAccountById = (accountId: string) => {
    // Инвалидируем конкретный счет и связанные теги
    dispatch(
      accountApi.util.invalidateTags([
        { type: 'Account', id: accountId },
        { type: 'AccountHistory', id: accountId },
        'Analytics',
      ])
    );
  };

  return {
    refreshAccounts,
    refreshAccountById,
  };
};

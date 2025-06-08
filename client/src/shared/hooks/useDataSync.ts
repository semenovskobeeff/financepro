import { useEffect, useState } from 'react';
import {
  useRecalculateBalancesMutation,
  useCheckBalancesQuery,
} from '../../entities/transaction/api/transactionApi';

interface DataSyncState {
  isChecking: boolean;
  hasMismatch: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  inconsistencies: Array<{
    accountId: string;
    accountName: string;
    storedBalance: number;
    calculatedBalance: number;
    difference: number;
  }>;
}

export const useDataSync = () => {
  const [syncState, setSyncState] = useState<DataSyncState>({
    isChecking: false,
    hasMismatch: false,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    inconsistencies: [],
  });

  // Используем серверную проверку балансов
  const {
    data: balanceCheckData,
    isLoading: isCheckingBalances,
    error: checkBalancesError,
    refetch: refetchBalanceCheck,
  } = useCheckBalancesQuery();

  const [recalculateBalances] = useRecalculateBalancesMutation();

  // Обновляем состояние на основе серверной проверки
  useEffect(() => {
    if (isCheckingBalances) {
      setSyncState(prev => ({ ...prev, isChecking: true, syncError: null }));
      return;
    }

    if (checkBalancesError) {
      let errorMessage = 'Ошибка при проверке балансов';

      if ('data' in checkBalancesError && checkBalancesError.data) {
        errorMessage =
          (checkBalancesError.data as any)?.message || errorMessage;
      } else if ('message' in checkBalancesError) {
        errorMessage = checkBalancesError.message || errorMessage;
      }

      setSyncState(prev => ({
        ...prev,
        isChecking: false,
        syncError: errorMessage,
      }));
      return;
    }

    if (balanceCheckData?.data) {
      const { hasInconsistencies, inconsistencies = [] } =
        balanceCheckData.data;

      setSyncState(prev => ({
        ...prev,
        isChecking: false,
        hasMismatch: hasInconsistencies,
        inconsistencies,
        syncError: null,
      }));

      if (hasInconsistencies) {
        console.warn('🚨 Обнаружены несоответствия балансов:', inconsistencies);
      } else {
        console.log('✅ Все балансы корректны');
      }
    }
  }, [balanceCheckData, isCheckingBalances, checkBalancesError]);

  // Проверка балансов (вызов refetch)
  const checkBalances = async () => {
    try {
      setSyncState(prev => ({ ...prev, syncError: null }));
      await refetchBalanceCheck();
    } catch (error) {
      console.error('Ошибка при проверке балансов:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка проверки';
      setSyncState(prev => ({
        ...prev,
        syncError: errorMessage,
      }));
    }
  };

  // Автоматическая синхронизация
  const syncBalances = async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      const result = await recalculateBalances().unwrap();
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        hasMismatch: false,
        inconsistencies: [],
        lastSyncTime: new Date(),
        syncError: null,
      }));

      // Перепроверяем балансы после синхронизации
      setTimeout(() => {
        refetchBalanceCheck();
      }, 2000); // Увеличиваем задержку до 2 секунд

      console.log('✅ Балансы успешно синхронизированы:', result.data);
    } catch (error: any) {
      console.error('❌ Ошибка при синхронизации балансов:', error);

      let errorMessage = 'Ошибка синхронизации';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        syncError: errorMessage,
      }));
    }
  };

  return {
    ...syncState,
    checkBalances,
    syncBalances,
  };
};

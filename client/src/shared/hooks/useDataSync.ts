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
      setSyncState(prev => ({ ...prev, isChecking: true }));
      return;
    }

    if (checkBalancesError) {
      setSyncState(prev => ({
        ...prev,
        isChecking: false,
        syncError: 'Ошибка при проверке балансов',
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
      await refetchBalanceCheck();
    } catch (error) {
      console.error('Ошибка при проверке балансов:', error);
      setSyncState(prev => ({
        ...prev,
        syncError: error instanceof Error ? error.message : 'Ошибка проверки',
      }));
    }
  };

  // Автоматическая синхронизация
  const syncBalances = async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, syncError: null }));

    try {
      await recalculateBalances().unwrap();
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
      }, 1000);

      console.log('✅ Балансы успешно синхронизированы');
    } catch (error: any) {
      console.error('❌ Ошибка при синхронизации балансов:', error);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        syncError:
          error?.data?.message || error?.message || 'Ошибка синхронизации',
      }));
    }
  };

  return {
    ...syncState,
    checkBalances,
    syncBalances,
  };
};

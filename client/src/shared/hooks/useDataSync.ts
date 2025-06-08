import { useState } from 'react';
// ИМПОРТЫ СИНХРОНИЗАЦИИ БАЛАНСОВ ОТКЛЮЧЕНЫ
/*
import {
  useRecalculateBalancesMutation,
  useCheckBalancesQuery,
  useValidateAndFixBalancesMutation,
  useSyncAccountBalanceMutation,
} from '../../entities/transaction/api/transactionApi';
*/

interface DataSyncState {
  isChecking: boolean;
  hasMismatch: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  errorType:
    | 'transaction_error'
    | 'balance_error'
    | 'network_error'
    | 'unknown_error'
    | null;
  inconsistencies: Array<{
    accountId: string;
    accountName: string;
    storedBalance: number;
    calculatedBalance: number;
    difference: number;
  }>;
}

// ХУК СИНХРОНИЗАЦИИ ДАННЫХ ОТКЛЮЧЕН
export const useDataSync = () => {
  const [syncState] = useState<DataSyncState>({
    isChecking: false,
    hasMismatch: false,
    isSyncing: false,
    lastSyncTime: null,
    syncError: 'Функция синхронизации балансов отключена',
    errorType: null,
    inconsistencies: [],
  });

  // Заглушки для всех методов
  const checkBalances = async () => {
    console.log('⚠️ Синхронизация балансов отключена');
  };

  const syncBalances = async () => {
    console.log('⚠️ Синхронизация балансов отключена');
  };

  const syncSingleAccount = async (accountId: string) => {
    console.log('⚠️ Синхронизация балансов отключена');
    return { data: { synchronized: false } };
  };

  const legacySyncBalances = async () => {
    console.log('⚠️ Синхронизация балансов отключена');
  };

  // Возвращаем отключенное состояние
  return {
    ...syncState,
    checkBalances,
    syncBalances,
    syncSingleAccount,
    legacySyncBalances,
  };
};

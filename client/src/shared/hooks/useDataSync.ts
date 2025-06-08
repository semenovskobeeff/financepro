import { useEffect, useState } from 'react';
import {
  useRecalculateBalancesMutation,
  useCheckBalancesQuery,
  useValidateAndFixBalancesMutation,
  useSyncAccountBalanceMutation,
} from '../../entities/transaction/api/transactionApi';

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

export const useDataSync = () => {
  const [syncState, setSyncState] = useState<DataSyncState>({
    isChecking: false,
    hasMismatch: false,
    isSyncing: false,
    lastSyncTime: null,
    syncError: null,
    errorType: null,
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
  const [validateAndFixBalances] = useValidateAndFixBalancesMutation();
  const [syncAccountBalance] = useSyncAccountBalanceMutation();

  // Функция для определения типа ошибки
  const getErrorType = (errorMessage: string): DataSyncState['errorType'] => {
    if (
      errorMessage.includes('транзакци') ||
      errorMessage.includes('операци')
    ) {
      return 'transaction_error';
    }
    if (errorMessage.includes('баланс') || errorMessage.includes('счет')) {
      return 'balance_error';
    }
    if (
      errorMessage.includes('сеть') ||
      errorMessage.includes('подключени') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection')
    ) {
      return 'network_error';
    }
    return 'unknown_error';
  };

  // Обновляем состояние на основе серверной проверки
  useEffect(() => {
    if (isCheckingBalances) {
      setSyncState(prev => ({
        ...prev,
        isChecking: true,
        syncError: null,
        errorType: null,
      }));
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

      // Проверяем специфические ошибки
      if (errorMessage.includes('транзакци')) {
        errorMessage =
          'Ошибка при получении транзакций. Проверьте подключение к серверу.';
      }

      setSyncState(prev => ({
        ...prev,
        isChecking: false,
        syncError: errorMessage,
        errorType: getErrorType(errorMessage),
      }));
      return;
    }

    if (balanceCheckData?.data) {
      const {
        hasInconsistencies,
        inconsistencies = [],
        autoFixed,
        fixResult,
      } = balanceCheckData.data;

      setSyncState(prev => ({
        ...prev,
        isChecking: false,
        hasMismatch: hasInconsistencies,
        inconsistencies,
        syncError: null,
        errorType: null,
        lastSyncTime: autoFixed ? new Date() : prev.lastSyncTime,
      }));

      if (autoFixed && fixResult) {
        console.log(
          `✅ Автоматически исправлено ${fixResult.accountsCorrected} из ${fixResult.accountsProcessed} счетов`
        );
      } else if (hasInconsistencies) {
        console.warn('🚨 Обнаружены несоответствия балансов:', inconsistencies);
      } else {
        console.log('✅ Все балансы корректны');
      }
    }
  }, [balanceCheckData, isCheckingBalances, checkBalancesError]);

  // Проверка балансов (вызов refetch)
  const checkBalances = async () => {
    try {
      setSyncState(prev => ({ ...prev, syncError: null, errorType: null }));
      await refetchBalanceCheck();
    } catch (error) {
      console.error('Ошибка при проверке балансов:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Неизвестная ошибка проверки';
      setSyncState(prev => ({
        ...prev,
        syncError: errorMessage,
        errorType: getErrorType(errorMessage),
      }));
    }
  };

  // Быстрая синхронизация с валидацией и автоисправлением
  const syncBalances = async () => {
    setSyncState(prev => ({
      ...prev,
      isSyncing: true,
      syncError: null,
      errorType: null,
    }));

    try {
      console.log('🔄 Запуск интеллектуальной синхронизации балансов...');

      const result = await validateAndFixBalances({ autoFix: true }).unwrap();

      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        hasMismatch: false,
        inconsistencies: [],
        lastSyncTime: new Date(),
        syncError: null,
        errorType: null,
      }));

      // Показываем информацию о результатах
      if (result.data.status === 'fixed' && result.data.fixResult) {
        console.log(
          `✅ Синхронизация завершена. Исправлено ${result.data.fixResult.accountsCorrected} из ${result.data.fixResult.accountsProcessed} счетов`
        );
      } else {
        console.log('✅ Все балансы уже были корректными');
      }

      // Перепроверяем балансы после синхронизации
      setTimeout(() => {
        refetchBalanceCheck();
      }, 1000);
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
        errorType: getErrorType(errorMessage),
      }));
    }
  };

  // Синхронизация отдельного счета
  const syncSingleAccount = async (accountId: string) => {
    try {
      console.log('⚡ Синхронизация отдельного счета:', accountId);

      const result = await syncAccountBalance(accountId).unwrap();

      if (result.data.synchronized) {
        console.log(
          `✅ Счет синхронизирован. Разница: ${result.data.difference}`
        );
      } else {
        console.log('✅ Баланс счета уже корректен');
      }

      // Обновляем общее состояние
      setTimeout(() => {
        refetchBalanceCheck();
      }, 500);

      return result;
    } catch (error: any) {
      console.error('❌ Ошибка синхронизации счета:', error);
      throw error;
    }
  };

  // Устаревший метод для совместимости
  const legacySyncBalances = async () => {
    setSyncState(prev => ({
      ...prev,
      isSyncing: true,
      syncError: null,
      errorType: null,
    }));

    try {
      const result = await recalculateBalances().unwrap();
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        hasMismatch: false,
        inconsistencies: [],
        lastSyncTime: new Date(),
        syncError: null,
        errorType: null,
      }));

      // Перепроверяем балансы после синхронизации
      setTimeout(() => {
        refetchBalanceCheck();
      }, 2000);

      console.log(
        '✅ Балансы успешно синхронизированы (устаревший метод):',
        result.data
      );
    } catch (error: any) {
      console.error(
        '❌ Ошибка при синхронизации балансов (устаревший метод):',
        error
      );

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
        errorType: getErrorType(errorMessage),
      }));
    }
  };

  return {
    ...syncState,
    checkBalances,
    syncBalances,
    syncSingleAccount,
    legacySyncBalances,
  };
};

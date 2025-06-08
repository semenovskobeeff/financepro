import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Transaction,
  TransactionsState,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  GetTransactionsRequest,
} from '../model/types';

interface GetTransactionsResponse {
  transactions: Transaction[];
  totalPages: number;
  currentPage: number;
  total: number;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
}

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQuery,
  tagTypes: ['Transaction', 'Account', 'Analytics', 'BalanceCheck'],
  endpoints: builder => ({
    getTransactions: builder.query<
      GetTransactionsResponse,
      GetTransactionsRequest
    >({
      query: params => ({
        url: '/transactions',
        params,
      }),
      transformResponse: (
        response: GetTransactionsResponse | ApiResponse<GetTransactionsResponse>
      ) => {
        // Проверяем, обернут ли ответ в объект с data (реальный API)
        // или это прямой ответ (MSW)
        if ('data' in response && response.data) {
          return response.data;
        }
        // Прямой ответ от MSW
        return (
          (response as GetTransactionsResponse) || {
            transactions: [],
            totalPages: 0,
            currentPage: 1,
            total: 0,
          }
        );
      },
      providesTags: result =>
        result
          ? [
              ...result.transactions.map(({ id }) => ({
                type: 'Transaction' as const,
                id,
              })),
              { type: 'Transaction', id: 'LIST' },
            ]
          : [{ type: 'Transaction', id: 'LIST' }],
    }),

    getTransactionById: builder.query<Transaction, string>({
      query: id => ({ url: `/transactions/${id}` }),
      transformResponse: (response: Transaction | ApiResponse<Transaction>) => {
        if ('data' in response && response.data) {
          return response.data;
        }
        return response as Transaction;
      },
      providesTags: (_, __, id) => [{ type: 'Transaction', id }],
    }),

    createTransaction: builder.mutation<Transaction, CreateTransactionRequest>({
      query: data => ({
        url: '/transactions',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Transaction | ApiResponse<Transaction>) => {
        if ('data' in response && response.data) {
          return response.data;
        }
        return response as Transaction;
      },
      invalidatesTags: [
        { type: 'Transaction', id: 'LIST' },
        'Account',
        'Analytics',
      ],
    }),

    updateTransaction: builder.mutation<
      Transaction,
      { id: string; data: UpdateTransactionRequest }
    >({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (
        response: Transaction | { status: string; data: Transaction }
      ) => {
        // Обработка ответа от реального API с обертками
        if ('status' in response && 'data' in response) {
          return response.data;
        }
        // Обработка ответа от MSW (прямой объект)
        return response as Transaction;
      },
      invalidatesTags: (_, __, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        'Account',
        'Analytics',
      ],
    }),

    deleteTransaction: builder.mutation<void, string>({
      query: id => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        'Account',
        'Analytics',
      ],
    }),

    // Пересчет балансов всех счетов на основе транзакций
    recalculateBalances: builder.mutation<
      {
        status: string;
        message: string;
        data: {
          accountsProcessed: number;
          results: Array<{
            accountId: string;
            accountName: string;
            oldBalance: number;
            newBalance: number;
            difference: number;
            transactionsProcessed: number;
          }>;
        };
      },
      void
    >({
      query: () => ({
        url: '/transactions/recalculate-balances',
        method: 'POST',
      }),
      invalidatesTags: [
        'Account',
        'Analytics',
        'BalanceCheck',
        { type: 'Transaction', id: 'LIST' },
      ],
    }),

    // Проверка корректности балансов
    checkBalances: builder.query<
      {
        status: string;
        data: {
          hasInconsistencies: boolean;
          accountsChecked: number;
          inconsistencies: Array<{
            accountId: string;
            accountName: string;
            storedBalance: number;
            calculatedBalance: number;
            difference: number;
          }>;
          autoFixed?: boolean;
          fixResult?: {
            accountsProcessed: number;
            accountsCorrected: number;
            results: Array<any>;
            success: boolean;
          };
        };
      },
      void
    >({
      query: () => '/transactions/check-balances',
      providesTags: ['BalanceCheck'],
    }),

    // Синхронизация баланса отдельного счета
    syncAccountBalance: builder.mutation<
      {
        status: string;
        message: string;
        data: {
          synchronized: boolean;
          oldBalance: number;
          newBalance: number;
          difference: number;
        };
      },
      string
    >({
      query: accountId => ({
        url: `/transactions/sync-account/${accountId}`,
        method: 'POST',
      }),
      invalidatesTags: [
        'Account',
        'Analytics',
        'BalanceCheck',
        { type: 'Transaction', id: 'LIST' },
      ],
    }),

    // Валидация и автоисправление балансов
    validateAndFixBalances: builder.mutation<
      {
        status: string;
        message: string;
        data: {
          status: 'ok' | 'fixed' | 'inconsistent';
          hasInconsistencies: boolean;
          accountsChecked: number;
          inconsistencies: Array<any>;
          fixResult?: {
            accountsProcessed: number;
            accountsCorrected: number;
            results: Array<any>;
            success: boolean;
          };
        };
      },
      { autoFix?: boolean }
    >({
      query: ({ autoFix = true }) => ({
        url: `/transactions/validate-balances?autoFix=${autoFix}`,
        method: 'POST',
      }),
      invalidatesTags: [
        'Account',
        'Analytics',
        'BalanceCheck',
        { type: 'Transaction', id: 'LIST' },
      ],
    }),

    // Создание снимка балансов
    createBalanceSnapshot: builder.mutation<
      {
        status: string;
        message: string;
        data: {
          userId: string;
          timestamp: string;
          accounts: Array<{
            accountId: string;
            accountName: string;
            balance: number;
          }>;
        };
      },
      void
    >({
      query: () => ({
        url: '/transactions/balance-snapshot',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useRecalculateBalancesMutation,
  useCheckBalancesQuery,
  useSyncAccountBalanceMutation,
  useValidateAndFixBalancesMutation,
  useCreateBalanceSnapshotMutation,
} = transactionApi;

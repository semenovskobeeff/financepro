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
  tagTypes: ['Transaction', 'Account', 'Analytics'],
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

    archiveTransaction: builder.mutation<void, string>({
      query: id => ({
        url: `/transactions/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        'Account',
        'Analytics',
      ],
    }),

    restoreTransaction: builder.mutation<void, string>({
      query: id => ({
        url: `/transactions/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
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
        };
      },
      void
    >({
      query: () => '/transactions/check-balances',
      providesTags: ['BalanceCheck'],
    }),
  }),
});

export const {
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useArchiveTransactionMutation,
  useRestoreTransactionMutation,
  useDeleteTransactionMutation,
  useRecalculateBalancesMutation,
  useCheckBalancesQuery,
} = transactionApi;

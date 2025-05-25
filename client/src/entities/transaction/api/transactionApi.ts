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

export const transactionApi = createApi({
  reducerPath: 'transactionApi',
  baseQuery: baseQuery,
  tagTypes: ['Transaction', 'Account'],
  endpoints: builder => ({
    getTransactions: builder.query<
      GetTransactionsResponse,
      GetTransactionsRequest
    >({
      query: params => ({
        url: '/transactions',
        params,
      }),
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
      providesTags: (_, __, id) => [{ type: 'Transaction', id }],
    }),

    createTransaction: builder.mutation<Transaction, CreateTransactionRequest>({
      query: data => ({
        url: '/transactions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }, 'Account'],
    }),

    updateTransaction: builder.mutation<
      Transaction,
      { id: string } & UpdateTransactionRequest
    >({
      query: ({ id, ...patch }) => ({
        url: `/transactions/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id, accountId }) => {
        const tags = [
          { type: 'Transaction' as const, id },
          { type: 'Transaction' as const, id: 'LIST' },
          { type: 'Account' as const, id: 'LIST' },
        ];

        // Если есть accountId в результате или в запросе, инвалидируем историю конкретного счета
        if (result?.accountId) {
          tags.push({ type: 'Account' as const, id: result.accountId });
          tags.push({
            type: 'Account' as const,
            id: `${result.accountId}-history`,
          });
        }
        if (accountId) {
          tags.push({ type: 'Account' as const, id: accountId });
          tags.push({ type: 'Account' as const, id: `${accountId}-history` });
        }

        return tags;
      },
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
      ],
    }),

    deleteTransaction: builder.mutation<
      { success: boolean; id: string },
      string
    >({
      query: id => ({
        url: `transactions/${id}`,
        method: 'DELETE',
      }),
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
} = transactionApi;

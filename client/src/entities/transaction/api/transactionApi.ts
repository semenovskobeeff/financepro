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
  data: T;
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
      transformResponse: (response: ApiResponse<GetTransactionsResponse>) => {
        return (
          response.data || {
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
      transformResponse: (response: ApiResponse<Transaction>) => response.data,
      providesTags: (_, __, id) => [{ type: 'Transaction', id }],
    }),

    createTransaction: builder.mutation<Transaction, CreateTransactionRequest>({
      query: data => ({
        url: '/transactions',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Transaction>) => response.data,
      invalidatesTags: [{ type: 'Transaction', id: 'LIST' }, 'Account'],
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
      transformResponse: (response: ApiResponse<Transaction>) => response.data,
      invalidatesTags: (_, __, { id }) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        'Account',
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

    deleteTransaction: builder.mutation<void, string>({
      query: id => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Transaction', id },
        { type: 'Transaction', id: 'LIST' },
        'Account',
      ],
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

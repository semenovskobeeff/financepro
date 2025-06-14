import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Account,
  AccountsState,
  AccountHistoryItem,
  CreateAccountRequest,
  TransferFundsRequest,
  UpdateAccountRequest,
} from '../model/types';
import { RootState } from 'app/store';

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery,
  tagTypes: [
    'Account',
    'Analytics',
    'DashboardAnalytics',
    'TransactionAnalytics',
    'AccountHistory',
    'Transaction',
    'BalanceCheck',
  ],
  keepUnusedDataFor: 0,
  endpoints: builder => ({
    getAccounts: builder.query<Account[], { status?: string } | void>({
      query: params => {
        let url = '/accounts';
        if (params && params.status) {
          url += `?status=${params.status}`;
        }
        return { url };
      },
      // Для поллинга используйте: useGetAccountsQuery(params, { pollingInterval: 5000 })
      transformResponse: (response: { status: string; data: Account[] }) =>
        response?.data || [],
      providesTags: result =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({
                type: 'Account' as const,
                id,
              })),
              { type: 'Account' as const, id: 'LIST' },
            ]
          : [{ type: 'Account' as const, id: 'LIST' }],
    }),

    getAccountById: builder.query<Account, string>({
      query: id => ({ url: `/accounts/${id}` }),
      transformResponse: (response: { status: string; data: Account }) =>
        response?.data,
      providesTags: (_, __, id) => [{ type: 'Account' as const, id }],
    }),

    createAccount: builder.mutation<Account, CreateAccountRequest>({
      query: data => ({
        url: '/accounts',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { status: string; data: Account }) =>
        response?.data,
      invalidatesTags: [
        { type: 'Account' as const, id: 'LIST' },
        'Analytics' as const,
        'DashboardAnalytics' as const,
        'TransactionAnalytics' as const,
      ],
    }),

    updateAccount: builder.mutation<
      Account,
      { id: string; data: UpdateAccountRequest }
    >({
      query: ({ id, data }) => ({
        url: `/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { status: string; data: Account }) =>
        response?.data,
      invalidatesTags: (_, __, { id }) => [
        { type: 'Account' as const, id },
        { type: 'Account' as const, id: 'LIST' },
        'Analytics' as const,
        'DashboardAnalytics' as const,
        'TransactionAnalytics' as const,
      ],
    }),

    archiveAccount: builder.mutation<void, string>({
      query: id => ({
        url: `/accounts/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Account' as const, id },
        { type: 'Account' as const, id: 'LIST' },
        'Analytics' as const,
        'DashboardAnalytics' as const,
        'TransactionAnalytics' as const,
      ],
    }),

    restoreAccount: builder.mutation<void, string>({
      query: id => ({
        url: `/accounts/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Account' as const, id },
        { type: 'Account' as const, id: 'LIST' },
        'Analytics' as const,
        'DashboardAnalytics' as const,
        'TransactionAnalytics' as const,
      ],
    }),

    transferFunds: builder.mutation<
      { fromAccount: Account; toAccount: Account },
      TransferFundsRequest
    >({
      query: data => ({
        url: '/accounts/transfer',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: {
        status: string;
        data: { fromAccount: Account; toAccount: Account };
      }) => response?.data,
      invalidatesTags: [
        { type: 'Account' as const, id: 'LIST' },
        'Account' as const,
        'Analytics' as const,
        'DashboardAnalytics' as const,
        'TransactionAnalytics' as const,
        'AccountHistory' as const,
      ],
    }),

    getAccountHistory: builder.query<
      {
        history: AccountHistoryItem[];
        pagination?: {
          total: number;
          totalPages: number;
          currentPage: number;
          limit: number;
        };
      },
      { accountId: string; page?: number; limit?: number }
    >({
      query: ({ accountId, page = 1, limit = 10 }) => ({
        url: `/accounts/${accountId}/history`,
        params: { page, limit },
      }),
      transformResponse: (response: {
        status: string;
        data: {
          history: AccountHistoryItem[];
          pagination?: {
            total: number;
            totalPages: number;
            currentPage: number;
            limit: number;
          };
        };
      }) => response?.data || { history: [] },
      providesTags: (_, __, { accountId }) => [
        { type: 'AccountHistory' as const, id: accountId },
      ],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useArchiveAccountMutation,
  useRestoreAccountMutation,
  useTransferFundsMutation,
  useGetAccountHistoryQuery,
} = accountApi;

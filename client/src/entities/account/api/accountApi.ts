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

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
}

export const accountApi = createApi({
  reducerPath: 'accountApi',
  baseQuery,
  tagTypes: ['Account'],
  endpoints: builder => ({
    getAccounts: builder.query<Account[], { status?: string } | void>({
      query: params => {
        let url = '/accounts';
        if (params && params.status) {
          url += `?status=${params.status}`;
        }
        return { url };
      },
      transformResponse: (response: ApiResponse<Account[]>) =>
        response.data || [],
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Account' as const,
                id,
              })),
              { type: 'Account', id: 'LIST' },
            ]
          : [{ type: 'Account', id: 'LIST' }],
    }),

    getAccountById: builder.query<Account, string>({
      query: id => ({ url: `/accounts/${id}` }),
      transformResponse: (response: ApiResponse<Account>) => response.data,
      providesTags: (_, __, id) => [{ type: 'Account', id }],
    }),

    createAccount: builder.mutation<Account, CreateAccountRequest>({
      query: data => ({
        url: '/accounts',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Account>) => response.data,
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
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
      transformResponse: (response: ApiResponse<Account>) => response.data,
      invalidatesTags: (_, __, { id }) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    archiveAccount: builder.mutation<void, string>({
      query: id => ({
        url: `/accounts/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    restoreAccount: builder.mutation<void, string>({
      query: id => ({
        url: `/accounts/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
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
      transformResponse: (
        response: ApiResponse<{ fromAccount: Account; toAccount: Account }>
      ) => response.data,
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
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
      transformResponse: (
        response: ApiResponse<{
          history: AccountHistoryItem[];
          pagination?: {
            total: number;
            totalPages: number;
            currentPage: number;
            limit: number;
          };
        }>
      ) => response.data || { history: [] },
      providesTags: (_, __, { accountId }) => [
        { type: 'Account', id: `${accountId}-history` },
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

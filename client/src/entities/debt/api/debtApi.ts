import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Debt,
  DebtStatsResponse,
  CreateDebtRequest,
  UpdateDebtRequest,
  MakePaymentRequest,
} from '../model/types';

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery,
  tagTypes: [
    'Debt',
    'Analytics',
    'DashboardAnalytics',
    'DebtsAnalytics',
    'Account',
  ],
  keepUnusedDataFor: 0,
  endpoints: builder => ({
    getDebts: builder.query<Debt[], { status?: string } | void>({
      query: params => {
        let url = '/debts';
        if (params && params.status) {
          url += `?status=${params.status}`;
        }
        return { url };
      },
      transformResponse: (response: any) => {
        // Гарантируем возврат массива
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        console.warn('[debtApi] Unexpected response format:', response);
        return [];
      },
      providesTags: result =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({
                type: 'Debt' as const,
                id,
              })),
              { type: 'Debt', id: 'LIST' },
            ]
          : [{ type: 'Debt', id: 'LIST' }],
    }),

    getDebtById: builder.query<Debt, string>({
      query: id => ({ url: `/debts/${id}` }),
      transformResponse: (response: { status: string; data: Debt } | Debt) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as Debt;
      },
      providesTags: (_, __, id) => [{ type: 'Debt', id }],
    }),

    createDebt: builder.mutation<Debt, CreateDebtRequest>({
      query: data => ({
        url: '/debts',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { status: string; data: Debt } | Debt) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as Debt;
      },
      invalidatesTags: [
        { type: 'Debt', id: 'LIST' },
        'Analytics',
        'DashboardAnalytics',
        'DebtsAnalytics',
      ],
    }),

    updateDebt: builder.mutation<Debt, { id: string; data: UpdateDebtRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/debts/${id}`,
          method: 'PUT',
          body: data,
        }),
        transformResponse: (
          response: { status: string; data: Debt } | Debt
        ) => {
          if (response && typeof response === 'object' && 'data' in response) {
            return response.data;
          }
          return response as Debt;
        },
        invalidatesTags: (_, __, { id }) => [
          { type: 'Debt', id },
          { type: 'Debt', id: 'LIST' },
          'Analytics',
          'DashboardAnalytics',
          'DebtsAnalytics',
        ],
      }
    ),

    archiveDebt: builder.mutation<void, string>({
      query: id => ({
        url: `/debts/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Debt', id },
        { type: 'Debt', id: 'LIST' },
        'Analytics',
        'DashboardAnalytics',
        'DebtsAnalytics',
      ],
    }),

    restoreDebt: builder.mutation<void, string>({
      query: id => ({
        url: `/debts/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Debt', id },
        { type: 'Debt', id: 'LIST' },
        'Analytics',
        'DashboardAnalytics',
        'DebtsAnalytics',
      ],
    }),

    makePayment: builder.mutation<
      Debt,
      { id: string; data: MakePaymentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/debts/${id}/payment`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { status: string; data: Debt } | Debt) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as Debt;
      },
      invalidatesTags: (_, __, { id }) => [
        { type: 'Debt', id },
        { type: 'Debt', id: 'LIST' },
        'Analytics',
        'DashboardAnalytics',
        'DebtsAnalytics',
        'Account',
      ],
    }),

    getUpcomingPayments: builder.query<Debt[], { days?: number } | void>({
      query: params => {
        let url = '/debts/upcoming';
        if (params && params.days) {
          url += `?days=${params.days}`;
        }
        return { url };
      },
      transformResponse: (response: any) => {
        // Гарантируем возврат массива
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        console.warn('[debtApi] Unexpected response format:', response);
        return [];
      },
      providesTags: [{ type: 'Debt', id: 'UPCOMING' }],
    }),

    getDebtsStats: builder.query<DebtStatsResponse, void>({
      query: () => ({ url: '/debts/stats' }),
      transformResponse: (
        response:
          | { status: string; data: DebtStatsResponse }
          | DebtStatsResponse
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as DebtStatsResponse;
      },
      providesTags: [{ type: 'Debt', id: 'STATS' }],
    }),
  }),
});

export const {
  useGetDebtsQuery,
  useGetDebtByIdQuery,
  useCreateDebtMutation,
  useUpdateDebtMutation,
  useArchiveDebtMutation,
  useRestoreDebtMutation,
  useMakePaymentMutation,
  useGetUpcomingPaymentsQuery,
  useGetDebtsStatsQuery,
} = debtApi;

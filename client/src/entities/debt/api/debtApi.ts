import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Debt,
  DebtStatsResponse,
  CreateDebtRequest,
  UpdateDebtRequest,
  MakePaymentRequest,
} from '../model/types';

interface ApiResponse<T> {
  data: T;
}

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery,
  tagTypes: ['Debt'],
  endpoints: builder => ({
    getDebts: builder.query<Debt[], { status?: string } | void>({
      query: params => {
        let url = '/debts';
        if (params && params.status) {
          url += `?status=${params.status}`;
        }
        return { url };
      },
      transformResponse: (response: ApiResponse<Debt[]>) => response.data || [],
      providesTags: result =>
        result
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
      transformResponse: (response: ApiResponse<Debt>) => response.data,
      providesTags: (_, __, id) => [{ type: 'Debt', id }],
    }),

    createDebt: builder.mutation<Debt, CreateDebtRequest>({
      query: data => ({
        url: '/debts',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Debt>) => response.data,
      invalidatesTags: [{ type: 'Debt', id: 'LIST' }],
    }),

    updateDebt: builder.mutation<Debt, { id: string; data: UpdateDebtRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/debts/${id}`,
          method: 'PUT',
          body: data,
        }),
        transformResponse: (response: ApiResponse<Debt>) => response.data,
        invalidatesTags: (_, __, { id }) => [
          { type: 'Debt', id },
          { type: 'Debt', id: 'LIST' },
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
      transformResponse: (response: ApiResponse<Debt>) => response.data,
      invalidatesTags: (_, __, { id }) => [
        { type: 'Debt', id },
        { type: 'Debt', id: 'LIST' },
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
      transformResponse: (response: ApiResponse<Debt[]>) => response.data || [],
      providesTags: [{ type: 'Debt', id: 'UPCOMING' }],
    }),

    getDebtsStats: builder.query<DebtStatsResponse, void>({
      query: () => ({ url: '/debts/stats' }),
      transformResponse: (response: ApiResponse<DebtStatsResponse>) =>
        response.data,
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

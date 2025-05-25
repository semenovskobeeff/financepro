import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Debt,
  CreateDebtRequest,
  UpdateDebtRequest,
  MakePaymentRequest,
  DebtStatsResponse,
} from '../model/types';

export const debtApi = createApi({
  reducerPath: 'debtApi',
  baseQuery,
  tagTypes: ['Debt', 'DebtStats'],
  endpoints: builder => ({
    // Получение списка долгов
    getDebts: builder.query<Debt[], { status?: string }>({
      query: ({ status }) => ({
        url: '/debts',
        params: status ? { status } : undefined,
      }),
      providesTags: [{ type: 'Debt', id: 'LIST' }],
    }),

    // Получение активных долгов
    getActiveDebts: builder.query<Debt[], void>({
      query: () => '/debts?status=active',
      providesTags: [{ type: 'Debt', id: 'ACTIVE' }],
    }),

    // Получение архивных долгов
    getArchivedDebts: builder.query<Debt[], void>({
      query: () => '/debts?status=archived',
      providesTags: [{ type: 'Debt', id: 'ARCHIVED' }],
    }),

    // Получение долга по ID
    getDebtById: builder.query<Debt, string>({
      query: id => `/debts/${id}`,
      transformResponse: (response: { data: Debt }) => response.data,
      providesTags: (result, error, id) => [{ type: 'Debt', id }],
    }),

    // Создание нового долга
    createDebt: builder.mutation<Debt, CreateDebtRequest>({
      query: debt => ({
        url: '/debts',
        method: 'POST',
        body: debt,
      }),
      transformResponse: (response: { data: Debt }) => response.data,
      invalidatesTags: [{ type: 'Debt', id: 'LIST' }, { type: 'DebtStats' }],
    }),

    // Обновление долга
    updateDebt: builder.mutation<Debt, { id: string; data: UpdateDebtRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/debts/${id}`,
          method: 'PUT',
          body: data,
        }),
        transformResponse: (response: { data: Debt }) => response.data,
        invalidatesTags: (result, error, { id }) => [
          { type: 'Debt', id },
          { type: 'DebtStats' },
        ],
      }
    ),

    // Архивация долга
    archiveDebt: builder.mutation<Debt, string>({
      query: id => ({
        url: `/debts/${id}/archive`,
        method: 'POST',
      }),
      transformResponse: (response: { data: Debt }) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: 'Debt', id },
        { type: 'Debt', id: 'LIST' },
        { type: 'DebtStats' },
      ],
    }),

    // Восстановление долга из архива
    restoreDebt: builder.mutation<Debt, string>({
      query: id => ({
        url: `/debts/${id}/restore`,
        method: 'POST',
      }),
      transformResponse: (response: { data: Debt }) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: 'Debt', id },
        { type: 'Debt', id: 'LIST' },
        { type: 'DebtStats' },
      ],
    }),

    // Совершение платежа по долгу
    makePayment: builder.mutation<
      Debt,
      { id: string; data: MakePaymentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/debts/${id}/payment`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: { data: Debt }) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Debt', id },
        { type: 'DebtStats' },
      ],
    }),

    // Получение предстоящих платежей
    getUpcomingPayments: builder.query<Debt[], number | void>({
      query: (days = 7) => ({
        url: '/debts/upcoming',
        params: { days },
      }),
      transformResponse: (response: { data: Debt[] }) => response.data,
      providesTags: [{ type: 'Debt', id: 'UPCOMING' }],
    }),

    // Получение статистики по долгам
    getDebtStats: builder.query<DebtStatsResponse, void>({
      query: () => '/debts/stats',
      transformResponse: (response: { data: DebtStatsResponse }) =>
        response.data,
      providesTags: [{ type: 'DebtStats' }],
    }),
  }),
});

export const {
  useGetDebtsQuery,
  useGetActiveDebtsQuery,
  useGetArchivedDebtsQuery,
  useGetDebtByIdQuery,
  useCreateDebtMutation,
  useUpdateDebtMutation,
  useArchiveDebtMutation,
  useRestoreDebtMutation,
  useMakePaymentMutation,
  useGetUpcomingPaymentsQuery,
  useGetDebtStatsQuery,
} = debtApi;

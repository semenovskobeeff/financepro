import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../../../shared/api/baseQuery';
import {
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  MakePaymentRequest,
  SubscriptionStatsResponse,
  MakePaymentResponse,
  SubscriptionAnalyticsResponse,
} from '../model/types';

interface GetSubscriptionsResponse {
  subscriptions: Subscription[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery,
  tagTypes: ['Subscription'],
  endpoints: builder => ({
    getSubscriptions: builder.query<
      GetSubscriptionsResponse,
      { status?: string; page?: number; limit?: number }
    >({
      query: ({ status, page = 1, limit = 10 }) => {
        let url = `subscriptions?page=${page}&limit=${limit}`;
        if (status) {
          url += `&status=${status}`;
        }
        return url;
      },
      providesTags: result =>
        result
          ? [
              ...result.subscriptions.map(({ id }) => ({
                type: 'Subscription' as const,
                id,
              })),
              { type: 'Subscription', id: 'LIST' },
            ]
          : [{ type: 'Subscription', id: 'LIST' }],
    }),

    getSubscriptionById: builder.query<Subscription, string>({
      query: id => `subscriptions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),

    createSubscription: builder.mutation<
      Subscription,
      CreateSubscriptionRequest
    >({
      query: data => ({
        url: 'subscriptions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Subscription', id: 'LIST' }],
    }),

    updateSubscription: builder.mutation<
      Subscription,
      { id: string; data: UpdateSubscriptionRequest }
    >({
      query: ({ id, data }) => ({
        url: `subscriptions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    archiveSubscription: builder.mutation<Subscription, string>({
      query: id => ({
        url: `subscriptions/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    restoreSubscription: builder.mutation<Subscription, string>({
      query: id => ({
        url: `subscriptions/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    changeStatus: builder.mutation<
      Subscription,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `subscriptions/${id}/status`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    makePayment: builder.mutation<
      MakePaymentResponse,
      { id: string; data: MakePaymentRequest }
    >({
      query: ({ id, data }) => ({
        url: `subscriptions/${id}/payment`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
      ],
    }),

    getUpcomingPayments: builder.query<Subscription[], number | void>({
      query: (days = 7) => `subscriptions/upcoming?days=${days}`,
      providesTags: [{ type: 'Subscription', id: 'UPCOMING' }],
    }),

    getSubscriptionStats: builder.query<SubscriptionStatsResponse, void>({
      query: () => ({
        url: 'subscriptions/stats',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        // Убедимся, что response имеет правильный формат
        const defaultValue = {
          activeCount: 0,
          pausedCount: 0,
          totalMonthly: 0,
          totalYearly: 0,
          byCategory: [],
          byCurrency: [],
        };

        // Проверяем, что ответ не null и имеет нужные поля
        if (!response) return defaultValue;

        return {
          activeCount: response.activeCount || 0,
          pausedCount: response.pausedCount || 0,
          totalMonthly: response.totalMonthly || 0,
          totalYearly: response.totalYearly || 0,
          byCategory: response.byCategory || [],
          byCurrency: response.byCurrency || [],
        };
      },
      providesTags: [{ type: 'Subscription', id: 'STATS' }],
    }),

    getSubscriptionAnalytics: builder.query<
      SubscriptionAnalyticsResponse,
      string | void
    >({
      query: (period = 'month') => `subscriptions/analytics?period=${period}`,
      providesTags: [{ type: 'Subscription', id: 'ANALYTICS' }],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionByIdQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionMutation,
  useArchiveSubscriptionMutation,
  useRestoreSubscriptionMutation,
  useChangeStatusMutation,
  useMakePaymentMutation,
  useGetUpcomingPaymentsQuery,
  useGetSubscriptionStatsQuery,
  useGetSubscriptionAnalyticsQuery,
} = subscriptionApi;

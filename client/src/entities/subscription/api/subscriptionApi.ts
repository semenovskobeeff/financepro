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

interface ApiResponse<T> {
  data: T;
}

export const subscriptionApi = createApi({
  reducerPath: 'subscriptionApi',
  baseQuery,
  tagTypes: ['Subscription', 'Analytics', 'Account'],
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
      transformResponse: (response: ApiResponse<GetSubscriptionsResponse>) => {
        return (
          response.data || {
            subscriptions: [],
            pagination: { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
          }
        );
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
      transformResponse: (response: ApiResponse<Subscription>) => response.data,
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
      transformResponse: (response: ApiResponse<Subscription>) => response.data,
      invalidatesTags: [{ type: 'Subscription', id: 'LIST' }, 'Analytics'],
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
      transformResponse: (response: ApiResponse<Subscription>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        'Analytics',
      ],
    }),

    archiveSubscription: builder.mutation<Subscription, string>({
      query: id => ({
        url: `subscriptions/${id}/archive`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<Subscription>) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        'Analytics',
      ],
    }),

    restoreSubscription: builder.mutation<Subscription, string>({
      query: id => ({
        url: `subscriptions/${id}/restore`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<Subscription>) => response.data,
      invalidatesTags: (result, error, id) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        'Analytics',
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
      transformResponse: (response: ApiResponse<Subscription>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        'Analytics',
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
      transformResponse: (response: ApiResponse<MakePaymentResponse>) =>
        response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Subscription', id },
        { type: 'Subscription', id: 'LIST' },
        'Analytics',
        'Account',
      ],
    }),

    getUpcomingPayments: builder.query<Subscription[], number | void>({
      query: (days = 7) => `subscriptions/upcoming?days=${days}`,
      transformResponse: (response: ApiResponse<Subscription[]>) =>
        response.data || [],
      providesTags: [{ type: 'Subscription', id: 'UPCOMING' }],
    }),

    getSubscriptionStats: builder.query<SubscriptionStatsResponse, void>({
      query: () => ({
        url: 'subscriptions/stats',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<SubscriptionStatsResponse>) => {
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
        if (!response?.data) return defaultValue;

        const data = response.data;
        return {
          activeCount: data.activeCount || 0,
          pausedCount: data.pausedCount || 0,
          totalMonthly: data.totalMonthly || 0,
          totalYearly: data.totalYearly || 0,
          byCategory: data.byCategory || [],
          byCurrency: data.byCurrency || [],
        };
      },
      providesTags: [{ type: 'Subscription', id: 'STATS' }],
    }),

    getSubscriptionAnalytics: builder.query<
      SubscriptionAnalyticsResponse,
      string | void
    >({
      query: (period = 'month') => `subscriptions/analytics?period=${period}`,
      transformResponse: (
        response: ApiResponse<SubscriptionAnalyticsResponse>
      ) => response.data,
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

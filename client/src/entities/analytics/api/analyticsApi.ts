import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';

// Типы для аналитики транзакций
export interface TransactionAnalytics {
  summary: {
    income: number;
    expense: number;
    transfer: number;
    balance: number;
  };
  categoryStats: {
    income: Array<{
      type: string;
      categoryId: string | null;
      categoryName: string;
      categoryIcon: string;
      total: number;
      count: number;
    }>;
    expense: Array<{
      type: string;
      categoryId: string | null;
      categoryName: string;
      categoryIcon: string;
      total: number;
      count: number;
    }>;
  };
  timeStats: {
    income: Array<any>;
    expense: Array<any>;
  };
  accounts: Array<{
    _id: string;
    name: string;
    type: string;
    balance: number;
  }>;
}

// Типы для аналитики целей
export interface GoalsAnalytics {
  summary: {
    activeCount: number;
    completedCount: number;
    totalTargetAmount: number;
    totalProgress: number;
    averageProgress: number;
    averageCompletion: number;
  };
  goals: Array<{
    id: string;
    name: string;
    targetAmount: number;
    progress: number;
    progressPercent: number;
    deadline: string;
  }>;
}

// Типы для аналитики долгов
export interface DebtsAnalytics {
  summary: {
    totalCount: number;
    activeCount: number;
    paidCount: number;
    totalInitialAmount: number;
    totalCurrentAmount: number;
    totalPayments: number;
  };
  typeStats: Array<{
    type: string;
    count: number;
    totalInitial: number;
    totalCurrent: number;
    totalPaid: number;
    averageInterestRate: number;
  }>;
  upcomingPayments: Array<{
    id: string;
    name: string;
    type: string;
    nextPaymentDate: string;
    nextPaymentAmount: number;
    daysLeft: number;
  }>;
}

// Типы для сводной аналитики
export interface DashboardAnalytics {
  accounts: {
    count: number;
    totalBalance: number;
  };
  monthStats: {
    income: number;
    expense: number;
    balance: number;
  };
  subscriptions: {
    count: number;
    monthlyAmount: number;
  };
  debts: {
    count: number;
    totalAmount: number;
  };
  goals: {
    count: number;
    totalTarget: number;
    totalProgress: number;
  };
}

interface ApiResponse<T> {
  data: T;
}

export const analyticsApi = createApi({
  reducerPath: 'analyticsApi',
  baseQuery,
  tagTypes: ['Analytics'],
  endpoints: builder => ({
    // Аналитика транзакций
    getTransactionsAnalytics: builder.query<
      TransactionAnalytics,
      { period?: string; startDate?: string; endDate?: string }
    >({
      query: params => ({
        url: '/analytics/transactions',
        params,
      }),
      transformResponse: (response: ApiResponse<TransactionAnalytics>) => {
        console.log('💰 [API] getTransactionsAnalytics response:', response);

        if (response && response.data) {
          return response.data;
        }

        if (response && typeof response === 'object' && 'summary' in response) {
          return response as unknown as TransactionAnalytics;
        }

        console.warn('💰 [API] Invalid response, returning fallback data');
        return {
          summary: { income: 0, expense: 0, transfer: 0, balance: 0 },
          categoryStats: { income: [], expense: [] },
          timeStats: { income: [], expense: [] },
          accounts: [],
        };
      },
      providesTags: ['Analytics'],
    }),

    // Аналитика целей
    getGoalsAnalytics: builder.query<GoalsAnalytics, void>({
      query: () => '/analytics/goals',
      transformResponse: (response: ApiResponse<GoalsAnalytics>) => {
        console.log('🎯 [API] getGoalsAnalytics response:', response);

        if (response && response.data) {
          return response.data;
        }

        if (response && typeof response === 'object' && 'summary' in response) {
          return response as unknown as GoalsAnalytics;
        }

        console.warn('🎯 [API] Invalid response, returning fallback data');
        return {
          summary: {
            activeCount: 0,
            completedCount: 0,
            totalTargetAmount: 0,
            totalProgress: 0,
            averageProgress: 0,
            averageCompletion: 0,
          },
          goals: [],
        };
      },
      providesTags: ['Analytics'],
    }),

    // Аналитика долгов
    getDebtsAnalytics: builder.query<DebtsAnalytics, void>({
      query: () => '/analytics/debts',
      transformResponse: (response: ApiResponse<DebtsAnalytics>) => {
        console.log('💳 [API] getDebtsAnalytics response:', response);

        if (response && response.data) {
          return response.data;
        }

        if (response && typeof response === 'object' && 'summary' in response) {
          return response as unknown as DebtsAnalytics;
        }

        console.warn('💳 [API] Invalid response, returning fallback data');
        return {
          summary: {
            totalCount: 0,
            activeCount: 0,
            paidCount: 0,
            totalInitialAmount: 0,
            totalCurrentAmount: 0,
            totalPayments: 0,
          },
          typeStats: [],
          upcomingPayments: [],
        };
      },
      providesTags: ['Analytics'],
    }),

    // Сводная аналитика для дашборда
    getDashboardAnalytics: builder.query<DashboardAnalytics, void>({
      query: () => '/analytics/dashboard',
      transformResponse: (response: ApiResponse<DashboardAnalytics>) => {
        console.log('📊 [API] getDashboardAnalytics response:', response);

        // Проверяем, что ответ содержит данные
        if (response && response.data) {
          return response.data;
        }

        // Если response является самими данными (без обертки)
        if (
          response &&
          typeof response === 'object' &&
          'accounts' in response
        ) {
          console.log('📊 [API] Response is direct data, using as is');
          return response as unknown as DashboardAnalytics;
        }

        // Фоллбэк с базовыми данными только если ответ действительно пустой
        console.warn(
          '📊 [API] Invalid response structure, returning fallback data'
        );
        return {
          accounts: { count: 0, totalBalance: 0 },
          monthStats: { income: 0, expense: 0, balance: 0 },
          subscriptions: { count: 0, monthlyAmount: 0 },
          debts: { count: 0, totalAmount: 0 },
          goals: { count: 0, totalTarget: 0, totalProgress: 0 },
        };
      },
      providesTags: ['Analytics'],
    }),

    // Экспорт данных аналитики
    exportAnalytics: builder.query<
      { data: Array<any> },
      { type: string; format?: string; startDate?: string; endDate?: string }
    >({
      query: params => ({
        url: '/analytics/export',
        params,
      }),
      transformResponse: (response: ApiResponse<{ data: Array<any> }>) => {
        return response.data || { data: [] };
      },
    }),
  }),
});

export const {
  useGetTransactionsAnalyticsQuery,
  useGetGoalsAnalyticsQuery,
  useGetDebtsAnalyticsQuery,
  useGetDashboardAnalyticsQuery,
  useExportAnalyticsQuery,
} = analyticsApi;

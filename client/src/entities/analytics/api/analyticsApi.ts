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
      providesTags: ['Analytics'],
    }),

    // Аналитика целей
    getGoalsAnalytics: builder.query<GoalsAnalytics, void>({
      query: () => '/analytics/goals',
      providesTags: ['Analytics'],
    }),

    // Аналитика долгов
    getDebtsAnalytics: builder.query<DebtsAnalytics, void>({
      query: () => '/analytics/debts',
      providesTags: ['Analytics'],
    }),

    // Сводная аналитика для дашборда
    getDashboardAnalytics: builder.query<DashboardAnalytics, void>({
      query: () => '/analytics/dashboard',
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

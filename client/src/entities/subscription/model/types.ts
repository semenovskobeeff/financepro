export type SubscriptionFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'archived';

export interface SubscriptionHistoryItem {
  id?: string;
  date: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  description?: string;
  transactionId?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  customFrequencyDays?: number;
  startDate: string;
  nextPaymentDate: string;
  endDate?: string;
  lastPaymentDate?: string;
  accountId: string;
  categoryId?: string;
  autoPayment: boolean;
  paymentHistory: SubscriptionHistoryItem[];
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsState {
  subscriptions: Subscription[];
  selectedSubscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  filters: {
    status?: SubscriptionStatus;
    frequency?: SubscriptionFrequency;
  };
}

export interface CreateSubscriptionRequest {
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: SubscriptionFrequency;
  customFrequencyDays?: number;
  startDate: Date;
  endDate?: Date | null;
  accountId: string;
  categoryId?: string;
  autoPayment: boolean;
}

export interface UpdateSubscriptionRequest {
  name?: string;
  description?: string;
  amount?: number;
  currency?: string;
  frequency?: SubscriptionFrequency;
  customFrequencyDays?: number;
  startDate?: Date;
  endDate?: Date | null;
  accountId?: string;
  categoryId?: string;
  autoPayment?: boolean;
}

export interface MakePaymentRequest {
  amount: number;
  description?: string;
}

export interface MakePaymentResponse {
  subscription: Subscription;
  payment: SubscriptionHistoryItem;
  transaction: {
    id: string;
    type: string;
    amount: number;
    date: string;
  };
  account: {
    id: string;
    balance: number;
  };
}

export interface SubscriptionStatsResponse {
  activeCount: number;
  pausedCount: number;
  totalMonthly: number;
  totalYearly: number;
  byCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }[];
  byCurrency: {
    currency: string;
    amount: number;
    count: number;
  }[];
}

export interface SubscriptionAnalyticsResponse {
  summary: {
    totalMonthly: number;
    totalYearly: number;
    activeCount: number;
    totalCount: number;
  };
  categoryStats: {
    categoryId: string | null;
    categoryName: string;
    categoryIcon: string;
    amount: number;
    count: number;
  }[];
  frequencyStats: {
    frequency: string;
    label: string;
    count: number;
    amount: number;
  }[];
  monthlyForecast: {
    month: string;
    year: string;
    totalAmount: number;
    subscriptionsDue: {
      id: string;
      name: string;
      amount: number;
    }[];
  }[];
  paymentHistory: {
    month: string;
    year: string;
    totalAmount: number;
    payments: {
      subscriptionId: string;
      subscriptionName: string;
      amount: number;
      date: string;
      month: string;
      year: string;
    }[];
  }[];
}

export type DebtType = 'credit' | 'loan' | 'creditCard' | 'personalDebt';
export type DebtStatus = 'active' | 'paid' | 'defaulted' | 'archived';
export type PaymentFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'custom';

export interface DebtHistoryItem {
  date: string;
  amount: number;
  description?: string;
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  type: DebtType;
  initialAmount: number;
  currentAmount: number;
  interestRate: number;
  startDate: string;
  endDate?: string;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  lenderName?: string;
  linkedAccountId?: string;
  paymentHistory: DebtHistoryItem[];
  paymentFrequency: PaymentFrequency;
  status: DebtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DebtsState {
  debts: Debt[];
  selectedDebt: Debt | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  filters: {
    status?: DebtStatus;
    type?: DebtType;
  };
}

export interface CreateDebtRequest {
  name: string;
  type: DebtType;
  initialAmount: number;
  interestRate?: number;
  startDate: string;
  endDate?: string;
  paymentFrequency?: PaymentFrequency;
  lenderName?: string;
  linkedAccountId?: string;
}

export interface UpdateDebtRequest {
  name?: string;
  lenderName?: string;
  interestRate?: number;
  endDate?: string;
  paymentFrequency?: PaymentFrequency;
  linkedAccountId?: string;
}

export interface MakePaymentRequest {
  amount: number;
  description?: string;
  accountId?: string;
}

export interface DebtStatsResponse {
  totalDebt: number;
  activeDebts: number;
  paidDebts: number;
  upcomingPayments: Debt[];
  byType: {
    credit: number;
    loan: number;
    creditCard: number;
    personalDebt: number;
  };
}

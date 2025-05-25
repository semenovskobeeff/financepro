export type AccountType =
  | 'bank'
  | 'deposit'
  | 'goal'
  | 'credit'
  | 'subscription';

export interface AccountHistoryItem {
  id?: string;
  operationType: 'income' | 'expense' | 'transfer';
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  date: string;
  description?: string;
  linkedAccountId?: string;
}

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  name: string;
  cardInfo?: string;
  balance: number;
  currency: string;
  status: 'active' | 'archived';
  history: AccountHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AccountsState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateAccountRequest {
  type: AccountType;
  name: string;
  cardInfo?: string;
  balance?: number;
  currency?: string;
}

export interface UpdateAccountRequest {
  name?: string;
  cardInfo?: string;
}

export interface TransferFundsRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  date?: string;
}

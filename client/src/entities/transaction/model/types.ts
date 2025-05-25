export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId?: string;
  sourceId?: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  description?: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TransactionsState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  filters: {
    type?: TransactionType;
    accountId?: string;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  };
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  categoryId?: string;
  accountId: string;
  toAccountId?: string;
  date?: string;
  description?: string;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  amount?: number;
  categoryId?: string;
  accountId?: string;
  toAccountId?: string;
  date?: string;
  description?: string;
}

export interface GetTransactionsRequest {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  type?: TransactionType;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'archived';
}

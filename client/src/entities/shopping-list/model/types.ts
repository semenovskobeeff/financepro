export type ShoppingListStatus = 'draft' | 'active' | 'completed' | 'cancelled';
export type Priority = 'low' | 'medium' | 'high';

export interface ShoppingListItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  priority: Priority;
  category: string;
  isPurchased: boolean;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  userId: string;
  name: string;
  description?: string;
  deadline?: string;
  totalBudget: number;
  spentAmount: number;
  status: ShoppingListStatus;
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingListsState {
  lists: ShoppingList[];
  selectedList: ShoppingList | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateShoppingListRequest {
  name: string;
  description?: string;
  deadline?: string;
  totalBudget: number;
}

export interface UpdateShoppingListRequest {
  name?: string;
  description?: string;
  deadline?: string;
  totalBudget?: number;
  status?: ShoppingListStatus;
}

export interface CreateShoppingListItemRequest {
  name: string;
  price: number;
  quantity: number;
  priority: Priority;
  category: string;
  notes?: string;
}

export interface UpdateShoppingListItemRequest {
  name?: string;
  price?: number;
  quantity?: number;
  priority?: Priority;
  category?: string;
  isPurchased?: boolean;
  notes?: string;
}

export interface ShoppingListStatistics {
  totalLists: number;
  activeLists: number;
  totalBudget: number;
  totalSpent: number;
  completionRate: number;
}

export type GoalStatus = 'active' | 'completed' | 'cancelled' | 'archived';

export interface TransferHistoryItem {
  amount: number;
  date: string;
  fromAccountId: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  accountId: string;
  targetAmount: number;
  deadline: string;
  progress: number;
  transferHistory: TransferHistoryItem[];
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateGoalRequest {
  name: string;
  accountId: string;
  targetAmount: number;
  deadline: string;
}

export interface UpdateGoalRequest {
  name?: string;
  targetAmount?: number;
  deadline?: string;
}

export interface TransferToGoalRequest {
  fromAccountId: string;
  amount: number;
}

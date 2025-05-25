import {
  mockAccounts,
  mockDebts,
  mockGoals,
  mockSubscriptions,
} from './mockData';

// Подсчет активных счетов
const activeAccounts = mockAccounts.filter(
  account => account.status === 'active'
);
const activeAccountsCount = activeAccounts.length;
const totalBalance = activeAccounts.reduce(
  (sum, account) => sum + account.balance,
  0
);

// Подсчет активных целей
const activeGoals = mockGoals.filter(goal => goal.status === 'active');
const activeGoalsCount = activeGoals.length;
const goalsTotalTarget = activeGoals.reduce(
  (sum, goal) => sum + goal.targetAmount,
  0
);
const goalsTotalProgress = activeGoals.reduce(
  (sum, goal) => sum + goal.progress,
  0
);

// Подсчет активных долгов
const activeDebts = mockDebts.filter(
  debt => debt.status === 'active' || debt.status === 'defaulted'
);
const activeDebtsCount = activeDebts.length;
const activeDebtsTotalAmount = activeDebts.reduce(
  (sum, debt) => sum + debt.currentAmount,
  0
);

// Подсчет активных подписок
const activeSubscriptions = mockSubscriptions.filter(
  sub => sub.status === 'active'
);
const activeSubscriptionsCount = activeSubscriptions.length;
const monthlySubscriptionAmount = activeSubscriptions.reduce((sum, sub) => {
  if (sub.frequency === 'monthly') return sum + sub.amount;
  if (sub.frequency === 'yearly') return sum + sub.amount / 12;
  if (sub.frequency === 'quarterly') return sum + sub.amount / 3;
  if (sub.frequency === 'weekly') return sum + sub.amount * 4.33;
  if (sub.frequency === 'biweekly') return sum + sub.amount * 2.17;
  return sum;
}, 0);

// Моковые данные для аналитики
export const mockAnalytics = {
  // Данные для дашборда
  dashboard: {
    accounts: {
      count: activeAccountsCount,
      totalBalance: totalBalance,
    },
    monthStats: {
      income: 435000,
      expense: 57500,
      balance: 377500,
    },
    subscriptions: {
      count: activeSubscriptionsCount,
      monthlyAmount: Math.round(monthlySubscriptionAmount),
    },
    debts: {
      count: activeDebtsCount,
      totalAmount: activeDebtsTotalAmount,
    },
    goals: {
      count: activeGoalsCount,
      totalTarget: goalsTotalTarget,
      totalProgress: goalsTotalProgress,
    },
  },

  // Данные для аналитики транзакций
  transactions: {
    month: {
      summary: {
        income: 435000,
        expense: 57500,
        transfer: 25000,
        balance: 377500,
      },
      categoryStats: {
        income: [
          {
            type: 'income',
            categoryId: 'category6',
            categoryName: 'Зарплата',
            categoryIcon: 'work',
            total: 420000,
            count: 2,
          },
          {
            type: 'income',
            categoryId: 'category8',
            categoryName: 'Подарки',
            categoryIcon: 'card_giftcard',
            total: 15000,
            count: 1,
          },
        ],
        expense: [
          {
            type: 'expense',
            categoryId: 'category5',
            categoryName: 'Жилье',
            categoryIcon: 'home',
            total: 25000,
            count: 1,
          },
          {
            type: 'expense',
            categoryId: 'category1',
            categoryName: 'Продукты',
            categoryIcon: 'shopping_cart',
            total: 15000,
            count: 2,
          },
          {
            type: 'expense',
            categoryId: 'category3',
            categoryName: 'Развлечения',
            categoryIcon: 'movie',
            total: 15000,
            count: 1,
          },
          {
            type: 'expense',
            categoryId: 'category4',
            categoryName: 'Рестораны',
            categoryIcon: 'restaurant',
            total: 2500,
            count: 1,
          },
        ],
      },
      timeStats: {
        income: [
          { date: '2023-12-01', amount: 420000 },
          { date: '2023-12-15', amount: 15000 },
        ],
        expense: [
          { date: '2023-12-02', amount: 15000 },
          { date: '2023-12-05', amount: 25000 },
          { date: '2023-12-07', amount: 5000 },
          { date: '2023-12-08', amount: 10000 },
          { date: '2023-12-10', amount: 2500 },
        ],
      },
      accounts: [
        {
          _id: 'account1',
          name: 'Основной счёт',
          type: 'bank',
          balance: 158500,
        },
        {
          _id: 'account2',
          name: 'Сберегательный счёт',
          type: 'bank',
          balance: 350000,
        },
        {
          _id: 'account3',
          name: 'Кредитная карта',
          type: 'credit',
          balance: -25000,
        },
        {
          _id: 'account4',
          name: 'Отпускной счёт',
          type: 'bank',
          balance: 75000,
        },
      ],
    },
    quarter: {
      summary: {
        income: 935000,
        expense: 157500,
        transfer: 75000,
        balance: 777500,
      },
      categoryStats: {
        income: [
          {
            type: 'income',
            categoryId: 'category6',
            categoryName: 'Зарплата',
            categoryIcon: 'work',
            total: 900000,
            count: 5,
          },
          {
            type: 'income',
            categoryId: 'category8',
            categoryName: 'Подарки',
            categoryIcon: 'card_giftcard',
            total: 35000,
            count: 2,
          },
        ],
        expense: [
          {
            type: 'expense',
            categoryId: 'category5',
            categoryName: 'Жилье',
            categoryIcon: 'home',
            total: 75000,
            count: 3,
          },
          {
            type: 'expense',
            categoryId: 'category1',
            categoryName: 'Продукты',
            categoryIcon: 'shopping_cart',
            total: 35000,
            count: 6,
          },
          {
            type: 'expense',
            categoryId: 'category3',
            categoryName: 'Развлечения',
            categoryIcon: 'movie',
            total: 35000,
            count: 3,
          },
          {
            type: 'expense',
            categoryId: 'category4',
            categoryName: 'Рестораны',
            categoryIcon: 'restaurant',
            total: 12500,
            count: 5,
          },
        ],
      },
      timeStats: {
        income: [
          { date: '2023-10-01', amount: 120000 },
          { date: '2023-10-15', amount: 15000 },
          { date: '2023-11-01', amount: 420000 },
          { date: '2023-11-15', amount: 5000 },
          { date: '2023-12-01', amount: 420000 },
          { date: '2023-12-15', amount: 15000 },
        ],
        expense: [
          { date: '2023-10-05', amount: 25000 },
          { date: '2023-10-07', amount: 5000 },
          { date: '2023-10-10', amount: 2500 },
          { date: '2023-11-05', amount: 25000 },
          { date: '2023-11-07', amount: 5000 },
          { date: '2023-11-10', amount: 7500 },
          { date: '2023-12-02', amount: 15000 },
          { date: '2023-12-05', amount: 25000 },
          { date: '2023-12-07', amount: 5000 },
          { date: '2023-12-08', amount: 10000 },
          { date: '2023-12-10', amount: 2500 },
        ],
      },
      accounts: [
        {
          _id: 'account1',
          name: 'Основной счёт',
          type: 'bank',
          balance: 158500,
        },
        {
          _id: 'account2',
          name: 'Сберегательный счёт',
          type: 'bank',
          balance: 350000,
        },
        {
          _id: 'account3',
          name: 'Кредитная карта',
          type: 'credit',
          balance: -25000,
        },
        {
          _id: 'account4',
          name: 'Отпускной счёт',
          type: 'bank',
          balance: 75000,
        },
      ],
    },
    year: {
      summary: {
        income: 2435000,
        expense: 857500,
        transfer: 175000,
        balance: 1577500,
      },
      categoryStats: {
        income: [
          {
            type: 'income',
            categoryId: 'category6',
            categoryName: 'Зарплата',
            categoryIcon: 'work',
            total: 2300000,
            count: 15,
          },
          {
            type: 'income',
            categoryId: 'category8',
            categoryName: 'Подарки',
            categoryIcon: 'card_giftcard',
            total: 85000,
            count: 4,
          },
          {
            type: 'income',
            categoryId: 'category7',
            categoryName: 'Подработка',
            categoryIcon: 'work_outline',
            total: 50000,
            count: 2,
          },
        ],
        expense: [
          {
            type: 'expense',
            categoryId: 'category5',
            categoryName: 'Жилье',
            categoryIcon: 'home',
            total: 300000,
            count: 12,
          },
          {
            type: 'expense',
            categoryId: 'category1',
            categoryName: 'Продукты',
            categoryIcon: 'shopping_cart',
            total: 200000,
            count: 50,
          },
          {
            type: 'expense',
            categoryId: 'category3',
            categoryName: 'Развлечения',
            categoryIcon: 'movie',
            total: 150000,
            count: 35,
          },
          {
            type: 'expense',
            categoryId: 'category4',
            categoryName: 'Рестораны',
            categoryIcon: 'restaurant',
            total: 120000,
            count: 40,
          },
          {
            type: 'expense',
            categoryId: 'category2',
            categoryName: 'Транспорт',
            categoryIcon: 'directions_car',
            total: 87500,
            count: 25,
          },
        ],
      },
      timeStats: {
        income: [
          { date: '2023-01', amount: 120000 },
          { date: '2023-02', amount: 140000 },
          { date: '2023-03', amount: 130000 },
          { date: '2023-04', amount: 125000 },
          { date: '2023-05', amount: 180000 },
          { date: '2023-06', amount: 125000 },
          { date: '2023-07', amount: 130000 },
          { date: '2023-08', amount: 135000 },
          { date: '2023-09', amount: 120000 },
          { date: '2023-10', amount: 145000 },
          { date: '2023-11', amount: 135000 },
          { date: '2023-12', amount: 435000 },
        ],
        expense: [
          { date: '2023-01', amount: 65000 },
          { date: '2023-02', amount: 72000 },
          { date: '2023-03', amount: 75000 },
          { date: '2023-04', amount: 65000 },
          { date: '2023-05', amount: 75000 },
          { date: '2023-06', amount: 65000 },
          { date: '2023-07', amount: 72000 },
          { date: '2023-08', amount: 80000 },
          { date: '2023-09', amount: 70000 },
          { date: '2023-10', amount: 65000 },
          { date: '2023-11', amount: 70000 },
          { date: '2023-12', amount: 57500 },
        ],
      },
      accounts: [
        {
          _id: 'account1',
          name: 'Основной счёт',
          type: 'bank',
          balance: 158500,
        },
        {
          _id: 'account2',
          name: 'Сберегательный счёт',
          type: 'bank',
          balance: 350000,
        },
        {
          _id: 'account3',
          name: 'Кредитная карта',
          type: 'credit',
          balance: -25000,
        },
        {
          _id: 'account4',
          name: 'Отпускной счёт',
          type: 'bank',
          balance: 75000,
        },
      ],
    },
  },

  // Данные для аналитики целей
  goals: {
    summary: {
      activeCount: 2,
      completedCount: 1,
      totalTargetAmount: 360000,
      totalProgress: 200000,
      averageProgress: 66.67,
      averageCompletion: 33.33,
    },
    goals: [
      {
        id: 'goal1',
        name: 'Отпуск в Испании',
        targetAmount: 150000,
        progress: 75000,
        progressPercent: 50,
        deadline: '2024-08-01',
      },
      {
        id: 'goal2',
        name: 'Новый ноутбук',
        targetAmount: 90000,
        progress: 90000,
        progressPercent: 100,
        deadline: '2024-04-15',
      },
      {
        id: 'goal3',
        name: 'Покупка iPhone',
        targetAmount: 120000,
        progress: 35000,
        progressPercent: 29.17,
        deadline: '2024-05-20',
      },
    ],
  },

  // Данные для аналитики долгов
  debts: {
    summary: {
      totalCount: 4,
      activeCount: 3,
      paidCount: 1,
      totalInitialAmount: 6265000,
      totalCurrentAmount: 5665000,
      totalPayments: 170000,
    },
    typeStats: [
      {
        type: 'credit',
        count: 2,
        totalInitial: 6200000,
        totalCurrent: 5400000,
        totalPaid: 120000,
        averageInterestRate: 9,
      },
      {
        type: 'creditCard',
        count: 1,
        totalInitial: 50000,
        totalCurrent: 25000,
        totalPaid: 35000,
        averageInterestRate: 19.9,
      },
      {
        type: 'personalDebt',
        count: 1,
        totalInitial: 15000,
        totalCurrent: 0,
        totalPaid: 15000,
        averageInterestRate: 0,
      },
    ],
    upcomingPayments: [
      {
        id: 'debt1',
        name: 'Ипотека',
        type: 'credit',
        nextPaymentDate: '2024-01-10',
        nextPaymentAmount: 35000,
        daysLeft: 10,
      },
      {
        id: 'debt2',
        name: 'Кредит на автомобиль',
        type: 'credit',
        nextPaymentDate: '2024-01-15',
        nextPaymentAmount: 25000,
        daysLeft: 15,
      },
      {
        id: 'debt4',
        name: 'Кредитная карта',
        type: 'creditCard',
        nextPaymentDate: '2024-01-05',
        nextPaymentAmount: 5000,
        daysLeft: 5,
      },
    ],
  },
};

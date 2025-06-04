// Пустые моковые данные для аналитики
export const emptyMockAnalytics = {
  // Данные для дашборда
  dashboard: {
    accounts: {
      count: 1,
      totalBalance: 0,
    },
    monthStats: {
      income: 0,
      expense: 0,
      balance: 0,
    },
    subscriptions: {
      count: 0,
      monthlyAmount: 0,
    },
    debts: {
      count: 0,
      totalAmount: 0,
    },
    goals: {
      count: 0,
      totalTarget: 0,
      totalProgress: 0,
    },
  },

  // Данные для аналитики транзакций
  transactions: {
    week: {
      summary: {
        income: 0,
        expense: 0,
        transfer: 0,
        balance: 0,
      },
      categoryStats: {
        income: [],
        expense: [],
      },
      timeStats: {
        income: [],
        expense: [],
      },
    },
    month: {
      summary: {
        income: 0,
        expense: 0,
        transfer: 0,
        balance: 0,
      },
      categoryStats: {
        income: [],
        expense: [],
      },
      timeStats: {
        income: [],
        expense: [],
      },
    },
    year: {
      summary: {
        income: 0,
        expense: 0,
        transfer: 0,
        balance: 0,
      },
      categoryStats: {
        income: [],
        expense: [],
      },
      timeStats: {
        income: [],
        expense: [],
      },
    },
  },

  // Пустые данные для аналитики целей
  goals: [],

  // Пустые данные для аналитики долгов
  debts: [],
};

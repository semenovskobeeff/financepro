// Пустые моковые данные для режима разработки без заполненных данных

// Моковые данные для аутентификации (остаются для входа)
export const emptyMockUsers = [
  {
    id: 'user1',
    email: 'test@example.com',
    password: 'password',
    name: 'Иван Петров',
    roles: ['user'],
    settings: {},
  },
];

// Пустые моковые данные для счетов (только один базовый счет)
export const emptyMockAccounts = [
  {
    id: 'account1',
    userId: 'user1',
    type: 'bank',
    name: 'Основной счёт',
    cardInfo: '•••• 4853',
    balance: 0,
    currency: 'RUB',
    status: 'active',
    history: [],
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
];

// Пустые моковые данные для категорий (только базовые категории)
export const emptyMockCategories = [
  {
    id: 'category1',
    userId: 'user1',
    name: 'Доходы',
    type: 'income',
    icon: 'work',
    status: 'active',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'category2',
    userId: 'user1',
    name: 'Расходы',
    type: 'expense',
    icon: 'shopping_basket',
    status: 'active',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
  },
];

// Пустые моковые данные для транзакций
export const emptyMockTransactions: any[] = [];

// Пустые моковые данные для целей
export const emptyMockGoals: any[] = [];

// Пустые моковые данные для долгов
export const emptyMockDebts: any[] = [];

// Пустые моковые данные для подписок
export const emptyMockSubscriptions: any[] = [];

// Пустые моковые данные для списков покупок
export const emptyMockShoppingLists = [];

// Профили тестовых данных для демонстрации различных сценариев

export interface TestDataProfile {
  name: string;
  description: string;
  userType: 'basic' | 'advanced' | 'business' | 'student';
  features: string[];
}

export const testDataProfiles: TestDataProfile[] = [
  {
    name: 'Базовый пользователь',
    description: 'Обычный пользователь с простыми финансовыми операциями',
    userType: 'basic',
    features: [
      'Несколько банковских счетов',
      'Основные категории доходов и расходов',
      'Простые транзакции',
      'Одна-две подписки',
      'Простые цели накоплений',
    ],
  },
  {
    name: 'Продвинутый пользователь',
    description: 'Пользователь с разнообразными финансовыми инструментами',
    userType: 'advanced',
    features: [
      'Множество счетов (банковские, депозиты, инвестиции)',
      'Широкий спектр категорий',
      'Сложные транзакции с переводами',
      'Несколько активных кредитов',
      'Множественные цели и подписки',
      'Детальная аналитика расходов',
    ],
  },
  {
    name: 'Бизнес пользователь',
    description: 'Руководитель с бизнес-операциями',
    userType: 'business',
    features: [
      'Премиальные счета',
      'Бизнес-категории (командировки, офис)',
      'Крупные транзакции',
      'Бизнес-кредиты',
      'Инвестиционные цели',
      'Корпоративные подписки',
    ],
  },
  {
    name: 'Студент',
    description: 'Студент с ограниченным бюджетом',
    userType: 'student',
    features: [
      'Студенческий счёт с небольшими суммами',
      'Категории для образования',
      'Стипендии и учебные расходы',
      'Образовательный кредит',
      'Скромные цели накоплений',
      'Студенческие скидки на подписки',
    ],
  },
];

// Функция для получения описания текущего режима данных
export const getCurrentDataMode = (): string => {
  if (typeof window === 'undefined') return 'Неизвестно';

  const useMocks = localStorage.getItem('useMocks') === 'true';
  const mockDataType = localStorage.getItem('mockDataType') || 'filled';

  if (!useMocks) {
    return 'Реальный API';
  }

  return mockDataType === 'filled'
    ? 'Тестовые данные (полные)'
    : 'Тестовые данные (пустые)';
};

// Функция для получения списка доступных тестовых аккаунтов
export const getTestAccounts = () => [
  {
    email: 'test@example.com',
    password: 'password',
    profile: 'Базовый пользователь',
    description: 'Иван Петров - обычный пользователь с базовым набором данных',
  },
  {
    email: 'admin@example.com',
    password: 'admin123',
    profile: 'Бизнес пользователь',
    description: 'Анна Администратор - руководитель с бизнес-операциями',
  },
  {
    email: 'demo@example.com',
    password: 'demo123',
    profile: 'Студент',
    description: 'Демо Пользователь - студент с ограниченным бюджетом',
  },
];

// Статистика по тестовым данным
export const getTestDataStats = () => ({
  users: 3,
  accounts: 8,
  categories: 17,
  transactions: 25, // Обновлено: исправлены дублированные ID
  goals: 7,
  debts: 8,
  subscriptions: 10,
  shoppingLists: 5,
});

// Функция для проверки готовности тестовых данных
export const validateTestData = () => {
  const stats = getTestDataStats();
  const issues: string[] = [];

  if (stats.users < 2) issues.push('Недостаточно тестовых пользователей');
  if (stats.accounts < 5) issues.push('Недостаточно тестовых счетов');
  if (stats.transactions < 10) issues.push('Недостаточно тестовых транзакций');

  return {
    isValid: issues.length === 0,
    issues,
    stats,
  };
};

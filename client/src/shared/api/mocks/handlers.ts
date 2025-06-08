import { http, HttpResponse, delay } from 'msw';
import {
  mockUsers,
  mockAccounts,
  mockTransactions,
  mockCategories,
  mockGoals,
  mockDebts,
  mockSubscriptions,
  mockShoppingLists,
} from './mockData';
import {
  emptyMockUsers,
  emptyMockAccounts,
  emptyMockTransactions,
  emptyMockCategories,
  emptyMockGoals,
  emptyMockDebts,
  emptyMockSubscriptions,
  emptyMockShoppingLists,
} from './emptyMockData';
import { mockAnalytics } from './mockAnalytics';
import { emptyMockAnalytics } from './emptyMockAnalytics';
import { config } from '../../../config/environment';

// Функция для получения соответствующих данных в зависимости от настроек
// Читаем настройки каждый раз заново, чтобы поддерживать динамическое переключение
const getMockData = () => {
  // Принудительно перечитываем настройки из localStorage при каждом запросе
  let currentMockDataType: 'filled' | 'empty' = 'filled';

  if (typeof window !== 'undefined') {
    const storedType = localStorage.getItem('mockDataType');
    if (storedType === 'empty' || storedType === 'filled') {
      currentMockDataType = storedType;
    }
  }

  const isEmptyMode = currentMockDataType === 'empty';

  console.log(
    `[MSW] Используется режим данных: ${currentMockDataType} (empty: ${isEmptyMode})`
  );

  return {
    users: isEmptyMode ? emptyMockUsers : mockUsers,
    accounts: isEmptyMode ? emptyMockAccounts : mockAccounts,
    transactions: isEmptyMode ? emptyMockTransactions : mockTransactions,
    categories: isEmptyMode ? emptyMockCategories : mockCategories,
    goals: isEmptyMode ? emptyMockGoals : mockGoals,
    debts: isEmptyMode ? emptyMockDebts : mockDebts,
    subscriptions: isEmptyMode ? emptyMockSubscriptions : mockSubscriptions,
    shoppingLists: isEmptyMode ? emptyMockShoppingLists : mockShoppingLists,
    analytics: isEmptyMode ? emptyMockAnalytics : mockAnalytics,
  };
};

// Токен для имитации JWT
const generateToken = (user: any) => `fake-jwt-token-${user.id}`;

// Обработчики MSW http
export const handlers = [
  // ===================== АВТОРИЗАЦИЯ =====================

  // Вход в систему
  http.post('/api/users/login', async ({ request }) => {
    await delay(500);
    const { email, password } = (await request.json()) as any as any;
    const { users } = getMockData();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return new HttpResponse(
        JSON.stringify({
          message: 'Неверный email или пароль',
        }),
        { status: 401 }
      );
    }

    return HttpResponse.json({
      user: { ...user, password: undefined },
      token: generateToken(user),
    });
  }),

  // Регистрация
  http.post('/api/users/register', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any as any;
    const { email } = data;
    const { users } = getMockData();

    if (users.some(u => u.email === email)) {
      return new HttpResponse(
        JSON.stringify({
          message: 'Пользователь с таким email уже существует',
        }),
        { status: 409 }
      );
    }

    const newUser = {
      id: `user${users.length + 1}`,
      ...data,
      roles: ['user'],
      settings: {},
      isActive: true,
    };

    users.push(newUser);

    return HttpResponse.json({
      user: { ...newUser, password: undefined },
      token: generateToken(newUser),
    });
  }),

  // Получение профиля
  http.get('/api/users/profile', async ({ request }) => {
    await delay(300);
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Отсутствует токен авторизации' }),
        { status: 401 }
      );
    }

    // Имитируем получение пользователя из токена
    const user = mockUsers[0]; // Для простоты берем первого пользователя

    return HttpResponse.json({ ...user, password: undefined });
  }),

  // Выход из системы
  http.post('/api/users/logout', async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Успешный выход' });
  }),

  // Восстановление пароля
  http.post('/api/users/forgot-password', async ({ request }) => {
    await delay(800);

    try {
      const { email } = (await request.json()) as any;

      // Проверяем валидность email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new HttpResponse(
          JSON.stringify({
            message: 'Введите корректный email адрес',
            errors: [
              { field: 'email', message: 'Введите корректный email адрес' },
            ],
          }),
          { status: 400 }
        );
      }

      console.log('[MSW] Запрос на восстановление пароля для:', email);

      // Имитируем успешный запрос восстановления
      // В реальном приложении здесь проверялось бы существование пользователя
      // и отправлялось письмо, но для моков всегда возвращаем успех

      return HttpResponse.json({
        message:
          'Если ваш email зарегистрирован, вы получите письмо для сброса пароля.',
      });
    } catch (error) {
      console.error('[MSW] Ошибка в forgot-password:', error);
      return new HttpResponse(
        JSON.stringify({
          message: 'Ошибка при обработке запроса',
        }),
        { status: 500 }
      );
    }
  }),

  // Сброс пароля
  http.post('/api/users/reset-password', async ({ request }) => {
    await delay(800);

    try {
      const { token, password } = (await request.json()) as any;

      // Валидация токена
      if (!token || token.length !== 40) {
        return new HttpResponse(
          JSON.stringify({
            message:
              'Токен для сброса пароля недействителен, истек или уже был использован.',
            errors: [{ field: 'token', message: 'Неверный формат токена' }],
          }),
          { status: 400 }
        );
      }

      // Валидация пароля
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!password || password.length < 8 || !passwordRegex.test(password)) {
        return new HttpResponse(
          JSON.stringify({
            message:
              'Пароль должен содержать минимум 8 символов, включая: строчную букву, заглавную букву, цифру и специальный символ',
            errors: [
              {
                field: 'password',
                message:
                  'Пароль должен содержать: строчную букву, заглавную букву, цифру и специальный символ',
              },
            ],
          }),
          { status: 400 }
        );
      }

      console.log('[MSW] Сброс пароля с токеном:', token);

      // Имитируем успешный сброс пароля
      // В реальном приложении здесь обновлялся бы пароль пользователя

      return HttpResponse.json({
        message: 'Пароль успешно сброшен.',
      });
    } catch (error) {
      console.error('[MSW] Ошибка в reset-password:', error);
      return new HttpResponse(
        JSON.stringify({
          message: 'Ошибка при сбросе пароля',
        }),
        { status: 500 }
      );
    }
  }),

  // ===================== АККАУНТЫ =====================

  // Получение счетов
  http.get('/api/accounts', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const { accounts } = getMockData();

    let filteredAccounts = [...accounts];
    if (status) {
      filteredAccounts = filteredAccounts.filter(
        account => account.status === status
      );
    }

    return HttpResponse.json(filteredAccounts);
  }),

  // Получение счета по ID
  http.get('/api/accounts/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const { accounts } = getMockData();
    const account = accounts.find(a => a.id === id);

    if (!account) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(account);
  }),

  // Создание нового счета
  http.post('/api/accounts', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any as any;

    const newAccount = {
      id: `account${mockAccounts.length + 1}`,
      userId: 'user1',
      ...data,
      balance: data.balance || 0,
      currency: data.currency || 'RUB',
      status: 'active',
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAccounts.push(newAccount);
    return HttpResponse.json(newAccount, { status: 201 });
  }),

  // Обновление счета
  http.put('/api/accounts/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const accountIndex = mockAccounts.findIndex(a => a.id === id);

    if (accountIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any as any;
    console.log('Mock: Update data received:', data);

    // Валидация данных
    if (!data?.name || data.name.trim().length === 0) {
      console.log('Mock: Validation failed - name is required');
      return new HttpResponse(
        JSON.stringify({ message: 'Название счета обязательно' }),
        { status: 400 }
      );
    }

    const updatedAccount = {
      ...mockAccounts[accountIndex],
      ...data,
      name: data.name.trim(),
      updatedAt: new Date().toISOString(),
    };

    mockAccounts[accountIndex] = updatedAccount;
    console.log('Mock: Account updated successfully:', updatedAccount);

    return HttpResponse.json(updatedAccount);
  }),

  // Архивация счета
  http.put('/api/accounts/:id/archive', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const accountIndex = mockAccounts.findIndex(a => a.id === id);

    if (accountIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockAccounts[accountIndex] = {
      ...mockAccounts[accountIndex],
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Восстановление счета
  http.put('/api/accounts/:id/restore', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const accountIndex = mockAccounts.findIndex(a => a.id === id);

    if (accountIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockAccounts[accountIndex] = {
      ...mockAccounts[accountIndex],
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Перевод между счетами
  http.post('/api/accounts/transfer', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any as any;
    const { fromAccountId, toAccountId, amount, description } = data;

    const fromIndex = mockAccounts.findIndex(a => a.id === fromAccountId);
    const toIndex = mockAccounts.findIndex(a => a.id === toAccountId);

    if (fromIndex === -1 || toIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // Проверка баланса
    if (mockAccounts[fromIndex].balance < amount) {
      return new HttpResponse(
        JSON.stringify({
          message: 'Недостаточно средств на счете',
        }),
        { status: 400 }
      );
    }

    // Обновляем балансы счетов
    mockAccounts[fromIndex].balance -= amount;
    mockAccounts[toIndex].balance += amount;

    // Добавляем записи в историю операций
    const now = new Date().toISOString();

    mockAccounts[fromIndex].history.push({
      operationType: 'expense',
      amount: amount,
      date: now,
      description: description || 'Перевод средств',
      linkedAccountId: toAccountId,
    });

    mockAccounts[toIndex].history.push({
      operationType: 'income',
      amount: amount,
      date: now,
      description: description || 'Перевод средств',
      linkedAccountId: fromAccountId,
    });

    // Обновляем даты
    mockAccounts[fromIndex].updatedAt = now;
    mockAccounts[toIndex].updatedAt = now;

    return HttpResponse.json({
      fromAccount: mockAccounts[fromIndex],
      toAccount: mockAccounts[toIndex],
    });
  }),

  // Получение истории счета
  http.get('/api/accounts/:id/history', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const account = mockAccounts.find(a => a.id === id);

    if (!account) {
      return new HttpResponse(null, { status: 404 });
    }

    // Добавляем логирование для отладки
    console.log(
      'История счета получена:',
      account.id,
      account.history.length,
      'записей'
    );
    console.log('Пример операции:', account.history[0]);

    return HttpResponse.json(account.history);
  }),

  // ===================== КАТЕГОРИИ =====================

  // Получение категорий
  http.get('/api/categories', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const type = url.searchParams.get('type');

    let filteredCategories = [...mockCategories];

    if (status) {
      filteredCategories = filteredCategories.filter(
        cat => cat.status === status
      );
    }

    if (type) {
      filteredCategories = filteredCategories.filter(cat => cat.type === type);
    }

    return HttpResponse.json(filteredCategories);
  }),

  // Получение категории по ID
  http.get('/api/categories/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const category = mockCategories.find(c => c.id === id);

    if (!category) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(category);
  }),

  // Создание новой категории
  http.post('/api/categories', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any as any;

    const newCategory = {
      id: `category${mockCategories.length + 1}`,
      userId: 'user1',
      ...data,
      icon: data?.icon || 'category',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCategories.push(newCategory);
    return HttpResponse.json(newCategory, { status: 201 });
  }),

  // Обновление категории
  http.put('/api/categories/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const categoryIndex = mockCategories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any as any;

    const updatedCategory = {
      ...mockCategories[categoryIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockCategories[categoryIndex] = updatedCategory;
    return HttpResponse.json(updatedCategory);
  }),

  // Архивация категории
  http.put('/api/categories/:id/archive', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const categoryIndex = mockCategories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockCategories[categoryIndex] = {
      ...mockCategories[categoryIndex],
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Восстановление категории
  http.put('/api/categories/:id/restore', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const categoryIndex = mockCategories.findIndex(c => c.id === id);

    if (categoryIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockCategories[categoryIndex] = {
      ...mockCategories[categoryIndex],
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // ===================== ТРАНЗАКЦИИ =====================

  // Получение транзакций
  http.get('/api/transactions', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';
    const type = url.searchParams.get('type');
    const accountId = url.searchParams.get('accountId');
    const categoryId = url.searchParams.get('categoryId');
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    console.log('[MSW] Запрос транзакций:', {
      status,
      type,
      accountId,
      categoryId,
      page,
      limit,
    });
    console.log(
      '[MSW] Всего транзакций в mock данных:',
      mockTransactions.length
    );

    let filteredTransactions = [...mockTransactions];

    if (status) {
      filteredTransactions = filteredTransactions.filter(
        t => t.status === status
      );
    }

    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }

    if (accountId) {
      filteredTransactions = filteredTransactions.filter(
        t => t.accountId === accountId
      );
    }

    if (categoryId) {
      filteredTransactions = filteredTransactions.filter(
        t => t.categoryId === categoryId
      );
    }

    // Сортировка по дате (новые сначала)
    filteredTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(
      startIndex,
      endIndex
    );

    console.log(
      '[MSW] После фильтрации транзакций:',
      filteredTransactions.length
    );
    console.log('[MSW] Отправляем транзакции:', paginatedTransactions.length);

    return HttpResponse.json({
      transactions: paginatedTransactions,
      totalPages: Math.ceil(filteredTransactions.length / limit),
      currentPage: page,
      total: filteredTransactions.length,
    });
  }),

  // Создание новой транзакции
  http.post('/api/transactions', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any as any;

    const newTransaction = {
      id: `transaction${mockTransactions.length + 1}`,
      userId: 'user1',
      ...data,
      date: data?.date || new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Обновляем баланс аккаунта
    const accountIndex = mockAccounts.findIndex(a => a.id === data?.accountId);
    if (accountIndex !== -1) {
      const amount = data?.amount || 0;
      if (data.type === 'income') {
        mockAccounts[accountIndex].balance += amount;
      } else if (data.type === 'expense') {
        mockAccounts[accountIndex].balance -= amount;
      }

      // Добавляем в историю счета
      mockAccounts[accountIndex].history.push({
        operationType: data.type,
        amount: amount,
        date: newTransaction.date,
        description: data.description || '',
      });
    }

    mockTransactions.push(newTransaction);
    return HttpResponse.json(newTransaction, { status: 201 });
  }),

  // Обновление транзакции
  http.put('/api/transactions/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const transactionIndex = mockTransactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any as any;
    const oldTransaction = mockTransactions[transactionIndex];

    // Восстанавливаем старый баланс
    const oldAccountIndex = mockAccounts.findIndex(
      a => a.id === oldTransaction.accountId
    );
    if (oldAccountIndex !== -1) {
      if (oldTransaction.type === 'income') {
        mockAccounts[oldAccountIndex].balance -= oldTransaction.amount;
      } else if (oldTransaction.type === 'expense') {
        mockAccounts[oldAccountIndex].balance += oldTransaction.amount;
      }
    }

    // Обновляем транзакцию
    mockTransactions[transactionIndex] = {
      ...oldTransaction,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updatedTransaction = mockTransactions[transactionIndex];

    // Применяем новый баланс
    const newAccountIndex = mockAccounts.findIndex(
      a => a.id === updatedTransaction.accountId
    );
    if (newAccountIndex !== -1) {
      if (updatedTransaction.type === 'income') {
        mockAccounts[newAccountIndex].balance += updatedTransaction.amount;
      } else if (updatedTransaction.type === 'expense') {
        mockAccounts[newAccountIndex].balance -= updatedTransaction.amount;
      }

      // Обновляем историю счета
      mockAccounts[newAccountIndex].history.push({
        operationType: updatedTransaction.type,
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        description: updatedTransaction.description || 'Обновленная операция',
      });
    }

    return HttpResponse.json({
      status: 'success',
      data: updatedTransaction,
    });
  }),

  // Архивация транзакции
  http.put('/api/transactions/:id/archive', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const transactionIndex = mockTransactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockTransactions[transactionIndex] = {
      ...mockTransactions[transactionIndex],
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Восстановление транзакции
  http.put('/api/transactions/:id/restore', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const transactionIndex = mockTransactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockTransactions[transactionIndex] = {
      ...mockTransactions[transactionIndex],
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Удаление транзакции
  http.delete('/api/transactions/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const transactionIndex = mockTransactions.findIndex(t => t.id === id);

    if (transactionIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    // Удаляем транзакцию из массива
    mockTransactions.splice(transactionIndex, 1);

    return HttpResponse.json({ message: 'Транзакция удалена' });
  }),

  // ===================== ЦЕЛИ =====================

  // Получение целей
  http.get('/api/goals', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');

    let filteredGoals = [...mockGoals];
    if (status) {
      filteredGoals = filteredGoals.filter(goal => goal.status === status);
    }

    return HttpResponse.json(filteredGoals);
  }),

  // Получение цели по ID
  http.get('/api/goals/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const goal = mockGoals.find(g => g.id === id);

    if (!goal) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(goal);
  }),

  // Создание новой цели
  http.post('/api/goals', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any as any;

    const newGoal = {
      id: `goal${mockGoals.length + 1}`,
      userId: 'user1',
      ...data,
      progress: 0,
      transferHistory: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockGoals.push(newGoal);
    return HttpResponse.json(newGoal, { status: 201 });
  }),

  // Обновление цели
  http.put('/api/goals/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const goalIndex = mockGoals.findIndex(g => g.id === id);

    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any as any;
    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(mockGoals[goalIndex]);
  }),

  // Архивация цели
  http.put('/api/goals/:id/archive', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const goalIndex = mockGoals.findIndex(g => g.id === id);

    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      status: 'archived',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Восстановление цели
  http.put('/api/goals/:id/restore', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const goalIndex = mockGoals.findIndex(g => g.id === id);

    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      status: 'active',
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ success: true });
  }),

  // Перевод на цель
  http.post('/api/goals/:id/transfer', async ({ params, request }) => {
    await delay(700);
    const { id } = params;
    const goalIndex = mockGoals.findIndex(g => g.id === id);

    if (goalIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any;
    const { fromAccountId, amount } = data;

    // Обновляем прогресс цели
    mockGoals[goalIndex].progress += amount;

    // Добавляем запись в историю переводов
    mockGoals[goalIndex].transferHistory.push({
      amount,
      date: new Date().toISOString(),
      fromAccountId,
    });

    // Обновляем статус цели если достигнута
    if (mockGoals[goalIndex].progress >= mockGoals[goalIndex].targetAmount) {
      mockGoals[goalIndex].status = 'completed';
    }

    mockGoals[goalIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json(mockGoals[goalIndex]);
  }),

  // ===================== ДОЛГИ =====================

  // Получение долгов
  http.get('/api/debts', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');

    // Все долги
    const { debts } = getMockData();
    const allDebts = [...debts];

    // Отфильтрованные долги
    let result;

    // Фильтрация по статусу
    if (status === 'active') {
      // Только активные
      result = allDebts.filter(debt => debt.status === 'active');
    } else if (status === 'archived') {
      // Только архивные
      result = allDebts.filter(debt => debt.status === 'archived');
    } else {
      // Без фильтра - все долги
      result = allDebts;
    }

    // Фильтрация по типу, если указан
    if (type) {
      result = result.filter(debt => debt.type === type);
    }

    return HttpResponse.json(result);
  }),

  // Получение предстоящих платежей по долгам (ВАЖНО: должен быть ПЕРЕД /api/debts/:id)
  http.get('/api/debts/upcoming', async ({ request }) => {
    await delay(500);
    console.log('[MSW] GET /api/debts/upcoming - запрос получен');

    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days')) || 7;
    console.log('[MSW] Ищем платежи на ближайшие', days, 'дней');

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    const { debts } = getMockData();
    const upcomingDebtPayments = debts
      .filter(debt => debt.status === 'active')
      .filter(debt => debt.nextPaymentDate)
      .filter(debt => {
        const nextPaymentDate = new Date(debt.nextPaymentDate!);
        return nextPaymentDate >= currentDate && nextPaymentDate <= futureDate;
      })
      .map(debt => {
        const nextPaymentDate = new Date(debt.nextPaymentDate!);
        const daysLeft = Math.round(
          (nextPaymentDate.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          id: debt.id,
          name: debt.name,
          type: debt.type,
          nextPaymentDate: debt.nextPaymentDate,
          nextPaymentAmount: debt.nextPaymentAmount || 0,
          currentAmount: debt.currentAmount,
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    console.log('[MSW] Найдено платежей:', upcomingDebtPayments.length);
    return HttpResponse.json({ data: upcomingDebtPayments });
  }),

  // Получение долга по ID
  http.get('/api/debts/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const { debts } = getMockData();
    const debt = debts.find(d => d.id === id);

    if (!debt) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(debt);
  }),

  // Создание нового долга
  http.post('/api/debts', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any;

    const { debts } = getMockData();
    const newDebt = {
      id: `debt${debts.length + 1}`,
      userId: 'user1',
      ...data,
      currentAmount: data.initialAmount,
      paymentHistory: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    debts.push(newDebt);
    return HttpResponse.json(newDebt, { status: 201 });
  }),

  // Платеж по долгу
  http.post('/api/debts/:id/payment', async ({ params, request }) => {
    await delay(700);
    const { id } = params;
    const { debts } = getMockData();
    const debtIndex = debts.findIndex(d => d.id === id);

    if (debtIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any;
    const { amount, description } = data;

    // Обновляем сумму долга
    debts[debtIndex].currentAmount -= amount;

    // Добавляем запись в историю платежей
    debts[debtIndex].paymentHistory.push({
      date: new Date().toISOString(),
      amount,
      description: description || 'Платеж по долгу',
    });

    // Обновляем статус долга если полностью погашен
    if (debts[debtIndex].currentAmount <= 0) {
      debts[debtIndex].status = 'paid';
    }

    debts[debtIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json(debts[debtIndex]);
  }),

  // ===================== ПОДПИСКИ =====================

  // Получение подписок
  http.get('/api/subscriptions', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const frequency = url.searchParams.get('frequency');
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    console.log('Запрос подписок с параметром status:', status);

    let filteredSubscriptions = [...mockSubscriptions];

    if (status) {
      // Поддержка нескольких статусов через запятую
      if (status.includes(',')) {
        const statusArray = status.split(',').map(s => s.trim());
        console.log('Фильтрация по нескольким статусам:', statusArray);
        filteredSubscriptions = filteredSubscriptions.filter(sub =>
          statusArray.includes(sub.status)
        );
      } else {
        filteredSubscriptions = filteredSubscriptions.filter(
          sub => sub.status === status
        );
      }
    }

    if (frequency) {
      filteredSubscriptions = filteredSubscriptions.filter(
        sub => sub.frequency === frequency
      );
    }

    console.log(`Найдено подписок: ${filteredSubscriptions.length}`);

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = filteredSubscriptions.slice(
      startIndex,
      endIndex
    );

    return HttpResponse.json({
      subscriptions: paginatedSubscriptions,
      pagination: {
        total: filteredSubscriptions.length,
        totalPages: Math.ceil(filteredSubscriptions.length / limit),
        currentPage: page,
        limit,
      },
    });
  }),

  // Получение предстоящих платежей
  http.get('/api/subscriptions/upcoming', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days')) || 7;

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + days);

    const upcomingPayments = mockSubscriptions
      .filter(sub => sub.status === 'active')
      .filter(sub => {
        const nextPaymentDate = new Date(sub.nextPaymentDate);
        return nextPaymentDate >= currentDate && nextPaymentDate <= futureDate;
      })
      .map(sub => {
        const nextPaymentDate = new Date(sub.nextPaymentDate);
        const daysLeft = Math.round(
          (nextPaymentDate.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          id: sub.id,
          name: sub.name,
          nextPaymentDate: sub.nextPaymentDate,
          nextPaymentAmount: sub.amount,
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return HttpResponse.json(upcomingPayments);
  }),

  // Получение статистики подписок
  http.get('/api/subscriptions/stats', async ({ request }) => {
    console.log('API: статистика подписок запрошена');
    await delay(500);

    // Получаем активные подписки
    const activeSubscriptions = mockSubscriptions.filter(
      sub => sub.status === 'active'
    );

    // Получаем приостановленные подписки
    const pausedSubscriptions = mockSubscriptions.filter(
      sub => sub.status === 'paused'
    );

    // Рассчитываем ежемесячную сумму платежей
    const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
      if (sub.frequency === 'monthly') return sum + sub.amount;
      if (sub.frequency === 'yearly') return sum + sub.amount / 12;
      if (sub.frequency === 'quarterly') return sum + sub.amount / 3;
      if (sub.frequency === 'weekly') return sum + sub.amount * 4.33;
      if (sub.frequency === 'biweekly') return sum + sub.amount * 2.17;
      return sum;
    }, 0);

    // Рассчитываем годовую сумму
    const totalYearly = totalMonthly * 12;

    // Группировка по категориям
    const categories = {};
    activeSubscriptions.forEach(sub => {
      const categoryId = sub.categoryId || 'uncategorized';
      if (!categories[categoryId]) {
        categories[categoryId] = {
          categoryId,
          categoryName:
            categoryId === 'uncategorized' ? 'Без категории' : categoryId,
          amount: 0,
          count: 0,
        };
      }
      categories[categoryId].amount += sub.amount;
      categories[categoryId].count += 1;
    });

    // Группировка по валютам
    const currencies = {};
    activeSubscriptions.forEach(sub => {
      const currency = sub.currency || 'RUB';
      if (!currencies[currency]) {
        currencies[currency] = {
          currency,
          amount: 0,
          count: 0,
        };
      }
      currencies[currency].amount += sub.amount;
      currencies[currency].count += 1;
    });

    const result = {
      activeCount: activeSubscriptions.length,
      pausedCount: pausedSubscriptions.length,
      totalMonthly,
      totalYearly,
      byCategory: Object.values(categories),
      byCurrency: Object.values(currencies),
    };

    console.log('API: Отправляем статистику подписок:', result);
    return HttpResponse.json(result);
  }),

  // Получение подписки по ID
  http.get('/api/subscriptions/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const subscription = mockSubscriptions.find(s => s.id === id);

    if (!subscription) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(subscription);
  }),

  // ===================== АНАЛИТИКА =====================

  // Получение аналитики дашборда
  http.get('/api/analytics/dashboard', async () => {
    await delay(700);

    // ВАЖНО: Всегда возвращаем заполненные данные для дашборда
    // независимо от настройки mockDataType, чтобы показать функциональность
    console.log('Mock: Returning filled analytics data for dashboard');

    const filledDashboardData = {
      accounts: {
        count: 3,
        totalBalance: 558500,
      },
      monthStats: {
        income: 435000,
        expense: 400000,
        balance: 35000,
      },
      subscriptions: {
        count: 4,
        monthlyAmount: 2500,
      },
      debts: {
        count: 2,
        totalAmount: 60000,
      },
      goals: {
        count: 3,
        totalTarget: 1500000,
        totalProgress: 850000,
      },
    };

    const apiResponse = {
      data: filledDashboardData,
    };

    console.log('Mock: Dashboard analytics response:', apiResponse);
    return HttpResponse.json(apiResponse);
  }),

  // Получение аналитики транзакций
  http.get('/api/analytics/transactions', async ({ request }) => {
    await delay(700);
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';

    console.log('Mock: Analytics request for period:', period);

    // ВАЖНО: Всегда используем заполненные данные для демонстрации функциональности
    const analyticsData =
      mockAnalytics.transactions[
        period as keyof typeof mockAnalytics.transactions
      ];

    if (!analyticsData) {
      console.warn(
        'Mock: No analytics data for period:',
        period,
        'falling back to month'
      );
      const fallbackData = mockAnalytics.transactions.month;
      console.log('Mock: Returning fallback data:', fallbackData);
      const apiResponse = {
        data: fallbackData,
      };
      return HttpResponse.json(apiResponse);
    }

    console.log(
      'Mock: Returning filled analytics data for period:',
      period,
      analyticsData
    );
    const apiResponse = {
      data: analyticsData,
    };
    return HttpResponse.json(apiResponse);
  }),

  // Получение аналитики целей
  http.get('/api/analytics/goals', async () => {
    await delay(700);
    // ВАЖНО: Всегда используем заполненные данные для демонстрации функциональности
    console.log('Mock: Returning filled goals analytics data');
    const apiResponse = {
      data: mockAnalytics.goals,
    };
    return HttpResponse.json(apiResponse);
  }),

  // Получение аналитики долгов
  http.get('/api/analytics/debts', async () => {
    await delay(700);
    // ВАЖНО: Всегда используем заполненные данные для демонстрации функциональности
    console.log('Mock: Returning filled debts analytics data');
    const apiResponse = {
      data: mockAnalytics.debts,
    };
    return HttpResponse.json(apiResponse);
  }),

  // ===================== АРХИВ =====================

  // Получение статистики архива
  http.get('/api/archive/stats', async () => {
    await delay(500);

    // Подсчет архивных элементов по типам
    const archivedAccounts = mockAccounts.filter(
      a => a.status === 'archived'
    ).length;
    const archivedCategories = mockCategories.filter(
      c => c.status === 'archived'
    ).length;
    const archivedGoals = mockGoals.filter(g => g.status === 'archived').length;
    const archivedDebts = mockDebts.filter(d => d.status === 'archived').length;
    const archivedSubscriptions = mockSubscriptions.filter(
      s => s.status === 'archived'
    ).length;

    const total =
      archivedAccounts +
      archivedCategories +
      archivedGoals +
      archivedDebts +
      archivedSubscriptions;

    // Определение самого старого элемента в архиве
    const allArchivedItems = [
      ...mockAccounts.filter(a => a.status === 'archived'),
      ...mockCategories.filter(c => c.status === 'archived'),
      ...mockGoals.filter(g => g.status === 'archived'),
      ...mockDebts.filter(d => d.status === 'archived'),
      ...mockSubscriptions.filter(s => s.status === 'archived'),
    ];

    const oldestDate =
      allArchivedItems.length > 0
        ? new Date(
            Math.min(
              ...allArchivedItems.map(item =>
                new Date(item.updatedAt).getTime()
              )
            )
          ).toISOString()
        : null;

    return HttpResponse.json({
      total,
      byType: {
        accounts: archivedAccounts,
        categories: archivedCategories,
        goals: archivedGoals,
        debts: archivedDebts,
        subscriptions: archivedSubscriptions,
      },
      oldestDate,
    });
  }),

  // Получение архивированных элементов по типу
  http.get('/api/archive/:type', async ({ params, request }) => {
    await delay(500);
    const { type } = params;
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;
    const search = url.searchParams.get('search') || '';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let archivedItems: any[] = [];

    // Получаем архивные элементы в зависимости от типа
    if (type === 'accounts') {
      const accounts = mockAccounts
        .filter(a => a.status === 'archived')
        .map(item => ({ ...item, itemType: 'accounts' }));
      archivedItems = [...archivedItems, ...accounts];
    }

    if (type === 'categories') {
      const categories = mockCategories
        .filter(c => c.status === 'archived')
        .map(item => ({ ...item, itemType: 'categories' }));
      archivedItems = [...archivedItems, ...categories];
    }

    if (type === 'goals') {
      const goals = mockGoals
        .filter(g => g.status === 'archived')
        .map(item => ({ ...item, itemType: 'goals' }));
      archivedItems = [...archivedItems, ...goals];
    }

    if (type === 'debts') {
      const debts = mockDebts
        .filter(d => d.status === 'archived')
        .map(item => ({ ...item, itemType: 'debts' }));
      archivedItems = [...archivedItems, ...debts];
    }

    if (type === 'subscriptions') {
      const subscriptions = mockSubscriptions
        .filter(s => s.status === 'archived')
        .map(item => ({ ...item, itemType: 'subscriptions' }));
      archivedItems = [...archivedItems, ...subscriptions];
    }

    // Фильтр по поисковому запросу
    if (search) {
      const searchLower = search.toLowerCase();

      archivedItems = archivedItems.filter(item => {
        // Стандартный поиск по имени и описанию
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Фильтр по датам
    if (startDate) {
      const startDateObj = new Date(startDate);
      archivedItems = archivedItems.filter(
        item => new Date(item.updatedAt) >= startDateObj
      );
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999); // Конец дня
      archivedItems = archivedItems.filter(
        item => new Date(item.updatedAt) <= endDateObj
      );
    }

    // Сортировка по дате архивации (новые сначала)
    archivedItems.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = archivedItems.slice(startIndex, endIndex);

    return HttpResponse.json({
      items: paginatedItems,
      pagination: {
        total: archivedItems.length,
        page,
        totalPages: Math.ceil(archivedItems.length / limit),
        limit,
      },
    });
  }),

  // Восстановление из архива
  http.patch('/api/archive/:type/:id/restore', async ({ params }) => {
    await delay(700);
    const { type, id } = params;
    let restoredItem: any = null;

    // Восстанавливаем элемент в зависимости от типа
    if (type === 'accounts') {
      const index = mockAccounts.findIndex(
        a => a.id === id && a.status === 'archived'
      );
      if (index !== -1) {
        mockAccounts[index].status = 'active';
        mockAccounts[index].updatedAt = new Date().toISOString();
        restoredItem = mockAccounts[index];
      }
    } else if (type === 'categories') {
      const index = mockCategories.findIndex(
        c => c.id === id && c.status === 'archived'
      );
      if (index !== -1) {
        mockCategories[index].status = 'active';
        mockCategories[index].updatedAt = new Date().toISOString();
        restoredItem = mockCategories[index];
      }
    } else if (type === 'goals') {
      const index = mockGoals.findIndex(
        g => g.id === id && g.status === 'archived'
      );
      if (index !== -1) {
        mockGoals[index].status = 'active';
        mockGoals[index].updatedAt = new Date().toISOString();
        restoredItem = mockGoals[index];
      }
    } else if (type === 'debts') {
      const index = mockDebts.findIndex(
        d => d.id === id && d.status === 'archived'
      );
      if (index !== -1) {
        mockDebts[index].status = 'active';
        mockDebts[index].updatedAt = new Date().toISOString();
        restoredItem = mockDebts[index];
      }
    } else if (type === 'subscriptions') {
      const index = mockSubscriptions.findIndex(
        s => s.id === id && s.status === 'archived'
      );
      if (index !== -1) {
        mockSubscriptions[index].status = 'active';
        mockSubscriptions[index].updatedAt = new Date().toISOString();
        restoredItem = mockSubscriptions[index];
      }
    }

    if (!restoredItem) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      message: 'Элемент успешно восстановлен из архива',
      item: restoredItem,
    });
  }),

  // Удаление из архива
  http.delete('/api/archive/:type/:id', async ({ params }) => {
    await delay(700);
    const { type, id } = params;
    let deletedItem: any = null;

    // Удаляем элемент в зависимости от типа, но сохраняем его ссылки в других объектах
    // с пометкой "(в архиве)"
    if (type === 'accounts') {
      const index = mockAccounts.findIndex(
        a => a.id === id && a.status === 'archived'
      );
      if (index !== -1) {
        deletedItem = { ...mockAccounts[index] };

        // Обрабатываем ссылки на этот счет в транзакциях
        mockTransactions.forEach((transaction: any) => {
          if (transaction.accountId === id) {
            transaction.accountName = `${deletedItem.name} (в архиве)`;
          }
          // Добавляем обработку для toAccountId, который используется в переводах
          if (transaction.toAccountId === id) {
            transaction.toAccountName = `${deletedItem.name} (в архиве)`;
          }
        });

        // Обрабатываем ссылки в истории целей
        mockGoals.forEach(goal => {
          goal.transferHistory.forEach((transfer: any) => {
            if (transfer.fromAccountId === id) {
              transfer.fromAccountName = `${deletedItem.name} (в архиве)`;
            }
          });
        });

        // Удаляем счет
        mockAccounts.splice(index, 1);
      }
    } else if (type === 'categories') {
      const index = mockCategories.findIndex(
        c => c.id === id && c.status === 'archived'
      );
      if (index !== -1) {
        deletedItem = { ...mockCategories[index] };

        // Обрабатываем ссылки на эту категорию в транзакциях
        mockTransactions.forEach((transaction: any) => {
          if (transaction.categoryId === id) {
            transaction.categoryName = `${deletedItem.name} (в архиве)`;
          }
        });

        mockCategories.splice(index, 1);
      }
    } else if (type === 'goals') {
      const index = mockGoals.findIndex(
        g => g.id === id && g.status === 'archived'
      );
      if (index !== -1) {
        deletedItem = { ...mockGoals[index] };
        mockGoals.splice(index, 1);
      }
    } else if (type === 'debts') {
      const index = mockDebts.findIndex(
        d => d.id === id && d.status === 'archived'
      );
      if (index !== -1) {
        deletedItem = { ...mockDebts[index] };
        mockDebts.splice(index, 1);
      }
    } else if (type === 'subscriptions') {
      const index = mockSubscriptions.findIndex(
        s => s.id === id && s.status === 'archived'
      );
      if (index !== -1) {
        deletedItem = { ...mockSubscriptions[index] };
        mockSubscriptions.splice(index, 1);
      }
    }

    if (!deletedItem) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({
      message: 'Элемент успешно удален из архива',
    });
  }),

  // ===================== СПИСКИ ПОКУПОК =====================

  // Получение всех списков покупок
  http.get('/api/shopping-lists', async ({ request }) => {
    await delay(500);
    const { shoppingLists } = getMockData();
    return HttpResponse.json({ data: shoppingLists });
  }),

  // Получение статистики списков покупок (ДОЛЖНО БЫТЬ ВЫШЕ /:id)
  http.get('/api/shopping-lists/statistics', async ({ request }) => {
    await delay(300);
    const { shoppingLists } = getMockData();

    const activeLists = shoppingLists.filter(
      (list: any) => list.status === 'active'
    );
    const totalBudget = shoppingLists.reduce(
      (sum: number, list: any) => sum + list.totalBudget,
      0
    );
    const totalSpent = shoppingLists.reduce(
      (sum: number, list: any) => sum + list.spentAmount,
      0
    );

    const totalItems = shoppingLists.reduce(
      (sum: number, list: any) => sum + list.items.length,
      0
    );
    const purchasedItems = shoppingLists.reduce(
      (sum: number, list: any) =>
        sum + list.items.filter((item: any) => item.isPurchased).length,
      0
    );
    const completionRate =
      totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

    const statistics = {
      totalLists: shoppingLists.length,
      activeLists: activeLists.length,
      totalBudget,
      totalSpent,
      completionRate,
    };

    return HttpResponse.json({ data: statistics });
  }),

  // Получение конкретного списка покупок
  http.get('/api/shopping-lists/:id', async ({ params }) => {
    await delay(300);
    const { id } = params;
    const { shoppingLists } = getMockData();
    const list = shoppingLists.find((l: any) => l.id === id);

    if (!list) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json({ data: list });
  }),

  // Создание нового списка покупок
  http.post('/api/shopping-lists', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any;
    const { shoppingLists } = getMockData();

    const newList = {
      id: `list${Date.now()}`,
      userId: 'user1',
      name: data.name,
      description: data.description || '',
      deadline: data.deadline,
      totalBudget: data.totalBudget,
      spentAmount: 0,
      status: 'draft',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    shoppingLists.push(newList);
    return HttpResponse.json({ data: newList }, { status: 201 });
  }),

  // Обновление списка покупок
  http.put('/api/shopping-lists/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const data = (await request.json()) as any;
    const { shoppingLists } = getMockData();

    const listIndex = shoppingLists.findIndex((l: any) => l.id === id);
    if (listIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    shoppingLists[listIndex] = {
      ...shoppingLists[listIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({ data: shoppingLists[listIndex] });
  }),

  // Удаление списка покупок
  http.delete('/api/shopping-lists/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const { shoppingLists } = getMockData();

    const listIndex = shoppingLists.findIndex((l: any) => l.id === id);
    if (listIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    shoppingLists.splice(listIndex, 1);
    return HttpResponse.json({ message: 'Список покупок удален' });
  }),

  // Добавление товара в список
  http.post(
    '/api/shopping-lists/:listId/items',
    async ({ params, request }) => {
      await delay(500);
      const { listId } = params;
      const data = (await request.json()) as any;
      const { shoppingLists } = getMockData();

      const listIndex = shoppingLists.findIndex((l: any) => l.id === listId);
      if (listIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const newItem = {
        id: `item${Date.now()}`,
        name: data.name,
        price: data.price,
        quantity: data.quantity,
        priority: data.priority || 'medium',
        category: data.category || '',
        isPurchased: false,
        notes: data.notes || '',
      };

      shoppingLists[listIndex].items.push(newItem);
      shoppingLists[listIndex].updatedAt = new Date().toISOString();

      return HttpResponse.json({ data: shoppingLists[listIndex] });
    }
  ),

  // Обновление товара в списке
  http.put(
    '/api/shopping-lists/:listId/items/:itemId',
    async ({ params, request }) => {
      await delay(500);
      const { listId, itemId } = params;
      const data = (await request.json()) as any;
      const { shoppingLists } = getMockData();

      const listIndex = shoppingLists.findIndex((l: any) => l.id === listId);
      if (listIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const itemIndex = shoppingLists[listIndex].items.findIndex(
        (i: any) => i.id === itemId
      );
      if (itemIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      shoppingLists[listIndex].items[itemIndex] = {
        ...shoppingLists[listIndex].items[itemIndex],
        ...data,
      };

      // Пересчитываем потраченную сумму
      const spentAmount = shoppingLists[listIndex].items
        .filter((item: any) => item.isPurchased)
        .reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        );

      shoppingLists[listIndex].spentAmount = spentAmount;
      shoppingLists[listIndex].updatedAt = new Date().toISOString();

      return HttpResponse.json({ data: shoppingLists[listIndex] });
    }
  ),

  // Удаление товара из списка
  http.delete(
    '/api/shopping-lists/:listId/items/:itemId',
    async ({ params }) => {
      await delay(500);
      const { listId, itemId } = params;
      const { shoppingLists } = getMockData();

      const listIndex = shoppingLists.findIndex((l: any) => l.id === listId);
      if (listIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      const itemIndex = shoppingLists[listIndex].items.findIndex(
        (i: any) => i.id === itemId
      );
      if (itemIndex === -1) {
        return new HttpResponse(null, { status: 404 });
      }

      shoppingLists[listIndex].items.splice(itemIndex, 1);

      // Пересчитываем потраченную сумму
      const spentAmount = shoppingLists[listIndex].items
        .filter((item: any) => item.isPurchased)
        .reduce(
          (sum: number, item: any) => sum + item.price * item.quantity,
          0
        );

      shoppingLists[listIndex].spentAmount = spentAmount;
      shoppingLists[listIndex].updatedAt = new Date().toISOString();

      return HttpResponse.json({ data: shoppingLists[listIndex] });
    }
  ),
];

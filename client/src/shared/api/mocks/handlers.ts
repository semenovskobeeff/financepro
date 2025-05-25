import { http, HttpResponse, delay } from 'msw';
import {
  mockUsers,
  mockAccounts,
  mockTransactions,
  mockCategories,
  mockGoals,
  mockDebts,
  mockSubscriptions,
} from './mockData';
import { mockAnalytics } from './mockAnalytics';

// Токен для имитации JWT
const generateToken = (user: any) => `fake-jwt-token-${user.id}`;

// Обработчики MSW http
export const handlers = [
  // ===================== АВТОРИЗАЦИЯ =====================

  // Вход в систему
  http.post('/api/users/login', async ({ request }) => {
    await delay(500);
    const { email, password } = (await request.json()) as any as any;
    const user = mockUsers.find(
      u => u.email === email && u.password === password
    );

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

    if (mockUsers.some(u => u.email === email)) {
      return new HttpResponse(
        JSON.stringify({
          message: 'Пользователь с таким email уже существует',
        }),
        { status: 409 }
      );
    }

    const newUser = {
      id: `user${mockUsers.length + 1}`,
      ...data,
      roles: ['user'],
      settings: {},
      isActive: true,
    };

    mockUsers.push(newUser);

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

  // ===================== АККАУНТЫ =====================

  // Получение счетов
  http.get('/api/accounts', async ({ request }) => {
    await delay(500);
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'active';

    let filteredAccounts = [...mockAccounts];
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
    const account = mockAccounts.find(a => a.id === id);

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
  http.patch('/api/transactions/:id', async ({ params, request }) => {
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

    return HttpResponse.json(updatedTransaction);
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
    const allDebts = [...mockDebts];

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

    const upcomingDebtPayments = mockDebts
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
    const debt = mockDebts.find(d => d.id === id);

    if (!debt) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(debt);
  }),

  // Создание нового долга
  http.post('/api/debts', async ({ request }) => {
    await delay(700);
    const data = (await request.json()) as any;

    const newDebt = {
      id: `debt${mockDebts.length + 1}`,
      userId: 'user1',
      ...data,
      currentAmount: data.initialAmount,
      paymentHistory: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockDebts.push(newDebt);
    return HttpResponse.json(newDebt, { status: 201 });
  }),

  // Платеж по долгу
  http.post('/api/debts/:id/payment', async ({ params, request }) => {
    await delay(700);
    const { id } = params;
    const debtIndex = mockDebts.findIndex(d => d.id === id);

    if (debtIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const data = (await request.json()) as any;
    const { amount, description } = data;

    // Обновляем сумму долга
    mockDebts[debtIndex].currentAmount -= amount;

    // Добавляем запись в историю платежей
    mockDebts[debtIndex].paymentHistory.push({
      date: new Date().toISOString(),
      amount,
      description: description || 'Платеж по долгу',
    });

    // Обновляем статус долга если полностью погашен
    if (mockDebts[debtIndex].currentAmount <= 0) {
      mockDebts[debtIndex].status = 'paid';
    }

    mockDebts[debtIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json(mockDebts[debtIndex]);
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
    return HttpResponse.json(mockAnalytics.dashboard);
  }),

  // Получение аналитики транзакций
  http.get('/api/analytics/transactions', async ({ request }) => {
    await delay(700);
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'month';
    return HttpResponse.json(
      mockAnalytics.transactions[period] || mockAnalytics.transactions.month
    );
  }),

  // Получение аналитики целей
  http.get('/api/analytics/goals', async () => {
    await delay(700);
    return HttpResponse.json(mockAnalytics.goals);
  }),

  // Получение аналитики долгов
  http.get('/api/analytics/debts', async () => {
    await delay(700);
    return HttpResponse.json(mockAnalytics.debts);
  }),

  // ===================== АРХИВ =====================

  // Получение статистики архива
  http.get('/api/archive/stats', async () => {
    await delay(500);

    // Подсчет архивных элементов по типам
    const archivedAccounts = mockAccounts.filter(
      a => a.status === 'archived'
    ).length;
    const archivedTransactions = mockTransactions.filter(
      t => t.status === 'archived'
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
      archivedTransactions +
      archivedCategories +
      archivedGoals +
      archivedDebts +
      archivedSubscriptions;

    // Определение самого старого элемента в архиве
    const allArchivedItems = [
      ...mockAccounts.filter(a => a.status === 'archived'),
      ...mockTransactions.filter(t => t.status === 'archived'),
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
        transactions: archivedTransactions,
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
    if (type === 'accounts' || type === 'all') {
      const accounts = mockAccounts
        .filter(a => a.status === 'archived')
        .map(item => ({ ...item, itemType: 'accounts' }));
      archivedItems = [...archivedItems, ...accounts];
    }

    if (type === 'transactions' || type === 'all') {
      const transactions = mockTransactions
        .filter(t => t.status === 'archived')
        .map(item => ({ ...item, itemType: 'transactions' }));
      archivedItems = [...archivedItems, ...transactions];
    }

    if (type === 'categories' || type === 'all') {
      const categories = mockCategories
        .filter(c => c.status === 'archived')
        .map(item => ({ ...item, itemType: 'categories' }));
      archivedItems = [...archivedItems, ...categories];
    }

    if (type === 'goals' || type === 'all') {
      const goals = mockGoals
        .filter(g => g.status === 'archived')
        .map(item => ({ ...item, itemType: 'goals' }));
      archivedItems = [...archivedItems, ...goals];
    }

    if (type === 'debts' || type === 'all') {
      const debts = mockDebts
        .filter(d => d.status === 'archived')
        .map(item => ({ ...item, itemType: 'debts' }));
      archivedItems = [...archivedItems, ...debts];
    }

    if (type === 'subscriptions' || type === 'all') {
      const subscriptions = mockSubscriptions
        .filter(s => s.status === 'archived')
        .map(item => ({ ...item, itemType: 'subscriptions' }));
      archivedItems = [...archivedItems, ...subscriptions];
    }

    // Фильтр по поисковому запросу
    if (search) {
      const searchLower = search.toLowerCase();

      // Проверяем, есть ли фильтр по типу транзакции в формате type:income
      const typeFilter = search.match(/type:([a-z]+)/);

      archivedItems = archivedItems.filter(item => {
        // Применяем фильтр по типу транзакции, если он есть
        if (typeFilter && item.itemType === 'transactions') {
          const requestedType = typeFilter[1];

          // Если ищем переводы
          if (requestedType === 'transfer') {
            const isTransfer =
              item.type === 'transfer' ||
              !!item.toAccountId ||
              (item.description &&
                (item.description.toLowerCase().includes('перевод') ||
                  item.description.toLowerCase().includes('transfer') ||
                  item.description.toLowerCase().includes('на счет') ||
                  item.description.toLowerCase().includes('со счета')));

            if (!isTransfer) {
              return false;
            }
          }
          // Для других типов просто проверяем тип
          else if (item.type !== requestedType) {
            return false;
          }
        }

        // Стандартный поиск по имени и описанию
        return (
          item.name?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          search.includes(`type:${item.type}`) // Поиск по типу
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
    } else if (type === 'transactions') {
      const index = mockTransactions.findIndex(
        t => t.id === id && t.status === 'archived'
      );
      if (index !== -1) {
        mockTransactions[index].status = 'active';
        mockTransactions[index].updatedAt = new Date().toISOString();
        restoredItem = mockTransactions[index];
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
    } else if (type === 'transactions') {
      const index = mockTransactions.findIndex(
        t => t.id === id && t.status === 'archived'
      );
      if (index !== -1) {
        deletedItem = { ...mockTransactions[index] };
        mockTransactions.splice(index, 1);
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
];

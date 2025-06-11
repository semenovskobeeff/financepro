const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Импортируем модели
const User = require('../../domain/entities/User');
const Account = require('../../domain/entities/Account');
const Category = require('../../domain/entities/Category');
const Transaction = require('../../domain/entities/Transaction');
const Goal = require('../../domain/entities/Goal');
const Debt = require('../../domain/entities/Debt');
const Subscription = require('../../domain/entities/Subscription');

/**
 * Скрипт для заполнения базы данных начальными данными
 */
class DatabaseSeeder {
  constructor() {
    this.testUserId = null;
  }

  async seedDatabase() {
    try {
      console.log('🌱 Начинаем заполнение базы данных...');

      // Проверяем, есть ли уже данные
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        console.log('📊 База данных уже содержит пользователей');
        console.log('🔄 Проверяем полноту тестовых данных...');
        return await this.ensureTestDataCompleteness();
      }

      // Создаем тестового пользователя
      await this.createTestUser();

      // Создаем категории по умолчанию
      await this.createDefaultCategories();

      // Создаем тестовые счета
      await this.createTestAccounts();

      // Создаем тестовые транзакции
      await this.createTestTransactions();

      // Создаем тестовые цели
      await this.createTestGoals();

      // Создаем тестовые долги
      await this.createTestDebts();

      // Создаем тестовые подписки
      await this.createTestSubscriptions();

      // Создаем архивированные данные
      await this.createArchivedData();

      console.log('✅ База данных успешно заполнена тестовыми данными');
      return await this.getTestUser();
    } catch (error) {
      console.error('❌ Ошибка при заполнении БД:', error);
      throw error;
    }
  }

  async ensureTestDataCompleteness() {
    try {
      // Находим тестового пользователя
      const testUser = await User.findOne({ email: 'test@example.com' });
      if (!testUser) {
        console.log('❌ Тестовый пользователь не найден, создаем заново...');
        return await this.recreateAllTestData();
      }

      this.testUserId = testUser._id;
      console.log(`✅ Найден тестовый пользователь: ${testUser.email}`);

      // Проверяем количество данных по каждой сущности
      const [
        accountsCount,
        categoriesCount,
        transactionsCount,
        goalsCount,
        debtsCount,
        subscriptionsCount,
      ] = await Promise.all([
        Account.countDocuments({ userId: this.testUserId }),
        Category.countDocuments({ userId: this.testUserId }),
        Transaction.countDocuments({ userId: this.testUserId }),
        Goal.countDocuments({ userId: this.testUserId }),
        Debt.countDocuments({ userId: this.testUserId }),
        Subscription.countDocuments({ userId: this.testUserId }),
      ]);

      console.log('📊 Текущее состояние данных:');
      console.log(`   Счета: ${accountsCount}`);
      console.log(`   Категории: ${categoriesCount}`);
      console.log(`   Транзакции: ${transactionsCount}`);
      console.log(`   Цели: ${goalsCount}`);
      console.log(`   Долги: ${debtsCount}`);
      console.log(`   Подписки: ${subscriptionsCount}`);

      // Определяем минимальные требования для полноты данных
      const requirements = {
        accounts: 4, // Основной, сберегательный, кредитный, отпускной
        categories: 10, // Минимум категорий
        transactions: 50, // Транзакции за 3 месяца
        goals: 3, // 3 цели
        debts: 3, // 3 долга
        subscriptions: 4, // 4 подписки
      };

      // Проверяем, нужно ли дополнять данные
      const needsUpdate =
        accountsCount < requirements.accounts ||
        categoriesCount < requirements.categories ||
        transactionsCount < requirements.transactions ||
        goalsCount < requirements.goals ||
        debtsCount < requirements.debts ||
        subscriptionsCount < requirements.subscriptions;

      if (needsUpdate) {
        console.log('⚠️ Данные неполные, обновляем...');
        return await this.recreateAllTestData();
      } else {
        console.log('✅ Все тестовые данные присутствуют в полном объеме');
        return { userId: this.testUserId };
      }
    } catch (error) {
      console.error('❌ Ошибка при проверке полноты данных:', error);
      return await this.recreateAllTestData();
    }
  }

  async recreateAllTestData() {
    console.log('🔄 Пересоздание всех тестовых данных...');

    try {
      // Удаляем все данные тестового пользователя
      await this.clearTestUserData();

      // Создаем тестового пользователя заново
      await this.createTestUser();

      // Создаем все данные с нуля
      await this.createDefaultCategories();
      await this.createTestAccounts();
      await this.createTestTransactions();
      await this.createTestGoals();
      await this.createTestDebts();
      await this.createTestSubscriptions();
      await this.createArchivedData();

      console.log('✅ Все тестовые данные успешно пересозданы');
      return { userId: this.testUserId };
    } catch (error) {
      console.error('❌ Ошибка при пересоздании данных:', error);
      throw error;
    }
  }

  async clearTestUserData() {
    console.log('🧹 Очистка данных тестового пользователя...');

    // Находим тестового пользователя
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('ℹ️ Тестовый пользователь не найден');
      return;
    }

    const testUserId = testUser._id;

    // Удаляем все связанные данные
    await Promise.all([
      Account.deleteMany({ userId: testUserId }),
      Category.deleteMany({ userId: testUserId }),
      Transaction.deleteMany({ userId: testUserId }),
      Goal.deleteMany({ userId: testUserId }),
      Debt.deleteMany({ userId: testUserId }),
      Subscription.deleteMany({ userId: testUserId }),
      User.deleteOne({ _id: testUserId }),
    ]);

    console.log('✅ Данные тестового пользователя очищены');
  }

  async createTestUser() {
    console.log('👤 Создание тестового пользователя...');

    const testUser = new User({
      email: 'test@example.com',
      password: 'password', // Будет захеширован в pre-save middleware
      name: 'Иван Тестовый',
      roles: ['user'],
      settings: {
        currency: 'RUB',
        language: 'ru',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          dataSharing: false,
          analytics: true,
        },
      },
    });

    await testUser.save();
    this.testUserId = testUser._id;
    console.log(`✅ Создан тестовый пользователь: ${testUser.email}`);
  }

  async getTestUser() {
    if (!this.testUserId) {
      const user = await User.findOne({ email: 'test@example.com' });
      this.testUserId = user ? user._id : null;
    }
    return { userId: this.testUserId };
  }

  async createDefaultCategories() {
    console.log('📂 Создание категорий по умолчанию...');

    await Category.createDefaultCategories(this.testUserId);
    console.log('✅ Созданы категории по умолчанию');
  }

  async createTestAccounts() {
    console.log('🏦 Создание тестовых счетов...');

    const accounts = [
      {
        userId: this.testUserId,
        name: 'Основной счёт',
        type: 'bank',
        balance: 158500,
        currency: 'RUB',
        cardNumber: '4276 1234 5678 4853',
        bankName: 'Сбербанк',
        status: 'active',
        isDefault: true,
      },
      {
        userId: this.testUserId,
        name: 'Сберегательный счёт',
        type: 'deposit',
        balance: 256000,
        currency: 'RUB',
        bankName: 'ВТБ',
        interestRate: 5.5,
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Кредитная карта',
        type: 'credit',
        balance: -15800,
        currency: 'RUB',
        cardNumber: '5536 1234 5678 2376',
        bankName: 'Альфа-Банк',
        creditLimit: 100000,
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Отпускной счёт',
        type: 'bank',
        balance: 75000,
        currency: 'RUB',
        bankName: 'Тинькофф',
        status: 'active',
      },
    ];

    const createdAccounts = await Account.insertMany(accounts);
    console.log(`✅ Создано ${createdAccounts.length} тестовых счетов`);
    return createdAccounts;
  }

  async createTestTransactions() {
    console.log('💰 Создание тестовых транзакций...');

    // Получаем созданные счета и категории
    const accounts = await Account.find({ userId: this.testUserId }).limit(4);
    const categories = await Category.find({ userId: this.testUserId });

    const incomeCategories = categories.filter(c => c.type === 'income');
    const expenseCategories = categories.filter(c => c.type === 'expense');

    const transactions = [];
    const today = new Date();

    // Создаем транзакции за последние 90 дней для большей полноты
    for (let i = 1; i <= 90; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      // Убеждаемся, что дата не в будущем
      if (date > today) continue;

      // Случайные доходы (реже)
      if (Math.random() < 0.25) {
        const category =
          incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
        transactions.push({
          userId: this.testUserId,
          type: 'income',
          amount: Math.floor(Math.random() * 50000) + 5000,
          categoryId: category._id,
          accountId: accounts[0]._id,
          date: date,
          description: `Доход - ${category.name}`,
          status: 'active',
          location: undefined, // Убираем геолокацию
        });
      }

      // Случайные расходы (чаще)
      if (Math.random() < 0.8) {
        const category =
          expenseCategories[
            Math.floor(Math.random() * expenseCategories.length)
          ];
        transactions.push({
          userId: this.testUserId,
          type: 'expense',
          amount: Math.floor(Math.random() * 15000) + 500,
          categoryId: category._id,
          accountId: accounts[Math.floor(Math.random() * 2)]._id, // Основной или сберегательный
          date: date,
          description: `Расход - ${category.name}`,
          status: 'active',
          location: undefined, // Убираем геолокацию
        });
      }

      // Случайные переводы (редко)
      if (Math.random() < 0.1 && accounts.length > 1) {
        transactions.push({
          userId: this.testUserId,
          type: 'transfer',
          amount: Math.floor(Math.random() * 20000) + 1000,
          accountId: accounts[0]._id,
          toAccountId:
            accounts[Math.floor(Math.random() * (accounts.length - 1)) + 1]._id,
          date: date,
          description: 'Перевод между счетами',
          status: 'active',
          location: undefined, // Убираем геолокацию
        });
      }
    }

    // Добавляем несколько крупных транзакций
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    transactions.push(
      {
        userId: this.testUserId,
        type: 'income',
        amount: 120000,
        categoryId:
          incomeCategories.find(c => c.name === 'Зарплата')?._id ||
          incomeCategories[0]._id,
        accountId: accounts[0]._id,
        date: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
        description: 'Зарплата за месяц',
        status: 'active',
        location: undefined, // Убираем геолокацию
      },
      {
        userId: this.testUserId,
        type: 'income',
        amount: 300000,
        categoryId:
          incomeCategories.find(c => c.name === 'Бонусы')?._id ||
          incomeCategories[0]._id,
        accountId: accounts[1]._id,
        date: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 15),
        description: 'Годовой бонус',
        status: 'active',
        location: undefined, // Убираем геолокацию
      }
    );

    // Создаем транзакции по одной, чтобы избежать проблем с геолокацией
    const createdTransactions = [];
    for (const transactionData of transactions) {
      try {
        // Убираем поле location полностью и все ненужные поля
        const cleanData = {
          userId: transactionData.userId,
          type: transactionData.type,
          amount: transactionData.amount,
          categoryId: transactionData.categoryId,
          accountId: transactionData.accountId,
          toAccountId: transactionData.toAccountId,
          date: transactionData.date,
          description: transactionData.description,
          status: transactionData.status,
        };

        const transaction = new Transaction(cleanData);
        const saved = await transaction.save();
        createdTransactions.push(saved);
      } catch (error) {
        console.log(`⚠️ Ошибка создания транзакции: ${error.message}`);
      }
    }
    console.log(`✅ Создано ${createdTransactions.length} тестовых транзакций`);
  }

  async createTestGoals() {
    console.log('🎯 Создание тестовых целей...');

    const accounts = await Account.find({ userId: this.testUserId });

    const goals = [
      {
        userId: this.testUserId,
        name: 'Отпуск в Таиланде',
        description: 'Поездка на 2 недели в Пхукет',
        accountId:
          accounts.find(a => a.name === 'Отпускной счёт')?._id ||
          accounts[0]._id,
        targetAmount: 120000,
        deadline: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // через 5 месяцев
        progress: 57000,
        priority: 'high',
        category: 'travel',
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Новый ноутбук',
        description: 'MacBook Pro для работы',
        accountId: accounts[1]._id,
        targetAmount: 180000,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // через 3 месяца
        progress: 45000,
        priority: 'medium',
        category: 'purchase',
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Экстренный фонд',
        description: 'Резерв на 6 месяцев расходов',
        accountId: accounts[1]._id,
        targetAmount: 500000,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // через год
        progress: 150000,
        priority: 'urgent',
        category: 'emergency',
        status: 'active',
      },
    ];

    // Добавляем историю переводов для первой цели
    goals[0].transferHistory = [
      {
        amount: 25000,
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        fromAccountId: accounts[0]._id,
        description: 'Первоначальный взнос',
      },
      {
        amount: 20000,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        fromAccountId: accounts[0]._id,
        description: 'Месячное пополнение',
      },
      {
        amount: 12000,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        fromAccountId: accounts[0]._id,
        description: 'Дополнительное пополнение',
      },
    ];

    const createdGoals = await Goal.insertMany(goals);
    console.log(`✅ Создано ${createdGoals.length} тестовых целей`);
  }

  async createTestDebts() {
    console.log('💳 Создание тестовых долгов...');

    const accounts = await Account.find({ userId: this.testUserId });

    const debts = [
      {
        userId: this.testUserId,
        name: 'Ипотека',
        type: 'mortgage',
        initialAmount: 3000000,
        currentAmount: 2856000,
        interestRate: 9.5,
        startDate: new Date(2023, 1, 15),
        endDate: new Date(2043, 1, 15),
        nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        nextPaymentAmount: 35000,
        lenderName: 'Сбербанк',
        linkedAccountId: accounts[0]._id,
        paymentFrequency: 'monthly',
        contractNumber: 'MB-123456789',
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Автокредит',
        type: 'loan',
        initialAmount: 1200000,
        currentAmount: 850000,
        interestRate: 12.5,
        startDate: new Date(2022, 9, 15),
        endDate: new Date(2027, 9, 15),
        nextPaymentDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        nextPaymentAmount: 25000,
        lenderName: 'ВТБ',
        linkedAccountId: accounts[0]._id,
        paymentFrequency: 'monthly',
        contractNumber: 'AL-987654321',
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Кредитная карта',
        type: 'creditCard',
        initialAmount: 100000,
        currentAmount: 15800,
        interestRate: 23.9,
        startDate: new Date(2023, 5, 1),
        nextPaymentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        nextPaymentAmount: 3000,
        lenderName: 'Альфа-Банк',
        linkedAccountId: accounts[2]._id,
        paymentFrequency: 'monthly',
        creditLimit: 100000,
        minPaymentPercentage: 5,
        status: 'active',
      },
    ];

    // Добавляем историю платежей
    debts.forEach(debt => {
      debt.paymentHistory = [];
      for (let i = 1; i <= 3; i++) {
        debt.paymentHistory.push({
          date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
          amount: debt.nextPaymentAmount,
          description: `Ежемесячный платеж #${i}`,
          paymentType: 'regular',
        });
      }
    });

    const createdDebts = await Debt.insertMany(debts);
    console.log(`✅ Создано ${createdDebts.length} тестовых долгов`);
  }

  async createTestSubscriptions() {
    console.log('📺 Создание тестовых подписок...');

    const accounts = await Account.find({ userId: this.testUserId });
    const expenseCategories = await Category.find({
      userId: this.testUserId,
      type: 'expense',
    });

    const entertainmentCategory = expenseCategories.find(
      c => c.name === 'Развлечения'
    );

    const subscriptions = [
      {
        userId: this.testUserId,
        name: 'Netflix',
        description: 'Стриминговый сервис',
        amount: 799,
        currency: 'RUB',
        frequency: 'monthly',
        startDate: new Date(2023, 0, 15),
        nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        accountId: accounts[0]._id,
        categoryId: entertainmentCategory?._id,
        autoPayment: true,
        provider: 'Netflix',
        website: 'https://netflix.com',
        status: 'active',
        notifications: {
          enabled: true,
          daysBefore: 3,
          email: true,
          push: true,
        },
      },
      {
        userId: this.testUserId,
        name: 'Spotify Premium',
        description: 'Музыкальный стриминг',
        amount: 299,
        currency: 'RUB',
        frequency: 'monthly',
        startDate: new Date(2023, 1, 10),
        nextPaymentDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        accountId: accounts[0]._id,
        categoryId: entertainmentCategory?._id,
        autoPayment: true,
        provider: 'Spotify',
        website: 'https://spotify.com',
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Яндекс.Плюс',
        description: 'Мультиподписка Яндекса',
        amount: 399,
        currency: 'RUB',
        frequency: 'monthly',
        startDate: new Date(2023, 2, 5),
        nextPaymentDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        accountId: accounts[0]._id,
        categoryId: entertainmentCategory?._id,
        autoPayment: true,
        provider: 'Яндекс',
        website: 'https://plus.yandex.ru',
        status: 'active',
      },
      {
        userId: this.testUserId,
        name: 'Adobe Creative Cloud',
        description: 'Дизайн и фото',
        amount: 2390,
        currency: 'RUB',
        frequency: 'monthly',
        startDate: new Date(2023, 3, 12),
        nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        accountId: accounts[0]._id,
        autoPayment: false,
        provider: 'Adobe',
        website: 'https://adobe.com',
        status: 'paused',
        pauseReason: 'Временно не использую',
      },
    ];

    // Добавляем историю платежей
    subscriptions.forEach(subscription => {
      subscription.paymentHistory = [];
      for (let i = 1; i <= 6; i++) {
        subscription.paymentHistory.push({
          date: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
          amount: subscription.amount,
          status: 'success',
          description: `Автоматический платеж за ${subscription.name}`,
        });
      }
    });

    const createdSubscriptions = await Subscription.insertMany(subscriptions);
    console.log(`✅ Создано ${createdSubscriptions.length} тестовых подписок`);
  }

  async createArchivedData() {
    console.log('🗃️ Создание архивированных данных...');

    // Создание архивированного счета
    const archivedAccount = new Account({
      userId: this.testUserId,
      name: 'Старый банковский счет',
      type: 'bank',
      currency: 'RUB',
      balance: 0,
      status: 'archived',
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-06-20'),
    });
    await archivedAccount.save();

    // Создание архивированной категории
    const archivedCategory = new Category({
      userId: this.testUserId,
      name: 'Устаревшие расходы',
      type: 'expense',
      color: '#ff5722',
      icon: 'category',
      status: 'archived',
      createdAt: new Date('2023-02-10'),
      updatedAt: new Date('2023-07-15'),
    });
    await archivedCategory.save();

    // Создание архивированной цели
    const archivedGoal = new Goal({
      userId: this.testUserId,
      name: 'Поездка в отпуск 2023',
      targetAmount: 100000,
      currentAmount: 85000,
      deadline: new Date('2023-08-01'),
      status: 'archived',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-08-15'),
    });
    await archivedGoal.save();

    // Создание архивированного долга
    const archivedDebt = new Debt({
      userId: this.testUserId,
      name: 'Старый кредит',
      type: 'loan',
      initialAmount: 50000,
      currentAmount: 0,
      interestRate: 15.0,
      startDate: new Date('2022-12-01'),
      endDate: new Date('2023-12-31'),
      lenderName: 'Банк ABC',
      status: 'archived',
      createdAt: new Date('2022-12-01'),
      updatedAt: new Date('2023-11-30'),
    });
    await archivedDebt.save();

    // Создание архивированной подписки
    const archivedSubscription = new Subscription({
      userId: this.testUserId,
      name: 'Старый стриминг сервис',
      description: 'Ранее использовавшийся сервис',
      amount: 299,
      currency: 'RUB',
      frequency: 'monthly',
      startDate: new Date('2022-05-01'),
      nextPaymentDate: new Date('2023-05-01'),
      provider: 'OldStreamService',
      status: 'archived',
      createdAt: new Date('2022-05-01'),
      updatedAt: new Date('2023-04-30'),
    });
    await archivedSubscription.save();

    console.log('✅ Архивированные данные созданы успешно:');
    console.log('- 1 счет');
    console.log('- 1 категория');
    console.log('- 1 цель');
    console.log('- 1 долг');
    console.log('- 1 подписка');
  }

  async clearDatabase() {
    console.log('🧹 Очистка базы данных...');

    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Category.deleteMany({}),
      Transaction.deleteMany({}),
      Goal.deleteMany({}),
      Debt.deleteMany({}),
      Subscription.deleteMany({}),
    ]);

    console.log('✅ База данных очищена');
  }
}

module.exports = DatabaseSeeder;

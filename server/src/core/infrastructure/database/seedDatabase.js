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
        return await this.getTestUser();
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

      console.log('✅ База данных успешно заполнена тестовыми данными');
      return await this.getTestUser();
    } catch (error) {
      console.error('❌ Ошибка при заполнении БД:', error);
      throw error;
    }
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

    // Создаем транзакции за последние 30 дней
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Случайные доходы (реже)
      if (Math.random() < 0.3) {
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
        });
      }

      // Случайные расходы (чаще)
      if (Math.random() < 0.7) {
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
        });
      }
    }

    // Добавляем несколько крупных транзакций
    transactions.push(
      {
        userId: this.testUserId,
        type: 'income',
        amount: 120000,
        categoryId:
          incomeCategories.find(c => c.name === 'Зарплата')?._id ||
          incomeCategories[0]._id,
        accountId: accounts[0]._id,
        date: new Date(today.getFullYear(), today.getMonth(), 1),
        description: 'Зарплата за месяц',
        status: 'active',
      },
      {
        userId: this.testUserId,
        type: 'income',
        amount: 300000,
        categoryId:
          incomeCategories.find(c => c.name === 'Бонусы')?._id ||
          incomeCategories[0]._id,
        accountId: accounts[1]._id,
        date: new Date(today.getFullYear(), today.getMonth(), 15),
        description: 'Годовой бонус',
        status: 'active',
      }
    );

    const createdTransactions = await Transaction.insertMany(transactions);
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

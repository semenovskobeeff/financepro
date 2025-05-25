const Subscription = require('../../../core/domain/entities/Subscription');
const Account = require('../../../core/domain/entities/Account');
const Category = require('../../../core/domain/entities/Category');
const Transaction = require('../../../core/domain/entities/Transaction');
const { isValidObjectId, startSession } = require('mongoose');
const { ApplicationError } = require('../../../core/errors/ApplicationError');

class SubscriptionService {
  /**
   * Получение списка подписок пользователя
   */
  async getUserSubscriptions(userId, status = null, limit = 10, page = 1) {
    const query = { userId };

    console.log('Получен запрос на подписки с параметром status:', status);

    if (status) {
      // Если status содержит запятую, разбиваем на массив статусов
      if (status.includes(',')) {
        const statusArray = status.split(',').map(s => s.trim());
        console.log('Разбитый массив статусов:', statusArray);
        query.status = { $in: statusArray };
      } else {
        query.status = status;
      }
    }

    console.log('Итоговый запрос MongoDB:', JSON.stringify(query));

    const total = await Subscription.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const subscriptions = await Subscription.find(query)
      .sort({ nextPaymentDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('accountId', 'name type balance currency')
      .populate('categoryId', 'name icon type');

    console.log(`Найдено подписок: ${subscriptions.length}`);

    return {
      subscriptions,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  /**
   * Получение подписки по ID
   */
  async getSubscriptionById(subscriptionId, userId) {
    if (!isValidObjectId(subscriptionId)) {
      throw new ApplicationError('Некорректный ID подписки', 400);
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    })
      .populate('accountId', 'name type balance currency')
      .populate('categoryId', 'name icon type');

    if (!subscription) {
      throw new ApplicationError('Подписка не найдена', 404);
    }

    return subscription;
  }

  /**
   * Создание новой подписки
   */
  async createSubscription(subscriptionData, userId) {
    const { accountId, categoryId, ...data } = subscriptionData;

    // Проверка существования счета
    if (!isValidObjectId(accountId)) {
      throw new ApplicationError('Некорректный ID счета', 400);
    }

    const account = await Account.findOne({ _id: accountId, userId });
    if (!account) {
      throw new ApplicationError('Счет не найден', 404);
    }

    // Проверка существования категории
    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        throw new ApplicationError('Некорректный ID категории', 400);
      }

      const category = await Category.findOne({ _id: categoryId, userId });
      if (!category) {
        throw new ApplicationError('Категория не найдена', 404);
      }

      if (category.type !== 'expense') {
        throw new ApplicationError('Категория должна быть типа "расход"', 400);
      }
    }

    // Создание подписки
    const subscription = new Subscription({
      ...data,
      accountId,
      categoryId,
      userId,
      nextPaymentDate: new Date(data.startDate),
    });

    await subscription.save();
    return subscription;
  }

  /**
   * Обновление подписки
   */
  async updateSubscription(subscriptionId, updateData, userId) {
    if (!isValidObjectId(subscriptionId)) {
      throw new ApplicationError('Некорректный ID подписки', 400);
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      throw new ApplicationError('Подписка не найдена', 404);
    }

    // Нельзя обновлять архивированную подписку
    if (subscription.status === 'archived') {
      throw new ApplicationError(
        'Нельзя обновить архивированную подписку',
        400
      );
    }

    const { accountId, categoryId, ...data } = updateData;

    // Проверка существования счета
    if (accountId) {
      if (!isValidObjectId(accountId)) {
        throw new ApplicationError('Некорректный ID счета', 400);
      }

      const account = await Account.findOne({ _id: accountId, userId });
      if (!account) {
        throw new ApplicationError('Счет не найден', 404);
      }

      subscription.accountId = accountId;
    }

    // Проверка существования категории
    if (categoryId !== undefined) {
      if (categoryId) {
        if (!isValidObjectId(categoryId)) {
          throw new ApplicationError('Некорректный ID категории', 400);
        }

        const category = await Category.findOne({ _id: categoryId, userId });
        if (!category) {
          throw new ApplicationError('Категория не найдена', 404);
        }

        if (category.type !== 'expense') {
          throw new ApplicationError(
            'Категория должна быть типа "расход"',
            400
          );
        }

        subscription.categoryId = categoryId;
      } else {
        // Если передан null, убираем категорию
        subscription.categoryId = null;
      }
    }

    // Обновление полей
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        subscription[key] = data[key];
      }
    });

    // Если частота изменилась на custom, проверяем customFrequencyDays
    if (data.frequency === 'custom' && !data.customFrequencyDays) {
      throw new ApplicationError(
        'Для пользовательской периодичности требуется указать количество дней',
        400
      );
    }

    await subscription.save();
    return subscription;
  }

  /**
   * Архивация подписки
   */
  async archiveSubscription(subscriptionId, userId) {
    if (!isValidObjectId(subscriptionId)) {
      throw new ApplicationError('Некорректный ID подписки', 400);
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      throw new ApplicationError('Подписка не найдена', 404);
    }

    if (subscription.status === 'archived') {
      throw new ApplicationError('Подписка уже архивирована', 400);
    }

    subscription.status = 'archived';
    await subscription.save();

    return subscription;
  }

  /**
   * Восстановление подписки из архива
   */
  async restoreSubscription(subscriptionId, userId) {
    if (!isValidObjectId(subscriptionId)) {
      throw new ApplicationError('Некорректный ID подписки', 400);
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
    });

    if (!subscription) {
      throw new ApplicationError('Подписка не найдена', 404);
    }

    if (subscription.status !== 'archived') {
      throw new ApplicationError('Подписка не находится в архиве', 400);
    }

    subscription.status = 'active';
    await subscription.save();

    return subscription;
  }

  /**
   * Изменение статуса подписки (приостановка/отмена/активация)
   */
  async changeSubscriptionStatus(subscriptionId, status, userId) {
    if (!['active', 'paused', 'cancelled'].includes(status)) {
      throw new ApplicationError('Некорректный статус', 400);
    }

    if (!isValidObjectId(subscriptionId)) {
      throw new ApplicationError('Некорректный ID подписки', 400);
    }

    const subscription = await Subscription.findOne({
      _id: subscriptionId,
      userId,
      status: { $ne: 'archived' },
    });

    if (!subscription) {
      throw new ApplicationError('Подписка не найдена', 404);
    }

    if (subscription.status === status) {
      throw new ApplicationError(`Подписка уже имеет статус "${status}"`, 400);
    }

    subscription.status = status;
    await subscription.save();

    return subscription;
  }

  /**
   * Запись платежа по подписке
   */
  async makePayment(subscriptionId, paymentData, userId) {
    if (!isValidObjectId(subscriptionId)) {
      throw new ApplicationError('Некорректный ID подписки', 400);
    }

    // Начинаем транзакцию MongoDB для атомарности операции
    const session = await startSession();
    session.startTransaction();

    try {
      const subscription = await Subscription.findOne({
        _id: subscriptionId,
        userId,
        status: { $ne: 'archived' },
      }).session(session);

      if (!subscription) {
        throw new ApplicationError('Подписка не найдена', 404);
      }

      const { amount, description } = paymentData;
      const paymentAmount = amount || subscription.amount;

      // Получаем информацию о счете
      const account = await Account.findOne({
        _id: subscription.accountId,
        userId,
      }).session(session);

      if (!account) {
        throw new ApplicationError('Счет не найден', 404);
      }

      // Проверяем достаточность средств на счете
      if (account.balance < paymentAmount) {
        throw new ApplicationError('Недостаточно средств на счете', 400);
      }

      // Создаем транзакцию
      const transaction = new Transaction({
        userId,
        type: 'expense',
        amount: paymentAmount,
        accountId: subscription.accountId,
        categoryId: subscription.categoryId,
        date: new Date(),
        description: description || `Платеж по подписке: ${subscription.name}`,
      });

      // Сохраняем транзакцию сначала
      await transaction.save({ session });

      // Создание записи о платеже в подписке с ID транзакции
      const payment = subscription.processPayment(
        paymentAmount,
        description,
        transaction._id
      );

      // Обновляем баланс счета
      account.balance -= paymentAmount;

      // Добавляем запись в историю счета
      account.history.push({
        operationType: 'expense',
        amount: paymentAmount,
        date: new Date(),
        description: description || `Платеж по подписке: ${subscription.name}`,
      });

      // Сохраняем остальные изменения
      await Promise.all([
        subscription.save({ session }),
        account.save({ session }),
      ]);

      // Фиксируем транзакцию
      await session.commitTransaction();

      return {
        subscription,
        payment,
        transaction,
        account: {
          id: account._id,
          balance: account.balance,
        },
      };
    } catch (error) {
      // Откатываем транзакцию в случае ошибки
      await session.abortTransaction();
      throw error;
    } finally {
      // Завершаем сессию
      session.endSession();
    }
  }

  /**
   * Получение предстоящих платежей
   */
  async getUpcomingPayments(userId, days = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const subscriptions = await Subscription.find({
      userId,
      status: 'active',
      nextPaymentDate: { $lte: endDate },
    })
      .sort({ nextPaymentDate: 1 })
      .populate('accountId', 'name type balance currency')
      .populate('categoryId', 'name icon type');

    return subscriptions;
  }

  /**
   * Получение статистики по подпискам
   */
  async getSubscriptionStats(userId) {
    const subscriptions = await Subscription.find({
      userId,
      status: { $ne: 'archived' },
    });

    const activeSubscriptions = subscriptions.filter(
      sub => sub.status === 'active'
    );

    const pausedSubscriptions = subscriptions.filter(
      sub => sub.status === 'paused'
    );

    // Подсчет общей суммы ежемесячных платежей
    // Приводим все к месячному периоду
    let totalMonthly = 0;

    activeSubscriptions.forEach(sub => {
      let monthlyFactor;

      switch (sub.frequency) {
        case 'weekly':
          monthlyFactor = 4.33; // Среднее количество недель в месяце
          break;
        case 'biweekly':
          monthlyFactor = 2.17; // Среднее количество двухнедельных периодов в месяце
          break;
        case 'monthly':
          monthlyFactor = 1;
          break;
        case 'quarterly':
          monthlyFactor = 1 / 3; // Трети месяца
          break;
        case 'yearly':
          monthlyFactor = 1 / 12; // Двенадцатые месяца
          break;
        case 'custom':
          monthlyFactor = 30 / sub.customFrequencyDays; // Приблизительно
          break;
        default:
          monthlyFactor = 1;
      }

      totalMonthly += sub.amount * monthlyFactor;
    });

    // Группировка по частоте
    const byFrequency = {
      weekly: 0,
      biweekly: 0,
      monthly: 0,
      quarterly: 0,
      yearly: 0,
      custom: 0,
    };

    activeSubscriptions.forEach(sub => {
      byFrequency[sub.frequency] += 1;
    });

    // Предстоящие платежи на неделю
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

    const upcomingPayments = activeSubscriptions
      .filter(sub => new Date(sub.nextPaymentDate) <= sevenDaysLater)
      .sort(
        (a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate)
      );

    return {
      totalMonthly,
      totalYearly: totalMonthly * 12,
      activeCount: activeSubscriptions.length,
      pausedCount: pausedSubscriptions.length,
      upcomingPayments,
      byFrequency,
    };
  }

  /**
   * Получение развернутой аналитики по подпискам
   */
  async getSubscriptionAnalytics(userId, period = 'month') {
    const subscriptions = await Subscription.find({
      userId,
      status: { $ne: 'archived' },
    }).populate('categoryId', 'name icon type');

    const activeSubscriptions = subscriptions.filter(
      sub => sub.status === 'active'
    );

    // 1. Базовая статистика
    const totalMonthly = this._calculateTotalMonthly(activeSubscriptions);
    const totalYearly = totalMonthly * 12;

    // 2. Группировка по категориям
    const categoryStats = this._groupByCategory(activeSubscriptions);

    // 3. Группировка по периодичности
    const frequencyStats = this._groupByFrequency(activeSubscriptions);

    // 4. Расходы по месяцам (прогноз на 6 месяцев)
    const monthlyForecast = this._calculateMonthlyForecast(activeSubscriptions);

    // 5. История платежей (за последние 6 месяцев)
    const paymentHistory = await this._getPaymentHistory(activeSubscriptions);

    return {
      summary: {
        totalMonthly,
        totalYearly,
        activeCount: activeSubscriptions.length,
        totalCount: subscriptions.length,
      },
      categoryStats,
      frequencyStats,
      monthlyForecast,
      paymentHistory,
    };
  }

  /**
   * Вспомогательный метод: расчет общей суммы ежемесячных платежей
   */
  _calculateTotalMonthly(subscriptions) {
    let totalMonthly = 0;

    subscriptions.forEach(sub => {
      let monthlyFactor;

      switch (sub.frequency) {
        case 'weekly':
          monthlyFactor = 4.33; // Среднее количество недель в месяце
          break;
        case 'biweekly':
          monthlyFactor = 2.17; // Среднее количество двухнедельных периодов в месяце
          break;
        case 'monthly':
          monthlyFactor = 1;
          break;
        case 'quarterly':
          monthlyFactor = 1 / 3; // Трети месяца
          break;
        case 'yearly':
          monthlyFactor = 1 / 12; // Двенадцатые месяца
          break;
        case 'custom':
          monthlyFactor = 30 / sub.customFrequencyDays; // Приблизительно
          break;
        default:
          monthlyFactor = 1;
      }

      totalMonthly += sub.amount * monthlyFactor;
    });

    return totalMonthly;
  }

  /**
   * Вспомогательный метод: группировка по категориям
   */
  _groupByCategory(subscriptions) {
    const categoriesMap = new Map();
    let uncategorizedAmount = 0;
    let uncategorizedCount = 0;

    subscriptions.forEach(sub => {
      const monthlyAmount = this._getMonthlyAmount(sub);

      if (sub.categoryId) {
        const categoryId = sub.categoryId._id.toString();
        const categoryName = sub.categoryId.name;
        const categoryIcon = sub.categoryId.icon || 'label';

        if (categoriesMap.has(categoryId)) {
          const category = categoriesMap.get(categoryId);
          category.amount += monthlyAmount;
          category.count += 1;
        } else {
          categoriesMap.set(categoryId, {
            categoryId,
            categoryName,
            categoryIcon,
            amount: monthlyAmount,
            count: 1,
          });
        }
      } else {
        uncategorizedAmount += monthlyAmount;
        uncategorizedCount += 1;
      }
    });

    const categories = Array.from(categoriesMap.values());

    // Добавляем некатегоризированные, если есть
    if (uncategorizedCount > 0) {
      categories.push({
        categoryId: null,
        categoryName: 'Без категории',
        categoryIcon: 'help_outline',
        amount: uncategorizedAmount,
        count: uncategorizedCount,
      });
    }

    return categories.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Вспомогательный метод: группировка по периодичности
   */
  _groupByFrequency(subscriptions) {
    const frequencyGroups = {
      weekly: { count: 0, amount: 0, label: 'Еженедельно' },
      biweekly: { count: 0, amount: 0, label: 'Раз в 2 недели' },
      monthly: { count: 0, amount: 0, label: 'Ежемесячно' },
      quarterly: { count: 0, amount: 0, label: 'Ежеквартально' },
      yearly: { count: 0, amount: 0, label: 'Ежегодно' },
      custom: { count: 0, amount: 0, label: 'Пользовательская' },
    };

    subscriptions.forEach(sub => {
      const monthlyAmount = this._getMonthlyAmount(sub);

      if (frequencyGroups[sub.frequency]) {
        frequencyGroups[sub.frequency].count += 1;
        frequencyGroups[sub.frequency].amount += monthlyAmount;
      }
    });

    return Object.entries(frequencyGroups)
      .filter(([_, group]) => group.count > 0)
      .map(([key, group]) => ({
        frequency: key,
        ...group,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  /**
   * Вспомогательный метод: расчет месячного платежа для подписки
   */
  _getMonthlyAmount(subscription) {
    let monthlyFactor;

    switch (subscription.frequency) {
      case 'weekly':
        monthlyFactor = 4.33;
        break;
      case 'biweekly':
        monthlyFactor = 2.17;
        break;
      case 'monthly':
        monthlyFactor = 1;
        break;
      case 'quarterly':
        monthlyFactor = 1 / 3;
        break;
      case 'yearly':
        monthlyFactor = 1 / 12;
        break;
      case 'custom':
        monthlyFactor = 30 / subscription.customFrequencyDays;
        break;
      default:
        monthlyFactor = 1;
    }

    return subscription.amount * monthlyFactor;
  }

  /**
   * Вспомогательный метод: расчет прогноза расходов по месяцам
   */
  _calculateMonthlyForecast(subscriptions) {
    const forecast = [];
    const now = new Date();

    // Генерируем прогноз на ближайшие 6 месяцев
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = month.toLocaleString('ru-RU', { month: 'long' });
      const monthYear = month.toLocaleString('ru-RU', { year: 'numeric' });

      let totalAmount = 0;
      const subscriptionsDue = [];

      // Проходим по всем подпискам и смотрим, когда будут платежи
      subscriptions.forEach(subscription => {
        const monthlyAmount = this._getMonthlyAmount(subscription);
        totalAmount += monthlyAmount;

        // Добавляем в список подписок, по которым будет платеж в этом месяце
        subscriptionsDue.push({
          id: subscription._id,
          name: subscription.name,
          amount: monthlyAmount,
        });
      });

      forecast.push({
        month: monthName,
        year: monthYear,
        totalAmount,
        subscriptionsDue,
      });
    }

    return forecast;
  }

  /**
   * Вспомогательный метод: получение истории платежей
   */
  async _getPaymentHistory(subscriptions) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Собираем все платежи за последние 6 месяцев
    const history = [];

    for (const subscription of subscriptions) {
      const payments = subscription.paymentHistory.filter(
        payment => new Date(payment.date) >= sixMonthsAgo
      );

      for (const payment of payments) {
        const paymentDate = new Date(payment.date);
        const month = paymentDate.toLocaleString('ru-RU', { month: 'long' });
        const year = paymentDate.getFullYear();

        history.push({
          subscriptionId: subscription._id,
          subscriptionName: subscription.name,
          amount: payment.amount,
          date: payment.date,
          month,
          year,
        });
      }
    }

    // Группируем платежи по месяцам
    const monthlyHistory = [];
    const monthMap = new Map();

    history.forEach(payment => {
      const date = new Date(payment.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      if (monthMap.has(key)) {
        monthMap.get(key).totalAmount += payment.amount;
        monthMap.get(key).payments.push(payment);
      } else {
        monthMap.set(key, {
          month: payment.month,
          year: payment.year,
          totalAmount: payment.amount,
          payments: [payment],
        });
      }
    });

    // Сортируем по дате
    return Array.from(monthMap.values()).sort(
      (a, b) =>
        new Date(`${b.year}-${b.month}-01`) -
        new Date(`${a.year}-${a.month}-01`)
    );
  }
}

module.exports = new SubscriptionService();

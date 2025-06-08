const {
  Transaction,
  Account,
  Category,
  Goal,
  Debt,
  Subscription,
} = require('../../../core/domain/entities');
const mongoose = require('mongoose');

/**
 * Получить данные для аналитики транзакций
 * @param {string} userId ID пользователя
 * @param {Object} options опции фильтрации (период, даты)
 * @returns {Promise<Object>} Данные для аналитики
 */
const getTransactionsAnalytics = async (userId, options = {}) => {
  try {
    console.log(
      '🔍 [TRANSACTIONS] Получение аналитики транзакций для пользователя:',
      userId,
      'опции:',
      options
    );

    // Определяем временной диапазон для анализа
    const { period = 'month', startDate, endDate } = options;
    const dateRange = getDateRange(period, startDate, endDate);

    console.log(
      '📅 [TRANSACTIONS] Диапазон дат:',
      dateRange.startDate.toISOString(),
      'до',
      dateRange.endDate.toISOString()
    );

    // Получаем все транзакции пользователя за период
    const transactions = await Transaction.find({
      userId,
      date: { $gte: dateRange.startDate, $lte: dateRange.endDate },
    }).populate('categoryId');

    console.log(
      '💰 [TRANSACTIONS] Найдено транзакций за период:',
      transactions.length
    );

    // Получаем все счета пользователя для анализа баланса
    const accounts = await Account.find({ userId });
    console.log('📊 [TRANSACTIONS] Найдено счетов:', accounts.length);

    // Подготавливаем данные для анализа
    const summary = {
      income: 0,
      expense: 0,
      transfer: 0,
      balance: accounts.reduce((sum, account) => sum + account.balance, 0),
    };

    // Группировка транзакций по категориям
    const categoriesIncome = {};
    const categoriesExpense = {};

    // Временная статистика
    const timeStatsIncome = {};
    const timeStatsExpense = {};

    // Анализируем транзакции
    transactions.forEach(transaction => {
      const { type, amount, categoryId, date } = transaction;

      console.log(
        '🔍 [TRANSACTIONS] Обрабатываем транзакцию:',
        type,
        amount,
        categoryId?.name || 'Без категории'
      );

      // Обновляем общую сумму по типу
      summary[type] += amount;

      // Группируем по категориям для доходов и расходов
      if (type === 'income' || type === 'expense') {
        const categoryData = {
          type,
          categoryId: categoryId ? categoryId._id : null,
          categoryName: categoryId ? categoryId.name : 'Без категории',
          categoryIcon: categoryId ? categoryId.icon : 'help_outline',
          total: amount,
          count: 1,
        };

        const categories =
          type === 'income' ? categoriesIncome : categoriesExpense;
        const categoryKey = categoryId
          ? categoryId._id.toString()
          : 'uncategorized';

        if (categories[categoryKey]) {
          categories[categoryKey].total += amount;
          categories[categoryKey].count += 1;
        } else {
          categories[categoryKey] = categoryData;
        }

        // Группируем по времени (месяцам, неделям и т.д.)
        const timeKey = getTimeKey(date, period);
        const timeStats =
          type === 'income' ? timeStatsIncome : timeStatsExpense;

        if (timeStats[timeKey]) {
          timeStats[timeKey].amount += amount;
          timeStats[timeKey].count += 1;
        } else {
          timeStats[timeKey] = {
            period: timeKey,
            amount,
            count: 1,
          };
        }
      }
    });

    const result = {
      summary,
      categoryStats: {
        income: Object.values(categoriesIncome),
        expense: Object.values(categoriesExpense),
      },
      timeStats: {
        income: Object.values(timeStatsIncome),
        expense: Object.values(timeStatsExpense),
      },
      accounts: accounts.map(acc => ({
        _id: acc._id,
        name: acc.name,
        type: acc.type,
        balance: acc.balance,
      })),
    };

    console.log('📈 [TRANSACTIONS] Итоговая сводка:', summary);
    console.log(
      '📊 [TRANSACTIONS] Категории доходов:',
      Object.keys(categoriesIncome).length
    );
    console.log(
      '📊 [TRANSACTIONS] Категории расходов:',
      Object.keys(categoriesExpense).length
    );

    return result;
  } catch (error) {
    console.error(
      '❌ [TRANSACTIONS] Ошибка при получении аналитики транзакций:',
      error
    );
    throw error;
  }
};

/**
 * Получить данные для аналитики целей
 * @param {string} userId ID пользователя
 * @returns {Promise<Object>} Данные для аналитики целей
 */
const getGoalsAnalytics = async userId => {
  try {
    // Получаем все цели пользователя
    const goals = await Goal.find({ userId });

    if (!goals.length) {
      return {
        summary: {
          activeCount: 0,
          completedCount: 0,
          totalTargetAmount: 0,
          totalProgress: 0,
          averageProgress: 0,
          averageCompletion: 0,
        },
        goals: [],
      };
    }

    // Подготавливаем данные для анализа
    const activeGoals = goals.filter(goal => goal.progress < goal.targetAmount);
    const completedGoals = goals.filter(
      goal => goal.progress >= goal.targetAmount
    );

    const totalTargetAmount = goals.reduce(
      (sum, goal) => sum + goal.targetAmount,
      0
    );
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);

    const averageProgress = goals.length ? totalProgress / goals.length : 0;
    const averageCompletion = totalTargetAmount
      ? (totalProgress / totalTargetAmount) * 100
      : 0;

    return {
      summary: {
        activeCount: activeGoals.length,
        completedCount: completedGoals.length,
        totalTargetAmount,
        totalProgress,
        averageProgress,
        averageCompletion,
      },
      goals: goals.map(goal => ({
        id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        progress: goal.progress,
        progressPercent: goal.targetAmount
          ? (goal.progress / goal.targetAmount) * 100
          : 0,
        deadline: goal.deadline,
      })),
    };
  } catch (error) {
    console.error('Ошибка при получении аналитики целей:', error);
    throw error;
  }
};

/**
 * Получить данные для аналитики долгов
 * @param {string} userId ID пользователя
 * @returns {Promise<Object>} Данные для аналитики долгов
 */
const getDebtsAnalytics = async userId => {
  try {
    // Получаем все долги пользователя
    const debts = await Debt.find({ userId });

    if (!debts.length) {
      return {
        summary: {
          totalCount: 0,
          activeCount: 0,
          paidCount: 0,
          totalInitialAmount: 0,
          totalCurrentAmount: 0,
          totalPayments: 0,
        },
        typeStats: [],
        upcomingPayments: [],
      };
    }

    // Подготавливаем данные для анализа
    const activeDebts = debts.filter(debt => debt.remainingAmount > 0);
    const paidDebts = debts.filter(debt => debt.remainingAmount <= 0);

    const totalInitialAmount = debts.reduce(
      (sum, debt) => sum + debt.initialAmount,
      0
    );
    const totalCurrentAmount = activeDebts.reduce(
      (sum, debt) => sum + debt.remainingAmount,
      0
    );
    const totalPayments = debts.reduce((sum, debt) => {
      return sum + (debt.initialAmount - debt.remainingAmount);
    }, 0);

    // Группировка по типам долгов
    const typeStats = {};
    debts.forEach(debt => {
      if (!typeStats[debt.type]) {
        typeStats[debt.type] = {
          type: debt.type,
          count: 0,
          totalInitial: 0,
          totalCurrent: 0,
          totalPaid: 0,
          averageInterestRate: 0,
        };
      }

      const paid = debt.initialAmount - debt.remainingAmount;

      typeStats[debt.type].count += 1;
      typeStats[debt.type].totalInitial += debt.initialAmount;
      typeStats[debt.type].totalCurrent += debt.remainingAmount;
      typeStats[debt.type].totalPaid += paid;

      if (debt.interestRate) {
        typeStats[debt.type].averageInterestRate += debt.interestRate;
      }
    });

    // Вычисляем средние значения
    Object.values(typeStats).forEach(typeStat => {
      if (typeStat.count) {
        typeStat.averageInterestRate /= typeStat.count;
      }
    });

    // Определяем ближайшие платежи
    const today = new Date();
    const upcomingPayments = activeDebts
      .filter(debt => debt.nextPaymentDate)
      .map(debt => {
        const nextPaymentDate = new Date(debt.nextPaymentDate);
        const daysLeft = Math.ceil(
          (nextPaymentDate - today) / (1000 * 60 * 60 * 24)
        );

        return {
          id: debt._id,
          name: debt.name,
          type: debt.type,
          nextPaymentDate: debt.nextPaymentDate,
          nextPaymentAmount: debt.paymentAmount,
          daysLeft: daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5); // Топ-5 ближайших платежей

    return {
      summary: {
        totalCount: debts.length,
        activeCount: activeDebts.length,
        paidCount: paidDebts.length,
        totalInitialAmount,
        totalCurrentAmount,
        totalPayments,
      },
      typeStats: Object.values(typeStats),
      upcomingPayments,
    };
  } catch (error) {
    console.error('Ошибка при получении аналитики долгов:', error);
    throw error;
  }
};

/**
 * Получить сводную аналитику для дашборда
 * @param {string} userId ID пользователя
 * @returns {Promise<Object>} Сводная аналитика
 */
const getDashboardAnalytics = async userId => {
  try {
    console.log(
      '🔍 [ANALYTICS] Получение сводной аналитики для пользователя:',
      userId
    );

    // Получаем счета
    const accounts = await Account.find({ userId }).catch(err => {
      console.warn('⚠️ [ANALYTICS] Ошибка получения счетов:', err.message);
      return [];
    });
    console.log('📊 [ANALYTICS] Найдено счетов:', accounts.length);

    // Получаем статистику по транзакциям за текущий месяц
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const now = new Date();
    console.log(
      '📅 [ANALYTICS] Период анализа:',
      monthStart.toISOString(),
      'до',
      now.toISOString()
    );

    const transactions = await Transaction.find({
      userId,
      date: { $gte: monthStart },
    }).catch(err => {
      console.warn('⚠️ [ANALYTICS] Ошибка получения транзакций:', err.message);
      return [];
    });

    console.log(
      '💰 [ANALYTICS] Найдено транзакций за текущий месяц:',
      transactions.length
    );

    // Если нет транзакций за текущий месяц, берем последние 30 дней
    let transactionsForAnalysis = transactions;
    if (transactions.length === 0) {
      console.log(
        '⚠️ [ANALYTICS] Нет транзакций за текущий месяц, ищем за последние 30 дней'
      );
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      transactionsForAnalysis = await Transaction.find({
        userId,
        date: { $gte: last30Days },
      }).catch(err => {
        console.warn(
          '⚠️ [ANALYTICS] Ошибка получения транзакций за 30 дней:',
          err.message
        );
        return [];
      });

      console.log(
        '💰 [ANALYTICS] Найдено транзакций за последние 30 дней:',
        transactionsForAnalysis.length
      );
    }

    const monthStats = transactionsForAnalysis.reduce(
      (stats, tx) => {
        console.log(
          '🔍 [ANALYTICS] Обрабатываем транзакцию:',
          tx.type,
          tx.amount
        );
        if (tx.type === 'income') stats.income += tx.amount;
        else if (tx.type === 'expense') stats.expense += tx.amount;
        return stats;
      },
      { income: 0, expense: 0, balance: 0 }
    );

    monthStats.balance = monthStats.income - monthStats.expense;

    console.log('📈 [ANALYTICS] Статистика месяца:', monthStats);

    // Получаем подписки
    const subscriptions = await Subscription.find({ userId }).catch(err => {
      console.warn('⚠️ [ANALYTICS] Ошибка получения подписок:', err.message);
      return [];
    });
    console.log('🔄 [ANALYTICS] Найдено подписок:', subscriptions.length);

    const monthlySubscriptionAmount = subscriptions.reduce((sum, sub) => {
      return (
        sum + sub.amount * getPaymentFrequencyMultiplier(sub.paymentFrequency)
      );
    }, 0);

    // Получаем долги
    const debts = await Debt.find({
      userId,
      remainingAmount: { $gt: 0 },
    }).catch(err => {
      console.warn('⚠️ [ANALYTICS] Ошибка получения долгов:', err.message);
      return [];
    });
    console.log('💳 [ANALYTICS] Найдено активных долгов:', debts.length);

    // Получаем цели
    const goals = await Goal.find({ userId }).catch(err => {
      console.warn('⚠️ [ANALYTICS] Ошибка получения целей:', err.message);
      return [];
    });
    const activeGoals = goals.filter(goal => goal.progress < goal.targetAmount);
    console.log(
      '🎯 [ANALYTICS] Найдено целей/активных:',
      goals.length,
      '/',
      activeGoals.length
    );

    const result = {
      accounts: {
        count: accounts.length,
        totalBalance: accounts.reduce(
          (sum, acc) => sum + (acc.balance || 0),
          0
        ),
      },
      monthStats,
      subscriptions: {
        count: subscriptions.length,
        monthlyAmount: monthlySubscriptionAmount,
      },
      debts: {
        count: debts.length,
        totalAmount: debts.reduce(
          (sum, debt) => sum + (debt.remainingAmount || 0),
          0
        ),
      },
      goals: {
        count: activeGoals.length,
        totalTarget: activeGoals.reduce(
          (sum, goal) => sum + (goal.targetAmount || 0),
          0
        ),
        totalProgress: activeGoals.reduce(
          (sum, goal) => sum + (goal.progress || 0),
          0
        ),
      },
    };

    console.log(
      '✅ [ANALYTICS] Итоговая аналитика дашборда:',
      JSON.stringify(result, null, 2)
    );

    return result;
  } catch (error) {
    console.error(
      '❌ [ANALYTICS] Ошибка при получении сводной аналитики:',
      error
    );

    // Возвращаем базовую структуру с нулевыми значениями вместо ошибки
    const fallbackResult = {
      accounts: {
        count: 0,
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
    };

    console.log('⚠️ [ANALYTICS] Возвращаем базовые данные вместо ошибки');
    return fallbackResult;
  }
};

/**
 * Подготовить данные для экспорта
 * @param {string} userId ID пользователя
 * @param {Object} options Опции экспорта (тип данных, формат, период)
 * @returns {Promise<Array>} Данные для экспорта
 */
const exportAnalytics = async (userId, options = {}) => {
  try {
    const {
      type = 'transactions',
      format = 'csv',
      period = 'month',
      startDate,
      endDate,
    } = options;

    let data = [];

    switch (type) {
      case 'transactions':
        const transactionsAnalytics = await getTransactionsAnalytics(userId, {
          period,
          startDate,
          endDate,
        });
        data = await formatTransactionsForExport(transactionsAnalytics);
        break;
      case 'goals':
        const goalsAnalytics = await getGoalsAnalytics(userId);
        data = formatGoalsForExport(goalsAnalytics);
        break;
      case 'debts':
        const debtsAnalytics = await getDebtsAnalytics(userId);
        data = formatDebtsForExport(debtsAnalytics);
        break;
      default:
        throw new Error(`Неподдерживаемый тип экспорта: ${type}`);
    }

    return { data };
  } catch (error) {
    console.error('Ошибка при экспорте аналитики:', error);
    throw error;
  }
};

/**
 * Вспомогательные функции
 */

/**
 * Получить временной диапазон по периоду
 * @param {string} period Период (week, month, quarter, year, all)
 * @param {string} startDate Начальная дата (если указана явно)
 * @param {string} endDate Конечная дата (если указана явно)
 * @returns {Object} Объект с начальной и конечной датой
 */
const getDateRange = (period, startDate, endDate) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  let start = new Date();

  if (startDate && endDate) {
    return {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    };
  }

  switch (period) {
    case 'week':
      start.setDate(today.getDate() - 7);
      break;
    case 'month':
      start.setMonth(today.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(today.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(today.getFullYear() - 1);
      break;
    case 'all':
      start = new Date(0); // Начало времён
      break;
    default:
      start.setMonth(today.getMonth() - 1); // По умолчанию месяц
  }

  start.setHours(0, 0, 0, 0);

  return {
    startDate: start,
    endDate: today,
  };
};

/**
 * Получить ключ для группировки по времени
 * @param {Date} date Дата
 * @param {string} period Период
 * @returns {string} Ключ для группировки
 */
const getTimeKey = (date, period) => {
  const d = new Date(date);

  switch (period) {
    case 'week':
      return `${d.getDate()}.${d.getMonth() + 1}`; // DD.MM
    case 'month':
      return `${d.getDate()}.${d.getMonth() + 1}`; // DD.MM
    case 'quarter':
    case 'year':
      return `${d.getMonth() + 1}.${d.getFullYear()}`; // MM.YYYY
    default:
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`; // DD.MM.YYYY
  }
};

/**
 * Получить множитель для периодичности платежей
 * @param {string} frequency Периодичность
 * @returns {number} Множитель
 */
const getPaymentFrequencyMultiplier = frequency => {
  switch (frequency) {
    case 'weekly':
      return 4; // 4 раза в месяц
    case 'biweekly':
      return 2; // 2 раза в месяц
    case 'monthly':
      return 1; // 1 раз в месяц
    case 'quarterly':
      return 1 / 3; // 1/3 раза в месяц
    case 'annually':
      return 1 / 12; // 1/12 раза в месяц
    default:
      return 1;
  }
};

/**
 * Форматирование транзакций для экспорта
 * @param {Object} analytics Аналитика транзакций
 * @returns {Array} Данные для экспорта
 */
const formatTransactionsForExport = async analytics => {
  try {
    const { categoryStats } = analytics;

    // Объединяем доходы и расходы для экспорта
    const result = [
      // Заголовки для CSV
      ['Тип', 'Категория', 'Сумма', 'Количество транзакций'],
    ];

    // Добавляем данные по доходам
    categoryStats.income.forEach(item => {
      result.push(['Доход', item.categoryName, item.total, item.count]);
    });

    // Добавляем данные по расходам
    categoryStats.expense.forEach(item => {
      result.push(['Расход', item.categoryName, item.total, item.count]);
    });

    return result;
  } catch (error) {
    console.error('Ошибка при форматировании транзакций для экспорта:', error);
    throw error;
  }
};

/**
 * Форматирование целей для экспорта
 * @param {Object} analytics Аналитика целей
 * @returns {Array} Данные для экспорта
 */
const formatGoalsForExport = analytics => {
  const { goals } = analytics;

  // Заголовки для CSV
  const result = [
    [
      'Название',
      'Целевая сумма',
      'Текущий прогресс',
      'Процент выполнения',
      'Срок',
    ],
  ];

  // Добавляем данные по целям
  goals.forEach(goal => {
    result.push([
      goal.name,
      goal.targetAmount,
      goal.progress,
      `${goal.progressPercent.toFixed(1)}%`,
      goal.deadline
        ? new Date(goal.deadline).toLocaleDateString()
        : 'Не указан',
    ]);
  });

  return result;
};

/**
 * Форматирование долгов для экспорта
 * @param {Object} analytics Аналитика долгов
 * @returns {Array} Данные для экспорта
 */
const formatDebtsForExport = analytics => {
  const { typeStats } = analytics;

  // Заголовки для CSV
  const result = [
    [
      'Тип долга',
      'Количество',
      'Начальная сумма',
      'Текущий остаток',
      'Выплачено',
      'Средняя ставка',
    ],
  ];

  // Добавляем данные по типам долгов
  typeStats.forEach(item => {
    result.push([
      item.type,
      item.count,
      item.totalInitial,
      item.totalCurrent,
      item.totalPaid,
      `${item.averageInterestRate.toFixed(2)}%`,
    ]);
  });

  return result;
};

module.exports = {
  getTransactionsAnalytics,
  getGoalsAnalytics,
  getDebtsAnalytics,
  getDashboardAnalytics,
  exportAnalytics,
};

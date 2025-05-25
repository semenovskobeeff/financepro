const Goal = require('../../../core/domain/entities/Goal');
const Account = require('../../../core/domain/entities/Account');

/**
 * Сервис для работы с целями накопления
 */
class GoalService {
  /**
   * Получение целей пользователя с фильтрацией по статусу
   * @param {string} userId - ID пользователя
   * @param {string} status - Статус цели (active, completed, cancelled, archived)
   * @returns {Promise<Array>} - Массив целей
   */
  async getUserGoals(userId, status = null) {
    const filter = { userId };

    if (status) {
      filter.status = status;
    }

    return Goal.find(filter)
      .populate('accountId', 'name type balance currency')
      .sort({ createdAt: -1 });
  }

  /**
   * Получение информации о цели по ID
   * @param {string} goalId - ID цели
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Объект цели
   */
  async getGoalById(goalId, userId) {
    return Goal.findOne({ _id: goalId, userId }).populate(
      'accountId',
      'name type balance currency'
    );
  }

  /**
   * Создание новой цели
   * @param {Object} goalData - Данные цели
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Созданная цель
   */
  async createGoal(goalData, userId) {
    const { name, accountId, targetAmount, deadline } = goalData;

    // Проверяем, существует ли счет и принадлежит ли пользователю
    const account = await Account.findOne({ _id: accountId, userId });

    if (!account) {
      throw new Error('Счет не найден');
    }

    const newGoal = new Goal({
      userId,
      name,
      accountId,
      targetAmount,
      deadline: new Date(deadline),
      progress: account.balance, // Начальный прогресс равен текущему балансу счета
    });

    return newGoal.save();
  }

  /**
   * Обновление цели
   * @param {string} goalId - ID цели
   * @param {Object} updateData - Данные для обновления
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Обновленная цель
   */
  async updateGoal(goalId, updateData, userId) {
    const { name, targetAmount, deadline } = updateData;

    const goal = await Goal.findOne({ _id: goalId, userId });

    if (!goal) {
      throw new Error('Цель не найдена');
    }

    if (name) goal.name = name;
    if (targetAmount) goal.targetAmount = targetAmount;
    if (deadline) goal.deadline = new Date(deadline);

    return goal.save();
  }

  /**
   * Архивация цели
   * @param {string} goalId - ID цели
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Обновленная цель
   */
  async archiveGoal(goalId, userId) {
    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { status: 'archived' },
      { new: true }
    );

    if (!goal) {
      throw new Error('Цель не найдена');
    }

    return goal;
  }

  /**
   * Восстановление цели из архива
   * @param {string} goalId - ID цели
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Обновленная цель
   */
  async restoreGoal(goalId, userId) {
    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId, status: 'archived' },
      { status: 'active' },
      { new: true }
    );

    if (!goal) {
      throw new Error('Цель не найдена');
    }

    return goal;
  }

  /**
   * Перевод средств на цель
   * @param {string} goalId - ID цели
   * @param {string} fromAccountId - ID исходного счета
   * @param {number} amount - Сумма перевода
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Результат операции
   */
  async transferToGoal(goalId, fromAccountId, amount, userId) {
    if (!amount || amount <= 0) {
      throw new Error('Сумма должна быть положительной');
    }

    // Находим цель
    const goal = await Goal.findOne({
      _id: goalId,
      userId,
      status: 'active',
    });

    if (!goal) {
      throw new Error('Цель не найдена или не активна');
    }

    // Находим счет цели
    const goalAccount = await Account.findOne({
      _id: goal.accountId,
      userId,
    });

    if (!goalAccount) {
      throw new Error('Счет цели не найден');
    }

    // Находим счет, с которого будет выполнен перевод
    const sourceAccount = await Account.findOne({
      _id: fromAccountId,
      userId,
      status: 'active',
    });

    if (!sourceAccount) {
      throw new Error('Исходный счет не найден или не активен');
    }

    if (sourceAccount.balance < amount) {
      throw new Error('Недостаточно средств на счете');
    }

    // Обновляем баланс исходного счета
    sourceAccount.balance -= amount;

    // Добавляем запись в историю операций
    sourceAccount.history.push({
      operationType: 'expense',
      amount: amount,
      date: new Date(),
      description: `Перевод на цель: ${goal.name}`,
      linkedAccountId: goalAccount._id,
    });

    await sourceAccount.save();

    // Обновляем баланс целевого счета
    goalAccount.balance += amount;

    // Добавляем запись в историю операций
    goalAccount.history.push({
      operationType: 'income',
      amount: amount,
      date: new Date(),
      description: `Пополнение цели: ${goal.name}`,
      linkedAccountId: sourceAccount._id,
    });

    await goalAccount.save();

    // Обновляем прогресс цели
    goal.progress += amount;

    // Добавляем запись в историю переводов цели
    goal.transferHistory.push({
      amount: amount,
      date: new Date(),
      fromAccountId: sourceAccount._id,
    });

    // Если достигли или превысили целевую сумму, меняем статус
    if (goal.progress >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    return {
      goal,
      sourceAccount: {
        id: sourceAccount._id,
        name: sourceAccount.name,
        balance: sourceAccount.balance,
      },
      goalAccount: {
        id: goalAccount._id,
        name: goalAccount.name,
        balance: goalAccount.balance,
      },
    };
  }
}

module.exports = new GoalService();

const Debt = require('../../../core/domain/entities/Debt');
const Account = require('../../../core/domain/entities/Account');
const mongoose = require('mongoose');

class DebtService {
  /**
   * Получить список долгов пользователя
   */
  async getUserDebts(userId, status = null) {
    const query = { userId };

    if (status) {
      query.status = status;
    }

    return Debt.find(query).sort({ nextPaymentDate: 1, createdAt: -1 });
  }

  /**
   * Получить долг по ID
   */
  async getDebtById(debtId, userId) {
    return Debt.findOne({
      _id: debtId,
      userId,
    });
  }

  /**
   * Создать новый долг
   */
  async createDebt(debtData, userId) {
    const debt = new Debt({
      ...debtData,
      userId,
      currentAmount: debtData.initialAmount,
    });

    return debt.save();
  }

  /**
   * Обновить данные долга
   */
  async updateDebt(debtId, updateData, userId) {
    const debt = await Debt.findOne({
      _id: debtId,
      userId,
    });

    if (!debt) {
      throw new Error('Долг не найден');
    }

    if (debt.status === 'archived') {
      throw new Error('Невозможно обновить архивированный долг');
    }

    // Обновляем только разрешенные поля
    const allowedUpdates = [
      'name',
      'lenderName',
      'interestRate',
      'endDate',
      'paymentFrequency',
      'linkedAccountId',
    ];

    allowedUpdates.forEach(update => {
      if (updateData[update] !== undefined) {
        debt[update] = updateData[update];
      }
    });

    // Пересчитываем сроки платежей если изменена процентная ставка или частота платежей
    if (
      updateData.interestRate !== undefined ||
      updateData.paymentFrequency !== undefined
    ) {
      debt.calculateNextPayment();
    }

    return debt.save();
  }

  /**
   * Архивировать долг
   */
  async archiveDebt(debtId, userId) {
    const debt = await Debt.findOne({
      _id: debtId,
      userId,
    });

    if (!debt) {
      throw new Error('Долг не найден');
    }

    if (debt.status === 'archived') {
      throw new Error('Долг уже архивирован');
    }

    debt.status = 'archived';
    return debt.save();
  }

  /**
   * Восстановить долг из архива
   */
  async restoreDebt(debtId, userId) {
    const debt = await Debt.findOne({
      _id: debtId,
      userId,
    });

    if (!debt) {
      throw new Error('Долг не найден');
    }

    if (debt.status !== 'archived') {
      throw new Error('Долг не находится в архиве');
    }

    // Восстанавливаем предыдущий статус или устанавливаем активный
    debt.status = debt.currentAmount > 0 ? 'active' : 'paid';
    return debt.save();
  }

  /**
   * Совершить платеж по долгу
   */
  async makePayment(debtId, amount, description, accountId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const debt = await Debt.findOne({
        _id: debtId,
        userId,
      }).session(session);

      if (!debt) {
        throw new Error('Долг не найден');
      }

      if (debt.status === 'archived') {
        throw new Error('Невозможно внести платеж по архивированному долгу');
      }

      if (debt.status === 'paid') {
        throw new Error('Долг уже полностью погашен');
      }

      // Если указан счет, проверяем его и списываем средства
      if (accountId) {
        const account = await Account.findOne({
          _id: accountId,
          userId,
        }).session(session);

        if (!account) {
          throw new Error('Счет не найден');
        }

        if (account.balance < amount) {
          throw new Error('Недостаточно средств на счете');
        }

        // Списываем средства со счета
        account.balance -= amount;

        // Добавляем запись в историю счета
        account.history.push({
          operationType: 'expense',
          amount,
          date: new Date(),
          description: description || `Платеж по долгу: ${debt.name}`,
        });

        await account.save({ session });
      }

      // Вносим платеж в долг
      debt.makePayment(amount, description || 'Платеж по долгу');
      await debt.save({ session });

      await session.commitTransaction();
      return debt;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Получить предстоящие платежи
   */
  async getUpcomingPayments(userId, days = 7) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    return Debt.find({
      userId,
      status: 'active',
      nextPaymentDate: { $lte: date },
    }).sort({ nextPaymentDate: 1 });
  }

  /**
   * Получить статистику по долгам
   */
  async getDebtsStats(userId) {
    const debts = await Debt.find({
      userId,
      status: { $ne: 'archived' },
    });

    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentAmount, 0);
    const activeDebts = debts.filter(debt => debt.status === 'active').length;
    const paidDebts = debts.filter(debt => debt.status === 'paid').length;

    const upcomingPayments = debts
      .filter(debt => debt.status === 'active' && debt.nextPaymentDate)
      .sort((a, b) => new Date(a.nextPaymentDate) - new Date(b.nextPaymentDate))
      .slice(0, 5);

    const byType = {
      credit: 0,
      loan: 0,
      creditCard: 0,
      personalDebt: 0,
    };

    debts.forEach(debt => {
      if (debt.status !== 'archived') {
        byType[debt.type] += debt.currentAmount;
      }
    });

    return {
      totalDebt,
      activeDebts,
      paidDebts,
      upcomingPayments,
      byType,
    };
  }
}

module.exports = new DebtService();

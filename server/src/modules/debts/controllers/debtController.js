const debtService = require('../services/debtService');

/**
 * Получить список долгов пользователя
 */
const getDebts = async (req, res) => {
  try {
    const { status } = req.query;
    const debts = await debtService.getUserDebts(req.user._id, status);
    res.status(200).json({
      status: 'success',
      data: debts,
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      error: error.message,
    });
  }
};

/**
 * Получить долг по ID
 */
const getDebtById = async (req, res) => {
  try {
    const debt = await debtService.getDebtById(req.params.id, req.user._id);

    if (!debt) {
      return res.status(404).json({ error: 'Долг не найден' });
    }

    res.status(200).json({ data: debt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Создать новый долг
 */
const createDebt = async (req, res) => {
  try {
    const {
      name,
      type,
      initialAmount,
      interestRate,
      startDate,
      endDate,
      paymentFrequency,
      lenderName,
      linkedAccountId,
    } = req.body;

    // Проверяем обязательные поля
    if (!name || !type || !initialAmount || !startDate) {
      return res.status(400).json({
        error: 'Пожалуйста, заполните все обязательные поля',
      });
    }

    // Проверяем корректность суммы
    if (initialAmount <= 0) {
      return res.status(400).json({
        error: 'Сумма должна быть положительным числом',
      });
    }

    const debt = await debtService.createDebt(
      {
        name,
        type,
        initialAmount,
        interestRate,
        startDate,
        endDate,
        paymentFrequency,
        lenderName,
        linkedAccountId,
      },
      req.user._id
    );

    res.status(201).json({ data: debt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Обновить долг
 */
const updateDebt = async (req, res) => {
  try {
    const {
      name,
      lenderName,
      interestRate,
      endDate,
      paymentFrequency,
      linkedAccountId,
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (lenderName !== undefined) updateData.lenderName = lenderName;
    if (interestRate !== undefined) updateData.interestRate = interestRate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (paymentFrequency !== undefined)
      updateData.paymentFrequency = paymentFrequency;
    if (linkedAccountId !== undefined)
      updateData.linkedAccountId = linkedAccountId;

    const debt = await debtService.updateDebt(
      req.params.id,
      updateData,
      req.user._id
    );

    res.status(200).json({ data: debt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Архивировать долг
 */
const archiveDebt = async (req, res) => {
  try {
    const debt = await debtService.archiveDebt(req.params.id, req.user._id);
    res.status(200).json({ data: debt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Восстановить долг из архива
 */
const restoreDebt = async (req, res) => {
  try {
    const debt = await debtService.restoreDebt(req.params.id, req.user._id);
    res.status(200).json({ data: debt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Совершить платеж по долгу
 */
const makePayment = async (req, res) => {
  try {
    const { amount, description, accountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Сумма платежа должна быть положительным числом',
      });
    }

    const debt = await debtService.makePayment(
      req.params.id,
      amount,
      description,
      accountId,
      req.user._id
    );

    res.status(200).json({ data: debt });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Получить предстоящие платежи
 */
const getUpcomingPayments = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const payments = await debtService.getUpcomingPayments(req.user._id, days);
    res.status(200).json({ data: payments });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Получить статистику по долгам
 */
const getDebtsStats = async (req, res) => {
  try {
    const stats = await debtService.getDebtsStats(req.user._id);
    res.status(200).json({ data: stats });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  archiveDebt,
  restoreDebt,
  makePayment,
  getUpcomingPayments,
  getDebtsStats,
};

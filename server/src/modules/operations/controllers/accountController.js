const { Account, Transaction } = require('../../../core/domain/entities');

/**
 * Получение всех счетов пользователя
 */
exports.getAccounts = async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    const accounts = await Account.find({
      userId: req.user._id,
      status: status,
    });

    res.json({
      status: 'success',
      data: accounts,
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении счетов',
    });
  }
};

/**
 * Получение счета по ID
 */
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        status: 'error',
        message: 'Счет не найден',
      });
    }

    res.json({
      status: 'success',
      data: account,
    });
  } catch (error) {
    console.error('Get account by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ошибка при получении счета',
    });
  }
};

/**
 * Создание нового счета
 */
exports.createAccount = async (req, res) => {
  try {
    const { type, name, cardInfo, balance, currency } = req.body;

    const account = new Account({
      userId: req.user._id,
      type,
      name,
      cardInfo,
      balance: balance || 0,
      currency: currency || 'RUB',
    });

    await account.save();

    // Если указан начальный баланс, создаем первую операцию
    if (balance && balance > 0) {
      account.history.push({
        operationType: 'income',
        amount: balance,
        description: 'Начальный баланс',
      });

      await account.save();
    }

    res.status(201).json({
      status: 'success',
      data: account,
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ message: 'Ошибка при создании счета' });
  }
};

/**
 * Обновление счета
 */
exports.updateAccount = async (req, res) => {
  try {
    const { name, cardInfo } = req.body;

    // Валидация данных
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Название счета обязательно' });
    }

    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    // Обновление только разрешенных полей
    if (name !== undefined) account.name = name.trim();
    if (cardInfo !== undefined) account.cardInfo = cardInfo;

    await account.save();

    res.json({
      status: 'success',
      data: account,
    });
  } catch (error) {
    console.error('Update account error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Некорректные данные',
        details: error.message,
      });
    }
    res.status(500).json({ message: 'Ошибка при обновлении счета' });
  }
};

/**
 * Архивация счета
 */
exports.archiveAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    account.status = 'archived';
    await account.save();

    res.json({ message: 'Счет архивирован' });
  } catch (error) {
    console.error('Archive account error:', error);
    res.status(500).json({ message: 'Ошибка при архивации счета' });
  }
};

/**
 * Восстановление счета из архива
 */
exports.restoreAccount = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    account.status = 'active';
    await account.save();

    res.json({ message: 'Счет восстановлен из архива' });
  } catch (error) {
    console.error('Restore account error:', error);
    res.status(500).json({
      message: 'Ошибка при восстановлении счета из архива',
    });
  }
};

/**
 * Перевод средств между счетами
 */
exports.transferFunds = async (req, res) => {
  try {
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
      return res.status(400).json({
        message: 'Все поля обязательны и сумма должна быть положительной',
      });
    }

    // Находим исходный счет
    const fromAccount = await Account.findOne({
      _id: fromAccountId,
      userId: req.user._id,
      status: 'active',
    });

    if (!fromAccount) {
      return res.status(404).json({ message: 'Исходный счет не найден' });
    }

    // Находим целевой счет
    const toAccount = await Account.findOne({
      _id: toAccountId,
      userId: req.user._id,
      status: 'active',
    });

    if (!toAccount) {
      return res.status(404).json({ message: 'Целевой счет не найден' });
    }

    // Проверяем достаточность средств
    if (fromAccount.balance < amount) {
      return res
        .status(400)
        .json({ message: 'Недостаточно средств для перевода' });
    }

    // Создаем транзакцию
    const transaction = new Transaction({
      userId: req.user._id,
      type: 'transfer',
      amount,
      accountId: fromAccountId,
      toAccountId,
      date: new Date(),
      description: description || 'Перевод средств',
    });

    // Сохраняем транзакцию
    await transaction.save();

    // Пересчитываем балансы обоих счетов для точности
    const balanceService = require('../services/balanceService');
    const fromAccountBalance = await balanceService.recalculateAccountBalance(
      fromAccountId
    );
    const toAccountBalance = await balanceService.recalculateAccountBalance(
      toAccountId
    );

    // Получаем обновленные счета
    const updatedFromAccount = await Account.findById(fromAccountId);
    const updatedToAccount = await Account.findById(toAccountId);

    console.log('✅ Перевод выполнен и балансы пересчитаны:', {
      transactionId: transaction._id,
      fromAccountBalance: fromAccountBalance.newBalance,
      toAccountBalance: toAccountBalance.newBalance,
    });

    res.json({
      message: 'Перевод выполнен успешно',
      transaction,
      fromAccount: {
        id: updatedFromAccount._id,
        name: updatedFromAccount.name,
        balance: updatedFromAccount.balance,
      },
      toAccount: {
        id: updatedToAccount._id,
        name: updatedToAccount.name,
        balance: updatedToAccount.balance,
      },
      balanceInfo: {
        fromAccount: fromAccountBalance,
        toAccount: toAccountBalance,
      },
    });
  } catch (error) {
    console.error('Transfer funds error:', error);
    res.status(500).json({ message: 'Ошибка при переводе средств' });
  }
};

/**
 * Получение истории операций по счету
 */
exports.getAccountHistory = async (req, res) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('history.linkedAccountId');

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    // Сортируем историю по дате в обратном порядке
    const sortedHistory = account.history.sort((a, b) => b.date - a.date);

    res.json(sortedHistory);
  } catch (error) {
    console.error('Get account history error:', error);
    res.status(500).json({
      message: 'Ошибка при получении истории операций',
    });
  }
};

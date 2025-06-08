const {
  Transaction,
  Account,
  Category,
} = require('../../../core/domain/entities');

/**
 * Получение всех транзакций пользователя
 */
exports.getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'date',
      order = 'desc',
      type,
      accountId,
      categoryId,
      startDate,
      endDate,
      status = 'active',
    } = req.query;

    // Создаем базовый фильтр по пользователю и статусу
    const filter = {
      userId: req.user._id,
      status,
    };

    // Добавляем дополнительные фильтры, если они указаны
    if (type) filter.type = type;
    if (accountId) filter.accountId = accountId;
    if (categoryId) filter.categoryId = categoryId;

    // Фильтр по дате
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Сортировка
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Пагинация
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Выполняем запрос
    const transactions = await Transaction.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('accountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('categoryId', 'name type icon');

    // Считаем общее количество для пагинации
    const total = await Transaction.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        transactions,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Ошибка при получении транзакций' });
  }
};

/**
 * Получение транзакции по ID
 */
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate('accountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('categoryId', 'name type icon');

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    res.json({
      status: 'success',
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction by ID error:', error);
    res.status(500).json({ message: 'Ошибка при получении транзакции' });
  }
};

/**
 * Создание транзакции дохода или расхода
 */
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, categoryId, accountId, date, description } = req.body;

    console.log('🔄 Создание транзакции:', {
      type,
      amount,
      categoryId,
      accountId,
      date,
      description,
      userId: req.user._id,
    });

    // Проверка авторизации
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        message: 'Пользователь не авторизован',
      });
    }

    // Проверка обязательных полей
    if (
      !type ||
      !amount ||
      !accountId ||
      !['income', 'expense'].includes(type)
    ) {
      return res.status(400).json({
        message: 'Некорректные данные для создания транзакции',
      });
    }

    // Проверка существования счета
    const account = await Account.findOne({
      _id: accountId,
      userId: req.user._id,
      status: 'active',
    });

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    // Проверка категории, если указана
    if (categoryId) {
      const category = await Category.findOne({
        _id: categoryId,
        userId: req.user._id,
        type,
        status: 'active',
      });

      if (!category) {
        return res.status(404).json({ message: 'Категория не найдена' });
      }
    }

    // Создаем транзакцию
    const transaction = new Transaction({
      userId: req.user._id,
      type,
      amount,
      categoryId,
      accountId,
      date: date || new Date(),
      description,
    });

    // Проверка достаточности средств для расхода
    if (type === 'expense' && account.balance < amount) {
      return res.status(400).json({ message: 'Недостаточно средств на счете' });
    }

    // Сохраняем транзакцию (баланс обновится автоматически через middleware)
    await transaction.save();

    // Получаем созданную транзакцию с populated данными
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'name type')
      .populate('categoryId', 'name type icon');

    // Получаем обновленный счет после middleware
    const updatedAccount = await Account.findById(accountId);

    console.log('✅ Транзакция успешно создана:', {
      transactionId: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      accountBalance: updatedAccount.balance,
    });

    res.status(201).json({
      status: 'success',
      data: {
        transaction: populatedTransaction,
        account: {
          id: updatedAccount._id,
          name: updatedAccount.name,
          balance: updatedAccount.balance,
        },
      },
    });
  } catch (error) {
    console.error('❌ Create transaction error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?._id,
      body: req.body,
    });

    // Детализированная обработка ошибок
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Ошибка валидации данных транзакции',
        details: error.message,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Некорректный ID объекта',
        details: error.message,
      });
    }

    res.status(500).json({ message: 'Ошибка при создании транзакции' });
  }
};

/**
 * Обновление транзакции
 */
exports.updateTransaction = async (req, res) => {
  try {
    const { categoryId, description, amount, date, accountId, toAccountId } =
      req.body;

    console.log('🔄 Обновление транзакции:', {
      transactionId: req.params.id,
      userId: req.user._id,
      requestBody: req.body,
    });

    // Находим транзакцию
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Сохраняем данные старой транзакции для пересчета баланса
    const oldAmount = transaction.amount;
    const oldAccountId = transaction.accountId;
    const oldToAccountId = transaction.toAccountId;
    const oldType = transaction.type;
    let balanceUpdateNeeded = false;
    let accountsChanged = false;

    // Проверяем изменение счетов
    if (accountId !== undefined && accountId !== oldAccountId.toString()) {
      // Проверяем, что новый счет существует и принадлежит пользователю
      const newAccount = await Account.findOne({
        _id: accountId,
        userId: req.user._id,
        status: 'active',
      });

      if (!newAccount) {
        return res.status(404).json({ message: 'Выбранный счет не найден' });
      }

      transaction.accountId = accountId;
      accountsChanged = true;
    }

    if (
      oldType === 'transfer' &&
      toAccountId !== undefined &&
      toAccountId !== oldToAccountId?.toString()
    ) {
      // Проверяем, что новый целевой счет существует и принадлежит пользователю
      const newToAccount = await Account.findOne({
        _id: toAccountId,
        userId: req.user._id,
        status: 'active',
      });

      if (!newToAccount) {
        return res
          .status(404)
          .json({ message: 'Выбранный целевой счет не найден' });
      }

      if (
        accountId === toAccountId ||
        (accountId === undefined &&
          transaction.accountId.toString() === toAccountId)
      ) {
        return res.status(400).json({ message: 'Счета должны быть разными' });
      }

      transaction.toAccountId = toAccountId;
      accountsChanged = true;
    }

    // Проверка категории, если указана
    if (categoryId !== undefined) {
      if (categoryId) {
        const category = await Category.findOne({
          _id: categoryId,
          userId: req.user._id,
          type: transaction.type,
          status: 'active',
        });

        if (!category) {
          return res.status(404).json({ message: 'Категория не найдена' });
        }
        transaction.categoryId = categoryId;
      } else {
        // Если categoryId пустой, убираем категорию
        transaction.categoryId = null;
      }
    }

    // Обновляем описание
    if (description !== undefined) {
      transaction.description = description;
    }

    // Обновляем дату
    if (date !== undefined) {
      transaction.date = new Date(date);
    }

    // Обновляем сумму
    if (amount !== undefined && amount !== oldAmount) {
      // Валидация суммы
      if (amount <= 0) {
        return res
          .status(400)
          .json({ message: 'Сумма должна быть больше нуля' });
      }

      transaction.amount = amount;
      balanceUpdateNeeded = true;
    }

    // Если изменились счета или сумма, нужно пересчитать балансы вручную
    if (balanceUpdateNeeded || accountsChanged) {
      // Устанавливаем флаг для пропуска middleware
      transaction._skipBalanceUpdate = true;

      // Сначала отменяем старую операцию
      const oldAccount = await Account.findById(oldAccountId);
      if (!oldAccount) {
        return res.status(404).json({ message: 'Старый счет не найден' });
      }

      if (oldType === 'transfer') {
        if (oldToAccountId) {
          const oldToAccount = await Account.findById(oldToAccountId);
          if (oldToAccount) {
            // Отменяем старую операцию перевода
            oldAccount.balance += oldAmount;
            oldToAccount.balance -= oldAmount;
            await oldToAccount.save();
          }
        }
      } else {
        // Отменяем старую операцию дохода/расхода
        if (oldType === 'income') {
          oldAccount.balance -= oldAmount;
        } else if (oldType === 'expense') {
          oldAccount.balance += oldAmount;
        }
      }
      await oldAccount.save();

      // Теперь применяем новую операцию с новыми счетами и суммой
      const newAmount = amount !== undefined ? amount : oldAmount;
      const newAccount = await Account.findById(transaction.accountId);

      if (!newAccount) {
        return res.status(404).json({ message: 'Новый счет не найден' });
      }

      if (transaction.type === 'transfer') {
        if (transaction.toAccountId) {
          const newToAccount = await Account.findById(transaction.toAccountId);
          if (!newToAccount) {
            return res
              .status(404)
              .json({ message: 'Новый целевой счет не найден' });
          }

          // Проверяем достаточность средств
          if (newAccount.balance < newAmount) {
            return res.status(400).json({
              message: 'Недостаточно средств на счете для перевода',
            });
          }

          // Применяем новую операцию перевода
          newAccount.balance -= newAmount;
          newToAccount.balance += newAmount;
          await newToAccount.save();
        }
      } else {
        // Для обычных доходов и расходов
        if (transaction.type === 'income') {
          newAccount.balance += newAmount;
        } else if (transaction.type === 'expense') {
          // Проверяем достаточность средств
          if (newAccount.balance < newAmount) {
            return res.status(400).json({
              message: 'Недостаточно средств на счете для данной операции',
            });
          }
          newAccount.balance -= newAmount;
        }
      }

      await newAccount.save();
    }

    await transaction.save();

    console.log('✅ Транзакция успешно обновлена:', {
      transactionId: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId,
    });

    // Возвращаем обновленную транзакцию с данными счета
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'name type balance')
      .populate('toAccountId', 'name type balance')
      .populate('categoryId', 'name icon');

    res.json({
      status: 'success',
      data: populatedTransaction,
    });
  } catch (error) {
    console.error('❌ Update transaction error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      userId: req.user?._id,
      transactionId: req.params.id,
      body: req.body,
    });

    // Детализированная обработка ошибок
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Ошибка валидации при обновлении транзакции',
        details: error.message,
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Некорректный ID объекта',
        details: error.message,
      });
    }

    res.status(500).json({ message: 'Ошибка при обновлении транзакции' });
  }
};

/**
 * Архивация транзакции
 */
exports.archiveTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Для архивации транзакции необходимо также обновить баланс счета
    const account = await Account.findById(transaction.accountId);

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    // Меняем баланс в обратную сторону
    if (transaction.type === 'income') {
      account.balance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      account.balance += transaction.amount;
    } else if (transaction.type === 'transfer') {
      // Для переводов нужно обработать оба счета
      const toAccount = await Account.findById(transaction.toAccountId);

      if (!toAccount) {
        return res.status(404).json({ message: 'Целевой счет не найден' });
      }

      account.balance += transaction.amount;
      toAccount.balance -= transaction.amount;
      toAccount.status = 'active'; // На случай, если статус изменится
      await toAccount.save();
    }

    // Обновляем статус транзакции и счета
    transaction.status = 'archived';
    transaction._skipBalanceUpdate = true; // Пропускаем middleware обновления баланса
    account.status = 'active'; // На случай, если статус изменится

    await Promise.all([transaction.save(), account.save()]);

    res.json({ message: 'Транзакция архивирована' });
  } catch (error) {
    console.error('Archive transaction error:', error);
    res.status(500).json({ message: 'Ошибка при архивации транзакции' });
  }
};

/**
 * Восстановление транзакции из архива
 */
exports.restoreTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'archived',
    });

    if (!transaction) {
      return res
        .status(404)
        .json({ message: 'Транзакция не найдена или не архивирована' });
    }

    // Для восстановления транзакции необходимо также обновить баланс счета
    const account = await Account.findById(transaction.accountId);

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    // Меняем баланс согласно типу транзакции
    if (transaction.type === 'income') {
      account.balance += transaction.amount;
    } else if (transaction.type === 'expense') {
      // Проверка достаточности средств
      if (account.balance < transaction.amount) {
        return res.status(400).json({
          message: 'Недостаточно средств на счете для восстановления расхода',
        });
      }
      account.balance -= transaction.amount;
    } else if (transaction.type === 'transfer') {
      // Для переводов нужно обработать оба счета
      const toAccount = await Account.findById(transaction.toAccountId);

      if (!toAccount) {
        return res.status(404).json({ message: 'Целевой счет не найден' });
      }

      // Проверка достаточности средств
      if (account.balance < transaction.amount) {
        return res.status(400).json({
          message:
            'Недостаточно средств на исходном счете для восстановления перевода',
        });
      }

      account.balance -= transaction.amount;
      toAccount.balance += transaction.amount;
      await toAccount.save();
    }

    // Обновляем статус транзакции и сохраняем изменения
    transaction.status = 'active';
    transaction._skipBalanceUpdate = true; // Пропускаем middleware обновления баланса

    await Promise.all([transaction.save(), account.save()]);

    res.json({ message: 'Транзакция восстановлена из архива' });
  } catch (error) {
    console.error('Restore transaction error:', error);
    res.status(500).json({
      message: 'Ошибка при восстановлении транзакции',
    });
  }
};

/**
 * Удаление транзакции
 */
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакция не найдена' });
    }

    // Для удаления транзакции необходимо обновить баланс счета
    const account = await Account.findById(transaction.accountId);

    if (!account) {
      return res.status(404).json({ message: 'Счет не найден' });
    }

    // Меняем баланс в обратную сторону
    if (transaction.type === 'income') {
      account.balance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      account.balance += transaction.amount;
    } else if (transaction.type === 'transfer') {
      // Для переводов нужно обработать оба счета
      const toAccount = await Account.findById(transaction.toAccountId);

      if (!toAccount) {
        return res.status(404).json({ message: 'Целевой счет не найден' });
      }

      account.balance += transaction.amount;
      toAccount.balance -= transaction.amount;
      await toAccount.save();
    }

    // Сохраняем изменения счета и удаляем транзакцию
    await account.save();
    await Transaction.findByIdAndDelete(req.params.id);

    res.json({ message: 'Транзакция удалена' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Ошибка при удалении транзакции' });
  }
};

/**
 * Пересчет балансов всех счетов на основе транзакций
 * Используется для исправления ошибок в балансах
 */
exports.recalculateBalances = async (req, res) => {
  try {
    console.log(
      '🔄 Начинаем пересчет балансов для пользователя:',
      req.user._id
    );

    // Получаем все счета пользователя
    const accounts = await Account.find({
      userId: req.user._id,
      status: 'active',
    });

    const results = [];

    for (const account of accounts) {
      const oldBalance = account.balance;

      // Сбрасываем баланс на ноль
      account.balance = 0;

      // Получаем все активные транзакции для этого счета
      const transactions = await Transaction.find({
        $or: [{ accountId: account._id }, { toAccountId: account._id }],
        status: 'active',
      }).sort({ date: 1 });

      // Пересчитываем баланс на основе транзакций
      for (const transaction of transactions) {
        if (transaction.accountId.toString() === account._id.toString()) {
          // Это исходящий счет
          if (transaction.type === 'income') {
            account.balance += transaction.amount;
          } else if (
            transaction.type === 'expense' ||
            transaction.type === 'transfer'
          ) {
            account.balance -= transaction.amount;
          }
        } else if (
          transaction.toAccountId &&
          transaction.toAccountId.toString() === account._id.toString()
        ) {
          // Это входящий счет для перевода
          if (transaction.type === 'transfer') {
            account.balance += transaction.amount;
          }
        }
      }

      await account.save();

      results.push({
        accountId: account._id,
        accountName: account.name,
        oldBalance,
        newBalance: account.balance,
        difference: account.balance - oldBalance,
        transactionsProcessed: transactions.length,
      });

      console.log(`✅ Пересчитан баланс для счета ${account.name}:`, {
        старый: oldBalance,
        новый: account.balance,
        разница: account.balance - oldBalance,
      });
    }

    console.log('✅ Пересчет балансов завершен');

    res.json({
      status: 'success',
      message: 'Балансы успешно пересчитаны',
      data: {
        accountsProcessed: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка при пересчете балансов:', error);
    res.status(500).json({
      message: 'Ошибка при пересчете балансов',
      error: error.message,
    });
  }
};

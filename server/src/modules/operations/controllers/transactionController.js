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

    // Обновляем баланс счета
    if (type === 'income') {
      account.balance += amount;
      account.history.push({
        operationType: 'income',
        type: 'income',
        amount,
        date: transaction.date,
        description: description || 'Доход',
      });
    } else {
      // Проверка достаточности средств для расхода
      if (account.balance < amount) {
        return res
          .status(400)
          .json({ message: 'Недостаточно средств на счете' });
      }
      account.balance -= amount;
      account.history.push({
        operationType: 'expense',
        type: 'expense',
        amount,
        date: transaction.date,
        description: description || 'Расход',
      });
    }

    // Сохраняем изменения
    await Promise.all([transaction.save(), account.save()]);

    // Получаем созданную транзакцию с populated данными
    const populatedTransaction = await Transaction.findById(transaction._id)
      .populate('accountId', 'name type')
      .populate('categoryId', 'name type icon');

    console.log('✅ Транзакция успешно создана:', {
      transactionId: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
      accountBalance: account.balance,
    });

    res.status(201).json({
      status: 'success',
      data: {
        transaction: populatedTransaction,
        account: {
          id: account._id,
          name: account.name,
          balance: account.balance,
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
    const { categoryId, description, amount, date } = req.body;

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
    const oldType = transaction.type;
    let balanceUpdateNeeded = false;

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

    // Обновляем сумму и пересчитываем баланс счета
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

    // Если изменилась сумма, нужно обновить баланс счета
    if (balanceUpdateNeeded) {
      const account = await Account.findById(transaction.accountId);

      if (!account) {
        return res.status(404).json({ message: 'Счет не найден' });
      }

      // Обработка для разных типов транзакций
      if (oldType === 'transfer') {
        // Для переводов нужно обработать оба счёта
        const toAccount = await Account.findById(transaction.toAccountId);

        if (!toAccount) {
          return res
            .status(404)
            .json({ message: 'Целевой счет для перевода не найден' });
        }

        // Отменяем старую операцию перевода
        account.balance += oldAmount; // Возвращаем средства на исходный счёт
        toAccount.balance -= oldAmount; // Убираем средства с целевого счёта

        // Проверяем достаточность средств для новой суммы
        if (account.balance < amount) {
          return res.status(400).json({
            message:
              'Недостаточно средств на исходном счете для данной операции',
          });
        }

        // Применяем новую операцию перевода
        account.balance -= amount;
        toAccount.balance += amount;

        // Добавляем записи в историю обоих счетов
        account.history.push({
          operationType: 'transfer',
          type: 'transfer',
          amount: amount,
          date: new Date(),
          description: `Изменение перевода: ${description || 'Без описания'}`,
          linkedAccountId: toAccount._id,
          transactionId: transaction._id,
        });

        toAccount.history.push({
          operationType: 'transfer',
          type: 'transfer',
          amount: amount,
          date: new Date(),
          description: `Получение изменённого перевода: ${
            description || 'Без описания'
          }`,
          linkedAccountId: account._id,
          transactionId: transaction._id,
        });

        await toAccount.save();
      } else {
        // Для обычных доходов и расходов
        // Сначала "отменяем" старую операцию
        if (oldType === 'income') {
          account.balance -= oldAmount;
        } else if (oldType === 'expense') {
          account.balance += oldAmount;
        }

        // Затем применяем новую операцию
        if (oldType === 'income') {
          account.balance += amount;
        } else if (oldType === 'expense') {
          // Проверяем достаточность средств для расходной операции
          if (account.balance < amount) {
            return res.status(400).json({
              message: 'Недостаточно средств на счете для данной операции',
            });
          }
          account.balance -= amount;
        }

        // Добавляем запись в историю счета с обязательными полями
        account.history.push({
          operationType: oldType,
          type: oldType, // Обязательное поле!
          amount: amount,
          date: new Date(),
          description: `Изменение операции: ${description || 'Без описания'}`,
          transactionId: transaction._id,
        });
      }

      await account.save();
    }

    await transaction.save();

    console.log('✅ Транзакция успешно обновлена:', {
      transactionId: transaction._id,
      type: transaction.type,
      amount: transaction.amount,
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

    await Promise.all([transaction.save(), account.save()]);

    res.json({ message: 'Транзакция восстановлена из архива' });
  } catch (error) {
    console.error('Restore transaction error:', error);
    res.status(500).json({
      message: 'Ошибка при восстановлении транзакции',
    });
  }
};

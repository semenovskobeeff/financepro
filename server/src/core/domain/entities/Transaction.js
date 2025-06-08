const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пользователь обязателен'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Тип транзакции обязателен'],
      enum: {
        values: ['income', 'expense', 'transfer'],
        message: '{VALUE} не является допустимым типом транзакции',
      },
    },
    amount: {
      type: Number,
      required: [true, 'Сумма транзакции обязательна'],
      min: [0.01, 'Сумма должна быть больше 0'],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: 'Сумма должна быть положительным числом',
      },
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      validate: {
        validator: function (value) {
          // Категория обязательна для доходов и расходов, но не для переводов
          if (this.type === 'transfer') {
            return value == null;
          }
          return value != null;
        },
        message: 'Категория обязательна для доходов и расходов',
      },
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'sourceModel',
    },
    sourceModel: {
      type: String,
      enum: ['Goal', 'Debt', 'Subscription'],
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Счет-источник обязателен'],
    },
    toAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      validate: {
        validator: function (value) {
          // toAccountId обязателен только для переводов
          if (this.type === 'transfer') {
            return (
              value != null && value.toString() !== this.accountId.toString()
            );
          }
          return value == null;
        },
        message:
          'Счет назначения обязателен для переводов и должен отличаться от счета-источника',
      },
    },
    date: {
      type: Date,
      required: [true, 'Дата транзакции обязательна'],
      default: Date.now,
      validate: {
        validator: function (value) {
          // Дата не может быть в будущем (с учетом часового пояса)
          return value <= new Date();
        },
        message: 'Дата транзакции не может быть в будущем',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Описание не может превышать 500 символов'],
    },
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: {
        values: ['active', 'archived', 'pending', 'failed'],
        message: '{VALUE} не является допустимым статусом',
      },
    },

    // Метаданные для аудита
    processingStatus: {
      type: String,
      default: 'completed',
      enum: ['pending', 'processing', 'completed', 'failed'],
    },
    balanceSnapshot: {
      accountBalance: Number,
      toAccountBalance: Number,
    },

    // Поля для интеграции с внешними системами
    externalId: {
      type: String,
    },
    externalSystem: {
      type: String,
      enum: ['bank_api', 'manual', 'recurring', 'import'],
    },

    // Теги для категоризации
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [50, 'Тег не может превышать 50 символов'],
      },
    ],

    // Геолокация (опционально)
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (value) {
            if (!value || value.length === 0) return true; // Разрешаем пустые значения
            return (
              value.length === 2 &&
              value[0] >= -180 &&
              value[0] <= 180 && // longitude
              value[1] >= -90 &&
              value[1] <= 90
            ); // latitude
          },
          message: 'Некорректные координаты',
        },
      },
    },

    // Поля для повторяющихся транзакций
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
      },
      interval: {
        type: Number,
        min: 1,
        default: 1,
      },
      endDate: Date,
      nextOccurrence: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Составные индексы
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ accountId: 1, date: -1 });
transactionSchema.index({ categoryId: 1, date: -1 });
transactionSchema.index({ date: -1 });
// Индекс для поля externalId (исправлено дублирование - убрана опция sparse из поля схемы)
transactionSchema.index({ externalId: 1 }, { sparse: true });

// Геопространственный индекс
transactionSchema.index({ location: '2dsphere' });

// Виртуальные поля
transactionSchema.virtual('account', {
  ref: 'Account',
  localField: 'accountId',
  foreignField: '_id',
  justOne: true,
});

transactionSchema.virtual('toAccount', {
  ref: 'Account',
  localField: 'toAccountId',
  foreignField: '_id',
  justOne: true,
});

transactionSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

transactionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Middleware для валидации перед сохранением
transactionSchema.pre('save', async function (next) {
  try {
    console.log('🔍 Валидация транзакции перед сохранением:', {
      id: this._id,
      type: this.type,
      amount: this.amount,
      categoryId: this.categoryId,
      accountId: this.accountId,
      userId: this.userId,
    });

    // Проверяем существование связанных документов
    if (this.categoryId && this.type !== 'transfer') {
      const Category = mongoose.model('Category');
      const category = await Category.findById(this.categoryId);
      if (!category) {
        throw new Error('Указанная категория не найдена');
      }
      if (category.type !== this.type) {
        throw new Error('Тип категории не соответствует типу транзакции');
      }
    }

    // Проверяем существование счетов
    const Account = mongoose.model('Account');
    const account = await Account.findById(this.accountId);
    if (!account) {
      throw new Error('Счет-источник не найден');
    }

    if (this.toAccountId) {
      const toAccount = await Account.findById(this.toAccountId);
      if (!toAccount) {
        throw new Error('Счет назначения не найден');
      }
    }

    console.log('✅ Валидация транзакции прошла успешно');
    next();
  } catch (error) {
    console.error('❌ Ошибка валидации транзакции:', error.message);
    next(error);
  }
});

// Middleware для обновления балансов счетов - ОТКЛЮЧЕН
/*
transactionSchema.post('save', async function (doc) {
  try {
    // Пропускаем обновление баланса если установлен флаг
    if (doc._skipBalanceUpdate) {
      console.log('⏭️ Пропуск обновления баланса по флагу _skipBalanceUpdate');
      return;
    }

    console.log('🔄 Обновление балансов после сохранения транзакции:', doc._id);

    const Account = mongoose.model('Account');
    const balanceService = require('../../../modules/operations/services/balanceService');

    // Проверяем и синхронизируем баланс основного счета
    const account = await Account.findById(doc.accountId);
    if (!account) {
      console.error('❌ Счет-источник не найден:', doc.accountId);
      return;
    }

    // Проверяем, что счет принадлежит тому же пользователю
    if (account.userId.toString() !== doc.userId.toString()) {
      console.error('❌ Счет не принадлежит пользователю:', doc.accountId);
      return;
    }

    // Автосинхронизация баланса основного счета
    await balanceService.syncAccountBalance(doc.accountId);

    // Для переводов синхронизируем и целевой счет
    if (doc.type === 'transfer' && doc.toAccountId) {
      const toAccount = await Account.findById(doc.toAccountId);
      if (!toAccount) {
        console.error('❌ Счет назначения не найден:', doc.toAccountId);
        return;
      }

      // Проверяем, что счет принадлежит тому же пользователю
      if (toAccount.userId.toString() !== doc.userId.toString()) {
        console.error(
          '❌ Счет назначения не принадлежит пользователю:',
          doc.toAccountId
        );
        return;
      }

      // Автосинхронизация баланса целевого счета
      await balanceService.syncAccountBalance(doc.toAccountId);
    }

    console.log(
      '✅ Автосинхронизация балансов завершена для операции:',
      doc._id
    );
  } catch (error) {
    console.error('❌ Ошибка при автосинхронизации балансов:', error);

    // В случае критической ошибки запускаем полную проверку и исправление
    try {
      const balanceService = require('../../../modules/operations/services/balanceService');
      console.log('🚨 Запуск аварийной синхронизации балансов...');
      await balanceService.validateAndFixBalances(doc.userId, true);
    } catch (emergencyError) {
      console.error(
        '❌ Критическая ошибка аварийной синхронизации:',
        emergencyError
      );
    }
  }
});
*/

// Статические методы
transactionSchema.statics.findByUserId = function (userId, options = {}) {
  const {
    status = 'active',
    type,
    accountId,
    categoryId,
    startDate,
    endDate,
    limit = 50,
    skip = 0,
    sort = { date: -1 },
  } = options;

  const query = { userId, status };

  if (type) query.type = type;
  if (accountId) query.accountId = accountId;
  if (categoryId) query.categoryId = categoryId;

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  return this.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('categoryId', 'name icon type')
    .populate('accountId', 'name type')
    .populate('toAccountId', 'name type');
};

transactionSchema.statics.getStats = function (userId, options = {}) {
  const { startDate, endDate, groupBy = 'month' } = options;

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    status: 'active',
  };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  const groupFormat =
    groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-%U' : '%Y-%m';

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          period: { $dateToString: { format: groupFormat, date: '$date' } },
          type: '$type',
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.period',
        stats: {
          $push: {
            type: '$_id.type',
            total: '$total',
            count: '$count',
          },
        },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);

const mongoose = require('mongoose');

const accountHistorySchema = new mongoose.Schema(
  {
    operationType: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'transfer'],
    },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'transfer'],
    },
    amount: {
      type: Number,
      required: [true, 'Сумма операции обязательна'],
      min: [0, 'Сумма не может быть отрицательной'],
    },
    date: {
      type: Date,
      required: [true, 'Дата операции обязательна'],
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание не может превышать 200 символов'],
    },
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  {
    _id: false,
  }
);

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пользователь обязателен'],
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Тип счета обязателен'],
      enum: {
        values: ['bank', 'deposit', 'goal', 'credit', 'subscription'],
        message: '{VALUE} не является допустимым типом счета',
      },
    },
    name: {
      type: String,
      required: [true, 'Название счета обязательно'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
    },
    cardInfo: {
      type: String,
      trim: true,
      maxlength: [50, 'Информация о карте не может превышать 50 символов'],
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: function (value) {
          // Для кредитных счетов разрешаем отрицательный баланс
          if (this.type === 'credit') {
            return true;
          }
          return value >= 0;
        },
        message: 'Баланс не может быть отрицательным для данного типа счета',
      },
    },
    currency: {
      type: String,
      required: true,
      default: 'RUB',
      enum: {
        values: ['RUB', 'USD', 'EUR'],
        message: '{VALUE} не является поддерживаемой валютой',
      },
    },
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: {
        values: ['active', 'archived'],
        message: '{VALUE} не является допустимым статусом',
      },
    },
    history: [accountHistorySchema],

    // Дополнительные поля для различных типов счетов
    creditLimit: {
      type: Number,
      min: [0, 'Кредитный лимит не может быть отрицательным'],
      validate: {
        validator: function (value) {
          // Кредитный лимит только для кредитных счетов
          return this.type === 'credit' || value == null;
        },
        message: 'Кредитный лимит доступен только для кредитных счетов',
      },
    },
    interestRate: {
      type: Number,
      min: [0, 'Процентная ставка не может быть отрицательной'],
      max: [100, 'Процентная ставка не может превышать 100%'],
      validate: {
        validator: function (value) {
          // Процентная ставка для депозитов и кредитов
          return ['deposit', 'credit'].includes(this.type) || value == null;
        },
        message:
          'Процентная ставка доступна только для депозитов и кредитных счетов',
      },
    },

    // Метаданные
    lastTransactionDate: {
      type: Date,
    },
    transactionCount: {
      type: Number,
      default: 0,
      min: [0, 'Количество транзакций не может быть отрицательным'],
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
accountSchema.index({ userId: 1, status: 1 });
accountSchema.index({ userId: 1, type: 1 });
accountSchema.index({ createdAt: -1 });
accountSchema.index({ updatedAt: -1 });

// Виртуальные поля
accountSchema.virtual('availableBalance').get(function () {
  if (this.type === 'credit') {
    return (this.creditLimit || 0) + this.balance;
  }
  return this.balance;
});

accountSchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'accountId',
});

// Middleware для обновления статистики
accountSchema.pre('save', function (next) {
  if (this.isModified('history')) {
    this.transactionCount = this.history.length;
    if (this.history.length > 0) {
      this.lastTransactionDate = Math.max(
        ...this.history.map(h => new Date(h.date))
      );
    }
  }
  next();
});

// Методы экземпляра
accountSchema.methods.addTransaction = function (transactionData) {
  this.history.push({
    ...transactionData,
    date: transactionData.date || new Date(),
  });

  // Обновляем баланс
  if (transactionData.type === 'income') {
    this.balance += transactionData.amount;
  } else if (transactionData.type === 'expense') {
    this.balance -= transactionData.amount;
  }

  return this.save();
};

accountSchema.methods.updateBalance = function (amount, operation = 'add') {
  if (operation === 'add') {
    this.balance += amount;
  } else if (operation === 'subtract') {
    this.balance -= amount;
  } else if (operation === 'set') {
    this.balance = amount;
  }

  return this.save();
};

// Статические методы
accountSchema.statics.findByUserId = function (userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).sort({ createdAt: -1 });
};

accountSchema.statics.getTotalBalance = function (userId, currency = 'RUB') {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        currency,
        status: 'active',
      },
    },
    { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
  ]);
};

module.exports = mongoose.model('Account', accountSchema);

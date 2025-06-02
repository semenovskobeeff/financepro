const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionHistorySchema = new Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    date: {
      type: Date,
      required: [true, 'Дата платежа обязательна'],
      default: Date.now,
    },
    amount: {
      type: Number,
      required: [true, 'Сумма платежа обязательна'],
      min: [0.01, 'Сумма должна быть больше 0'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['success', 'pending', 'failed'],
        message: '{VALUE} не является допустимым статусом платежа',
      },
      default: 'success',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание не может превышать 200 символов'],
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    failureReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Причина неудачи не может превышать 300 символов'],
    },
  },
  { _id: false }
);

const subscriptionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пользователь обязателен'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Название подписки обязательно'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Описание не может превышать 500 символов'],
    },
    amount: {
      type: Number,
      required: [true, 'Сумма подписки обязательна'],
      min: [0.01, 'Сумма должна быть больше 0'],
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
    frequency: {
      type: String,
      required: [true, 'Частота платежей обязательна'],
      enum: {
        values: [
          'weekly',
          'biweekly',
          'monthly',
          'quarterly',
          'yearly',
          'custom',
        ],
        message: '{VALUE} не является допустимой частотой платежей',
      },
    },
    customFrequencyDays: {
      type: Number,
      min: [1, 'Кастомная частота должна быть минимум 1 день'],
      max: [365, 'Кастомная частота не может превышать 365 дней'],
      validate: {
        validator: function (value) {
          return this.frequency !== 'custom' || (value != null && value > 0);
        },
        message: 'Кастомная частота обязательна при выборе "custom"',
      },
    },
    startDate: {
      type: Date,
      required: [true, 'Дата начала подписки обязательна'],
    },
    nextPaymentDate: {
      type: Date,
      required: [true, 'Дата следующего платежа обязательна'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.startDate;
        },
        message: 'Дата окончания должна быть позже даты начала',
      },
    },
    lastPaymentDate: {
      type: Date,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Связанный счет обязателен'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    autoPayment: {
      type: Boolean,
      default: true,
    },
    paymentHistory: [subscriptionHistorySchema],
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: {
        values: ['active', 'paused', 'cancelled', 'archived'],
        message: '{VALUE} не является допустимым статусом',
      },
    },

    // Дополнительные поля
    provider: {
      type: String,
      trim: true,
      maxlength: [100, 'Название провайдера не может превышать 100 символов'],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'URL веб-сайта не может превышать 200 символов'],
      validate: {
        validator: function (value) {
          if (!value) return true;
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Некорректный URL веб-сайта',
      },
    },
    contractNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Номер договора не может превышать 50 символов'],
    },

    // Настройки уведомлений
    notifications: {
      enabled: {
        type: Boolean,
        default: true,
      },
      daysBefore: {
        type: Number,
        min: [0, 'Количество дней не может быть отрицательным'],
        max: [30, 'Количество дней не может превышать 30'],
        default: 3,
      },
      email: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },

    // Статистика
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Общая сумма выплат не может быть отрицательной'],
    },
    paymentCount: {
      type: Number,
      default: 0,
      min: [0, 'Количество платежей не может быть отрицательным'],
    },
    failedPayments: {
      type: Number,
      default: 0,
      min: [0, 'Количество неудачных платежей не может быть отрицательным'],
    },
    averageAmount: {
      type: Number,
      default: 0,
    },

    // Поля для отслеживания изменений
    lastStatusChange: {
      type: Date,
      default: Date.now,
    },
    pausedAt: Date,
    pauseReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Причина паузы не может превышать 200 символов'],
    },
    cancelledAt: Date,
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [200, 'Причина отмены не может превышать 200 символов'],
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
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ userId: 1, frequency: 1 });
subscriptionSchema.index({ nextPaymentDate: 1, status: 1 });
subscriptionSchema.index({ accountId: 1 });
subscriptionSchema.index({ categoryId: 1 });
subscriptionSchema.index({ provider: 1 });

// Виртуальные поля
subscriptionSchema.virtual('account', {
  ref: 'Account',
  localField: 'accountId',
  foreignField: '_id',
  justOne: true,
});

subscriptionSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

subscriptionSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

subscriptionSchema.virtual('monthlyAmount').get(function () {
  switch (this.frequency) {
    case 'weekly':
      return this.amount * 4.33;
    case 'biweekly':
      return this.amount * 2.17;
    case 'monthly':
      return this.amount;
    case 'quarterly':
      return this.amount / 3;
    case 'yearly':
      return this.amount / 12;
    case 'custom':
      return this.customFrequencyDays
        ? (this.amount * 30) / this.customFrequencyDays
        : 0;
    default:
      return this.amount;
  }
});

subscriptionSchema.virtual('daysToNextPayment').get(function () {
  if (!this.nextPaymentDate) return null;
  const today = new Date();
  const nextPayment = new Date(this.nextPaymentDate);
  const diffTime = nextPayment - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

subscriptionSchema.virtual('isOverdue').get(function () {
  return (
    this.nextPaymentDate &&
    new Date() > this.nextPaymentDate &&
    this.status === 'active'
  );
});

subscriptionSchema.virtual('successRate').get(function () {
  if (this.paymentCount === 0) return 100;
  return ((this.paymentCount - this.failedPayments) / this.paymentCount) * 100;
});

// Middleware для автоматического расчета статистики
subscriptionSchema.pre('save', function (next) {
  // Рассчитываем общую сумму выплат и количество платежей
  const successfulPayments = this.paymentHistory.filter(
    p => p.status === 'success'
  );
  this.totalPaid = successfulPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );
  this.paymentCount = successfulPayments.length;
  this.failedPayments = this.paymentHistory.filter(
    p => p.status === 'failed'
  ).length;

  // Рассчитываем средний размер платежа
  this.averageAmount =
    this.paymentCount > 0 ? this.totalPaid / this.paymentCount : 0;

  // Находим дату последнего успешного платежа
  if (successfulPayments.length > 0) {
    this.lastPaymentDate = Math.max(
      ...successfulPayments.map(p => new Date(p.date))
    );
  }

  // Обновляем дату изменения статуса если статус изменился
  if (this.isModified('status')) {
    this.lastStatusChange = new Date();

    if (this.status === 'paused') {
      this.pausedAt = new Date();
    } else if (this.status === 'cancelled') {
      this.cancelledAt = new Date();
    }
  }

  next();
});

// Методы экземпляра
subscriptionSchema.methods.makePayment = function (
  amount,
  description,
  status = 'success'
) {
  const payment = {
    date: new Date(),
    amount: amount || this.amount,
    status,
    description,
  };

  if (status === 'failed' && description) {
    payment.failureReason = description;
  }

  this.paymentHistory.push(payment);

  // Обновляем дату следующего платежа только при успешном платеже
  if (status === 'success' && this.status === 'active') {
    this.updateNextPaymentDate();
  }

  return this.save();
};

subscriptionSchema.methods.updateNextPaymentDate = function () {
  if (this.status !== 'active') return;

  const currentDate = this.nextPaymentDate || new Date();
  const nextDate = new Date(currentDate);

  switch (this.frequency) {
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case 'custom':
      if (this.customFrequencyDays) {
        nextDate.setDate(nextDate.getDate() + this.customFrequencyDays);
      }
      break;
  }

  this.nextPaymentDate = nextDate;
};

subscriptionSchema.methods.pause = function (reason) {
  this.status = 'paused';
  this.pauseReason = reason;
  this.pausedAt = new Date();
  return this.save();
};

subscriptionSchema.methods.resume = function () {
  if (this.status !== 'paused') {
    throw new Error('Можно возобновить только приостановленную подписку');
  }

  this.status = 'active';
  this.pauseReason = undefined;

  // Обновляем дату следующего платежа при возобновлении
  this.updateNextPaymentDate();

  return this.save();
};

subscriptionSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

// Статические методы
subscriptionSchema.statics.findByUserId = function (userId, options = {}) {
  const {
    status,
    frequency,
    includeArchived = false,
    limit = 50,
    skip = 0,
  } = options;

  const query = { userId };

  if (status) {
    query.status = status;
  } else if (!includeArchived) {
    query.status = { $ne: 'archived' };
  }

  if (frequency) {
    query.frequency = frequency;
  }

  return this.find(query)
    .sort({ nextPaymentDate: 1, createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('accountId', 'name type balance')
    .populate('categoryId', 'name icon type');
};

subscriptionSchema.statics.getUpcomingPayments = function (userId, days = 7) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);

  return this.find({
    userId,
    status: 'active',
    nextPaymentDate: {
      $gte: new Date(),
      $lte: endDate,
    },
  })
    .sort({ nextPaymentDate: 1 })
    .populate('accountId', 'name type')
    .populate('categoryId', 'name icon');
};

subscriptionSchema.statics.getOverdueSubscriptions = function (userId) {
  return this.find({
    userId,
    status: 'active',
    nextPaymentDate: { $lt: new Date() },
  })
    .sort({ nextPaymentDate: 1 })
    .populate('accountId', 'name type');
};

subscriptionSchema.statics.getStatistics = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalMonthly: { $sum: '$monthlyAmount' },
        totalPaid: { $sum: '$totalPaid' },
      },
    },
  ]);
};

subscriptionSchema.statics.getAnalytics = function (userId, period = 'month') {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$frequency',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalPaid' },
        avgAmount: { $avg: '$amount' },
      },
    },
  ]);
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;

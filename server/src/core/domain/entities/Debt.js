const mongoose = require('mongoose');
const mongooseVersion = require('mongoose-version');

const debtHistorySchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание не может превышать 200 символов'],
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    paymentType: {
      type: String,
      enum: ['regular', 'early', 'penalty', 'full'],
      default: 'regular',
    },
  },
  {
    _id: false,
  }
);

const debtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пользователь обязателен'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Название долга обязательно'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
    },
    type: {
      type: String,
      required: [true, 'Тип долга обязателен'],
      enum: {
        values: ['credit', 'loan', 'creditCard', 'personalDebt', 'mortgage'],
        message: '{VALUE} не является допустимым типом долга',
      },
    },
    initialAmount: {
      type: Number,
      required: [true, 'Первоначальная сумма долга обязательна'],
      min: [0.01, 'Сумма должна быть больше 0'],
    },
    currentAmount: {
      type: Number,
      required: [true, 'Текущая сумма долга обязательна'],
      min: [0, 'Текущая сумма не может быть отрицательной'],
      validate: {
        validator: function (value) {
          return value <= this.initialAmount;
        },
        message: 'Текущая сумма не может превышать первоначальную',
      },
    },
    interestRate: {
      type: Number,
      min: [0, 'Процентная ставка не может быть отрицательной'],
      max: [100, 'Процентная ставка не может превышать 100%'],
      default: 0,
    },
    startDate: {
      type: Date,
      required: [true, 'Дата начала долга обязательна'],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value > this.startDate;
        },
        message: 'Дата окончания долга должна быть позже даты начала',
      },
    },
    nextPaymentDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date();
        },
        message: 'Дата следующего платежа должна быть в будущем',
      },
    },
    nextPaymentAmount: {
      type: Number,
      min: [0, 'Сумма следующего платежа не может быть отрицательной'],
    },
    lenderName: {
      type: String,
      trim: true,
      maxlength: [100, 'Название кредитора не может превышать 100 символов'],
    },
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    paymentHistory: [debtHistorySchema],
    paymentFrequency: {
      type: String,
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
      default: 'monthly',
    },
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: {
        values: ['active', 'paid', 'defaulted', 'archived'],
        message: '{VALUE} не является допустимым статусом',
      },
    },

    // Дополнительные поля
    currency: {
      type: String,
      default: 'RUB',
      enum: {
        values: ['RUB', 'USD', 'EUR'],
        message: '{VALUE} не является поддерживаемой валютой',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Описание не может превышать 500 символов'],
    },
    contractNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Номер договора не может превышать 50 символов'],
    },

    // Параметры для кредитных карт
    creditLimit: {
      type: Number,
      min: [0, 'Кредитный лимит не может быть отрицательным'],
      validate: {
        validator: function (value) {
          return this.type !== 'creditCard' || value != null;
        },
        message: 'Кредитный лимит обязателен для кредитных карт',
      },
    },
    minPaymentPercentage: {
      type: Number,
      min: [0, 'Процент минимального платежа не может быть отрицательным'],
      max: [100, 'Процент минимального платежа не может превышать 100%'],
      default: 5,
    },

    // Настройки автоплатежей
    autoPayment: {
      enabled: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        min: [0, 'Сумма автоплатежа не может быть отрицательной'],
      },
      sourceAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
      },
    },

    // Статистика
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Общая сумма выплат не может быть отрицательной'],
    },
    remainingPayments: Number,
    monthlyPayment: Number,
    totalInterestPaid: {
      type: Number,
      default: 0,
    },
    lastPaymentDate: Date,
    paymentCount: {
      type: Number,
      default: 0,
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
debtSchema.index({ userId: 1, status: 1 });
debtSchema.index({ userId: 1, type: 1 });
debtSchema.index({ nextPaymentDate: 1, status: 1 });
debtSchema.index({ endDate: 1, status: 1 });
debtSchema.index({ lenderName: 1 });

// Плагин для версионности
debtSchema.plugin(mongooseVersion, {
  collection: 'debt_versions',
  strategy: 'collection',
});

// Перед сохранением обновляем nextPaymentDate и nextPaymentAmount
debtSchema.pre('save', async function (next) {
  if (
    this.isNew ||
    this.isModified('currentAmount') ||
    this.isModified('paymentFrequency')
  ) {
    this.calculateNextPayment();
  }
  next();
});

// Метод для расчета следующей даты платежа
debtSchema.methods.calculateNextPayment = function () {
  if (this.currentAmount <= 0) {
    this.nextPaymentDate = null;
    this.nextPaymentAmount = 0;
    this.status = 'paid';
    return;
  }

  const today = new Date();
  if (!this.nextPaymentDate || this.nextPaymentDate < today) {
    let nextDate = new Date();

    switch (this.paymentFrequency) {
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
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    this.nextPaymentDate = nextDate;
  }

  // Расчет минимального платежа (можно использовать более сложные алгоритмы)
  if (this.type === 'creditCard') {
    // Для кредитных карт: 5% от текущей суммы или 1000, что больше
    this.nextPaymentAmount = Math.max(this.currentAmount * 0.05, 1000);
  } else {
    // Для кредитов: аннуитетный платеж с учетом процентной ставки
    // Упрощенный расчет для примера
    const monthlyRate = this.interestRate / 100 / 12;
    const remainingPeriods = this.endDate
      ? Math.max(
          1,
          Math.ceil((this.endDate - new Date()) / (30 * 24 * 60 * 60 * 1000))
        )
      : 12;

    if (monthlyRate === 0) {
      this.nextPaymentAmount = this.currentAmount / remainingPeriods;
    } else {
      // Аннуитетный платеж: P = (PV * r * (1 + r)^n) / ((1 + r)^n - 1)
      const factor = Math.pow(1 + monthlyRate, remainingPeriods);
      this.nextPaymentAmount =
        (this.currentAmount * monthlyRate * factor) / (factor - 1);
    }
  }

  // Округляем до двух знаков после запятой
  this.nextPaymentAmount = Math.ceil(this.nextPaymentAmount * 100) / 100;
};

// Метод для внесения платежа
debtSchema.methods.makePayment = function (amount, description = 'Платеж') {
  if (amount <= 0) throw new Error('Сумма платежа должна быть положительной');

  // Добавляем запись в историю платежей
  this.paymentHistory.push({
    date: new Date(),
    amount,
    description,
  });

  // Обновляем текущий долг
  this.currentAmount = Math.max(0, this.currentAmount - amount);

  // Проверяем, полностью ли погашен долг
  if (this.currentAmount === 0) {
    this.status = 'paid';
    this.nextPaymentDate = null;
    this.nextPaymentAmount = 0;
  } else {
    // Пересчитываем следующий платеж
    this.calculateNextPayment();
  }

  return this;
};

// Виртуальные поля
debtSchema.virtual('linkedAccount', {
  ref: 'Account',
  localField: 'linkedAccountId',
  foreignField: '_id',
  justOne: true,
});

debtSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

debtSchema.virtual('remainingAmount').get(function () {
  return this.currentAmount;
});

debtSchema.virtual('paidAmount').get(function () {
  return this.initialAmount - this.currentAmount;
});

debtSchema.virtual('progressPercentage').get(function () {
  return ((this.initialAmount - this.currentAmount) / this.initialAmount) * 100;
});

debtSchema.virtual('isOverdue').get(function () {
  return (
    this.nextPaymentDate &&
    new Date() > this.nextPaymentDate &&
    this.status === 'active'
  );
});

debtSchema.virtual('daysToNextPayment').get(function () {
  if (!this.nextPaymentDate) return null;
  const today = new Date();
  const nextPayment = new Date(this.nextPaymentDate);
  const diffTime = nextPayment - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware для автоматического расчета статистики
debtSchema.pre('save', function (next) {
  // Рассчитываем общую сумму выплат
  this.totalPaid = this.paymentHistory.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  // Обновляем количество платежей
  this.paymentCount = this.paymentHistory.length;

  // Находим дату последнего платежа
  if (this.paymentHistory.length > 0) {
    this.lastPaymentDate = Math.max(
      ...this.paymentHistory.map(p => new Date(p.date))
    );
  }

  // Автоматически помечаем как оплаченный при достижении нуля
  if (this.currentAmount <= 0 && this.status === 'active') {
    this.status = 'paid';
  }

  // Рассчитываем следующую дату платежа на основе частоты
  if (
    this.status === 'active' &&
    this.paymentFrequency &&
    this.nextPaymentDate
  ) {
    // Логика расчета следующей даты платежа
  }

  next();
});

// Методы экземпляра
debtSchema.methods.makePayment = function (amount, description, accountId) {
  if (amount <= 0) {
    throw new Error('Сумма платежа должна быть положительной');
  }

  if (this.status !== 'active') {
    throw new Error('Нельзя совершить платеж по неактивному долгу');
  }

  if (amount > this.currentAmount) {
    throw new Error('Сумма платежа не может превышать текущую сумму долга');
  }

  const payment = {
    date: new Date(),
    amount,
    description,
    paymentType: amount >= this.currentAmount ? 'full' : 'regular',
  };

  this.paymentHistory.push(payment);
  this.currentAmount -= amount;

  // Обновляем дату следующего платежа
  if (this.currentAmount > 0) {
    this.updateNextPaymentDate();
  }

  return this.save();
};

debtSchema.methods.updateNextPaymentDate = function () {
  if (!this.paymentFrequency || this.status !== 'active') return;

  const currentDate = this.nextPaymentDate || new Date();
  const nextDate = new Date(currentDate);

  switch (this.paymentFrequency) {
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
  }

  this.nextPaymentDate = nextDate;
};

debtSchema.methods.calculateMinimumPayment = function () {
  if (this.type === 'creditCard' && this.minPaymentPercentage) {
    return Math.max(
      100,
      this.currentAmount * (this.minPaymentPercentage / 100)
    );
  }

  if (this.monthlyPayment) {
    return this.monthlyPayment;
  }

  // Простой расчет для других типов долгов
  if (this.endDate) {
    const monthsRemaining = Math.ceil(
      (new Date(this.endDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)
    );
    return monthsRemaining > 0
      ? this.currentAmount / monthsRemaining
      : this.currentAmount;
  }

  return 0;
};

// Статические методы
debtSchema.statics.findByUserId = function (userId, options = {}) {
  const { status, type, includeArchived = false } = options;

  const query = { userId };

  if (status) {
    query.status = status;
  } else if (!includeArchived) {
    query.status = { $ne: 'archived' };
  }

  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ nextPaymentDate: 1, createdAt: -1 })
    .populate('linkedAccountId', 'name type balance')
    .populate('autoPayment.sourceAccountId', 'name type');
};

debtSchema.statics.getUpcomingPayments = function (userId, days = 7) {
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
    .populate('linkedAccountId', 'name type');
};

debtSchema.statics.getOverdueDebts = function (userId) {
  return this.find({
    userId,
    status: 'active',
    nextPaymentDate: { $lt: new Date() },
  })
    .sort({ nextPaymentDate: 1 })
    .populate('linkedAccountId', 'name type');
};

debtSchema.statics.getStatistics = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalInitial: { $sum: '$initialAmount' },
        totalCurrent: { $sum: '$currentAmount' },
        totalPaid: { $sum: '$totalPaid' },
      },
    },
  ]);
};

module.exports = mongoose.model('Debt', debtSchema);

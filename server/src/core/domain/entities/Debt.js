const mongoose = require('mongoose');
const mongooseVersion = require('mongoose-version');

const debtHistorySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
});

const debtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['credit', 'loan', 'creditCard', 'personalDebt'],
      required: true,
    },
    initialAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    interestRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    nextPaymentDate: {
      type: Date,
    },
    nextPaymentAmount: {
      type: Number,
      min: 0,
    },
    lenderName: {
      type: String,
      trim: true,
    },
    linkedAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
    },
    paymentHistory: [debtHistorySchema],
    paymentFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'custom'],
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['active', 'paid', 'defaulted', 'archived'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

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

const Debt = mongoose.model('Debt', debtSchema);

module.exports = Debt;

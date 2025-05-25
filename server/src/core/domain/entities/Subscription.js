const mongoose = require('mongoose');
const { Schema } = mongoose;

const subscriptionHistorySchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'success',
    },
    description: String,
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  },
  { timestamps: true }
);

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'RUB',
    },
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom'],
      required: true,
    },
    customFrequencyDays: {
      type: Number,
      min: 1,
      validate: {
        validator: function (v) {
          return (
            this.frequency !== 'custom' ||
            (this.frequency === 'custom' && v > 0)
          );
        },
        message:
          'Необходимо указать количество дней для пользовательской периодичности',
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextPaymentDate: {
      type: Date,
      required: true,
    },
    endDate: Date,
    lastPaymentDate: Date,
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    autoPayment: {
      type: Boolean,
      default: false,
    },
    paymentHistory: [subscriptionHistorySchema],
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled', 'archived'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Индексы для оптимизации запросов
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ nextPaymentDate: 1, status: 1 });

// Pre-save хук для расчета следующей даты платежа
subscriptionSchema.pre('save', function (next) {
  if (
    this.isNew ||
    this.isModified('frequency') ||
    this.isModified('startDate')
  ) {
    this.nextPaymentDate = this.calculateNextPaymentDate();
  }
  next();
});

// Метод для расчета следующей даты платежа
subscriptionSchema.methods.calculateNextPaymentDate = function (
  fromDate = null
) {
  const baseDate = fromDate || this.lastPaymentDate || this.startDate;
  const date = new Date(baseDate);

  switch (this.frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      date.setDate(date.getDate() + this.customFrequencyDays);
      break;
  }

  return date;
};

// Виртуальное свойство для проверки просроченности подписки
subscriptionSchema.virtual('isOverdue').get(function () {
  return this.status === 'active' && this.nextPaymentDate < new Date();
});

// Метод для обработки платежа
subscriptionSchema.methods.processPayment = function (
  amount,
  description,
  transactionId
) {
  const payment = {
    date: new Date(),
    amount: amount || this.amount,
    status: 'success',
    description: description || `Платеж за ${this.name}`,
    transactionId: transactionId,
  };

  this.paymentHistory.push(payment);
  this.lastPaymentDate = payment.date;
  this.nextPaymentDate = this.calculateNextPaymentDate(payment.date);

  return payment;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;

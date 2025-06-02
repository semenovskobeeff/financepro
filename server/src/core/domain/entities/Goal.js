const mongoose = require('mongoose');

const transferHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, 'Сумма перевода обязательна'],
      min: [0.01, 'Сумма должна быть больше 0'],
    },
    date: {
      type: Date,
      required: [true, 'Дата перевода обязательна'],
      default: Date.now,
    },
    fromAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Счет-источник обязателен'],
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Описание не может превышать 200 символов'],
    },
  },
  {
    _id: false,
  }
);

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пользователь обязателен'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Название цели обязательно'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Описание не может превышать 500 символов'],
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Связанный счет обязателен'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Целевая сумма обязательна'],
      min: [0.01, 'Целевая сумма должна быть больше 0'],
      validate: {
        validator: function (value) {
          return Number.isFinite(value) && value > 0;
        },
        message: 'Целевая сумма должна быть положительным числом',
      },
    },
    deadline: {
      type: Date,
      required: [true, 'Дедлайн обязателен'],
      validate: {
        validator: function (value) {
          return value > new Date();
        },
        message: 'Дедлайн должен быть в будущем',
      },
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Прогресс не может быть отрицательным'],
      validate: {
        validator: function (value) {
          return value <= this.targetAmount;
        },
        message: 'Прогресс не может превышать целевую сумму',
      },
    },
    transferHistory: [transferHistorySchema],
    status: {
      type: String,
      required: true,
      default: 'active',
      enum: {
        values: ['active', 'completed', 'cancelled', 'archived'],
        message: '{VALUE} не является допустимым статусом',
      },
    },

    // Дополнительные поля
    priority: {
      type: String,
      default: 'medium',
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} не является допустимым приоритетом',
      },
    },
    category: {
      type: String,
      trim: true,
      enum: [
        'travel',
        'education',
        'health',
        'emergency',
        'purchase',
        'investment',
        'other',
      ],
      default: 'other',
    },
    currency: {
      type: String,
      default: 'RUB',
      enum: {
        values: ['RUB', 'USD', 'EUR'],
        message: '{VALUE} не является поддерживаемой валютой',
      },
    },

    // Настройки автоматического пополнения
    autoContribution: {
      enabled: {
        type: Boolean,
        default: false,
      },
      amount: {
        type: Number,
        min: [0, 'Сумма автопополнения не может быть отрицательной'],
      },
      frequency: {
        type: String,
        enum: ['weekly', 'monthly', 'quarterly'],
      },
      sourceAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
      },
      nextContribution: Date,
    },

    // Статистика
    completedAt: Date,
    daysToDeadline: Number,
    progressPercentage: Number,
    averageMonthlyContribution: Number,
    estimatedCompletionDate: Date,
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
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, deadline: 1 });
goalSchema.index({ accountId: 1 });
goalSchema.index({ status: 1, deadline: 1 });

// Виртуальные поля
goalSchema.virtual('account', {
  ref: 'Account',
  localField: 'accountId',
  foreignField: '_id',
  justOne: true,
});

goalSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

goalSchema.virtual('remainingAmount').get(function () {
  return Math.max(0, this.targetAmount - this.progress);
});

goalSchema.virtual('progressPercent').get(function () {
  return Math.min(100, (this.progress / this.targetAmount) * 100);
});

goalSchema.virtual('isOverdue').get(function () {
  return new Date() > this.deadline && this.status === 'active';
});

goalSchema.virtual('daysRemaining').get(function () {
  const today = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Middleware для автоматического расчета статистики
goalSchema.pre('save', function (next) {
  // Рассчитываем процент выполнения
  this.progressPercentage = (this.progress / this.targetAmount) * 100;

  // Рассчитываем дни до дедлайна
  const today = new Date();
  const deadline = new Date(this.deadline);
  this.daysToDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  // Автоматически завершаем цель при достижении 100%
  if (this.progress >= this.targetAmount && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }

  // Рассчитываем среднее месячное пополнение
  if (this.transferHistory.length > 0) {
    const firstTransfer = new Date(this.transferHistory[0].date);
    const monthsElapsed = Math.max(
      1,
      (today - firstTransfer) / (1000 * 60 * 60 * 24 * 30)
    );
    this.averageMonthlyContribution = this.progress / monthsElapsed;

    // Прогнозируем дату завершения
    if (this.averageMonthlyContribution > 0 && this.status === 'active') {
      const remainingAmount = this.targetAmount - this.progress;
      const monthsToCompletion =
        remainingAmount / this.averageMonthlyContribution;
      this.estimatedCompletionDate = new Date(
        today.getTime() + monthsToCompletion * 30 * 24 * 60 * 60 * 1000
      );
    }
  }

  next();
});

// Методы экземпляра
goalSchema.methods.addContribution = function (
  amount,
  fromAccountId,
  description
) {
  if (amount <= 0) {
    throw new Error('Сумма пополнения должна быть положительной');
  }

  if (this.status !== 'active') {
    throw new Error('Нельзя пополнить неактивную цель');
  }

  const contribution = {
    amount,
    date: new Date(),
    fromAccountId,
    description,
  };

  this.transferHistory.push(contribution);
  this.progress += amount;

  return this.save();
};

goalSchema.methods.updateProgress = function (newProgress) {
  if (newProgress < 0) {
    throw new Error('Прогресс не может быть отрицательным');
  }

  if (newProgress > this.targetAmount) {
    throw new Error('Прогресс не может превышать целевую сумму');
  }

  this.progress = newProgress;
  return this.save();
};

goalSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  if (reason) {
    this.description = (this.description || '') + ` [Отменена: ${reason}]`;
  }
  return this.save();
};

// Статические методы
goalSchema.statics.findByUserId = function (userId, options = {}) {
  const { status, includeArchived = false, sortBy = 'deadline' } = options;

  const query = { userId };

  if (status) {
    query.status = status;
  } else if (!includeArchived) {
    query.status = { $ne: 'archived' };
  }

  const sortOptions = {};
  if (sortBy === 'deadline') {
    sortOptions.deadline = 1;
  } else if (sortBy === 'progress') {
    sortOptions.progressPercentage = -1;
  } else if (sortBy === 'priority') {
    sortOptions.priority = 1;
  } else {
    sortOptions.createdAt = -1;
  }

  return this.find(query)
    .sort(sortOptions)
    .populate('accountId', 'name type balance')
    .populate('autoContribution.sourceAccountId', 'name type');
};

goalSchema.statics.getOverdueGoals = function (userId) {
  return this.find({
    userId,
    status: 'active',
    deadline: { $lt: new Date() },
  }).populate('accountId', 'name type');
};

goalSchema.statics.getGoalsNearDeadline = function (userId, days = 30) {
  const deadlineThreshold = new Date();
  deadlineThreshold.setDate(deadlineThreshold.getDate() + days);

  return this.find({
    userId,
    status: 'active',
    deadline: { $lte: deadlineThreshold, $gte: new Date() },
  })
    .sort({ deadline: 1 })
    .populate('accountId', 'name type');
};

goalSchema.statics.getStatistics = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalTarget: { $sum: '$targetAmount' },
        totalProgress: { $sum: '$progress' },
      },
    },
  ]);
};

module.exports = mongoose.model('Goal', goalSchema);

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Пользователь обязателен'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Название категории обязательно'],
      trim: true,
      maxlength: [100, 'Название не может превышать 100 символов'],
      validate: {
        validator: function (value) {
          return value && value.trim().length > 0;
        },
        message: 'Название категории не может быть пустым',
      },
    },
    type: {
      type: String,
      required: [true, 'Тип категории обязателен'],
      enum: {
        values: ['income', 'expense'],
        message: '{VALUE} не является допустимым типом категории',
      },
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, 'Название иконки не может превышать 50 символов'],
      default: 'category',
    },
    color: {
      type: String,
      trim: true,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        'Некорректный формат цвета (HEX)',
      ],
      default: '#2196F3',
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

    // Дополнительные поля
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Описание не может превышать 500 символов'],
    },
    budget: {
      monthly: {
        type: Number,
        min: [0, 'Месячный бюджет не может быть отрицательным'],
      },
      yearly: {
        type: Number,
        min: [0, 'Годовой бюджет не может быть отрицательным'],
      },
    },

    // Поля для сортировки и группировки
    sortOrder: {
      type: Number,
      default: 0,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      validate: {
        validator: function (value) {
          // Родительская категория не может ссылаться на саму себя
          return !value || value.toString() !== this._id?.toString();
        },
        message: 'Категория не может быть родительской для самой себя',
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // Статистика использования
    transactionCount: {
      type: Number,
      default: 0,
      min: [0, 'Количество транзакций не может быть отрицательным'],
    },
    lastUsed: {
      type: Date,
    },
    totalAmount: {
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
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ userId: 1, status: 1 });
categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ parentId: 1 });
categorySchema.index({ sortOrder: 1 });

// Виртуальные поля
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
});

categorySchema.virtual('transactions', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'categoryId',
});

categorySchema.virtual('isParent').get(function () {
  return this.parentId == null;
});

// Middleware для валидации
categorySchema.pre('save', async function (next) {
  try {
    // Проверяем уникальность имени в рамках пользователя
    const existingCategory = await this.constructor.findOne({
      userId: this.userId,
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id },
      status: 'active',
    });

    if (existingCategory) {
      throw new Error('Категория с таким названием уже существует');
    }

    // Проверяем корректность родительской категории
    if (this.parentId) {
      const parentCategory = await this.constructor.findById(this.parentId);
      if (!parentCategory) {
        throw new Error('Родительская категория не найдена');
      }
      if (parentCategory.userId.toString() !== this.userId.toString()) {
        throw new Error(
          'Родительская категория должна принадлежать тому же пользователю'
        );
      }
      if (parentCategory.type !== this.type) {
        throw new Error(
          'Тип родительской категории должен совпадать с типом дочерней'
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Middleware для обновления статистики при создании транзакции
categorySchema.methods.updateStats = async function () {
  const Transaction = mongoose.model('Transaction');

  const stats = await Transaction.aggregate([
    {
      $match: {
        categoryId: this._id,
        status: 'active',
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        lastUsed: { $max: '$date' },
      },
    },
  ]);

  if (stats.length > 0) {
    this.transactionCount = stats[0].count;
    this.totalAmount = stats[0].totalAmount;
    this.lastUsed = stats[0].lastUsed;
  } else {
    this.transactionCount = 0;
    this.totalAmount = 0;
    this.lastUsed = null;
  }

  return this.save();
};

// Статические методы
categorySchema.statics.findByUserId = function (userId, options = {}) {
  const { type, status = 'active', includeSubcategories = false } = options;

  const query = { userId, status };
  if (type) query.type = type;

  let findQuery = this.find(query).sort({ sortOrder: 1, name: 1 });

  if (includeSubcategories) {
    findQuery = findQuery.populate('subcategories');
  }

  return findQuery;
};

categorySchema.statics.getPopularCategories = function (
  userId,
  type,
  limit = 10
) {
  return this.find({
    userId,
    type,
    status: 'active',
  })
    .sort({ transactionCount: -1, lastUsed: -1 })
    .limit(limit);
};

categorySchema.statics.createDefaultCategories = async function (userId) {
  const defaultIncome = [
    { name: 'Зарплата', icon: 'work', color: '#4CAF50' },
    { name: 'Подработка', icon: 'attach_money', color: '#8BC34A' },
    { name: 'Бонусы', icon: 'star', color: '#CDDC39' },
    { name: 'Инвестиции', icon: 'trending_up', color: '#2196F3' },
    { name: 'Возврат долга', icon: 'reply', color: '#FF9800' },
  ];

  const defaultExpense = [
    { name: 'Продукты', icon: 'shopping_cart', color: '#F44336' },
    { name: 'Транспорт', icon: 'directions_car', color: '#9C27B0' },
    { name: 'Развлечения', icon: 'movie', color: '#E91E63' },
    { name: 'Коммунальные услуги', icon: 'home', color: '#FF5722' },
    { name: 'Здоровье', icon: 'local_hospital', color: '#795548' },
    { name: 'Образование', icon: 'school', color: '#607D8B' },
    { name: 'Одежда', icon: 'checkroom', color: '#3F51B5' },
  ];

  const incomeCategories = defaultIncome.map((cat, index) => ({
    ...cat,
    userId,
    type: 'income',
    isDefault: true,
    sortOrder: index,
  }));

  const expenseCategories = defaultExpense.map((cat, index) => ({
    ...cat,
    userId,
    type: 'expense',
    isDefault: true,
    sortOrder: index,
  }));

  try {
    await this.insertMany([...incomeCategories, ...expenseCategories]);
    return true;
  } catch (error) {
    console.error('Ошибка при создании категорий по умолчанию:', error);
    return false;
  }
};

module.exports = mongoose.model('Category', categorySchema);

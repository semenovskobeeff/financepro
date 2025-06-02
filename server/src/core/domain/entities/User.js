const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email обязателен'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Пожалуйста, введите корректный email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Пароль обязателен'],
      minlength: [6, 'Пароль должен содержать минимум 6 символов'],
      select: false,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
    resetPasswordUsed: {
      type: Boolean,
      default: undefined,
    },
    name: {
      type: String,
      required: [true, 'Имя обязательно'],
      trim: true,
      maxlength: [50, 'Имя не может превышать 50 символов'],
    },
    roles: {
      type: [String],
      enum: ['user', 'admin'],
      default: ['user'],
    },
    settings: {
      primaryIncomeAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
      },
      primaryExpenseAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
      },
      currency: {
        type: String,
        default: 'RUB',
        enum: ['RUB', 'USD', 'EUR'],
      },
      theme: {
        type: String,
        default: 'light',
        enum: ['light', 'dark'],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Индексы
// email индекс создается автоматически из-за unique: true в схеме
userSchema.index({ createdAt: -1 });

// Хеширование пароля перед сохранением
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Метод для проверки пароля
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Метод для создания токена сброса пароля
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = require('crypto').randomBytes(32).toString('hex');

  this.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 минут

  return resetToken;
};

// Виртуальное поле для получения всех счетов пользователя
userSchema.virtual('accounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'userId',
});

module.exports = mongoose.model('User', userSchema);

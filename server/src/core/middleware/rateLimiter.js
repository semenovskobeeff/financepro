const rateLimit = require('express-rate-limit');

// Ограничение для попыток входа
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // 5 попыток за окно
  message: {
    message: 'Слишком много попыток входа. Попробуйте позже.',
    error: 'RATE_LIMIT_LOGIN',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Не считаем успешные попытки
});

// Ограничение для восстановления пароля
const forgotPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 3, // 3 попытки за окно
  message: {
    message:
      'Слишком много запросов на восстановление пароля. Попробуйте позже.',
    error: 'RATE_LIMIT_FORGOT_PASSWORD',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => {
    // Ограничиваем по IP и email
    return `${req.ip}-${req.body.email || 'unknown'}`;
  },
});

// Ограничение для сброса пароля
const resetPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 минут
  max: 10, // 10 попыток за окно
  message: {
    message: 'Слишком много попыток сброса пароля. Попробуйте позже.',
    error: 'RATE_LIMIT_RESET_PASSWORD',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Общее ограничение для API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000, // 1000 запросов за окно
  message: {
    message: 'Слишком много запросов. Попробуйте позже.',
    error: 'RATE_LIMIT_GENERAL',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
  generalLimiter,
};

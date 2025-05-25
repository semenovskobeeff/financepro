const { body, validationResult } = require('express-validator');

// Валидация для восстановления пароля
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Валидация для сброса пароля
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Токен восстановления обязателен')
    .isLength({ min: 40, max: 40 })
    .withMessage('Неверный формат токена'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Пароль должен содержать минимум 8 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Пароль должен содержать: строчную букву, заглавную букву, цифру и специальный символ'
    ),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Валидация для регистрации
const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),

  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Имя должно содержать от 2 до 50 символов'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Пароль должен содержать минимум 8 символов')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Пароль должен содержать: строчную букву, заглавную букву, цифру и специальный символ'
    ),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors: errors.array(),
      });
    }
    next();
  },
];

// Валидация для входа
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Введите корректный email адрес'),

  body('password').notEmpty().withMessage('Пароль обязателен'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Ошибка валидации',
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateForgotPassword,
  validateResetPassword,
  validateRegistration,
  validateLogin,
};

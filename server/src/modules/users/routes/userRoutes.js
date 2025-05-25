const express = require('express');
const userController = require('../controllers/userController');
const { auth } = require('../../../core/infrastructure/auth/auth');
const {
  validateForgotPassword,
  validateResetPassword,
  validateRegistration,
  validateLogin,
} = require('../../../core/middleware/validation');
const {
  loginLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require('../../../core/middleware/rateLimiter');
const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь зарегистрирован
 *       400:
 *         description: Ошибка валидации данных
 */
router.post('/register', validateRegistration, userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Авторизация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Пользователь авторизован
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', loginLimiter, validateLogin, userController.login);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Запрос на сброс пароля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Запрос успешно отправлен
 *       500:
 *         description: Ошибка сервера
 */
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  validateForgotPassword,
  userController.forgotPassword
);

/**
 * @swagger
 * /api/users/reset-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Сброс пароля
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Пароль успешно сброшен
 *       400:
 *         description: Неверный токен или ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post(
  '/reset-password',
  resetPasswordLimiter,
  validateResetPassword,
  userController.resetPassword
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Получить профиль пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные профиля
 *       401:
 *         description: Не авторизован
 */
router.get('/profile', auth, userController.getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: Обновить профиль пользователя
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               settings:
 *                 type: object
 *                 properties:
 *                   primaryIncomeAccount:
 *                     type: string
 *                   primaryExpenseAccount:
 *                     type: string
 *     responses:
 *       200:
 *         description: Профиль обновлен
 *       401:
 *         description: Не авторизован
 */
router.put('/profile', auth, userController.updateProfile);

module.exports = router;

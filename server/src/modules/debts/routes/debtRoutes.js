const express = require('express');
const router = express.Router();
const debtController = require('../controllers/debtController');
const { auth } = require('../../../core/infrastructure/auth/auth');

/**
 * @swagger
 * /api/v1/debts:
 *   get:
 *     tags:
 *       - Debts
 *     summary: Получить список долгов пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paid, defaulted, archived]
 *         description: Фильтр по статусу долга
 *     responses:
 *       200:
 *         description: Список долгов
 */
router.get('/', auth, debtController.getDebts);

/**
 * @swagger
 * /api/v1/debts/upcoming:
 *   get:
 *     tags:
 *       - Debts
 *     summary: Получить список предстоящих платежей
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Количество дней для прогноза
 *     responses:
 *       200:
 *         description: Список предстоящих платежей
 */
router.get('/upcoming', auth, debtController.getUpcomingPayments);

/**
 * @swagger
 * /api/v1/debts/stats:
 *   get:
 *     tags:
 *       - Debts
 *     summary: Получить статистику по долгам
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика по долгам
 */
router.get('/stats', auth, debtController.getDebtsStats);

/**
 * @swagger
 * /api/v1/debts/{id}:
 *   get:
 *     tags:
 *       - Debts
 *     summary: Получить долг по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID долга
 *     responses:
 *       200:
 *         description: Информация о долге
 *       404:
 *         description: Долг не найден
 */
router.get('/:id', auth, debtController.getDebtById);

/**
 * @swagger
 * /api/v1/debts:
 *   post:
 *     tags:
 *       - Debts
 *     summary: Создать новый долг
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - initialAmount
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [credit, loan, creditCard, personalDebt]
 *               initialAmount:
 *                 type: number
 *               interestRate:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               paymentFrequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly, quarterly, custom]
 *               lenderName:
 *                 type: string
 *               linkedAccountId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Долг успешно создан
 *       400:
 *         description: Ошибка валидации
 */
router.post('/', auth, debtController.createDebt);

/**
 * @swagger
 * /api/v1/debts/{id}:
 *   put:
 *     tags:
 *       - Debts
 *     summary: Обновить долг
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID долга
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lenderName:
 *                 type: string
 *               interestRate:
 *                 type: number
 *               endDate:
 *                 type: string
 *                 format: date
 *               paymentFrequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly, quarterly, custom]
 *               linkedAccountId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Долг успешно обновлен
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Долг не найден
 */
router.put('/:id', auth, debtController.updateDebt);

/**
 * @swagger
 * /api/v1/debts/{id}/payment:
 *   post:
 *     tags:
 *       - Debts
 *     summary: Совершить платеж по долгу
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID долга
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               accountId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Платеж успешно выполнен
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Долг не найден
 */
router.post('/:id/payment', auth, debtController.makePayment);

/**
 * @swagger
 * /api/v1/debts/{id}/archive:
 *   post:
 *     tags:
 *       - Debts
 *     summary: Архивировать долг
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID долга
 *     responses:
 *       200:
 *         description: Долг успешно архивирован
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Долг не найден
 */
router.post('/:id/archive', auth, debtController.archiveDebt);

/**
 * @swagger
 * /api/v1/debts/{id}/restore:
 *   post:
 *     tags:
 *       - Debts
 *     summary: Восстановить долг из архива
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID долга
 *     responses:
 *       200:
 *         description: Долг успешно восстановлен
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Долг не найден
 */
router.post('/:id/restore', auth, debtController.restoreDebt);

module.exports = router;

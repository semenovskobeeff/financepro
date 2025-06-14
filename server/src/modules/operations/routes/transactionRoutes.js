const express = require('express');
const transactionController = require('../controllers/transactionController');
const { auth } = require('../../../core/infrastructure/auth/auth');

const router = express.Router();

// Все маршруты защищены middleware авторизации
router.use(auth);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Получить список транзакций с фильтрацией и пагинацией
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: date
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense, transfer]
 *       - in: query
 *         name: accountId
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived]
 *           default: active
 *     responses:
 *       200:
 *         description: Список транзакций
 *       401:
 *         description: Не авторизован
 */
router.get('/', transactionController.getTransactions);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags:
 *       - Transactions
 *     summary: Получить транзакцию по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные транзакции
 *       404:
 *         description: Транзакция не найдена
 *       401:
 *         description: Не авторизован
 */
router.get('/:id', transactionController.getTransactionById);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags:
 *       - Transactions
 *     summary: Создать новую транзакцию
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - accountId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               amount:
 *                 type: number
 *               categoryId:
 *                 type: string
 *               accountId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Транзакция создана
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 */
router.post('/', transactionController.createTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags:
 *       - Transactions
 *     summary: Обновить транзакцию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               accountId:
 *                 type: string
 *               toAccountId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Транзакция обновлена
 *       404:
 *         description: Транзакция не найдена
 *       401:
 *         description: Не авторизован
 */
router.put('/:id', transactionController.updateTransaction);
router.patch('/:id', transactionController.updateTransaction);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags:
 *       - Transactions
 *     summary: Удалить транзакцию
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Транзакция удалена
 *       404:
 *         description: Транзакция не найдена
 *       401:
 *         description: Не авторизован
 */
router.delete('/:id', transactionController.deleteTransaction);

// МАРШРУТЫ СИНХРОНИЗАЦИИ БАЛАНСОВ
// Пересчет балансов всех счетов на основе транзакций
router.post('/recalculate-balances', transactionController.recalculateBalances);

// Проверить корректность балансов счетов
router.get('/check-balances', transactionController.checkBalances);

// Синхронизировать баланс отдельного счета
router.post(
  '/sync-account/:accountId',
  transactionController.syncAccountBalance
);

// Валидировать и автоисправить балансы
router.post('/validate-balances', transactionController.validateAndFixBalances);

// Создать снимок балансов для диагностики
router.post('/balance-snapshot', transactionController.createBalanceSnapshot);

module.exports = router;

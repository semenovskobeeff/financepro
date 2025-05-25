const express = require('express');
const accountController = require('../controllers/accountController');
const { auth } = require('../../../core/infrastructure/auth/auth');

const router = express.Router();

// Все маршруты защищены middleware авторизации
router.use(auth);

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Получить все счета пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список счетов
 *       401:
 *         description: Не авторизован
 */
router.get('/', accountController.getAccounts);

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Получить счет по ID
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
 *         description: Данные счета
 *       404:
 *         description: Счет не найден
 *       401:
 *         description: Не авторизован
 */
router.get('/:id', accountController.getAccountById);

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     tags:
 *       - Accounts
 *     summary: Создать новый счет
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
 *               - name
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [bank, deposit, goal, credit, subscription]
 *               name:
 *                 type: string
 *               cardInfo:
 *                 type: string
 *               balance:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       201:
 *         description: Счет создан
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 */
router.post('/', accountController.createAccount);

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     tags:
 *       - Accounts
 *     summary: Обновить счет
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
 *               name:
 *                 type: string
 *               cardInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Счет обновлен
 *       404:
 *         description: Счет не найден
 *       401:
 *         description: Не авторизован
 */
router.put('/:id', accountController.updateAccount);

/**
 * @swagger
 * /api/accounts/{id}/archive:
 *   put:
 *     tags:
 *       - Accounts
 *     summary: Архивировать счет
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
 *         description: Счет архивирован
 *       404:
 *         description: Счет не найден
 *       401:
 *         description: Не авторизован
 */
router.put('/:id/archive', accountController.archiveAccount);

/**
 * @swagger
 * /api/accounts/{id}/restore:
 *   put:
 *     tags:
 *       - Accounts
 *     summary: Восстановить счет из архива
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
 *         description: Счет восстановлен
 *       404:
 *         description: Счет не найден
 *       401:
 *         description: Не авторизован
 */
router.put('/:id/restore', accountController.restoreAccount);

/**
 * @swagger
 * /api/accounts/transfer:
 *   post:
 *     tags:
 *       - Accounts
 *     summary: Перевод средств между счетами
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromAccountId
 *               - toAccountId
 *               - amount
 *             properties:
 *               fromAccountId:
 *                 type: string
 *               toAccountId:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Перевод выполнен
 *       400:
 *         description: Некорректные данные или недостаточно средств
 *       404:
 *         description: Счет не найден
 *       401:
 *         description: Не авторизован
 */
router.post('/transfer', accountController.transferFunds);

/**
 * @swagger
 * /api/accounts/{id}/history:
 *   get:
 *     tags:
 *       - Accounts
 *     summary: Получить историю операций по счету
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
 *         description: История операций
 *       404:
 *         description: Счет не найден
 *       401:
 *         description: Не авторизован
 */
router.get('/:id/history', accountController.getAccountHistory);

module.exports = router;

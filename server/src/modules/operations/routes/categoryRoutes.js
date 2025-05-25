const express = require('express');
const categoryController = require('../controllers/categoryController');
const { auth } = require('../../../core/infrastructure/auth/auth');

const router = express.Router();

// Все маршруты защищены middleware авторизации
router.use(auth);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Получить все категории пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, archived]
 *           default: active
 *     responses:
 *       200:
 *         description: Список категорий
 *       401:
 *         description: Не авторизован
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Получить категорию по ID
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
 *         description: Данные категории
 *       404:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Создать новую категорию
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
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Категория создана
 *       400:
 *         description: Некорректные данные
 *       401:
 *         description: Не авторизован
 */
router.post('/', categoryController.createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Обновить категорию
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
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Категория обновлена
 *       404:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 */
router.put('/:id', categoryController.updateCategory);

/**
 * @swagger
 * /api/categories/{id}/archive:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Архивировать категорию
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
 *         description: Категория архивирована
 *       404:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 */
router.put('/:id/archive', categoryController.archiveCategory);

/**
 * @swagger
 * /api/categories/{id}/restore:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Восстановить категорию из архива
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
 *         description: Категория восстановлена
 *       404:
 *         description: Категория не найдена
 *       401:
 *         description: Не авторизован
 */
router.put('/:id/restore', categoryController.restoreCategory);

module.exports = router;

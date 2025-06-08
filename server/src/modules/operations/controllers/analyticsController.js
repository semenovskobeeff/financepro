const {
  Transaction,
  Account,
  Category,
  Goal,
  Debt,
  Subscription,
} = require('../../../core/domain/entities');
const mongoose = require('mongoose');
const analyticsService = require('../services/analyticsService');

/**
 * Получение общей аналитики по транзакциям
 * @swagger
 * /api/analytics/transactions:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Получить аналитику по транзакциям
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year, all]
 *           default: month
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
 *     responses:
 *       200:
 *         description: Аналитика по транзакциям
 */
const getTransactionsAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { period, startDate, endDate } = req.query;

    console.log(
      '🎯 [CONTROLLER] Запрос аналитики транзакций от пользователя:',
      userId
    );
    console.log('🎯 [CONTROLLER] Параметры запроса:', {
      period,
      startDate,
      endDate,
    });

    const analytics = await analyticsService.getTransactionsAnalytics(userId, {
      period,
      startDate,
      endDate,
    });

    console.log('✅ [CONTROLLER] Аналитика транзакций получена успешно');
    res.json(analytics);
  } catch (error) {
    console.error(
      '❌ [CONTROLLER] Ошибка при получении аналитики транзакций:',
      error
    );
    res.status(500).json({ message: 'Ошибка сервера при получении аналитики' });
  }
};

/**
 * Получение аналитики по целям
 * @swagger
 * /api/analytics/goals:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Получить аналитику по целям
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Аналитика по целям
 */
const getGoalsAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const analytics = await analyticsService.getGoalsAnalytics(userId);

    res.json(analytics);
  } catch (error) {
    console.error('Ошибка при получении аналитики целей:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении аналитики' });
  }
};

/**
 * Получение аналитики по долгам
 * @swagger
 * /api/analytics/debts:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Получить аналитику по долгам
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Аналитика по долгам
 */
const getDebtsAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const analytics = await analyticsService.getDebtsAnalytics(userId);

    res.json(analytics);
  } catch (error) {
    console.error('Ошибка при получении аналитики долгов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении аналитики' });
  }
};

/**
 * Получение общей сводной аналитики
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Получить сводную аналитику для дашборда
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Сводная аналитика
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    // Получаем userId из объекта пользователя (MongoDB использует _id)
    const userId = req.user._id || req.user.id;
    console.log(
      '🎯 [CONTROLLER] Запрос сводной аналитики от пользователя:',
      userId
    );
    console.log('🎯 [CONTROLLER] Объект пользователя (_id):', req.user._id);
    console.log('🎯 [CONTROLLER] Объект пользователя (id):', req.user.id);

    const analytics = await analyticsService.getDashboardAnalytics(userId);

    console.log('✅ [CONTROLLER] Аналитика получена успешно');
    res.json(analytics);
  } catch (error) {
    console.error(
      '❌ [CONTROLLER] Ошибка при получении сводной аналитики:',
      error
    );
    res.status(500).json({ message: 'Ошибка сервера при получении аналитики' });
  }
};

/**
 * Экспорт отчета по транзакциям
 * @swagger
 * /api/analytics/export:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Экспорт аналитических данных
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [transactions, goals, debts]
 *           default: transactions
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
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
 *     responses:
 *       200:
 *         description: Экспортированные данные
 */
const exportAnalyticsData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { type, format, period, startDate, endDate } = req.query;

    const result = await analyticsService.exportAnalytics(userId, {
      type,
      format,
      period,
      startDate,
      endDate,
    });

    // Устанавливаем заголовки для скачивания файла
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="analytics-${type}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`
    );

    // Преобразуем данные в CSV формат
    const csvData = result.data.map(row => row.join(',')).join('\n');

    res.send(csvData);
  } catch (error) {
    console.error('Ошибка при экспорте данных аналитики:', error);
    res.status(500).json({ message: 'Ошибка сервера при экспорте данных' });
  }
};

module.exports = {
  getTransactionsAnalytics,
  getGoalsAnalytics,
  getDebtsAnalytics,
  getDashboardAnalytics,
  exportAnalyticsData,
};

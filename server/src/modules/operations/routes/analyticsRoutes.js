const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { auth } = require('../../../core/infrastructure/auth/auth');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: API для аналитики и отчетов
 */

// Маршруты для аналитики транзакций
router.get('/transactions', auth, analyticsController.getTransactionsAnalytics);

// Маршруты для аналитики целей
router.get('/goals', auth, analyticsController.getGoalsAnalytics);

// Маршруты для аналитики долгов
router.get('/debts', auth, analyticsController.getDebtsAnalytics);

// Маршрут для получения сводной аналитики дашборда
router.get('/dashboard', auth, analyticsController.getDashboardAnalytics);

// Маршрут для экспорта данных
router.get('/export', auth, analyticsController.exportAnalyticsData);

module.exports = router;

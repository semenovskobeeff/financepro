const express = require('express');
const router = express.Router();

// ================================
// ИМПОРТ МОДУЛЬНЫХ МАРШРУТОВ
// ================================
const userRoutes = require('../modules/users/routes/userRoutes');
const accountRoutes = require('../modules/operations/routes/accountRoutes');
const transactionRoutes = require('../modules/operations/routes/transactionRoutes');
const categoryRoutes = require('../modules/operations/routes/categoryRoutes');
const goalRoutes = require('../modules/goals/routes/goalRoutes');
const debtRoutes = require('../modules/debts/routes/debtRoutes');
const subscriptionRoutes = require('../modules/operations/routes/subscriptionRoutes');
const analyticsRoutes = require('../modules/operations/routes/analyticsRoutes');
const archiveRoutes = require('../modules/operations/routes/archiveRoutes');
const shoppingListRoutes = require('../modules/shopping-lists/routes/shoppingListRoutes');

// ================================
// СЛУЖЕБНЫЕ МАРШРУТЫ
// ================================

// API информация
router.get('/', (req, res) => {
  res.json({
    message: 'Finance App API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      users: '/api/users',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      categories: '/api/categories',
      goals: '/api/goals',
      debts: '/api/debts',
      subscriptions: '/api/subscriptions',
      analytics: '/api/analytics',
      archive: '/api/archive',
      shoppingLists: '/api/shopping-lists',
      health: '/api/health',
    },
  });
});

// Проверка работоспособности
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API сервер работает',
    timestamp: new Date().toISOString(),
  });
});

// ================================
// ПОДКЛЮЧЕНИЕ МОДУЛЬНЫХ МАРШРУТОВ
// ================================
router.use('/users', userRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/goals', goalRoutes);
router.use('/debts', debtRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/archive', archiveRoutes);
router.use('/shopping-lists', shoppingListRoutes);

module.exports = router;

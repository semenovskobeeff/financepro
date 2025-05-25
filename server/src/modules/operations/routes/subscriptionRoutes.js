const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { auth } = require('../../../core/infrastructure/auth/auth');

// Получение статистики по подпискам
router.get('/stats', auth, subscriptionController.getSubscriptionStats);

// Получение предстоящих платежей
router.get('/upcoming', auth, subscriptionController.getUpcomingPayments);

// Получение расширенной аналитики
router.get('/analytics', auth, subscriptionController.getSubscriptionAnalytics);

// Получение списка подписок
router.get('/', auth, subscriptionController.getSubscriptions);

// Получение подписки по ID
router.get('/:id', auth, subscriptionController.getSubscriptionById);

// Создание новой подписки
router.post('/', auth, subscriptionController.createSubscription);

// Обновление подписки
router.put('/:id', auth, subscriptionController.updateSubscription);

// Архивация подписки
router.post('/:id/archive', auth, subscriptionController.archiveSubscription);

// Восстановление подписки из архива
router.post('/:id/restore', auth, subscriptionController.restoreSubscription);

// Изменение статуса подписки
router.post('/:id/status', auth, subscriptionController.changeStatus);

// Запись платежа по подписке
router.post('/:id/payment', auth, subscriptionController.makePayment);

module.exports = router;

const subscriptionService = require('../services/subscriptionService');
const { ApplicationError } = require('../../../core/errors/ApplicationError');

/**
 * Получение списка подписок пользователя
 * @swagger
 * /api/v1/subscriptions:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Получение списка подписок
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, cancelled, archived]
 *         description: Фильтр по статусу подписок
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Количество записей на странице
 *     responses:
 *       200:
 *         description: Список подписок
 */
const getSubscriptions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const result = await subscriptionService.getUserSubscriptions(
      userId,
      status,
      parseInt(limit),
      parseInt(page)
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error getting subscriptions:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при получении подписок',
    });
  }
};

/**
 * Получение подписки по ID
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Получение подписки по ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID подписки
 *     responses:
 *       200:
 *         description: Подписка
 *       404:
 *         description: Подписка не найдена
 */
const getSubscriptionById = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user._id;

    const subscription = await subscriptionService.getSubscriptionById(
      subscriptionId,
      userId
    );

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error getting subscription by ID:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при получении подписки',
    });
  }
};

/**
 * Создание новой подписки
 * @swagger
 * /api/v1/subscriptions:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Создание новой подписки
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
 *               - amount
 *               - frequency
 *               - startDate
 *               - accountId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               frequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly, quarterly, yearly, custom]
 *               customFrequencyDays:
 *                 type: number
 *                 minimum: 1
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               accountId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               autoPayment:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Подписка создана
 *       400:
 *         description: Некорректные данные
 */
const createSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptionData = req.body;

    // Проверка обязательных полей
    const requiredFields = [
      'name',
      'amount',
      'frequency',
      'startDate',
      'accountId',
    ];
    for (const field of requiredFields) {
      if (!subscriptionData[field]) {
        throw new ApplicationError(`Поле ${field} обязательно`, 400);
      }
    }

    // Проверка customFrequencyDays для frequency = custom
    if (
      subscriptionData.frequency === 'custom' &&
      !subscriptionData.customFrequencyDays
    ) {
      throw new ApplicationError(
        'Для пользовательской периодичности требуется указать количество дней',
        400
      );
    }

    // Создание подписки
    const subscription = await subscriptionService.createSubscription(
      subscriptionData,
      userId
    );

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при создании подписки',
    });
  }
};

/**
 * Обновление подписки
 * @swagger
 * /api/v1/subscriptions/{id}:
 *   put:
 *     tags:
 *       - Subscriptions
 *     summary: Обновление подписки
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID подписки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               frequency:
 *                 type: string
 *                 enum: [weekly, biweekly, monthly, quarterly, yearly, custom]
 *               customFrequencyDays:
 *                 type: number
 *                 minimum: 1
 *               endDate:
 *                 type: string
 *                 format: date
 *               accountId:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               autoPayment:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Подписка обновлена
 *       400:
 *         description: Некорректные данные
 *       404:
 *         description: Подписка не найдена
 */
const updateSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user._id;
    const updateData = req.body;

    const subscription = await subscriptionService.updateSubscription(
      subscriptionId,
      updateData,
      userId
    );

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при обновлении подписки',
    });
  }
};

/**
 * Архивация подписки
 * @swagger
 * /api/v1/subscriptions/{id}/archive:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Архивация подписки
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID подписки
 *     responses:
 *       200:
 *         description: Подписка архивирована
 *       404:
 *         description: Подписка не найдена
 */
const archiveSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user._id;

    const subscription = await subscriptionService.archiveSubscription(
      subscriptionId,
      userId
    );

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error archiving subscription:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при архивации подписки',
    });
  }
};

/**
 * Восстановление подписки из архива
 * @swagger
 * /api/v1/subscriptions/{id}/restore:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Восстановление подписки из архива
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID подписки
 *     responses:
 *       200:
 *         description: Подписка восстановлена
 *       404:
 *         description: Подписка не найдена
 */
const restoreSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user._id;

    const subscription = await subscriptionService.restoreSubscription(
      subscriptionId,
      userId
    );

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error restoring subscription:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при восстановлении подписки',
    });
  }
};

/**
 * Изменение статуса подписки
 * @swagger
 * /api/v1/subscriptions/{id}/status:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Изменение статуса подписки
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID подписки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, paused, cancelled]
 *     responses:
 *       200:
 *         description: Статус подписки изменен
 *       400:
 *         description: Некорректный статус
 *       404:
 *         description: Подписка не найдена
 */
const changeStatus = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user._id;
    const { status } = req.body;

    if (!status) {
      throw new ApplicationError('Статус обязателен', 400);
    }

    const subscription = await subscriptionService.changeSubscriptionStatus(
      subscriptionId,
      status,
      userId
    );

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error changing subscription status:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при изменении статуса подписки',
    });
  }
};

/**
 * Запись платежа по подписке
 * @swagger
 * /api/v1/subscriptions/{id}/payment:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Запись платежа по подписке
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID подписки
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Платеж записан
 *       404:
 *         description: Подписка не найдена
 */
const makePayment = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const userId = req.user._id;
    const paymentData = req.body;

    const result = await subscriptionService.makePayment(
      subscriptionId,
      paymentData,
      userId
    );

    res.status(200).json({
      subscription: result.subscription,
      payment: result.payment,
      transaction: result.transaction,
      account: result.account,
    });
  } catch (error) {
    console.error('Error making subscription payment:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при создании платежа по подписке',
    });
  }
};

/**
 * Получение предстоящих платежей
 * @swagger
 * /api/v1/subscriptions/upcoming:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Получение предстоящих платежей
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 90
 *           default: 7
 *         description: Количество дней для прогноза
 *     responses:
 *       200:
 *         description: Список предстоящих платежей
 */
const getUpcomingPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 7 } = req.query;

    const subscriptions = await subscriptionService.getUpcomingPayments(
      userId,
      parseInt(days)
    );

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Error getting upcoming payments:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при получении предстоящих платежей',
    });
  }
};

/**
 * Получение статистики по подпискам
 * @swagger
 * /api/v1/subscriptions/stats:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Получение статистики по подпискам
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика по подпискам
 */
const getSubscriptionStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await subscriptionService.getSubscriptionStats(userId);

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error getting subscription stats:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при получении статистики по подпискам',
    });
  }
};

/**
 * Получение расширенной аналитики по подпискам
 * @swagger
 * /api/v1/subscriptions/analytics:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Получение расширенной аналитики по подпискам
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: Период для аналитики
 *     responses:
 *       200:
 *         description: Расширенная аналитика по подпискам
 */
const getSubscriptionAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query;

    const analytics = await subscriptionService.getSubscriptionAnalytics(
      userId,
      period
    );

    res.status(200).json(analytics);
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    res.status(error.statusCode || 500).json({
      message: error.message || 'Ошибка при получении аналитики по подпискам',
    });
  }
};

module.exports = {
  getSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  archiveSubscription,
  restoreSubscription,
  changeStatus,
  makePayment,
  getUpcomingPayments,
  getSubscriptionStats,
  getSubscriptionAnalytics,
};

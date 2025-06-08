const {
  Transaction,
  Account,
  Category,
  Goal,
  Debt,
  Subscription,
} = require('../../../core/domain/entities');

/**
 * Получение списка архивных объектов определенного типа
 * @swagger
 * /api/archive/{type}:
 *   get:
 *     tags:
 *       - Archive
 *     summary: Получить список архивных объектов
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [accounts, categories, goals, debts, subscriptions]
 *         required: true
 *         description: Тип архивных объектов
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список архивных объектов
 */
const getArchivedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type } = req.params;
    const { page = 1, limit = 10, startDate, endDate, search } = req.query;

    const skip = (page - 1) * limit;
    let items = [];
    let total = 0;
    const query = { userId, status: 'archived' };

    // Добавляем условия фильтрации по дате, если указаны
    if (startDate || endDate) {
      query.updatedAt = {};
      if (startDate) query.updatedAt.$gte = new Date(startDate);
      if (endDate) query.updatedAt.$lte = new Date(endDate);
    }

    // Добавляем условие поиска, если указано
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Получаем данные в зависимости от типа
    switch (type) {
      case 'accounts':
        items = await Account.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await Account.countDocuments(query);
        break;

      case 'categories':
        items = await Category.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await Category.countDocuments(query);
        break;
      case 'goals':
        items = await Goal.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await Goal.countDocuments(query);
        break;
      case 'debts':
        items = await Debt.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await Debt.countDocuments(query);
        break;
      case 'subscriptions':
        items = await Subscription.find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(parseInt(limit));
        total = await Subscription.countDocuments(query);
        break;

      default:
        return res
          .status(400)
          .json({ message: 'Неизвестный тип архивных объектов' });
    }

    // Вычисляем пагинацию
    const totalPages = Math.ceil(total / limit);

    res.json({
      items,
      pagination: {
        total,
        page: parseInt(page),
        totalPages,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Ошибка при получении архивных объектов:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении архива' });
  }
};

/**
 * Восстановление архивного объекта
 * @swagger
 * /api/archive/{type}/{id}/restore:
 *   patch:
 *     tags:
 *       - Archive
 *     summary: Восстановить объект из архива
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *           enum: [accounts, categories, goals, debts, subscriptions]
 *         required: true
 *         description: Тип архивного объекта
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID архивного объекта
 *     responses:
 *       200:
 *         description: Объект успешно восстановлен
 */
const restoreFromArchive = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, id } = req.params;

    let item;

    // Восстанавливаем объект в зависимости от типа
    switch (type) {
      case 'accounts':
        item = await Account.findOneAndUpdate(
          { _id: id, userId, status: 'archived' },
          { status: 'active' },
          { new: true }
        );
        break;

      case 'categories':
        item = await Category.findOneAndUpdate(
          { _id: id, userId, status: 'archived' },
          { status: 'active' },
          { new: true }
        );
        break;
      case 'goals':
        item = await Goal.findOneAndUpdate(
          { _id: id, userId, status: 'archived' },
          { status: 'active' },
          { new: true }
        );
        break;
      case 'debts':
        item = await Debt.findOneAndUpdate(
          { _id: id, userId, status: 'archived' },
          { status: 'active' },
          { new: true }
        );
        break;
      case 'subscriptions':
        item = await Subscription.findOneAndUpdate(
          { _id: id, userId, status: 'archived' },
          { status: 'active' },
          { new: true }
        );
        break;
      default:
        return res
          .status(400)
          .json({ message: 'Неизвестный тип архивного объекта' });
    }

    if (!item) {
      return res.status(404).json({ message: 'Архивный объект не найден' });
    }

    res.json({
      message: 'Объект успешно восстановлен',
      item,
    });
  } catch (error) {
    console.error('Ошибка при восстановлении из архива:', error);
    res
      .status(500)
      .json({ message: 'Ошибка сервера при восстановлении из архива' });
  }
};

/**
 * Статистика по архиву
 * @swagger
 * /api/archive/stats:
 *   get:
 *     tags:
 *       - Archive
 *     summary: Получить статистику по архиву
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика по архиву
 */
const getArchiveStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = { userId, status: 'archived' };

    // Получаем статистику по каждому типу
    const [
      accountsCount,
      categoriesCount,
      goalsCount,
      debtsCount,
      subscriptionsCount,
    ] = await Promise.all([
      Account.countDocuments(query),
      Category.countDocuments(query),
      Goal.countDocuments(query),
      Debt.countDocuments(query),
      Subscription.countDocuments(query),
    ]);

    // Суммарная статистика
    const totalItems =
      accountsCount +
      categoriesCount +
      goalsCount +
      debtsCount +
      subscriptionsCount;

    // Дата самого старого архивного объекта
    const oldestDate = await [
      Account,
      Category,
      Goal,
      Debt,
      Subscription,
    ].reduce(async (oldestPromise, Model) => {
      const oldest = await oldestPromise;
      const item = await Model.findOne(query).sort({ archivedAt: 1 }).limit(1);
      if (!item) return oldest;
      return !oldest || item.archivedAt < oldest ? item.archivedAt : oldest;
    }, Promise.resolve(null));

    res.json({
      total: totalItems,
      byType: {
        accounts: accountsCount,
        categories: categoriesCount,
        goals: goalsCount,
        debts: debtsCount,
        subscriptions: subscriptionsCount,
      },
      oldestDate,
    });
  } catch (error) {
    console.error('Ошибка при получении статистики архива:', error);
    res
      .status(500)
      .json({ message: 'Ошибка сервера при получении статистики архива' });
  }
};

module.exports = {
  getArchivedItems,
  restoreFromArchive,
  getArchiveStats,
};

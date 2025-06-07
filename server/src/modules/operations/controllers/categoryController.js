const { Category } = require('../../../core/domain/entities');

/**
 * Получение всех категорий пользователя
 */
exports.getCategories = async (req, res) => {
  try {
    const { type, status = 'active' } = req.query;

    // Базовый фильтр по пользователю
    const filter = {
      userId: req.user._id,
    };

    // Дополнительные фильтры
    if (type) filter.type = type;
    if (status) filter.status = status;

    const categories = await Category.find(filter).sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Ошибка при получении категорий' });
  }
};

/**
 * Получение категории по ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category by ID error:', error);
    res.status(500).json({ message: 'Ошибка при получении категории' });
  }
};

/**
 * Создание новой категории
 */
exports.createCategory = async (req, res) => {
  try {
    const { name, type, icon } = req.body;

    console.log('[DEBUG] Creating category:', {
      name,
      type,
      icon,
      userId: req.user?._id,
    });

    // Проверка обязательных полей
    if (!name || !type || !['income', 'expense'].includes(type)) {
      console.log('[DEBUG] Validation failed:', {
        name: !!name,
        type,
        validType: ['income', 'expense'].includes(type),
      });
      return res.status(400).json({
        message: 'Необходимо указать name и type (income/expense)',
      });
    }

    // Проверка на уникальность имени категории для данного пользователя и типа
    const existingCategory = await Category.findOne({
      userId: req.user._id,
      name,
      type,
      status: 'active',
    });

    if (existingCategory) {
      console.log('[DEBUG] Category already exists:', {
        name,
        type,
        userId: req.user._id,
      });
      return res
        .status(400)
        .json({ message: 'Категория с таким именем уже существует' });
    }

    // Создаем новую категорию
    const category = new Category({
      userId: req.user._id,
      name,
      type,
      icon: icon || 'category',
    });

    const savedCategory = await category.save();
    console.log('[DEBUG] Category created successfully:', savedCategory._id);

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Create category error:', error);

    // Более детальная обработка ошибок
    if (error.code === 11000) {
      // Ошибка дублирования уникального ключа
      return res.status(400).json({
        message: 'Категория с таким названием уже существует',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: messages.join('. '),
      });
    }

    res.status(500).json({ message: 'Ошибка при создании категории' });
  }
};

/**
 * Обновление категории
 */
exports.updateCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    // Находим категорию
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    // Обновляем поля
    if (name) {
      // Проверка на уникальность имени
      const existingCategory = await Category.findOne({
        userId: req.user._id,
        name,
        type: category.type,
        status: 'active',
        _id: { $ne: category._id }, // Исключаем текущую категорию
      });

      if (existingCategory) {
        return res.status(400).json({
          message: 'Категория с таким именем уже существует',
        });
      }

      category.name = name;
    }

    if (icon) {
      category.icon = icon;
    }

    await category.save();

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении категории' });
  }
};

/**
 * Архивация категории
 */
exports.archiveCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!category) {
      return res.status(404).json({ message: 'Категория не найдена' });
    }

    category.status = 'archived';
    await category.save();

    res.json({ message: 'Категория архивирована' });
  } catch (error) {
    console.error('Archive category error:', error);
    res.status(500).json({ message: 'Ошибка при архивации категории' });
  }
};

/**
 * Восстановление категории из архива
 */
exports.restoreCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'archived',
    });

    if (!category) {
      return res
        .status(404)
        .json({ message: 'Категория не найдена или не архивирована' });
    }

    // Проверка на уникальность имени при восстановлении
    const existingCategory = await Category.findOne({
      userId: req.user._id,
      name: category.name,
      type: category.type,
      status: 'active',
    });

    if (existingCategory) {
      return res.status(400).json({
        message:
          'Категория с таким именем уже существует. Пожалуйста, измените имя перед восстановлением.',
      });
    }

    category.status = 'active';
    await category.save();

    res.json({ message: 'Категория восстановлена из архива', category });
  } catch (error) {
    console.error('Restore category error:', error);
    res.status(500).json({
      message: 'Ошибка при восстановлении категории из архива',
    });
  }
};

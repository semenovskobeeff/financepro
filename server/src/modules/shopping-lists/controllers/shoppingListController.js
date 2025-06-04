const { ShoppingListService } = require('../services/shoppingListService');

const shoppingListService = new ShoppingListService();

// Получение всех списков покупок пользователя
const getShoppingLists = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const lists = await shoppingListService.getShoppingLists(userId);
    res.json({ data: lists });
  } catch (error) {
    console.error('Error getting shopping lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получение конкретного списка покупок
const getShoppingListById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const list = await shoppingListService.getShoppingListById(id, userId);
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json({ data: list });
  } catch (error) {
    console.error('Error getting shopping list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Создание нового списка покупок
const createShoppingList = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, deadline, totalBudget } = req.body;

    if (!name || !totalBudget) {
      return res
        .status(400)
        .json({ error: 'Name and totalBudget are required' });
    }

    const list = await shoppingListService.createShoppingList(userId, {
      name,
      description,
      deadline: deadline ? new Date(deadline) : undefined,
      totalBudget: Number(totalBudget),
    });

    res.status(201).json({ data: list });
  } catch (error) {
    console.error('Error creating shopping list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Обновление списка покупок
const updateShoppingList = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = { ...req.body };
    if (updates.deadline) {
      updates.deadline = new Date(updates.deadline);
    }
    if (updates.totalBudget) {
      updates.totalBudget = Number(updates.totalBudget);
    }

    const list = await shoppingListService.updateShoppingList(
      id,
      userId,
      updates
    );
    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json({ data: list });
  } catch (error) {
    console.error('Error updating shopping list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Удаление списка покупок
const deleteShoppingList = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = await shoppingListService.deleteShoppingList(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Добавление товара в список
const addItemToList = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { listId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, price, quantity, priority, category, notes } = req.body;

    if (!name || !price || !quantity || !priority || !category) {
      return res.status(400).json({
        error: 'Name, price, quantity, priority, and category are required',
      });
    }

    const list = await shoppingListService.addItemToList(listId, userId, {
      name,
      price: Number(price),
      quantity: Number(quantity),
      priority,
      category,
      notes,
    });

    if (!list) {
      return res.status(404).json({ error: 'Shopping list not found' });
    }

    res.json({ data: list });
  } catch (error) {
    console.error('Error adding item to list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Обновление товара в списке
const updateListItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { listId, itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = { ...req.body };
    if (updates.price) updates.price = Number(updates.price);
    if (updates.quantity) updates.quantity = Number(updates.quantity);

    const list = await shoppingListService.updateListItem(
      listId,
      itemId,
      userId,
      updates
    );
    if (!list) {
      return res.status(404).json({ error: 'Shopping list or item not found' });
    }

    res.json({ data: list });
  } catch (error) {
    console.error('Error updating list item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Удаление товара из списка
const removeItemFromList = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { listId, itemId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const list = await shoppingListService.removeItemFromList(
      listId,
      itemId,
      userId
    );
    if (!list) {
      return res.status(404).json({ error: 'Shopping list or item not found' });
    }

    res.json({ data: list });
  } catch (error) {
    console.error('Error removing item from list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Получение статистики по спискам покупок
const getShoppingListStatistics = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await shoppingListService.getShoppingListStatistics(userId);
    res.json({ data: stats });
  } catch (error) {
    console.error('Error getting shopping list statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getShoppingLists,
  getShoppingListById,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  updateListItem,
  removeItemFromList,
  getShoppingListStatistics,
};

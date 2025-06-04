const express = require('express');
const { auth } = require('../../../core/infrastructure/auth/auth');
const {
  getShoppingLists,
  getShoppingListById,
  createShoppingList,
  updateShoppingList,
  deleteShoppingList,
  addItemToList,
  updateListItem,
  removeItemFromList,
  getShoppingListStatistics,
} = require('../controllers/shoppingListController');

const router = express.Router();

// Основные маршруты для списков покупок
router.get('/', auth, getShoppingLists);
router.get('/statistics', auth, getShoppingListStatistics);
router.get('/:id', auth, getShoppingListById);
router.post('/', auth, createShoppingList);
router.put('/:id', auth, updateShoppingList);
router.delete('/:id', auth, deleteShoppingList);

// Маршруты для товаров в списках
router.post('/:listId/items', auth, addItemToList);
router.put('/:listId/items/:itemId', auth, updateListItem);
router.delete('/:listId/items/:itemId', auth, removeItemFromList);

module.exports = router;

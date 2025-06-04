// Доменные типы для списков покупок

/**
 * @typedef {Object} ShoppingListItem
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {number} quantity
 * @property {'low'|'medium'|'high'} priority
 * @property {string} category
 * @property {boolean} isPurchased
 * @property {string} [notes]
 */

/**
 * @typedef {Object} ShoppingList
 * @property {string} id
 * @property {string} userId
 * @property {string} name
 * @property {string} [description]
 * @property {Date} [deadline]
 * @property {number} totalBudget
 * @property {number} spentAmount
 * @property {'draft'|'active'|'completed'|'cancelled'} status
 * @property {ShoppingListItem[]} items
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

module.exports = {
  // Экспортируем типы через JSDoc для использования в комментариях
};

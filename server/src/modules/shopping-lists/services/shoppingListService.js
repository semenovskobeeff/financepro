const { randomUUID } = require('crypto');

// Временное хранилище данных (в реальном проекте будет база данных)
let shoppingLists = [];

class ShoppingListService {
  async getShoppingLists(userId) {
    return shoppingLists.filter(list => list.userId === userId);
  }

  async getShoppingListById(id, userId) {
    return (
      shoppingLists.find(list => list.id === id && list.userId === userId) ||
      null
    );
  }

  async createShoppingList(userId, data) {
    const newList = {
      id: randomUUID(),
      userId,
      name: data.name,
      description: data.description,
      deadline: data.deadline,
      totalBudget: data.totalBudget,
      spentAmount: 0,
      status: 'draft',
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    shoppingLists.push(newList);
    return newList;
  }

  async updateShoppingList(id, userId, data) {
    const listIndex = shoppingLists.findIndex(
      list => list.id === id && list.userId === userId
    );
    if (listIndex === -1) return null;

    shoppingLists[listIndex] = {
      ...shoppingLists[listIndex],
      ...data,
      updatedAt: new Date(),
    };

    return shoppingLists[listIndex];
  }

  async deleteShoppingList(id, userId) {
    const initialLength = shoppingLists.length;
    shoppingLists = shoppingLists.filter(
      list => !(list.id === id && list.userId === userId)
    );
    return shoppingLists.length < initialLength;
  }

  async addItemToList(listId, userId, data) {
    const listIndex = shoppingLists.findIndex(
      list => list.id === listId && list.userId === userId
    );
    if (listIndex === -1) return null;

    const newItem = {
      id: randomUUID(),
      name: data.name,
      price: data.price,
      quantity: data.quantity,
      priority: data.priority,
      category: data.category,
      isPurchased: false,
      notes: data.notes,
    };

    shoppingLists[listIndex].items.push(newItem);
    shoppingLists[listIndex].updatedAt = new Date();

    return shoppingLists[listIndex];
  }

  async updateListItem(listId, itemId, userId, data) {
    const listIndex = shoppingLists.findIndex(
      list => list.id === listId && list.userId === userId
    );
    if (listIndex === -1) return null;

    const itemIndex = shoppingLists[listIndex].items.findIndex(
      item => item.id === itemId
    );
    if (itemIndex === -1) return null;

    shoppingLists[listIndex].items[itemIndex] = {
      ...shoppingLists[listIndex].items[itemIndex],
      ...data,
    };

    // Обновляем потраченную сумму при покупке товара
    if (data.isPurchased !== undefined) {
      this.updateSpentAmount(listIndex);
    }

    shoppingLists[listIndex].updatedAt = new Date();
    return shoppingLists[listIndex];
  }

  async removeItemFromList(listId, itemId, userId) {
    const listIndex = shoppingLists.findIndex(
      list => list.id === listId && list.userId === userId
    );
    if (listIndex === -1) return null;

    const itemIndex = shoppingLists[listIndex].items.findIndex(
      item => item.id === itemId
    );
    if (itemIndex === -1) return null;

    shoppingLists[listIndex].items.splice(itemIndex, 1);
    this.updateSpentAmount(listIndex);
    shoppingLists[listIndex].updatedAt = new Date();

    return shoppingLists[listIndex];
  }

  updateSpentAmount(listIndex) {
    const list = shoppingLists[listIndex];
    list.spentAmount = list.items
      .filter(item => item.isPurchased)
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  async getShoppingListStatistics(userId) {
    const userLists = shoppingLists.filter(list => list.userId === userId);
    const activeLists = userLists.filter(list => list.status === 'active');
    const totalBudget = userLists.reduce(
      (sum, list) => sum + list.totalBudget,
      0
    );
    const totalSpent = userLists.reduce(
      (sum, list) => sum + list.spentAmount,
      0
    );

    const totalItems = userLists.reduce(
      (sum, list) => sum + list.items.length,
      0
    );
    const purchasedItems = userLists.reduce(
      (sum, list) => sum + list.items.filter(item => item.isPurchased).length,
      0
    );
    const completionRate =
      totalItems > 0 ? (purchasedItems / totalItems) * 100 : 0;

    return {
      totalLists: userLists.length,
      activeLists: activeLists.length,
      totalBudget,
      totalSpent,
      completionRate,
    };
  }
}

module.exports = { ShoppingListService };

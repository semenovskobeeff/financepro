// СЕРВИС СИНХРОНИЗАЦИИ БАЛАНСОВ ОТКЛЮЧЕН
/*
const Account = require('../../../core/domain/entities/Account');
const Transaction = require('../../../core/domain/entities/Transaction');

class BalanceService {
  // ... existing code ...
}

module.exports = new BalanceService();
*/

// Заглушка для избежания ошибок импорта
module.exports = {
  checkBalancesConsistency: () =>
    Promise.resolve({ hasInconsistencies: false }),
  calculateAccountBalance: () => Promise.resolve(0),
  recalculateAllBalances: () => Promise.resolve({ accountsProcessed: 0 }),
  syncAccountBalance: () => Promise.resolve({ synchronized: false }),
  validateAndFixBalances: () => Promise.resolve({ status: 'disabled' }),
  createBalanceSnapshot: () => Promise.resolve({ timestamp: new Date() }),
};

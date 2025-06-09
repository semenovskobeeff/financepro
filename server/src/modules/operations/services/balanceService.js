const Account = require('../../../core/domain/entities/Account');
const Transaction = require('../../../core/domain/entities/Transaction');

class BalanceService {
  /**
   * Пересчитывает баланс счета на основе всех транзакций
   * @param {string} accountId - ID счета
   * @returns {Promise<Object>} - Результат пересчета
   */
  async recalculateAccountBalance(accountId) {
    try {
      console.log('🔄 Пересчет баланса счета:', accountId);

      const account = await Account.findById(accountId);
      if (!account) {
        throw new Error('Счет не найден');
      }

      const oldBalance = account.balance;

      // Получаем все транзакции, связанные с этим счетом (включая все статусы кроме deleted)
      const transactions = await Transaction.find({
        $or: [{ accountId: accountId }, { toAccountId: accountId }],
        status: { $ne: 'deleted' }, // исключаем только удаленные
      }).sort({ date: 1 });

      let calculatedBalance = 0;

      // Пересчитываем баланс на основе транзакций
      transactions.forEach(transaction => {
        if (transaction.accountId.toString() === accountId.toString()) {
          // Это исходящая операция или операция с данным счетом
          if (transaction.type === 'income') {
            calculatedBalance += transaction.amount;
          } else if (transaction.type === 'expense') {
            calculatedBalance -= transaction.amount;
          } else if (transaction.type === 'transfer') {
            calculatedBalance -= transaction.amount; // Исходящий перевод
          }
        } else if (
          transaction.toAccountId &&
          transaction.toAccountId.toString() === accountId.toString()
        ) {
          // Это входящий перевод
          if (transaction.type === 'transfer') {
            calculatedBalance += transaction.amount; // Входящий перевод
          }
        }
      });

      // Обновляем баланс счета
      account.balance = calculatedBalance;
      await account.save();

      const result = {
        accountId,
        accountName: account.name,
        oldBalance,
        newBalance: calculatedBalance,
        difference: calculatedBalance - oldBalance,
        transactionsProcessed: transactions.length,
        synchronized: Math.abs(calculatedBalance - oldBalance) > 0.01,
      };

      if (result.synchronized) {
        console.log('✅ Баланс счета синхронизирован:', result);
      } else {
        console.log('ℹ️ Баланс счета корректен:', result);
      }

      return result;
    } catch (error) {
      console.error('❌ Ошибка пересчета баланса счета:', error);
      throw error;
    }
  }

  /**
   * Пересчитывает балансы всех счетов пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Результат пересчета
   */
  async recalculateAllBalances(userId) {
    try {
      console.log('🔄 Пересчет балансов всех счетов пользователя:', userId);

      const accounts = await Account.find({
        userId,
        status: 'active',
      });

      const results = [];
      let accountsProcessed = 0;
      let accountsCorrected = 0;

      for (const account of accounts) {
        try {
          const result = await this.recalculateAccountBalance(account._id);
          results.push(result);
          accountsProcessed++;

          if (result.synchronized) {
            accountsCorrected++;
          }
        } catch (error) {
          console.error(`❌ Ошибка пересчета счета ${account._id}:`, error);
          results.push({
            accountId: account._id,
            accountName: account.name,
            error: error.message,
          });
        }
      }

      const summary = {
        accountsProcessed,
        accountsCorrected,
        results,
        success: true,
      };

      console.log('✅ Пересчет балансов завершен:', {
        processed: accountsProcessed,
        corrected: accountsCorrected,
      });

      return summary;
    } catch (error) {
      console.error('❌ Ошибка пересчета балансов:', error);
      throw error;
    }
  }

  /**
   * Проверяет корректность балансов счетов
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Результат проверки
   */
  async checkBalancesConsistency(userId) {
    try {
      console.log(
        '🔍 Проверка корректности балансов для пользователя:',
        userId
      );

      const accounts = await Account.find({
        userId,
        status: 'active',
      });

      const inconsistencies = [];
      let accountsChecked = 0;

      for (const account of accounts) {
        try {
          // Вычисляем правильный баланс без изменения счета (включая все статусы кроме deleted)
          const transactions = await Transaction.find({
            $or: [{ accountId: account._id }, { toAccountId: account._id }],
            status: { $ne: 'deleted' }, // исключаем только удаленные
          });

          let calculatedBalance = 0;

          transactions.forEach(transaction => {
            if (transaction.accountId.toString() === account._id.toString()) {
              if (transaction.type === 'income') {
                calculatedBalance += transaction.amount;
              } else if (transaction.type === 'expense') {
                calculatedBalance -= transaction.amount;
              } else if (transaction.type === 'transfer') {
                calculatedBalance -= transaction.amount;
              }
            } else if (
              transaction.toAccountId &&
              transaction.toAccountId.toString() === account._id.toString()
            ) {
              if (transaction.type === 'transfer') {
                calculatedBalance += transaction.amount;
              }
            }
          });

          accountsChecked++;

          // Проверяем расхождение (с учетом возможных погрешностей округления)
          const difference = Math.abs(account.balance - calculatedBalance);
          if (difference > 0.01) {
            inconsistencies.push({
              accountId: account._id,
              accountName: account.name,
              storedBalance: account.balance,
              calculatedBalance,
              difference: account.balance - calculatedBalance,
            });
          }
        } catch (error) {
          console.error(`❌ Ошибка проверки счета ${account._id}:`, error);
        }
      }

      const result = {
        hasInconsistencies: inconsistencies.length > 0,
        accountsChecked,
        inconsistencies,
      };

      if (result.hasInconsistencies) {
        console.log(
          '⚠️ Найдены несоответствия в балансах:',
          inconsistencies.length
        );
      } else {
        console.log('✅ Все балансы корректны');
      }

      return result;
    } catch (error) {
      console.error('❌ Ошибка проверки балансов:', error);
      throw error;
    }
  }

  /**
   * Валидация и автоисправление балансов
   * @param {string} userId - ID пользователя
   * @param {boolean} autoFix - Автоматически исправлять найденные проблемы
   * @returns {Promise<Object>} - Результат валидации
   */
  async validateAndFixBalances(userId, autoFix = true) {
    try {
      const checkResult = await this.checkBalancesConsistency(userId);

      if (!checkResult.hasInconsistencies) {
        return {
          status: 'ok',
          message: 'Все балансы корректны',
          ...checkResult,
        };
      }

      if (!autoFix) {
        return {
          status: 'inconsistent',
          message: 'Найдены несоответствия в балансах',
          ...checkResult,
        };
      }

      // Исправляем найденные несоответствия
      const fixResult = await this.recalculateAllBalances(userId);

      return {
        status: 'fixed',
        message: 'Балансы исправлены автоматически',
        hasInconsistencies: false,
        inconsistencies: [],
        fixResult,
      };
    } catch (error) {
      console.error('❌ Ошибка валидации балансов:', error);
      throw error;
    }
  }

  /**
   * Создает снимок балансов для диагностики
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} - Снимок балансов
   */
  async createBalanceSnapshot(userId) {
    try {
      const accounts = await Account.find({
        userId,
        status: 'active',
      });

      const snapshot = {
        userId,
        timestamp: new Date(),
        accounts: accounts.map(account => ({
          accountId: account._id,
          accountName: account.name,
          balance: account.balance,
          type: account.type,
          currency: account.currency,
        })),
      };

      console.log(
        '📸 Создан снимок балансов:',
        snapshot.accounts.length,
        'счетов'
      );
      return snapshot;
    } catch (error) {
      console.error('❌ Ошибка создания снимка балансов:', error);
      throw error;
    }
  }
}

module.exports = new BalanceService();

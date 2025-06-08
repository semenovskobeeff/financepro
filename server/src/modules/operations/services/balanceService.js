const { Account, Transaction } = require('../../../core/domain/entities');

class BalanceService {
  /**
   * Проверка корректности балансов всех счетов пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} Результат проверки
   */
  async checkBalancesConsistency(userId) {
    try {
      console.log('🔍 Начинаем проверку балансов для пользователя:', userId);

      const accounts = await Account.find({
        userId,
        status: 'active',
      });

      const inconsistencies = [];

      for (const account of accounts) {
        const calculatedBalance = await this.calculateAccountBalance(
          account._id
        );
        const storedBalance = account.balance;
        const difference = Math.abs(calculatedBalance - storedBalance);

        if (difference > 0.01) {
          // Погрешность округления
          inconsistencies.push({
            accountId: account._id,
            accountName: account.name,
            storedBalance,
            calculatedBalance,
            difference,
          });

          console.warn(`⚠️ Несоответствие баланса для счета ${account.name}:`, {
            stored: storedBalance,
            calculated: calculatedBalance,
            difference,
          });
        }
      }

      return {
        hasInconsistencies: inconsistencies.length > 0,
        accountsChecked: accounts.length,
        inconsistencies,
      };
    } catch (error) {
      console.error('❌ Ошибка при проверке балансов:', error);
      throw error;
    }
  }

  /**
   * Рассчитать корректный баланс счета на основе транзакций
   * @param {string} accountId - ID счета
   * @returns {Promise<number>} Рассчитанный баланс
   */
  async calculateAccountBalance(accountId) {
    try {
      let balance = 0;

      // Получаем все активные транзакции для этого счета
      const transactions = await Transaction.find({
        $or: [{ accountId }, { toAccountId: accountId }],
        status: 'active',
      }).sort({ date: 1 });

      for (const transaction of transactions) {
        if (transaction.accountId.toString() === accountId.toString()) {
          // Исходящий счет
          if (transaction.type === 'income') {
            balance += transaction.amount;
          } else if (
            transaction.type === 'expense' ||
            transaction.type === 'transfer'
          ) {
            balance -= transaction.amount;
          }
        } else if (
          transaction.toAccountId &&
          transaction.toAccountId.toString() === accountId.toString()
        ) {
          // Входящий счет для перевода
          if (transaction.type === 'transfer') {
            balance += transaction.amount;
          }
        }
      }

      return balance;
    } catch (error) {
      console.error('❌ Ошибка при расчете баланса счета:', error);
      throw error;
    }
  }

  /**
   * Пересчет всех балансов пользователя
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} Результат пересчета
   */
  async recalculateAllBalances(userId) {
    try {
      console.log('🔄 Начинаем пересчет балансов для пользователя:', userId);

      const accounts = await Account.find({
        userId,
        status: 'active',
      });

      const results = [];

      for (const account of accounts) {
        const oldBalance = account.balance;
        const newBalance = await this.calculateAccountBalance(account._id);

        // Обновляем баланс
        account.balance = newBalance;
        await account.save();

        results.push({
          accountId: account._id,
          accountName: account.name,
          oldBalance,
          newBalance,
          difference: newBalance - oldBalance,
        });

        console.log(`✅ Обновлен баланс счета ${account.name}:`, {
          старый: oldBalance,
          новый: newBalance,
          разница: newBalance - oldBalance,
        });
      }

      return {
        accountsProcessed: accounts.length,
        results,
      };
    } catch (error) {
      console.error('❌ Ошибка при пересчете балансов:', error);
      throw error;
    }
  }

  /**
   * Автоматическая проверка и исправление балансов
   * @param {string} userId - ID пользователя
   * @param {boolean} autoFix - Автоматически исправлять найденные ошибки
   * @returns {Promise<Object>} Результат проверки и исправления
   */
  async validateAndFixBalances(userId, autoFix = false) {
    try {
      const checkResult = await this.checkBalancesConsistency(userId);

      if (!checkResult.hasInconsistencies) {
        console.log('✅ Все балансы корректны для пользователя:', userId);
        return {
          status: 'ok',
          message: 'Все балансы корректны',
          ...checkResult,
        };
      }

      if (autoFix) {
        console.log('🔧 Автоматическое исправление балансов...');
        const fixResult = await this.recalculateAllBalances(userId);

        return {
          status: 'fixed',
          message: 'Балансы автоматически исправлены',
          ...checkResult,
          fixResult,
        };
      }

      return {
        status: 'inconsistent',
        message: 'Обнаружены несоответствия в балансах',
        ...checkResult,
      };
    } catch (error) {
      console.error('❌ Ошибка при валидации балансов:', error);
      throw error;
    }
  }
}

module.exports = new BalanceService();

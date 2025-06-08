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
        const difference = calculatedBalance - storedBalance;

        if (Math.abs(difference) > 0.01) {
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
   * Рассчитать корректный баланс счета на основе всех транзакций
   * @param {string} accountId - ID счета
   * @returns {Promise<number>} Рассчитанный баланс
   */
  async calculateAccountBalance(accountId) {
    try {
      console.log('🔄 Расчет баланса для счета:', accountId);

      // Получаем счет для определения начального баланса
      const account = await Account.findById(accountId);
      if (!account) {
        throw new Error(`Счет ${accountId} не найден`);
      }

      // Получаем все активные транзакции для этого счета, отсортированные по дате
      const transactions = await Transaction.find({
        $or: [{ accountId }, { toAccountId: accountId }],
        status: 'active',
      }).sort({ date: 1, createdAt: 1 });

      console.log(
        `💰 Найдено ${transactions.length} транзакций для счета ${account.name}`
      );

      // Начинаем с нулевого баланса и пересчитываем все операции
      let balance = 0;

      for (const transaction of transactions) {
        const isSourceAccount =
          transaction.accountId.toString() === accountId.toString();
        const isTargetAccount =
          transaction.toAccountId &&
          transaction.toAccountId.toString() === accountId.toString();

        if (isSourceAccount) {
          // Исходящий счет
          if (transaction.type === 'income') {
            balance += transaction.amount;
            console.log(`📈 Доход +${transaction.amount}, баланс: ${balance}`);
          } else if (transaction.type === 'expense') {
            balance -= transaction.amount;
            console.log(`📉 Расход -${transaction.amount}, баланс: ${balance}`);
          } else if (transaction.type === 'transfer') {
            balance -= transaction.amount;
            console.log(
              `📤 Перевод исходящий -${transaction.amount}, баланс: ${balance}`
            );
          }
        } else if (isTargetAccount) {
          // Входящий счет для перевода
          if (transaction.type === 'transfer') {
            balance += transaction.amount;
            console.log(
              `📥 Перевод входящий +${transaction.amount}, баланс: ${balance}`
            );
          }
        }
      }

      console.log(
        `✅ Итоговый рассчитанный баланс для ${account.name}: ${balance}`
      );
      return balance;
    } catch (error) {
      console.error('❌ Ошибка при расчете баланса счета:', error);
      throw error;
    }
  }

  /**
   * Полный пересчет всех балансов пользователя с корректировкой
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} Результат пересчета
   */
  async recalculateAllBalances(userId) {
    try {
      console.log(
        '🔄 Начинаем полный пересчет балансов для пользователя:',
        userId
      );

      const accounts = await Account.find({
        userId,
        status: 'active',
      });

      const results = [];
      let totalCorrections = 0;

      for (const account of accounts) {
        const oldBalance = account.balance;
        const newBalance = await this.calculateAccountBalance(account._id);
        const difference = newBalance - oldBalance;

        // Обновляем баланс только если есть разница
        if (Math.abs(difference) > 0.01) {
          account.balance = newBalance;
          await account.save();
          totalCorrections++;

          console.log(`🔧 Исправлен баланс счета ${account.name}:`, {
            старый: oldBalance,
            новый: newBalance,
            разница: difference,
          });
        } else {
          console.log(
            `✅ Баланс счета ${account.name} корректен: ${oldBalance}`
          );
        }

        results.push({
          accountId: account._id,
          accountName: account.name,
          oldBalance,
          newBalance,
          difference,
          wasChanged: Math.abs(difference) > 0.01,
        });
      }

      console.log(
        `🎯 Пересчет завершен. Исправлено счетов: ${totalCorrections} из ${accounts.length}`
      );

      return {
        accountsProcessed: accounts.length,
        accountsCorrected: totalCorrections,
        results,
        success: true,
      };
    } catch (error) {
      console.error('❌ Ошибка при пересчете балансов:', error);
      throw error;
    }
  }

  /**
   * Автоматическая синхронизация баланса конкретного счета
   * @param {string} accountId - ID счета
   * @returns {Promise<Object>} Результат синхронизации
   */
  async syncAccountBalance(accountId) {
    try {
      console.log('⚡ Автосинхронизация баланса счета:', accountId);

      const account = await Account.findById(accountId);
      if (!account) {
        throw new Error(`Счет ${accountId} не найден`);
      }

      const oldBalance = account.balance;
      const newBalance = await this.calculateAccountBalance(accountId);
      const difference = newBalance - oldBalance;

      if (Math.abs(difference) > 0.01) {
        account.balance = newBalance;
        await account.save();

        console.log(
          `🔄 Автосинхронизация: обновлен баланс счета ${account.name}`,
          {
            старый: oldBalance,
            новый: newBalance,
            разница: difference,
          }
        );

        return {
          synchronized: true,
          oldBalance,
          newBalance,
          difference,
        };
      }

      console.log(
        `✅ Автосинхронизация: баланс счета ${account.name} корректен`
      );
      return {
        synchronized: false,
        oldBalance,
        newBalance,
        difference: 0,
      };
    } catch (error) {
      console.error('❌ Ошибка автосинхронизации баланса:', error);
      throw error;
    }
  }

  /**
   * Автоматическая проверка и исправление балансов при критических операциях
   * @param {string} userId - ID пользователя
   * @param {boolean} autoFix - Автоматически исправлять найденные ошибки
   * @returns {Promise<Object>} Результат проверки и исправления
   */
  async validateAndFixBalances(userId, autoFix = true) {
    try {
      console.log('🔍 Валидация балансов для пользователя:', userId);

      const checkResult = await this.checkBalancesConsistency(userId);

      if (!checkResult.hasInconsistencies) {
        console.log('✅ Все балансы корректны для пользователя:', userId);
        return {
          status: 'ok',
          message: 'Все балансы корректны',
          ...checkResult,
        };
      }

      console.log(
        `⚠️ Найдено ${checkResult.inconsistencies.length} некорректных балансов`
      );

      if (autoFix) {
        console.log('🔧 Автоматическое исправление балансов...');
        const fixResult = await this.recalculateAllBalances(userId);

        return {
          status: 'fixed',
          message: `Автоматически исправлено ${fixResult.accountsCorrected} балансов`,
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

  /**
   * Создать точку восстановления для балансов
   * @param {string} userId - ID пользователя
   * @returns {Promise<Object>} Снимок текущих балансов
   */
  async createBalanceSnapshot(userId) {
    try {
      console.log('📸 Создание снимка балансов для пользователя:', userId);

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
        })),
      };

      console.log(`📸 Создан снимок ${accounts.length} счетов`);
      return snapshot;
    } catch (error) {
      console.error('❌ Ошибка создания снимка балансов:', error);
      throw error;
    }
  }
}

module.exports = new BalanceService();

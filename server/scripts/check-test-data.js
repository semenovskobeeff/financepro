require('dotenv').config();
const mongoose = require('mongoose');

// Импортируем модели
require('../src/core/domain/entities/User');
require('../src/core/domain/entities/Account');
require('../src/core/domain/entities/Transaction');
require('../src/core/domain/entities/Goal');
require('../src/core/domain/entities/Debt');
require('../src/core/domain/entities/Subscription');
require('../src/core/domain/entities/Category');

const User = mongoose.model('User');
const Account = mongoose.model('Account');
const Transaction = mongoose.model('Transaction');
const Goal = mongoose.model('Goal');
const Debt = mongoose.model('Debt');
const Subscription = mongoose.model('Subscription');
const Category = mongoose.model('Category');

async function checkTestUserData() {
  try {
    console.log('🔍 Подключение к базе данных...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('👤 Поиск тестового пользователя...');
    const testUser = await User.findOne({ email: 'test@example.com' });

    if (!testUser) {
      console.log('❌ Тестовый пользователь не найден');
      process.exit(1);
    }

    console.log(`✅ Найден тестовый пользователь: ${testUser.email}`);
    console.log(`📧 ID пользователя: ${testUser._id}`);

    console.log('📊 Подсчет данных...');
    const [accounts, categories, transactions, goals, debts, subscriptions] =
      await Promise.all([
        Account.countDocuments({ userId: testUser._id }),
        Category.countDocuments({ userId: testUser._id }),
        Transaction.countDocuments({ userId: testUser._id }),
        Goal.countDocuments({ userId: testUser._id }),
        Debt.countDocuments({ userId: testUser._id }),
        Subscription.countDocuments({ userId: testUser._id }),
      ]);

    console.log('\n📊 Текущее состояние данных для test@example.com:');
    console.log(`   Счета: ${accounts} / требуется: 4`);
    console.log(`   Категории: ${categories} / требуется: 10`);
    console.log(`   Транзакции: ${transactions} / требуется: 50`);
    console.log(`   Цели: ${goals} / требуется: 3`);
    console.log(`   Долги: ${debts} / требуется: 3`);
    console.log(`   Подписки: ${subscriptions} / требуется: 4`);

    // Определяем полноту данных
    const requirements = {
      accounts: 4,
      categories: 10,
      transactions: 50,
      goals: 3,
      debts: 3,
      subscriptions: 4,
    };
    const needsUpdate =
      accounts < requirements.accounts ||
      categories < requirements.categories ||
      transactions < requirements.transactions ||
      goals < requirements.goals ||
      debts < requirements.debts ||
      subscriptions < requirements.subscriptions;

    if (needsUpdate) {
      console.log('\n⚠️ Данные неполные, рекомендуется обновление');
      console.log('💡 Запустите: npm run reseed');
    } else {
      console.log('\n✅ Все данные присутствуют в полном объеме');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
    process.exit(1);
  }
}

checkTestUserData();

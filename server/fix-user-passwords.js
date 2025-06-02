require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

console.log('🔧 Исправление паролей пользователей в MongoDB Atlas...');
console.log('');

// Подключение к базе данных
const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app-test';

    console.log('🔄 Подключение к MongoDB Atlas...');
    console.log('📍 URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('✅ Подключение установлено');
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    return false;
  }
};

// Схема пользователя (упрощенная)
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    roles: [{ type: String, default: 'user' }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);

// Исправление паролей
const fixPasswords = async () => {
  try {
    console.log('🔍 Поиск пользователей с проблемными паролями...');

    // Находим всех пользователей
    const users = await User.find({});
    console.log(`📊 Найдено пользователей: ${users.length}`);

    if (users.length === 0) {
      console.log('👤 Создаём тестового пользователя...');

      const hashedPassword = await bcrypt.hash('password', 12);
      const testUser = new User({
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Тестовый пользователь',
        roles: ['user'],
      });

      await testUser.save();
      console.log('✅ Тестовый пользователь создан');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Пароль: password');

      return;
    }

    // Проверяем и исправляем пароли
    let fixedCount = 0;

    for (const user of users) {
      // Проверяем, является ли пароль захешированным
      if (
        !user.password ||
        user.password.length < 50 ||
        !user.password.startsWith('$2')
      ) {
        console.log(`🔧 Исправляем пароль для пользователя: ${user.email}`);

        // Хешируем пароль "password" по умолчанию
        const hashedPassword = await bcrypt.hash('password', 12);

        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        fixedCount++;
      }
    }

    if (fixedCount > 0) {
      console.log(`✅ Исправлено паролей: ${fixedCount}`);
      console.log('🔑 Пароль для всех пользователей: password');
    } else {
      console.log('✅ Все пароли в порядке');
    }

    // Показываем всех пользователей
    console.log('');
    console.log('👥 Пользователи в базе данных:');
    const updatedUsers = await User.find({}, 'email name roles').lean();
    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name})`);
    });
  } catch (error) {
    console.error('❌ Ошибка при исправлении паролей:', error.message);
  }
};

// Основная функция
const main = async () => {
  const connected = await connectDB();

  if (!connected) {
    console.log('💡 Убедитесь, что:');
    console.log('   1. Файл .env настроен правильно');
    console.log('   2. IP добавлен в MongoDB Atlas Network Access');
    console.log('   3. Кластер MongoDB Atlas активен');
    process.exit(1);
  }

  await fixPasswords();

  console.log('');
  console.log('🎉 Готово! Теперь можно авторизоваться в приложении');
  console.log('📧 Email: test@example.com');
  console.log('🔑 Пароль: password');

  await mongoose.disconnect();
  process.exit(0);
};

main();

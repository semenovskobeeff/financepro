require('dotenv').config();
const DatabaseSeeder = require('../src/core/infrastructure/database/seedDatabase');
const dbConnection = require('../src/core/infrastructure/database/connection');

async function forceReseed() {
  try {
    console.log('🚀 Запуск принудительного пересоздания тестовых данных...');

    // Подключение к БД
    await dbConnection.connect();
    console.log('✅ Подключение к базе данных установлено');

    // Создание экземпляра сидера
    const seeder = new DatabaseSeeder();

    // Принудительное пересоздание всех данных
    await seeder.recreateAllTestData();

    console.log('🎉 Все тестовые данные успешно пересозданы!');
    console.log('📧 Тестовый пользователь: test@example.com');
    console.log('🔑 Пароль: password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при пересоздании тестовых данных:', error);
    process.exit(1);
  }
}

forceReseed();

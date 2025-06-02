const DatabaseSeeder = require('../src/core/infrastructure/database/seedDatabase');
const dbConnection = require('../src/core/infrastructure/database/connection');

async function runSeed() {
  try {
    console.log('🚀 Запуск инициализации базы данных...');

    // Подключение к БД
    await dbConnection.connect();
    console.log('✅ Подключение к базе данных установлено');

    // Создание экземпляра сидера
    const seeder = new DatabaseSeeder();

    // Запуск заполнения БД
    await seeder.seedDatabase();

    console.log('🎉 База данных успешно инициализирована!');
    console.log('📧 Тестовый пользователь: test@example.com');
    console.log('🔑 Пароль: password');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

runSeed();

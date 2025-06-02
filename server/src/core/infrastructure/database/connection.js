const mongoose = require('mongoose');

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
  }

  async connect() {
    try {
      const mongoUri =
        process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app-test';

      console.log('🔄 Подключение к базе данных...');
      console.log(
        `📍 URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`
      );

      // Настройки подключения (удалены устаревшие useNewUrlParser и useUnifiedTopology)
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 15000, // Увеличено время ожидания
        socketTimeoutMS: 45000,
        retryWrites: true,
        bufferCommands: false,

        // Для локальной разработки
        ...(process.env.NODE_ENV === 'development' && {
          autoIndex: true,
        }),
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      console.log('✅ Успешно подключено к базе данных');
      console.log(
        `📊 База данных: ${this.connection.connection.db.databaseName}`
      );

      // Настройка обработчиков событий
      this.setupEventHandlers();

      return this.connection;
    } catch (error) {
      console.error('❌ Ошибка подключения к базе данных:', error.message);

      // Детальная информация об ошибке
      if (
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED')
      ) {
        console.log('💡 Возможные решения:');
        console.log('   1. Установите и запустите локальную MongoDB');
        console.log('   2. Или настройте MongoDB Atlas в файле .env');
        console.log('   3. Проверьте правильность MONGODB_URI');
      }

      this.isConnected = false;

      // Не останавливаем процесс, позволяем серверу работать с ошибкой БД
      console.log('⚠️  Сервер будет работать без подключения к БД');
      return null;
    }
  }

  setupEventHandlers() {
    // Событие при успешном подключении
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose подключен к MongoDB');
    });

    // Событие при ошибке подключения
    mongoose.connection.on('error', error => {
      console.error('❌ Ошибка соединения с MongoDB:', error);
      this.isConnected = false;
    });

    // Событие при отключении
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose отключен от MongoDB');
      this.isConnected = false;
    });

    // Событие при восстановлении соединения
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose переподключен к MongoDB');
      this.isConnected = true;
    });

    // Graceful shutdown
    process.on('SIGINT', this.gracefulShutdown.bind(this));
    process.on('SIGTERM', this.gracefulShutdown.bind(this));
  }

  async gracefulShutdown() {
    console.log('🔄 Закрытие соединения с MongoDB...');
    try {
      await mongoose.connection.close();
      console.log('✅ Соединение с MongoDB закрыто');
      process.exit(0);
    } catch (error) {
      console.error('❌ Ошибка при закрытии соединения:', error);
      process.exit(1);
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('✅ Отключено от MongoDB');
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
    };
  }

  // Метод для создания индексов
  async createIndexes() {
    try {
      if (!this.isConnected) {
        console.log(
          '⚠️  База данных не подключена, пропускаем создание индексов'
        );
        return;
      }

      console.log('🔄 Создание индексов...');

      const models = [
        'User',
        'Account',
        'Category',
        'Transaction',
        'Goal',
        'Debt',
        'Subscription',
      ];

      for (const modelName of models) {
        try {
          // Проверяем, существует ли модель
          if (!mongoose.models[modelName]) {
            console.log(`⚠️  Модель ${modelName} не найдена, пропускаем`);
            continue;
          }

          const model = mongoose.model(modelName);

          // Специальная обработка для User модели
          if (modelName === 'User') {
            try {
              // Получаем существующие индексы
              const existingIndexes = await model.collection.indexes();
              const conflictingIndexes = existingIndexes.filter(
                index =>
                  index.name.includes('email_1') && index.name !== 'email_1'
              );

              // Удаляем конфликтующие индексы
              for (const index of conflictingIndexes) {
                try {
                  await model.collection.dropIndex(index.name);
                  console.log(
                    `🔧 Удален конфликтующий индекс ${index.name} для модели ${modelName}`
                  );
                } catch (dropError) {
                  console.log(
                    `ℹ️  Не удалось удалить индекс ${index.name}: ${dropError.message}`
                  );
                }
              }
            } catch (indexError) {
              console.log(
                `ℹ️  Ошибка при работе с индексами для ${modelName}: ${indexError.message}`
              );
            }
          }

          // Создаем индексы для модели
          await model.createIndexes();
          console.log(`✅ Индексы созданы для модели ${modelName}`);
        } catch (error) {
          // Обработка различных типов ошибок индексов
          if (error.code === 11000) {
            console.log(`ℹ️  Индексы уже существуют для модели ${modelName}`);
          } else if (
            error.code === 85 ||
            error.message.includes('An existing index has the same name')
          ) {
            console.log(
              `ℹ️  Конфликт имен индексов для модели ${modelName}, используем существующие`
            );
          } else if (error.message.includes('Index with name')) {
            console.log(`ℹ️  Индекс уже существует для модели ${modelName}`);
          } else {
            console.log(
              `⚠️  Ошибка создания индексов для ${modelName}: ${error.message}`
            );
          }
        }
      }

      console.log('✅ Процесс создания индексов завершен');
    } catch (error) {
      console.log('⚠️  Ошибка при создании индексов:', error.message);
      // Не останавливаем выполнение
    }
  }

  // Метод для проверки состояния БД
  async healthCheck() {
    try {
      const admin = mongoose.connection.db.admin();
      const result = await admin.ping();

      return {
        status: 'healthy',
        database: mongoose.connection.db.databaseName,
        ping: result.ok === 1,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Метод для получения статистики БД
  async getStats() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();

      return {
        database: db.databaseName,
        collections: stats.collections,
        dataSize: this.formatBytes(stats.dataSize),
        storageSize: this.formatBytes(stats.storageSize),
        indexSize: this.formatBytes(stats.indexSize),
        documents: stats.objects,
        avgObjSize: this.formatBytes(stats.avgObjSize),
      };
    } catch (error) {
      console.error('❌ Ошибка получения статистики БД:', error);
      return null;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Создаем singleton экземпляр
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;

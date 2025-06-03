const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Загружаем переменные окружения

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ================================
// ОТЛАДКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ
// ================================
// Принудительный деплой для тестирования переменных окружения
console.log('🔍 Отладка переменных окружения:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI установлен:', !!process.env.MONGODB_URI);
console.log(
  'MONGODB_URI (маскированный):',
  process.env.MONGODB_URI
    ? process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    : 'НЕ УСТАНОВЛЕН'
);
console.log('JWT_SECRET установлен:', !!process.env.JWT_SECRET);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('SEED_DATABASE:', process.env.SEED_DATABASE);
console.log('==================================');

// ================================
// ИМПОРТ ПОДКЛЮЧЕНИЯ К БД И МОДЕЛЕЙ
// ================================
const dbConnection = require('./core/infrastructure/database/connection');
const DatabaseSeeder = require('./core/infrastructure/database/seedDatabase');

// Импортируем все модели для их регистрации в Mongoose
require('./core/domain/entities/User');
require('./core/domain/entities/Account');
require('./core/domain/entities/Category');
require('./core/domain/entities/Transaction');
require('./core/domain/entities/Goal');
require('./core/domain/entities/Debt');
require('./core/domain/entities/Subscription');

// ================================
// ИМПОРТ МАРШРУТОВ
// ================================
const apiRoutes = require('./routes');

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 3001;

// ================================
// TRUST PROXY ДЛЯ RAILWAY
// ================================
// Railway использует прокси, поэтому нужно включить trust proxy
app.set('trust proxy', true);

// ================================
// MIDDLEWARE
// ================================
app.use(express.json());
// Формируем список разрешенных origins
const allowedOrigins = [
  'http://localhost:8000', // Локальная разработка (Docker)
  'http://localhost:5173', // Локальная разработка (Vite)
  'http://localhost:3000', // Альтернативный локальный порт
  'https://*.vercel.app', // Любой поддомен Vercel
  'https://vercel.app', // Основной домен Vercel
  /https:\/\/.*\.vercel\.app$/, // Regex для поддоменов Vercel
];

// Добавляем CLIENT_URL если он указан
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan('dev'));

// ================================
// МАРШРУТЫ
// ================================

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Finance App API Server',
    version: '1.0.0',
    docs: 'Документация API доступна по адресу /api',
    endpoints: [
      'GET /api - информация об API',
      'GET /api/health - проверка работоспособности',
      'POST /api/users/register - регистрация пользователя',
      'POST /api/users/login - авторизация',
      'GET /api/accounts - получить счета',
      'GET /api/transactions - получить транзакции',
      'GET /api/categories - получить категории',
      'GET /api/goals - получить цели',
      'GET /api/debts - получить долги',
      'GET /api/subscriptions - получить подписки',
      'GET /api/analytics - получить аналитику',
      'GET /api/archive - получить архив',
    ],
  });
});

// Добавляем endpoint для проверки здоровья БД ПЕРЕД общими роутами
app.get('/api/health/database', async (req, res) => {
  try {
    const health = await dbConnection.healthCheck();
    const stats = await dbConnection.getStats();

    res.json({
      status: 'success',
      data: {
        health,
        stats,
        connection: dbConnection.getConnectionStatus(),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Ошибка проверки состояния БД',
      error: error.message,
    });
  }
});

// Подключение всех API маршрутов
app.use('/api', apiRoutes);

// ================================
// ОБРАБОТКА ОШИБОК
// ================================

// Обработчик для неизвестных маршрутов
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Маршрут ${req.originalUrl} не найден`,
    availableEndpoints: '/api',
  });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ================================
// ПОДКЛЮЧЕНИЕ К БД И ЗАПУСК СЕРВЕРА
// ================================

// Функция инициализации приложения
const initializeApp = async () => {
  let dbConnected = false;

  try {
    console.log('🔄 Инициализация приложения...');

    // Пытаемся подключиться к MongoDB
    const connection = await dbConnection.connect();

    if (connection) {
      dbConnected = true;
      console.log('🗂️  Создание индексов базы данных...');

      // Создаем индексы для всех моделей
      await dbConnection.createIndexes();

      // Заполняем БД тестовыми данными если настроено
      if (process.env.SEED_DATABASE === 'true') {
        console.log('🌱 Заполнение базы данных тестовыми данными...');
        try {
          const seeder = new DatabaseSeeder();
          await seeder.seedDatabase();
          console.log('✅ Тестовые данные успешно загружены');
        } catch (seedError) {
          console.log(
            '⚠️  Ошибка при заполнении БД тестовыми данными:',
            seedError.message
          );
          console.log('📝 База данных может уже содержать данные');
        }
      }

      // Возвращаем информацию о подключении
      const dbStatus = dbConnection.getConnectionStatus();
      console.log('📊 Статус БД:', {
        connected: dbStatus.isConnected,
        database: dbStatus.name,
        host: dbStatus.host,
      });
    }

    return dbConnected;
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error.message);

    // Выводим подсказки для пользователя
    console.log('\n💡 Возможные решения:');
    console.log('   1. Создайте файл server/.env с настройками MONGODB_URI');
    console.log(
      '   2. Установите локальную MongoDB: https://www.mongodb.com/try/download/community'
    );
    console.log(
      '   3. Или настройте MongoDB Atlas: https://www.mongodb.com/atlas'
    );
    console.log('   4. Проверьте, что MongoDB запущена: mongod --version');
    console.log(
      '\n🔄 Сервер будет работать без базы данных (ограниченный функционал)\n'
    );

    return false;
  }
};

// Запуск сервера
if (process.env.NODE_ENV !== 'test') {
  initializeApp()
    .then(dbConnected => {
      // Слушаем на всех интерфейсах (0.0.0.0) для внешнего доступа
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Сервер запущен на порту ${PORT}`);
        console.log(`📚 API доступно по адресу: http://localhost:${PORT}/api`);
        console.log(`🌐 Внешний доступ: http://0.0.0.0:${PORT}/api`);
        console.log(`🏠 Главная страница: http://localhost:${PORT}/`);
        console.log(
          `🔍 Проверка БД: http://localhost:${PORT}/api/health/database`
        );

        if (dbConnected) {
          console.log('✅ Приложение готово к работе с MongoDB Atlas');
        } else {
          console.log('⚠️  Приложение работает без подключения к БД');
        }
      });
    })
    .catch(error => {
      console.error('💥 Критическая ошибка запуска:', error);
      process.exit(1);
    });
}

module.exports = app; // Для тестирования

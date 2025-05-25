const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Загружаем переменные окружения

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

// Импорт маршрутов
const userRoutes = require('./modules/users/routes/userRoutes');
const accountRoutes = require('./modules/operations/routes/accountRoutes');
const transactionRoutes = require('./modules/operations/routes/transactionRoutes');
const categoryRoutes = require('./modules/operations/routes/categoryRoutes');
const goalRoutes = require('./modules/goals/routes/goalRoutes');
const debtRoutes = require('./modules/debts/routes/debtRoutes');
const subscriptionRoutes = require('./modules/operations/routes/subscriptionRoutes');
const analyticsRoutes = require('./modules/operations/routes/analyticsRoutes');
const archiveRoutes = require('./modules/operations/routes/archiveRoutes');

// Инициализация приложения
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Маршруты API
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/archive', archiveRoutes);

// Корневой маршрут
app.get('/', (req, res) => {
  res.json({
    message: 'Finance App API Server',
    version: '1.0.0',
    endpoints: [
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

// API информация
app.get('/api', (req, res) => {
  res.json({
    message: 'Finance App API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      users: '/api/users',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      categories: '/api/categories',
      goals: '/api/goals',
      debts: '/api/debts',
      subscriptions: '/api/subscriptions',
      analytics: '/api/analytics',
      archive: '/api/archive',
      health: '/api/health',
    },
  });
});

// Простой маршрут для проверки работоспособности
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API сервер работает' });
});

// Обработчик ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Внутренняя ошибка сервера',
  });
});

// Подключение к MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app'
    );
    console.log('MongoDB подключена');
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error.message);
    console.log('Запуск в режиме без базы данных для демонстрации...');
    // Не завершаем процесс, продолжаем работу без БД
  }
};

// Запуск сервера
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`API доступно по адресу: http://localhost:${PORT}/api`);
      console.log(
        'ВНИМАНИЕ: Для полной функциональности требуется подключение к MongoDB'
      );
    });
  });
}

module.exports = app; // Для тестирования

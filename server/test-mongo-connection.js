const mongoose = require('mongoose');
const https = require('https');

console.log('🔍 Тестирование подключения к MongoDB...');
console.log('');

// Получаем IP адрес
const getIP = () => {
  return new Promise(resolve => {
    https
      .get('https://api.ipify.org?format=json', res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const ip = JSON.parse(data).ip;
            resolve(ip);
          } catch (e) {
            resolve('Не удалось определить');
          }
        });
      })
      .on('error', () => {
        resolve('Ошибка получения IP');
      });
  });
};

// Тестовое подключение
const testConnection = async () => {
  try {
    // Показываем IP
    const ip = await getIP();
    console.log('📍 Ваш текущий IP:', ip);
    console.log(
      '⚠️  Убедитесь, что этот IP добавлен в MongoDB Atlas Network Access'
    );
    console.log('');

    // Проверяем строку подключения
    const uri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app-test';
    console.log(
      '📋 Тип подключения:',
      uri.startsWith('mongodb+srv')
        ? 'MongoDB Atlas (облако)'
        : 'Локальная MongoDB'
    );
    console.log(
      '📋 Строка подключения:',
      uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')
    );
    console.log('');

    console.log('🔄 Попытка подключения...');

    // Подключаемся с таймаутом
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10 секунд
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
    });

    console.log('✅ Подключение успешно!');
    console.log('📊 База данных:', mongoose.connection.db.databaseName);
    console.log('🏠 Хост:', mongoose.connection.host);
    console.log('🔌 Порт:', mongoose.connection.port);

    // Тестируем базовую операцию
    console.log('');
    console.log('🧪 Тестирование базовых операций...');

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log('📦 Коллекций в БД:', collections.length);

    await mongoose.disconnect();
    console.log('');
    console.log('🎉 Все тесты прошли успешно!');
    console.log('💡 MongoDB настроена правильно');

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Ошибка подключения:', error.message);
    console.error('');

    // Диагностика ошибок
    if (
      error.message.includes('not authorized') ||
      error.message.includes('authentication failed')
    ) {
      console.log('🔍 Диагноз: ОШИБКА АУТЕНТИФИКАЦИИ');
      console.log('💡 Решения:');
      console.log('   - Проверьте правильность логина и пароля в MONGODB_URI');
      console.log('   - Убедитесь, что пользователь создан в MongoDB Atlas');
      console.log('   - Проверьте права доступа пользователя к базе данных');
    } else if (
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    ) {
      console.log('🔍 Диагноз: СЕТЕВАЯ ПРОБЛЕМА');
      console.log('💡 Решения:');
      console.log('   - Добавьте ваш IP в MongoDB Atlas Network Access');
      console.log('   - Проверьте интернет-соединение');
      console.log('   - Убедитесь, что кластер MongoDB Atlas запущен');
    } else if (
      error.message.includes('timeout') ||
      error.message.includes('timed out')
    ) {
      console.log('🔍 Диагноз: ТАЙМАУТ ПОДКЛЮЧЕНИЯ');
      console.log('💡 Решения:');
      console.log('   - IP не добавлен в whitelist MongoDB Atlas');
      console.log('   - Корпоративный файрволл блокирует порт 27017');
      console.log('   - Нестабильное интернет-соединение');
    } else {
      console.log('🔍 Диагноз: НЕИЗВЕСТНАЯ ОШИБКА');
      console.log('💡 Попробуйте:');
      console.log('   - Проверить формат MONGODB_URI');
      console.log('   - Использовать локальную MongoDB для тестирования');
    }

    console.log('');
    console.log('🛠️  Быстрые действия:');
    console.log(
      '1. Откройте mongodb-diagnostics.html для подробной диагностики'
    );
    console.log(
      '2. Добавьте IP',
      await getIP(),
      'в MongoDB Atlas Network Access'
    );
    console.log('3. Или временно разрешите доступ со всех IP: 0.0.0.0/0');

    process.exit(1);
  }
};

testConnection();

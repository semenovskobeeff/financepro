const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/users';

async function testPasswordReset() {
  console.log('🧪 Тестирование системы восстановления пароля\n');

  // Тест 1: Запрос восстановления пароля
  console.log('1. Тестирование запроса восстановления пароля...');
  try {
    const response = await axios.post(`${BASE_URL}/forgot-password`, {
      email: 'test@example.com',
    });
    console.log('✅ Запрос прошел успешно:', response.data.message);
  } catch (error) {
    if (error.response) {
      console.log('❌ Ошибка:', error.response.data);
    } else {
      console.log('❌ Ошибка сети:', error.message);
    }
  }

  console.log('\n2. Тестирование валидации email...');
  try {
    await axios.post(`${BASE_URL}/forgot-password`, {
      email: 'invalid-email',
    });
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Валидация email работает:', error.response.data.message);
    } else {
      console.log(
        '❌ Неожиданная ошибка:',
        error.response?.data || error.message
      );
    }
  }

  console.log('\n3. Тестирование валидации токена сброса...');
  try {
    await axios.post(`${BASE_URL}/reset-password`, {
      token: 'invalid-token',
      password: 'NewPassword123!',
    });
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Валидация токена работает:', error.response.data.message);
    } else {
      console.log(
        '❌ Неожиданная ошибка:',
        error.response?.data || error.message
      );
    }
  }

  console.log('\n4. Тестирование валидации пароля...');
  try {
    await axios.post(`${BASE_URL}/reset-password`, {
      token: '1234567890abcdef1234567890abcdef12345678',
      password: 'weak',
    });
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Валидация пароля работает:', error.response.data.message);
    } else {
      console.log(
        '❌ Неожиданная ошибка:',
        error.response?.data || error.message
      );
    }
  }

  console.log('\n5. Тестирование rate limiting...');
  console.log('Отправляем 4 запроса подряд...');

  for (let i = 1; i <= 4; i++) {
    try {
      const response = await axios.post(`${BASE_URL}/forgot-password`, {
        email: 'rate-limit-test@example.com',
      });
      console.log(`   Запрос ${i}: ✅ ${response.data.message}`);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log(
          `   Запрос ${i}: ✅ Rate limiting сработал: ${error.response.data.message}`
        );
      } else {
        console.log(
          `   Запрос ${i}: ❌ Неожиданная ошибка:`,
          error.response?.data || error.message
        );
      }
    }

    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n🎉 Тестирование завершено!');
  console.log('\n📝 Рекомендации:');
  console.log('1. Проверьте логи сервера на предмет ошибок');
  console.log('2. Если все тесты прошли успешно, система настроена правильно');
  console.log(
    '3. Для полного тестирования создайте реального пользователя и протестируйте с реальным email'
  );
}

// Запуск тестов
testPasswordReset().catch(console.error);

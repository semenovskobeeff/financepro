import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { mockUsers } from './mockData';
import { emptyMockUsers } from './emptyMockData';
import { config } from '../../../config/environment';

// Настраиваем и экспортируем mock service worker
export const worker = setupWorker(...handlers);

// Флаги для отслеживания состояния инициализации
let isWorkerStarted = false;
let startupPromise: Promise<void> | null = null;

// Функция для автоматической авторизации тестового пользователя
export const autoLoginTestUser = () => {
  console.log('[MSW] Автоматическая авторизация тестового пользователя');

  // Читаем текущие настройки из localStorage
  let currentMockDataType: 'filled' | 'empty' = 'filled';
  if (typeof window !== 'undefined') {
    const storedType = localStorage.getItem('mockDataType');
    if (storedType === 'empty' || storedType === 'filled') {
      currentMockDataType = storedType;
    }
  }

  // Выбираем тестового пользователя в зависимости от типа данных
  const users = currentMockDataType === 'empty' ? emptyMockUsers : mockUsers;
  const testUser = users[0]; // Получаем тестового пользователя
  const token = `fake-jwt-token-${testUser.id}`;

  // Сохраняем данные авторизации в localStorage
  localStorage.setItem('token', token);
  localStorage.setItem(
    'user',
    JSON.stringify({ ...testUser, password: undefined })
  );

  console.log('[MSW] Тестовый пользователь авторизован:', testUser.email);
  console.log('[MSW] Тип данных:', currentMockDataType);
};

// Функция для безопасного запуска MSW в браузере
export const startMSW = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  // Если уже запущен, возвращаем
  if (isWorkerStarted) {
    console.log('[MSW] Worker уже запущен');
    return;
  }

  // Если уже идет процесс запуска, ждем его завершения
  if (startupPromise) {
    return startupPromise;
  }

  startupPromise = new Promise<void>(async (resolve, reject) => {
    try {
      await worker.start({
        onUnhandledRequest: 'bypass', // Изменено с 'warn' на 'bypass'
        quiet: true, // Убираем лишние логи
        serviceWorker: {
          url: '/mockServiceWorker.js',
        },
      });

      isWorkerStarted = true;
      console.log('[MSW] ✅ Mocking enabled successfully');
      console.log('[MSW] Handlers loaded:', handlers.length);

      resolve();
    } catch (error) {
      console.error('[MSW] ❌ Failed to start worker:', error);
      isWorkerStarted = false;
      reject(error);
    } finally {
      startupPromise = null;
    }
  });

  return startupPromise;
};

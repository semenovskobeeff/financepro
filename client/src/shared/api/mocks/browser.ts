import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// Настраиваем и экспортируем mock service worker
export const worker = setupWorker(...handlers);

// Функция для безопасного запуска MSW в браузере
export const startMSW = async () => {
  try {
    if (typeof window === 'undefined') {
      return;
    }

    await worker.start({
      onUnhandledRequest: 'warn',
      quiet: false,
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    console.log('[MSW] Mocking enabled in development mode');
    console.log('[MSW] Handlers loaded:', handlers.length);

    console.log('[MSW] Registered endpoints:');
    handlers.forEach((handler, index) => {
      console.log(
        `  ${index + 1}. ${handler.info.method} ${handler.info.path}`
      );
    });
  } catch (error) {
    console.error('[MSW] Failed to start worker:', error);
  }
};

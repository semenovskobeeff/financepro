import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/global.css';
import './styles/notion-theme.css';
import './styles/notion-pastel.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { ThemeProvider } from './shared/config/ThemeContext';
import ErrorBoundary from './shared/ui/ErrorBoundary';
import { config } from './config/environment';
import {
  setupGlobalErrorHandlers,
  safeLocalStorage,
} from './shared/utils/errorUtils';

// Флаг для отслеживания инициализации
let isAppInitialized = false;

// Настройка глобальных обработчиков ошибок
setupGlobalErrorHandlers();

// Безопасная очистка старых данных при старте
const cleanupOnStart = () => {
  try {
    // Очищаем потенциально большие или устаревшие данные
    const keysToCleanup = [
      'persist:root', // Старые данные Redux persist
      'redux-localstorage-simple', // Устаревшие данные
      'debug', // Отладочные данные
    ];

    keysToCleanup.forEach(key => {
      if (localStorage.getItem(key)) {
        safeLocalStorage.removeItem(key);
        console.log(`🧹 Очищен ключ localStorage: ${key}`);
      }
    });

    // Очищаем sessionStorage от временных данных
    sessionStorage.clear();
  } catch (error) {
    console.warn('Ошибка при очистке localStorage при старте:', error);
  }
};

// Выполняем очистку
cleanupOnStart();

// Глобальная обработка ошибок
window.addEventListener('error', event => {
  console.error('Глобальная ошибка:', event.error);
});

window.addEventListener('unhandledrejection', event => {
  console.error('Необработанное отклонение промиса:', event.reason);
});

async function initApp() {
  // Защита от повторной инициализации
  if (isAppInitialized) {
    console.log('[INDEX] Приложение уже инициализировано, пропускаем');
    return;
  }

  console.log('[INDEX] 🚀 Инициализация приложения...');
  console.log(
    '[INDEX] Режим:',
    config.useMocks ? 'тестовые данные' : 'реальный API'
  );
  console.log('[INDEX] URL:', window.location.href);

  try {
    // Инициализируем MSW только если нужно
    if (config.useMocks) {
      console.log('[INDEX] 🎭 Запуск MSW...');
      const { startMSW, autoLoginTestUser } = await import(
        './shared/api/mocks/browser'
      );
      await startMSW();

      // Даем MSW время на полную инициализацию
      await new Promise(resolve => setTimeout(resolve, 500));

      // После инициализации MSW запускаем автологин
      autoLoginTestUser();

      console.log('[INDEX] ✅ MSW успешно инициализирован');
    } else {
      console.log('[INDEX] 🌐 Используем реальный API:', config.apiUrl);
    }

    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );

    root.render(
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    );

    isAppInitialized = true;
    console.log('[INDEX] ✅ Приложение успешно инициализировано');
  } catch (error) {
    console.error('[INDEX] ❌ Критическая ошибка инициализации:', error);

    // Показываем пользователю ошибку
    const root = ReactDOM.createRoot(
      document.getElementById('root') as HTMLElement
    );

    root.render(
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#d32f2f',
        }}
      >
        <h2>Ошибка инициализации приложения</h2>
        <p>Произошла критическая ошибка при запуске приложения.</p>
        <p>Попробуйте обновить страницу или обратитесь к администратору.</p>
        <details style={{ marginTop: '20px', textAlign: 'left' }}>
          <summary>Техническая информация</summary>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '10px',
              marginTop: '10px',
            }}
          >
            {error instanceof Error ? error.stack : String(error)}
          </pre>
        </details>
      </div>
    );
  }
}

// Инициализируем приложение только один раз
if (!isAppInitialized) {
  initApp().catch(error => {
    console.error('❌ Фатальная ошибка инициализации приложения:', error);
  });
}

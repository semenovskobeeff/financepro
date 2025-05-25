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

// Глобальная обработка ошибок
window.addEventListener('error', event => {
  console.error('Глобальная ошибка:', event.error);
});

window.addEventListener('unhandledrejection', event => {
  console.error('Необработанное отклонение промиса:', event.reason);
});

async function initApp() {
  // Включаем заглушки в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    const { startMSW } = await import('./shared/api/mocks/browser');
    await startMSW();

    console.log('[INDEX] MSW запущен, тестируем API...');

    // Тестовый запрос для проверки MSW
    setTimeout(async () => {
      try {
        const response = await fetch('/api/analytics/dashboard');
        const data = await response.json();
        console.log(
          '[INDEX] Тест API дашборда:',
          response.ok ? 'успешно' : 'ошибка',
          data
        );
      } catch (error) {
        console.error('[INDEX] Ошибка тестового запроса:', error);
      }
    }, 1000);
  }

  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

initApp().catch(error => {
  console.error('Ошибка инициализации приложения:', error);
});

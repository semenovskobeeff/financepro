import { useState, useEffect } from 'react';
import {
  preloaderMessages,
  PreloaderMessageKey,
} from '../utils/preloaderMessages';

interface UseAppLoadingProps {
  minLoadingTime?: number; // Минимальное время показа прелоадера в мс
}

export const useAppLoading = ({
  minLoadingTime = 1000,
}: UseAppLoadingProps = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string>(
    preloaderMessages.initializing
  );
  const [loadingStartTime] = useState(Date.now());

  useEffect(() => {
    // Эмулируем инициализацию приложения
    const initializeApp = async () => {
      try {
        setLoadingMessage(preloaderMessages.authenticating);

        // Ждем завершения всех критических операций
        await Promise.all([
          // Даем время для загрузки основных компонентов
          new Promise(resolve => setTimeout(resolve, 300)),
          // Проверяем готовность DOM
          new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0);
            } else {
              window.addEventListener('load', () => resolve(void 0));
            }
          }),
          // Ждем инициализации Redux store
          new Promise(resolve => {
            // Проверяем что store доступен
            if (
              typeof window !== 'undefined' &&
              (window as any).__REDUX_DEVTOOLS_EXTENSION__
            ) {
              setTimeout(resolve, 100);
            } else {
              resolve(void 0);
            }
          }),
          // Ждем загрузки шрифтов
          document.fonts ? document.fonts.ready : Promise.resolve(),
        ]);

        setLoadingMessage(preloaderMessages.setupComplete);

        // Гарантируем минимальное время показа прелоадера
        const elapsedTime = Date.now() - loadingStartTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        // В случае ошибки все равно показываем приложение
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [loadingStartTime, minLoadingTime]);

  return { isLoading, loadingMessage };
};

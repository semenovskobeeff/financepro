export const preloaderMessages = {
  initializing: 'Инициализируем приложение...',
  loadingData: 'Загружаем данные...',
  authenticating: 'Проверяем авторизацию...',
  setupComplete: 'Почти готово...',
} as const;

export type PreloaderMessageKey = keyof typeof preloaderMessages;

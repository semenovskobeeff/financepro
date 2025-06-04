import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from 'features/auth/api/authApi';
import { accountApi } from 'entities/account/api/accountApi';
import { categoryApi } from 'entities/category/api/categoryApi';
import { transactionApi } from 'entities/transaction/api/transactionApi';
import { goalApi } from 'entities/goal/api/goalApi';
import { debtApi } from 'entities/debt/api/debtApi';
import { subscriptionApi } from 'entities/subscription/api/subscriptionApi';
import { analyticsApi } from 'entities/analytics/api/analyticsApi';
import { archiveApi } from 'entities/archive/api/archiveApi';
import { shoppingListApi } from 'entities/shopping-list/api/shoppingListApi';
import authReducer from 'features/auth/model/authSlice';

// В будущем здесь будут импортироваться и использоваться редьюсеры

// Создание хранилища с RTK Query
export const store = configureStore({
  reducer: {
    // API редьюсеры
    [authApi.reducerPath]: authApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [transactionApi.reducerPath]: transactionApi.reducer,
    [goalApi.reducerPath]: goalApi.reducer,
    [debtApi.reducerPath]: debtApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [archiveApi.reducerPath]: archiveApi.reducer,
    [shoppingListApi.reducerPath]: shoppingListApi.reducer,

    // Глобальные редьюсеры
    auth: authReducer,
  },
  // Добавление middleware для работы RTK Query
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      accountApi.middleware,
      categoryApi.middleware,
      transactionApi.middleware,
      goalApi.middleware,
      debtApi.middleware,
      subscriptionApi.middleware,
      analyticsApi.middleware,
      archiveApi.middleware,
      shoppingListApi.middleware
    ),
});

// Настройка слушателей для RTK Query
setupListeners(store.dispatch);

// Типы для использования в приложении
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

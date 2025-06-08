import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  ShoppingList,
  CreateShoppingListRequest,
  UpdateShoppingListRequest,
  CreateShoppingListItemRequest,
  UpdateShoppingListItemRequest,
  ShoppingListStatistics,
} from '../model/types';

export const shoppingListApi = createApi({
  reducerPath: 'shoppingListApi',
  baseQuery,
  tagTypes: ['ShoppingList'],
  endpoints: builder => ({
    // Получение всех списков покупок
    getShoppingLists: builder.query<ShoppingList[], void>({
      query: () => '/shopping-lists',
      transformResponse: (
        response: { status: string; data: ShoppingList[] } | ShoppingList[]
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data || [];
        }
        return (response as ShoppingList[]) || [];
      },
      providesTags: result =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({
                type: 'ShoppingList' as const,
                id,
              })),
              { type: 'ShoppingList', id: 'LIST' },
            ]
          : [{ type: 'ShoppingList', id: 'LIST' }],
    }),

    // Получение конкретного списка
    getShoppingListById: builder.query<ShoppingList, string>({
      query: id => `/shopping-lists/${id}`,
      transformResponse: (
        response: { status: string; data: ShoppingList } | ShoppingList
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingList;
      },
      providesTags: (_, __, id) => [{ type: 'ShoppingList', id }],
    }),

    // Создание нового списка
    createShoppingList: builder.mutation<
      ShoppingList,
      CreateShoppingListRequest
    >({
      query: data => ({
        url: '/shopping-lists',
        method: 'POST',
        body: data,
      }),
      transformResponse: (
        response: { status: string; data: ShoppingList } | ShoppingList
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingList;
      },
      invalidatesTags: [{ type: 'ShoppingList', id: 'LIST' }],
    }),

    // Обновление списка
    updateShoppingList: builder.mutation<
      ShoppingList,
      { id: string; data: UpdateShoppingListRequest }
    >({
      query: ({ id, data }) => ({
        url: `/shopping-lists/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (
        response: { status: string; data: ShoppingList } | ShoppingList
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingList;
      },
      invalidatesTags: (_, __, { id }) => [
        { type: 'ShoppingList', id },
        { type: 'ShoppingList', id: 'LIST' },
      ],
    }),

    // Удаление списка
    deleteShoppingList: builder.mutation<void, string>({
      query: id => ({
        url: `/shopping-lists/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'ShoppingList', id },
        { type: 'ShoppingList', id: 'LIST' },
      ],
    }),

    // Добавление товара в список
    addItemToList: builder.mutation<
      ShoppingList,
      { listId: string; data: CreateShoppingListItemRequest }
    >({
      query: ({ listId, data }) => ({
        url: `/shopping-lists/${listId}/items`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (
        response: { status: string; data: ShoppingList } | ShoppingList
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingList;
      },
      invalidatesTags: (_, __, { listId }) => [
        { type: 'ShoppingList', id: listId },
        { type: 'ShoppingList', id: 'LIST' },
      ],
    }),

    // Обновление товара в списке
    updateListItem: builder.mutation<
      ShoppingList,
      {
        listId: string;
        itemId: string;
        data: UpdateShoppingListItemRequest;
      }
    >({
      query: ({ listId, itemId, data }) => ({
        url: `/shopping-lists/${listId}/items/${itemId}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (
        response: { status: string; data: ShoppingList } | ShoppingList
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingList;
      },
      invalidatesTags: (_, __, { listId }) => [
        { type: 'ShoppingList', id: listId },
        { type: 'ShoppingList', id: 'LIST' },
      ],
    }),

    // Удаление товара из списка
    removeItemFromList: builder.mutation<
      ShoppingList,
      { listId: string; itemId: string }
    >({
      query: ({ listId, itemId }) => ({
        url: `/shopping-lists/${listId}/items/${itemId}`,
        method: 'DELETE',
      }),
      transformResponse: (
        response: { status: string; data: ShoppingList } | ShoppingList
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingList;
      },
      invalidatesTags: (_, __, { listId }) => [
        { type: 'ShoppingList', id: listId },
        { type: 'ShoppingList', id: 'LIST' },
      ],
    }),

    // Получение статистики
    getShoppingListStatistics: builder.query<ShoppingListStatistics, void>({
      query: () => '/shopping-lists/statistics',
      transformResponse: (
        response:
          | { status: string; data: ShoppingListStatistics }
          | ShoppingListStatistics
      ) => {
        if (response && typeof response === 'object' && 'data' in response) {
          return response.data;
        }
        return response as ShoppingListStatistics;
      },
      providesTags: [{ type: 'ShoppingList', id: 'STATS' }],
    }),
  }),
});

export const {
  useGetShoppingListsQuery,
  useGetShoppingListByIdQuery,
  useCreateShoppingListMutation,
  useUpdateShoppingListMutation,
  useDeleteShoppingListMutation,
  useAddItemToListMutation,
  useUpdateListItemMutation,
  useRemoveItemFromListMutation,
  useGetShoppingListStatisticsQuery,
} = shoppingListApi;

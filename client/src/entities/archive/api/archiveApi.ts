import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';

// Типы архивных объектов
export type ArchiveItemType =
  | 'accounts'
  | 'transactions'
  | 'categories'
  | 'goals'
  | 'debts'
  | 'subscriptions';

// Интерфейс для архивного элемента
export interface ArchiveItem {
  id: string;
  userId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  itemType?: string;
  [key: string]: any; // Для дополнительных полей
}

// Интерфейс для ответа архива с пагинацией
export interface ArchiveResponse {
  items: ArchiveItem[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

// Интерфейс для статистики архива
export interface ArchiveStats {
  total: number;
  byType: {
    accounts: number;
    transactions: number;
    categories: number;
    goals: number;
    debts: number;
    subscriptions: number;
  };
  oldestDate: string | null;
}

interface ApiResponse<T> {
  data: T;
}

export const archiveApi = createApi({
  reducerPath: 'archiveApi',
  baseQuery,
  tagTypes: ['Archive'],
  endpoints: builder => ({
    // Получение архивных объектов определенного типа
    getArchivedItems: builder.query<
      ArchiveResponse,
      {
        type: ArchiveItemType;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
      }
    >({
      query: ({ type, page = 1, limit = 10, startDate, endDate, search }) => ({
        url: `/archive/${type}`,
        params: { page, limit, startDate, endDate, search },
      }),
      transformResponse: (response: ApiResponse<ArchiveResponse>) => {
        return (
          response.data || {
            items: [],
            pagination: { total: 0, page: 1, totalPages: 0, limit: 10 },
          }
        );
      },
      providesTags: ['Archive'],
    }),

    // Получение статистики архива
    getArchiveStats: builder.query<ArchiveStats, void>({
      query: () => '/archive/stats',
      transformResponse: (response: ApiResponse<ArchiveStats>) => {
        return (
          response.data || {
            total: 0,
            byType: {
              accounts: 0,
              transactions: 0,
              categories: 0,
              goals: 0,
              debts: 0,
              subscriptions: 0,
            },
            oldestDate: null,
          }
        );
      },
      providesTags: ['Archive'],
    }),

    // Восстановление объекта из архива
    restoreFromArchive: builder.mutation<
      { message: string; item: ArchiveItem },
      { type: string; id: string }
    >({
      query: ({ type, id }) => ({
        url: `/archive/${type}/${id}/restore`,
        method: 'PATCH',
      }),
      transformResponse: (
        response: ApiResponse<{ message: string; item: ArchiveItem }>
      ) => response.data,
      invalidatesTags: ['Archive'],
    }),

    // Полное удаление объекта из архива
    deleteFromArchive: builder.mutation<
      { message: string },
      { type: string; id: string }
    >({
      query: ({ type, id }) => ({
        url: `/archive/${type}/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
      invalidatesTags: ['Archive'],
    }),
  }),
});

export const {
  useGetArchivedItemsQuery,
  useGetArchiveStatsQuery,
  useRestoreFromArchiveMutation,
  useDeleteFromArchiveMutation,
} = archiveApi;

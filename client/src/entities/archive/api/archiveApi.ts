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

// Базовый интерфейс для архивного объекта
export interface ArchiveItem {
  id: string;
  userId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  itemType?: string;
  [key: string]: any;
}

// Интерфейс для ответа с пагинацией
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
      providesTags: ['Archive'],
    }),

    // Получение статистики архива
    getArchiveStats: builder.query<ArchiveStats, void>({
      query: () => '/archive/stats',
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

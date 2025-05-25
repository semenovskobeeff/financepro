import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Category,
  CategoryType,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../model/types';
import { RootState } from 'app/store';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery,
  tagTypes: ['Category'],
  endpoints: builder => ({
    getCategories: builder.query<
      Category[],
      { type?: CategoryType; status?: 'active' | 'archived' }
    >({
      query: params => ({
        url: '/categories',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Category' as const,
                id,
              })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),

    getCategoryById: builder.query<Category, string>({
      query: id => ({ url: `/categories/${id}` }),
      providesTags: (_, __, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: data => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<
      Category,
      { id: string; data: UpdateCategoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Category', id }],
    }),

    archiveCategory: builder.mutation<void, string>({
      query: id => ({
        url: `/categories/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),

    restoreCategory: builder.mutation<void, string>({
      query: id => ({
        url: `/categories/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useArchiveCategoryMutation,
  useRestoreCategoryMutation,
} = categoryApi;

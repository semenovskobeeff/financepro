import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../model/types';

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery,
  tagTypes: ['Category'],
  endpoints: builder => ({
    getCategories: builder.query<
      Category[],
      { type?: string; status?: string } | void
    >({
      query: params => {
        let url = '/categories';
        if (params) {
          const searchParams = new URLSearchParams();
          if (params.type) searchParams.append('type', params.type);
          if (params.status) searchParams.append('status', params.status);
          if (searchParams.toString()) {
            url += `?${searchParams.toString()}`;
          }
        }
        return { url };
      },
      transformResponse: (response: any) => {
        // Гарантируем возврат массива
        if (Array.isArray(response)) {
          return response;
        }
        if (response && Array.isArray(response.data)) {
          return response.data;
        }
        console.warn('[categoryApi] Unexpected response format:', response);
        return [];
      },
      providesTags: result =>
        result && Array.isArray(result)
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
      transformResponse: (response: Category) => response,
      providesTags: (_, __, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: data => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Category) => response,
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
      transformResponse: (response: Category) => response,
      invalidatesTags: (_, __, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
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

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../model/types';

interface ApiResponse<T> {
  data: T;
}

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
      transformResponse: (response: ApiResponse<Category[]>) =>
        response.data || [],
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
      transformResponse: (response: ApiResponse<Category>) => response.data,
      providesTags: (_, __, id) => [{ type: 'Category', id }],
    }),

    createCategory: builder.mutation<Category, CreateCategoryRequest>({
      query: data => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: ApiResponse<Category>) => response.data,
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
      transformResponse: (response: ApiResponse<Category>) => response.data,
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

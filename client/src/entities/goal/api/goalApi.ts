import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  Goal,
  CreateGoalRequest,
  UpdateGoalRequest,
  TransferToGoalRequest,
} from '../model/types';

export const goalApi = createApi({
  reducerPath: 'goalApi',
  baseQuery,
  tagTypes: ['Goal'],
  endpoints: builder => ({
    getGoals: builder.query<Goal[], { status?: string } | void>({
      query: params => {
        let url = '/goals';
        if (params && params.status) {
          url += `?status=${params.status}`;
        }
        return { url };
      },
      transformResponse: (response: Goal[]) => response || [],
      providesTags: result =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({
                type: 'Goal' as const,
                id,
              })),
              { type: 'Goal', id: 'LIST' },
            ]
          : [{ type: 'Goal', id: 'LIST' }],
    }),

    getGoalById: builder.query<Goal, string>({
      query: id => ({ url: `/goals/${id}` }),
      transformResponse: (response: Goal) => response,
      providesTags: (_, __, id) => [{ type: 'Goal', id }],
    }),

    createGoal: builder.mutation<Goal, CreateGoalRequest>({
      query: data => ({
        url: '/goals',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Goal) => response,
      invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
    }),

    updateGoal: builder.mutation<Goal, { id: string; data: UpdateGoalRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/goals/${id}`,
          method: 'PUT',
          body: data,
        }),
        transformResponse: (response: Goal) => response,
        invalidatesTags: (_, __, { id }) => [
          { type: 'Goal', id },
          { type: 'Goal', id: 'LIST' },
        ],
      }
    ),

    archiveGoal: builder.mutation<void, string>({
      query: id => ({
        url: `/goals/${id}/archive`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Goal', id },
        { type: 'Goal', id: 'LIST' },
      ],
    }),

    restoreGoal: builder.mutation<void, string>({
      query: id => ({
        url: `/goals/${id}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'Goal', id },
        { type: 'Goal', id: 'LIST' },
      ],
    }),

    transferToGoal: builder.mutation<
      Goal,
      { id: string; data: TransferToGoalRequest }
    >({
      query: ({ id, data }) => ({
        url: `/goals/${id}/transfer`,
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: Goal) => response,
      invalidatesTags: (_, __, { id }) => [
        { type: 'Goal', id },
        { type: 'Goal', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useGetGoalByIdQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useArchiveGoalMutation,
  useRestoreGoalMutation,
  useTransferToGoalMutation,
} = goalApi;

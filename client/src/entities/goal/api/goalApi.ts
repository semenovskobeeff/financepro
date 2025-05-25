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
  tagTypes: ['Goal', 'Account'],
  endpoints: builder => ({
    getGoals: builder.query<Goal[], { status?: string }>({
      query: params => ({
        url: '/goals',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Goal' as const, id })),
              { type: 'Goal', id: 'LIST' },
            ]
          : [{ type: 'Goal', id: 'LIST' }],
    }),

    getGoalById: builder.query<Goal, string>({
      query: id => ({ url: `/goals/${id}` }),
      providesTags: (_, __, id) => [{ type: 'Goal', id }],
    }),

    createGoal: builder.mutation<Goal, CreateGoalRequest>({
      query: data => ({
        url: '/goals',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Goal', id: 'LIST' }],
    }),

    updateGoal: builder.mutation<Goal, { id: string; data: UpdateGoalRequest }>(
      {
        query: ({ id, data }) => ({
          url: `/goals/${id}`,
          method: 'PUT',
          body: data,
        }),
        invalidatesTags: (_, __, { id }) => [{ type: 'Goal', id }],
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
      void,
      { id: string; data: TransferToGoalRequest }
    >({
      query: ({ id, data }) => ({
        url: `/goals/${id}/transfer`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Goal', id },
        { type: 'Goal', id: 'LIST' },
        { type: 'Account', id: 'LIST' },
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

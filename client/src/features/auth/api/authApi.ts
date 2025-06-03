import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'shared/api/baseQuery';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../model/types';

interface ApiResponse<T> {
  data: T;
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['Auth'],
  endpoints: builder => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: credentials => ({
        url: '/users/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (
        response: AuthResponse | ApiResponse<AuthResponse>
      ) => {
        // Сервер может возвращать как обернутый, так и прямой ответ
        return 'data' in response ? response.data : response;
      },
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (
        response: AuthResponse | ApiResponse<AuthResponse>
      ) => {
        // Сервер может возвращать как обернутый, так и прямой ответ
        return 'data' in response ? response.data : response;
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
    }),

    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      transformResponse: (response: User | ApiResponse<User>) => {
        return 'data' in response ? response.data : response;
      },
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: data => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: User | ApiResponse<User>) => {
        return 'data' in response ? response.data : response;
      },
      invalidatesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: ({ email }) => ({
        url: '/users/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (
        response: { message: string } | ApiResponse<{ message: string }>
      ) => {
        return 'data' in response ? response.data : response;
      },
    }),

    resetPassword: builder.mutation<
      { message: string },
      { token: string; password: string }
    >({
      query: ({ token, password }) => ({
        url: '/users/reset-password',
        method: 'POST',
        body: { token, password },
      }),
      transformResponse: (
        response: { message: string } | ApiResponse<{ message: string }>
      ) => {
        return 'data' in response ? response.data : response;
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

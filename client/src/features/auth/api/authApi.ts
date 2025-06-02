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
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: userData => ({
        url: '/users/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: ApiResponse<AuthResponse>) => response.data,
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/users/logout',
        method: 'POST',
      }),
    }),

    getProfile: builder.query<User, void>({
      query: () => '/users/profile',
      transformResponse: (response: ApiResponse<User>) => response.data,
      providesTags: ['Auth'],
    }),

    updateProfile: builder.mutation<User, Partial<User>>({
      query: data => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<User>) => response.data,
      invalidatesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: ({ email }) => ({
        url: '/users/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
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
      transformResponse: (response: ApiResponse<{ message: string }>) =>
        response.data,
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

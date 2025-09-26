import { api } from './baseApi';

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  roles?: string[];
  phoneNumber?: string;
  department?: string;
  position?: string;
  managerId?: string;
  startDate?: string;
  salary?: number;
  active?: boolean;
}

export interface UpdateUserRequest {
  id: string;
  displayName?: string;
  roles?: string[];
  phoneNumber?: string;
  department?: string;
  position?: string;
  managerId?: string;
  startDate?: string;
  salary?: number;
  active?: boolean;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  phoneNumber?: string;
  department?: string;
  position?: string;
  managerId?: string;
  startDate?: any;
  salary?: number;
  active: boolean;
  language: string;
  onboardingCompleted: boolean;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  updatedBy: string;
  portalAccess?: {
    admin: boolean;
    employee: boolean;
    client: string[];
    candidate: boolean;
  };
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UserFilters {
  search?: string;
  departmentId?: string;
  active?: boolean;
  roleId?: string;
  page?: number;
  limit?: number;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get users with pagination and filters
    getUsers: builder.query<UsersResponse, UserFilters>({
      query: (filters = {}) => ({
        url: '/users',
        params: {
          search: filters.search,
          department: filters.departmentId,
          active: filters.active,
          role: filters.roleId,
          page: filters.page || 1,
          limit: filters.limit || 10,
        },
      }),
      transformResponse: (response: any) => {
        if (response.success) {
          return response;
        }
        throw new Error(response.error?.message || 'Failed to fetch users');
      },
      providesTags: ['User'],
    }),

    // Get single user by ID
    getUser: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch user');
      },
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Create new user
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to create user');
      },
      invalidatesTags: ['User'],
    }),

    // Update user
    updateUser: builder.mutation<User, UpdateUserRequest>({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to update user');
      },
      invalidatesTags: (_result, _error, { id }) => [
        'User',
        { type: 'User', id },
      ],
    }),

    // Delete user (soft delete)
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      transformResponse: (response: any) => {
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to delete user');
        }
      },
      invalidatesTags: (_result, _error, id) => [
        'User',
        { type: 'User', id },
      ],
    }),

    // Get available roles for user assignment
    getRoles: builder.query<Array<{ id: string; name: string; description?: string }>, void>({
      query: () => '/users/meta/roles',
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch roles');
      },
    }),

    // Get departments for user assignment
    getDepartments: builder.query<Array<{ id: string; name: string }>, void>({
      query: () => '/users/meta/departments',
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch departments');
      },
    }),

    // Get managers for user assignment (users with manager role)
    getManagers: builder.query<Array<{ id: string; displayName: string; email: string; department?: string }>, void>({
      query: () => '/users/meta/managers',
      transformResponse: (response: any) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.error?.message || 'Failed to fetch managers');
      },
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetRolesQuery,
  useGetDepartmentsQuery,
  useGetManagersQuery,
} = userApi;

// Export types for external use
export type { CreateUserRequest, UpdateUserRequest, User, UsersResponse, UserFilters };
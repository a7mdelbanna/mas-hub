// Mock User Management API for development
import { api } from './baseApi';

// Export User type for compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  phoneNumber?: string;
  title?: string;
  position?: string;
  department?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: any[];
  managerId?: string;
}

export type UserRole = {
  id: string;
  name: string;
  permissions: any[];
};

// Mock data
const mockUsers = [
  {
    id: '1',
    email: 'ahmed@mas.com',
    name: 'Ahmed Elbanna',
    phoneNumber: '+1234567890',
    title: 'CEO',
    active: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    roles: [{ id: '1', name: 'Admin', permissions: [] }],
    department: { id: '1', name: 'Executive' },
  },
  {
    id: '2',
    email: 'sarah@mas.com',
    name: 'Sarah Johnson',
    phoneNumber: '+1234567891',
    title: 'CTO',
    active: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
    roles: [{ id: '1', name: 'Admin', permissions: [] }],
    department: { id: '1', name: 'Technology' },
  },
  {
    id: '3',
    email: 'mike@mas.com',
    name: 'Mike Chen',
    phoneNumber: '+1234567892',
    title: 'Manager',
    active: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
    roles: [{ id: '2', name: 'Manager', permissions: [] }],
    department: { id: '2', name: 'Operations' },
  },
];

const mockRoles = [
  { id: '1', name: 'Admin', description: 'Full system access' },
  { id: '2', name: 'Manager', description: 'Manage team and projects' },
  { id: '3', name: 'Employee', description: 'Standard user access' },
];

const mockDepartments = [
  { id: '1', name: 'Executive', code: 'EXEC' },
  { id: '2', name: 'Technology', code: 'TECH' },
  { id: '3', name: 'Operations', code: 'OPS' },
  { id: '4', name: 'Sales', code: 'SALES' },
  { id: '5', name: 'Marketing', code: 'MKTG' },
];

const mockManagers = mockUsers.filter(u =>
  u.roles.some(r => r.name === 'Admin' || r.name === 'Manager')
).map(u => ({
  id: u.id,
  name: u.name,
  title: u.title
}));

// Types
export interface CreateUserRequest {
  email: string;
  name: string;
  phoneNumber?: string;
  departmentId?: string;
  managerId?: string;
  title?: string;
  startDate?: Date;
  timezone?: string;
  language: 'en' | 'ar' | 'ru';
  active: boolean;
  portalAccess: {
    employee: boolean;
    client?: string[];
  };
  roleIds: string[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

export interface UserWithRoles extends User {
  roles: UserRole[];
  department?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    name: string;
  };
}

export interface UsersResponse {
  users: UserWithRoles[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  search?: string;
  departmentId?: string;
  active?: boolean;
  roleId?: string;
  page?: number;
  limit?: number;
}

// Create mock API with override fetch
export const userApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // Get users with pagination and filters
    getUsers: builder.query<UsersResponse, UserFilters>({
      queryFn: async (filters) => {
        try {
          // Return mock data instead of making API call
          const filteredUsers = mockUsers.filter(user => {
            if (filters.search && !user.name.toLowerCase().includes(filters.search.toLowerCase()) &&
                !user.email.toLowerCase().includes(filters.search.toLowerCase())) {
              return false;
            }
            if (filters.active !== undefined && user.active !== filters.active) {
              return false;
            }
            return true;
          });

          const page = filters.page || 1;
          const limit = filters.limit || 10;
          const start = (page - 1) * limit;
          const paginatedUsers = filteredUsers.slice(start, start + limit);

          return {
            data: {
              users: paginatedUsers as UserWithRoles[],
              total: filteredUsers.length,
              page,
              limit,
            }
          };
        } catch (error) {
          return { error: { status: 500, data: 'Error fetching users' } };
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),

    // Get single user by ID
    getUser: builder.query<UserWithRoles, string>({
      queryFn: async (id) => {
        try {
          const user = mockUsers.find(u => u.id === id);
          if (!user) {
            return { error: { status: 404, data: 'User not found' } };
          }
          return { data: user as UserWithRoles };
        } catch (error) {
          return { error: { status: 500, data: 'Error fetching user' } };
        }
      },
      providesTags: (_result, _error, id) => [{ type: 'User', id }],
    }),

    // Create new user
    createUser: builder.mutation<UserWithRoles, CreateUserRequest>({
      queryFn: async (userData) => {
        try {
          const newUser = {
            id: String(mockUsers.length + 1),
            email: userData.email,
            name: userData.name,
            phoneNumber: userData.phoneNumber || '',
            title: userData.title || '',
            active: userData.active,
            createdAt: new Date(),
            updatedAt: new Date(),
            roles: userData.roleIds.map(id =>
              mockRoles.find(r => r.id === id)!
            ).filter(Boolean).map(r => ({ ...r, permissions: [] })),
            department: userData.departmentId
              ? mockDepartments.find(d => d.id === userData.departmentId)
              : undefined,
          };
          mockUsers.push(newUser as any);
          return { data: newUser as UserWithRoles };
        } catch (error) {
          return { error: { status: 500, data: 'Error creating user' } };
        }
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // Update existing user
    updateUser: builder.mutation<UserWithRoles, UpdateUserRequest>({
      queryFn: async ({ id, ...updates }) => {
        try {
          const userIndex = mockUsers.findIndex(u => u.id === id);
          if (userIndex === -1) {
            return { error: { status: 404, data: 'User not found' } };
          }

          const updatedUser = {
            ...mockUsers[userIndex],
            ...updates,
            updatedAt: new Date(),
            roles: updates.roleIds
              ? updates.roleIds.map(rid =>
                  mockRoles.find(r => r.id === rid)!
                ).filter(Boolean).map(r => ({ ...r, permissions: [] }))
              : mockUsers[userIndex].roles,
            department: updates.departmentId
              ? mockDepartments.find(d => d.id === updates.departmentId)
              : mockUsers[userIndex].department,
          };

          mockUsers[userIndex] = updatedUser;
          return { data: updatedUser as UserWithRoles };
        } catch (error) {
          return { error: { status: 500, data: 'Error updating user' } };
        }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Delete user (soft delete)
    deleteUser: builder.mutation<void, string>({
      queryFn: async (id) => {
        try {
          const userIndex = mockUsers.findIndex(u => u.id === id);
          if (userIndex === -1) {
            return { error: { status: 404, data: 'User not found' } };
          }
          mockUsers.splice(userIndex, 1);
          return { data: undefined };
        } catch (error) {
          return { error: { status: 500, data: 'Error deleting user' } };
        }
      },
      invalidatesTags: (_result, _error, id) => [
        'User',
        { type: 'User', id },
      ],
    }),

    // Get available roles
    getRoles: builder.query<Array<{ id: string; name: string; description?: string }>, void>({
      queryFn: async () => {
        try {
          return { data: mockRoles };
        } catch (error) {
          return { error: { status: 500, data: 'Error fetching roles' } };
        }
      },
    }),

    // Get departments
    getDepartments: builder.query<Array<{ id: string; name: string; code: string }>, void>({
      queryFn: async () => {
        try {
          return { data: mockDepartments };
        } catch (error) {
          return { error: { status: 500, data: 'Error fetching departments' } };
        }
      },
    }),

    // Get managers (users with manager role)
    getManagers: builder.query<Array<{ id: string; name: string; title?: string }>, void>({
      queryFn: async () => {
        try {
          return { data: mockManagers };
        } catch (error) {
          return { error: { status: 500, data: 'Error fetching managers' } };
        }
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

// Export types
export type { CreateUserRequest, UpdateUserRequest, UserWithRoles, UsersResponse, UserFilters };
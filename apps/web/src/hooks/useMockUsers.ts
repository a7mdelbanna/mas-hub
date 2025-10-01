import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/mock/user.service';
import type { User } from '../services/mock/auth.service';
import type { Department, Role } from '../services/mock/user.service';

export interface UserFilters {
  search?: string;
  departmentId?: string;
  managerId?: string;
  active?: boolean;
  role?: string;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  limit?: number;
  organizationId?: string;
}

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
}

export function useUsers(initialFilters: UserFilters = {}): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await userService.getUsers();

      // Apply filters
      let filteredUsers = [...allUsers];

      if (filters.active !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.active === filters.active);
      }

      if (filters.departmentId) {
        filteredUsers = filteredUsers.filter(u => u.departmentId === filters.departmentId);
      }

      if (filters.managerId) {
        filteredUsers = filteredUsers.filter(u => u.managerId === filters.managerId);
      }

      if (filters.role) {
        filteredUsers = filteredUsers.filter(u => u.roles.includes(filters.role));
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.title?.toLowerCase().includes(searchLower) ||
          user.position?.toLowerCase().includes(searchLower)
        );
      }

      // Apply ordering
      if (filters.orderBy) {
        filteredUsers.sort((a, b) => {
          const aVal = a[filters.orderBy!.field as keyof User];
          const bVal = b[filters.orderBy!.field as keyof User];

          if (filters.orderBy!.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }

      // Apply limit
      if (filters.limit) {
        filteredUsers = filteredUsers.slice(0, filters.limit);
      }

      setUsers(filteredUsers);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    filters,
    setFilters,
  };
}

// Hook for single user
export function useUser(userId: string | null) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUserById(userId);
        setUser(userData || null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
}

// Hook for departments
export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const data = await userService.getDepartments();
        setDepartments(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  return { departments, loading, error };
}

// Hook for roles
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const data = await userService.getRoles();
        setRoles(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  return { roles, loading, error };
}

// Hook for managers
export function useManagers() {
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const data = await userService.getManagers();
        setManagers(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
  }, []);

  return { managers, loading, error };
}
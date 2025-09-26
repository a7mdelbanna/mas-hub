import { useState, useEffect, useCallback } from 'react';
import { where, orderBy, limit, QueryConstraint } from 'firebase/firestore';
import { useFirestoreCollection } from './useFirestoreCollection';
import { userService } from '../lib/firebase/services/user.service';
import type { UserFilters } from '../lib/firebase/services/user.service';
import type { User } from '../lib/firebase/services/auth.service';
import { useOrganization } from './useOrganization';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
}

export function useUsers(initialFilters: UserFilters = {}): UseUsersResult {
  const { organization } = useOrganization();
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [constraints, setConstraints] = useState<QueryConstraint[]>([]);

  // Build Firestore constraints from filters
  useEffect(() => {
    const newConstraints: QueryConstraint[] = [];

    // CRITICAL: Always filter by organization for multi-tenant isolation
    // Set organization filter in the filters object for memory filtering in service
    if (organization?.id && !filters.organizationId) {
      setFilters(prev => ({ ...prev, organizationId: organization.id }));
      return; // Will re-run with updated filters
    }

    if (filters.departmentId) {
      newConstraints.push(where('departmentId', '==', filters.departmentId));
    }

    if (filters.managerId) {
      newConstraints.push(where('managerId', '==', filters.managerId));
    }

    if (filters.active !== undefined) {
      newConstraints.push(where('active', '==', filters.active));
    }

    if (filters.role) {
      newConstraints.push(where('roles', 'array-contains', filters.role));
    }

    // Add ordering
    if (filters.orderBy) {
      newConstraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction));
    } else {
      newConstraints.push(orderBy('createdAt', 'desc'));
    }

    // Add limit
    if (filters.limit) {
      newConstraints.push(limit(filters.limit));
    }

    setConstraints(newConstraints);
  }, [filters, organization?.id]);

  const { data, loading, error, refetch } = useFirestoreCollection<User>({
    collectionName: 'users',
    constraints,
    dependencies: [filters],
  });

  // Apply client-side search filter
  const filteredUsers = useCallback(() => {
    if (!filters.search) {
      return data;
    }

    const searchLower = filters.search.toLowerCase();
    return data.filter(user =>
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.title?.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower)
    );
  }, [data, filters.search]);

  return {
    users: filteredUsers(),
    loading,
    error: error as Error | null,
    refetch,
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
        setUser(userData);
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
  const [departments, setDepartments] = useState<any[]>([]);
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
  const [roles, setRoles] = useState<any[]>([]);
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
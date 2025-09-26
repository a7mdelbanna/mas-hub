import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { BaseService } from './base.service';
import { authService, type User } from './auth.service';

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  displayName?: string;
  phoneNumber?: string;
  departmentId?: string;
  managerId?: string;
  title?: string;
  position?: string;
  startDate?: Date;
  timezone?: string;
  language?: 'en' | 'ar' | 'ru';
  active?: boolean;
  portalAccess?: {
    employee?: boolean;
    client?: string[];
    candidate?: boolean;
  };
  roles?: string[];
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

export interface UserFilters {
  search?: string;
  organizationId?: string; // CRITICAL: Add organization filter
  departmentId?: string;
  managerId?: string;
  active?: boolean;
  role?: string;
  limit?: number;
  orderBy?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  parentId?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  async getUsers(filters: UserFilters = {}): Promise<User[]> {
    try {
      const constraints: QueryConstraint[] = [];

      // CRITICAL: Add organization filter for multi-tenancy
      if (filters.organizationId) {
        // Filter by organization membership using the organizations map field
        // Note: Firestore doesn't support querying nested map fields directly,
        // so we'll filter after fetching for now. In production, consider using
        // a subcollection or array field for better query performance.
        console.log('[MULTI-TENANT] Filtering users by organization:', filters.organizationId);
      } else {
        // WARNING: No organization filter - security risk
        console.warn('[SECURITY WARNING] getUsers called without organizationId filter - potential data leak');
      }

      // Add search filter
      if (filters.search) {
        // Note: Firestore doesn't support full-text search natively
        // For better search, consider using Algolia or ElasticSearch
        // For now, we'll filter in memory after fetching
      }

      // Add department filter
      if (filters.departmentId) {
        constraints.push(where('departmentId', '==', filters.departmentId));
      }

      // Add manager filter
      if (filters.managerId) {
        constraints.push(where('managerId', '==', filters.managerId));
      }

      // Add active filter
      if (filters.active !== undefined) {
        constraints.push(where('active', '==', filters.active));
      }

      // Add role filter
      if (filters.role) {
        constraints.push(where('roles', 'array-contains', filters.role));
      }

      // Add ordering
      if (filters.orderBy) {
        constraints.push(orderBy(filters.orderBy.field, filters.orderBy.direction));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      // Add limit
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      const q = query(this.getCollection(), ...constraints);
      const querySnapshot = await getDocs(q);
      let users = querySnapshot.docs.map(doc => this.convertTimestamps({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply organization filter in memory (until we migrate to array field)
      if (filters.organizationId) {
        users = users.filter(user => {
          // Check if user has organizations map with this orgId
          if (user.organizations && user.organizations[filters.organizationId]) {
            return user.organizations[filters.organizationId].active === true;
          }
          // Also check organizationIds array if it exists
          if (user.organizationIds) {
            return user.organizationIds.includes(filters.organizationId);
          }
          return false;
        });
      }

      // Apply search filter in memory
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        users = users.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.title?.toLowerCase().includes(searchLower) ||
          user.department?.toLowerCase().includes(searchLower)
        );
      }

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return this.getById(id);
  }

  /**
   * CRITICAL: Get users by organization for multi-tenant isolation
   */
  async getUsersByOrganization(organizationId: string, filters: Omit<UserFilters, 'organizationId'> = {}): Promise<User[]> {
    if (!organizationId) {
      throw new Error('[SECURITY] Organization ID is required for getUsersByOrganization');
    }

    return this.getUsers({
      ...filters,
      organizationId, // Enforce organization filter
    });
  }

  /**
   * Get current user's organization users
   */
  async getCurrentOrganizationUsers(): Promise<User[]> {
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.currentOrganizationId) {
      throw new Error('No organization context available');
    }

    return this.getUsersByOrganization(currentUser.currentOrganizationId);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      // Check if current user has permission
      const hasPermission = await authService.checkPermission('users.create');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to create users');
      }

      let userId: string;

      // If password is provided, create Firebase Auth user
      if (userData.password) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        userId = userCredential.user.uid;

        // Update display name in Firebase Auth
        if (userData.name) {
          await updateProfile(userCredential.user, {
            displayName: userData.name,
          });
        }
      } else {
        // Generate a unique ID for users without auth
        userId = doc(collection(db, 'users')).id;
      }

      // Create user profile in Firestore
      const userProfile: Omit<User, 'createdAt' | 'updatedAt'> = {
        id: userId,
        email: userData.email,
        name: userData.name,
        displayName: userData.displayName || userData.name,
        phoneNumber: userData.phoneNumber || '',
        title: userData.title || '',
        position: userData.position || '',
        department: '',
        departmentId: userData.departmentId || '',
        managerId: userData.managerId || '',
        active: userData.active !== undefined ? userData.active : true,
        roles: userData.roles || ['employee'],
        permissions: [],
        portalAccess: userData.portalAccess || { employee: true },
      };

      // Get department name if departmentId is provided
      if (userData.departmentId) {
        const dept = await this.getDepartmentById(userData.departmentId);
        if (dept) {
          userProfile.department = dept.name;
        }
      }

      await setDoc(doc(db, 'users', userId), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const createdUser = await this.getUserById(userId);
      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      return createdUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }

  async updateUser(userId: string, updates: Partial<UpdateUserRequest>): Promise<User> {
    try {
      // Check if current user has permission
      const hasPermission = await authService.checkPermission('users.update');
      const isOwnProfile = authService.getCurrentUser()?.id === userId;

      if (!hasPermission && !isOwnProfile) {
        throw new Error('Insufficient permissions to update users');
      }

      // If updating own profile, restrict certain fields
      if (isOwnProfile && !hasPermission) {
        // Users can't change their own roles, permissions, or active status
        delete updates.roles;
        delete updates.active;
      }

      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp(),
      };

      // Get department name if departmentId is updated
      if (updates.departmentId) {
        const dept = await this.getDepartmentById(updates.departmentId);
        if (dept) {
          updateData.department = dept.name;
        }
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      await updateDoc(doc(db, 'users', userId), updateData);

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Check if current user has permission
      const hasPermission = await authService.checkPermission('users.delete');
      if (!hasPermission) {
        throw new Error('Insufficient permissions to delete users');
      }

      // Soft delete - just mark as inactive
      await this.updateUser(userId, { active: false });

      // Optionally, you can hard delete
      // await deleteDoc(doc(db, 'users', userId));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async getDepartments(): Promise<Department[]> {
    try {
      const q = query(collection(db, 'departments'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Department));
    } catch (error) {
      console.error('Error getting departments:', error);
      // Return default departments if collection doesn't exist
      return [
        { id: '1', name: 'Executive', code: 'EXEC' },
        { id: '2', name: 'Technology', code: 'TECH' },
        { id: '3', name: 'Operations', code: 'OPS' },
        { id: '4', name: 'Sales', code: 'SALES' },
        { id: '5', name: 'Marketing', code: 'MKTG' },
        { id: '6', name: 'Human Resources', code: 'HR' },
        { id: '7', name: 'Finance', code: 'FIN' },
      ];
    }
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const docSnap = await getDoc(doc(db, 'departments', id));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        } as Department;
      }

      // Return from default list if not in database
      const defaultDepts = await this.getDepartments();
      return defaultDepts.find(d => d.id === id) || null;
    } catch (error) {
      console.error('Error getting department:', error);
      return null;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      const q = query(collection(db, 'roles'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      } as Role));
    } catch (error) {
      console.error('Error getting roles:', error);
      // Return default roles if collection doesn't exist
      return [
        {
          id: '1',
          name: 'super_admin',
          description: 'Super Administrator with full access',
          permissions: ['*']
        },
        {
          id: '2',
          name: 'admin',
          description: 'Administrator with system management access',
          permissions: ['users.*', 'projects.*', 'invoices.*', 'settings.*']
        },
        {
          id: '3',
          name: 'manager',
          description: 'Manager with team and project management access',
          permissions: ['users.read', 'projects.*', 'tasks.*', 'invoices.read']
        },
        {
          id: '4',
          name: 'employee',
          description: 'Employee with standard access',
          permissions: ['projects.read', 'tasks.*', 'invoices.read']
        },
        {
          id: '5',
          name: 'client',
          description: 'Client with limited portal access',
          permissions: ['projects.read', 'invoices.read']
        },
        {
          id: '6',
          name: 'candidate',
          description: 'Candidate with application access',
          permissions: ['applications.*']
        },
      ];
    }
  }

  async getManagers(): Promise<User[]> {
    try {
      // Get users with manager or admin roles
      const constraints = [
        where('active', '==', true),
        orderBy('name'),
      ];

      const q = query(this.getCollection(), ...constraints);
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => this.convertTimestamps({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter for managers and admins
      return users.filter(user =>
        user.roles?.includes('manager') ||
        user.roles?.includes('admin') ||
        user.roles?.includes('super_admin')
      );
    } catch (error) {
      console.error('Error getting managers:', error);
      return [];
    }
  }

  // Real-time subscription to users
  subscribeToUsers(
    filters: UserFilters,
    callback: (users: User[]) => void
  ): () => void {
    const constraints: QueryConstraint[] = [];

    if (filters.departmentId) {
      constraints.push(where('departmentId', '==', filters.departmentId));
    }
    if (filters.active !== undefined) {
      constraints.push(where('active', '==', filters.active));
    }
    if (filters.role) {
      constraints.push(where('roles', 'array-contains', filters.role));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(this.getCollection(), ...constraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let users = snapshot.docs.map(doc => this.convertTimestamps({
        id: doc.id,
        ...doc.data(),
      }));

      // Apply search filter in memory
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        users = users.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower)
        );
      }

      callback(users);
    }, (error) => {
      console.error('Error in users subscription:', error);
    });

    return unsubscribe;
  }
}

export const userService = new UserService();
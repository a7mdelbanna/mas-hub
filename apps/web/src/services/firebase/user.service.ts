/**
 * User Service
 * User management operations using Firestore
 */

import { BaseService, BaseDocument, QueryOptions } from './base.service';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { authService, UserProfile } from './auth.service';

export interface User extends BaseDocument {
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoUrl?: string;
  roles: string[];
  permissions: string[];
  portalAccess: {
    admin: boolean;
    employee: boolean;
    client: string[];
    candidate: boolean;
  };
  active: boolean;
  language: string;
  companyName?: string;
  department?: string;
  position?: string;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  settings?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    timezone?: string;
    dateFormat?: string;
  };
}

export interface UserFilter {
  role?: string;
  active?: boolean;
  department?: string;
  searchTerm?: string;
}

class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<User[]> {
    return this.getMany({
      where: [{ field: 'roles', operator: 'array-contains', value: role }],
      orderBy: [{ field: 'displayName', direction: 'asc' }],
    });
  }

  /**
   * Get active users
   */
  async getActiveUsers(): Promise<User[]> {
    return this.getMany({
      where: [{ field: 'active', operator: '==', value: true }],
      orderBy: [{ field: 'displayName', direction: 'asc' }],
    });
  }

  /**
   * Search users with filters
   */
  async searchUsers(filter: UserFilter): Promise<User[]> {
    const constraints = [];

    if (filter.role) {
      constraints.push({ field: 'roles', operator: 'array-contains', value: filter.role });
    }

    if (filter.active !== undefined) {
      constraints.push({ field: 'active', operator: '==', value: filter.active });
    }

    if (filter.department) {
      constraints.push({ field: 'department', operator: '==', value: filter.department });
    }

    const users = await this.getMany({
      where: constraints.length > 0 ? constraints : undefined,
      orderBy: [{ field: 'displayName', direction: 'asc' }],
    });

    // Client-side filtering for search term (Firestore doesn't support full-text search)
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      return users.filter(user =>
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower) ||
        user.position?.toLowerCase().includes(searchLower)
      );
    }

    return users;
  }

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roles: string[]): Promise<void> {
    // Generate portal access based on highest role
    let portalAccess = {
      admin: false,
      employee: false,
      client: [] as string[],
      candidate: false,
    };

    if (roles.includes('admin')) {
      portalAccess.admin = true;
      portalAccess.employee = true;
    } else if (roles.includes('manager')) {
      portalAccess.employee = true;
    } else if (roles.includes('employee')) {
      portalAccess.employee = true;
    } else if (roles.includes('client')) {
      portalAccess.client = [userId];
    } else if (roles.includes('candidate')) {
      portalAccess.candidate = true;
    }

    await this.update(userId, {
      roles,
      portalAccess,
    } as Partial<User>);
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(userId: string, permissions: string[]): Promise<void> {
    await this.update(userId, {
      permissions,
    } as Partial<User>);
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(userId: string): Promise<void> {
    const user = await this.getById(userId);
    if (user) {
      await this.update(userId, {
        active: !user.active,
      } as Partial<User>);
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: User['settings']): Promise<void> {
    await this.update(userId, {
      settings,
    } as Partial<User>);
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      lastLoginAt: serverTimestamp(),
    });
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(department: string): Promise<User[]> {
    return this.getMany({
      where: [
        { field: 'department', operator: '==', value: department },
        { field: 'active', operator: '==', value: true },
      ],
      orderBy: [{ field: 'displayName', direction: 'asc' }],
    });
  }

  /**
   * Get managers (users with manager or admin role)
   */
  async getManagers(): Promise<User[]> {
    const admins = await this.getUsersByRole('admin');
    const managers = await this.getUsersByRole('manager');

    // Combine and deduplicate
    const allManagers = [...admins, ...managers];
    const uniqueManagers = allManagers.filter((user, index, self) =>
      index === self.findIndex((u) => u.id === user.id)
    );

    return uniqueManagers.sort((a, b) => a.displayName.localeCompare(b.displayName));
  }

  /**
   * Get team members for a manager
   */
  async getTeamMembers(managerId: string): Promise<User[]> {
    // This would typically involve checking a team structure
    // For now, return users in the same department
    const manager = await this.getById(managerId);
    if (!manager || !manager.department) {
      return [];
    }

    return this.getUsersByDepartment(manager.department);
  }

  /**
   * Bulk update users
   */
  async bulkUpdateUsers(updates: Array<{ id: string; data: Partial<User> }>): Promise<void> {
    const operations = updates.map(update => ({
      type: 'update' as const,
      id: update.id,
      data: update.data,
    }));

    await this.batchOperation(operations);
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user) return false;

    // Admins have all permissions
    if (user.roles.includes('admin')) return true;

    // Check specific permissions
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has role
   */
  async userHasRole(userId: string, role: string): Promise<boolean> {
    const user = await this.getById(userId);
    if (!user) return false;

    return user.roles.includes(role);
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<{
    total: number;
    active: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
  }> {
    const allUsers = await this.getMany();

    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.active).length,
      byRole: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
    };

    // Count by role
    allUsers.forEach(user => {
      user.roles.forEach(role => {
        stats.byRole[role] = (stats.byRole[role] || 0) + 1;
      });

      // Count by department
      if (user.department) {
        stats.byDepartment[user.department] = (stats.byDepartment[user.department] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Export users to CSV format
   */
  async exportUsers(filter?: UserFilter): Promise<string> {
    const users = filter ? await this.searchUsers(filter) : await this.getMany();

    const headers = ['ID', 'Email', 'Name', 'Roles', 'Department', 'Position', 'Active', 'Verified'];
    const rows = users.map(user => [
      user.id,
      user.email,
      user.displayName,
      user.roles.join(', '),
      user.department || '',
      user.position || '',
      user.active ? 'Yes' : 'No',
      user.emailVerified ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
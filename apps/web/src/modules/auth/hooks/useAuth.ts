import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import type { User } from '../../../types';

export function useAuth() {
  const authState = useSelector((state: RootState) => state.auth);

  const hasRole = (role: string): boolean => {
    return authState.roles.includes(role);
  };

  const hasPermission = (permission: string): boolean => {
    return authState.permissions.includes(permission);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => authState.roles.includes(role));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => authState.permissions.includes(permission));
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => authState.permissions.includes(permission));
  };

  const canAccessPortal = (portalType: 'admin' | 'employee' | 'client' | 'candidate'): boolean => {
    switch (portalType) {
      case 'admin':
        return hasAnyRole(['admin', 'super_admin']);
      case 'employee':
        return hasAnyRole(['employee', 'manager', 'admin', 'super_admin']);
      case 'client':
        return authState.user?.portalAccess?.client && authState.user.portalAccess.client.length > 0;
      case 'candidate':
        return !!authState.user?.portalAccess?.candidate;
      default:
        return false;
    }
  };

  return {
    ...authState,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    canAccessPortal,
  };
}

// Default export for the hook
export default useAuth;

// Mock utility functions - no Firebase needed
export const useAuthUser = {
  async getUserProfile(userId: string): Promise<Partial<User>> {
    // Return mock user profile
    return {
      id: userId,
      email: 'admin@mashub.com',
      displayName: 'Admin User',
      roles: ['admin'],
      permissions: ['all'],
    };
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    // Mock update - just log it
    console.log('User profile update requested:', userId, updates);
  },
};
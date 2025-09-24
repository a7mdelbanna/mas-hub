import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import type { User } from '../../../types/models';

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
        return !!authState.user?.portalAccess;
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

// Utility functions for Firebase operations
export const useAuthUser = {
  async getUserProfile(userId: string): Promise<Partial<User>> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as Partial<User>;
      }
      throw new Error('User profile not found');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      // This would typically be done via a Cloud Function to maintain security
      // For now, we'll just log it
      console.log('User profile update requested:', userId, updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
};
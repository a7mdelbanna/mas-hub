import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ensureAdminUser } from '../ensureAdminUser';

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  phoneNumber?: string;
  title?: string;
  position?: string;
  department?: string;
  departmentId?: string;
  managerId?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  permissions?: string[];
  portalAccess?: {
    employee?: boolean;
    client?: string[];
    candidate?: boolean;
  };
  currentOrganizationId?: string;
  organizationIds?: string[];
  organizations?: {
    [orgId: string]: {
      roles: string[];
      joinedAt: any;
      active: boolean;
    };
  };
}

export class AuthService {
  private currentUser: User | null = null;

  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Ensure admin user has proper privileges
      await ensureAdminUser(
        userCredential.user.uid,
        userCredential.user.email!,
        userCredential.user.displayName
      );

      const user = await this.getUserProfile(userCredential.user.uid);
      if (!user) {
        throw new Error('User profile not found');
      }
      if (!user.active) {
        await signOut(auth);
        throw new Error('User account is deactivated');
      }
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(error.message || 'Failed to sign in');
    }
  }

  async signUp(email: string, password: string, userData: Partial<User>): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Update Firebase Auth profile
      if (userData.name) {
        await updateProfile(firebaseUser, {
          displayName: userData.name,
        });
      }

      // Create user profile in Firestore
      const userProfile: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || '',
        displayName: userData.displayName || userData.name || '',
        phoneNumber: userData.phoneNumber || '',
        title: userData.title || '',
        position: userData.position || '',
        department: userData.department || '',
        departmentId: userData.departmentId || '',
        managerId: userData.managerId || '',
        active: true,
        roles: userData.roles || ['employee'],
        permissions: userData.permissions || [],
        portalAccess: userData.portalAccess || { employee: true },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      this.currentUser = userProfile;
      return userProfile;
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async signOutUser(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<User> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    try {
      // Update Firebase Auth profile if name changed
      if (updates.name && updates.name !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: updates.name,
        });
      }

      // Update email if changed
      if (updates.email && updates.email !== currentUser.email) {
        await updateEmail(currentUser, updates.email);
      }

      // Update Firestore profile
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        ...updates,
        id: currentUser.uid,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      const updatedUser = await this.getUserProfile(currentUser.uid);
      if (updatedUser) {
        this.currentUser = updatedUser;
      }
      return updatedUser!;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Ensure user has a profile in Firestore
        await ensureAdminUser(
          firebaseUser.uid,
          firebaseUser.email!,
          firebaseUser.displayName
        );

        const userProfile = await this.getUserProfile(firebaseUser.uid);
        this.currentUser = userProfile;
        callback(userProfile);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }

  async checkPermission(permission: string): Promise<boolean> {
    if (!this.currentUser) return false;

    // Check if user has specific permission
    if (this.currentUser.permissions?.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const rolePermissions: Record<string, string[]> = {
      super_admin: ['*'], // All permissions
      admin: ['users.*', 'projects.*', 'invoices.*', 'settings.*'],
      manager: ['users.read', 'projects.*', 'tasks.*', 'invoices.read'],
      employee: ['projects.read', 'tasks.*', 'invoices.read'],
      client: ['projects.read', 'invoices.read'],
      candidate: ['applications.*'],
    };

    for (const role of this.currentUser.roles) {
      const perms = rolePermissions[role] || [];
      if (perms.includes('*') || perms.includes(permission)) {
        return true;
      }
      // Check wildcard permissions
      const permissionParts = permission.split('.');
      const wildcardPerm = `${permissionParts[0]}.*`;
      if (perms.includes(wildcardPerm)) {
        return true;
      }
    }

    return false;
  }

  hasRole(role: string): boolean {
    return this.currentUser?.roles.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'super_admin']);
  }

  isManager(): boolean {
    return this.hasAnyRole(['manager']) || this.isAdmin();
  }

  isEmployee(): boolean {
    return this.hasAnyRole(['employee']) || this.isManager();
  }
}

export const authService = new AuthService();
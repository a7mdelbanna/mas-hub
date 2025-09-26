/**
 * Firebase Auth Service
 * Direct authentication operations using Firebase Auth SDK
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase/config';
import { organizationService } from '../../lib/firebase/services/organization.service';

export interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  role: 'admin' | 'manager' | 'employee' | 'client' | 'candidate';
  phoneNumber?: string;
  companyName?: string;
  department?: string;
  position?: string;
}

export interface UserProfile {
  id: string;
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
  currentOrganizationId?: string;
  organizationIds?: string[];
  organizations?: {
    [orgId: string]: {
      roles: string[];
      joinedAt: any;
      active: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface AuthError {
  code: string;
  message: string;
}

class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
  }

  /**
   * Map Firebase auth errors to user-friendly messages
   */
  private handleAuthError(error: any): AuthError {
    const errorMap: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'This operation is not allowed',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/account-exists-with-different-credential': 'An account already exists with this email',
      'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups',
      'auth/popup-closed-by-user': 'Sign-in was cancelled',
      'auth/requires-recent-login': 'Please sign in again to complete this action',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
    };

    const code = error.code || 'unknown';
    const message = errorMap[code] || error.message || 'An error occurred during authentication';

    console.error('[AuthService] Error:', error);

    return { code, message };
  }

  /**
   * Create role-based portal access
   */
  private createPortalAccess(role: string, userId: string) {
    const portalAccess = {
      admin: false,
      employee: false,
      client: [] as string[],
      candidate: false,
    };

    switch (role) {
      case 'admin':
        portalAccess.admin = true;
        portalAccess.employee = true;
        break;
      case 'manager':
        portalAccess.employee = true;
        break;
      case 'employee':
        portalAccess.employee = true;
        break;
      case 'client':
        portalAccess.client = [userId];
        break;
      case 'candidate':
        portalAccess.candidate = true;
        break;
    }

    return portalAccess;
  }

  /**
   * Sign up with email and password
   */
  async signUp(data: SignUpData): Promise<UserProfile> {
    try {
      // Validate password strength
      if (data.password.length < 8) {
        throw { code: 'auth/weak-password', message: 'Password must be at least 8 characters' };
      }

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: data.displayName,
      });

      // Send email verification
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email`,
      });

      // Create user roles array
      const roles = [data.role];
      if (data.role === 'admin') {
        roles.push('manager', 'employee');
      } else if (data.role === 'manager') {
        roles.push('employee');
      }

      // Create organization for the new company
      // Use company name if provided, otherwise use user's name
      const orgName = data.companyName || `${data.displayName}'s Organization`;
      const organization = await organizationService.createOrganization({
        name: orgName,
        description: `Organization for ${orgName}`,
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          language: 'en',
          dateFormat: 'MM/DD/YYYY',
        },
      }, user.uid);

      // Create user profile in Firestore with organization association
      const userProfile: UserProfile = {
        id: user.uid,
        email: data.email,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber,
        photoUrl: null,
        roles,
        permissions: [],
        portalAccess: this.createPortalAccess(data.role, user.uid),
        active: true,
        language: 'en',
        companyName: data.companyName,
        department: data.department,
        position: data.position,
        onboardingCompleted: false,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        updatedBy: user.uid,
        currentOrganizationId: organization.id, // Set current organization
        organizationIds: [organization.id], // Array of organization IDs for multi-tenancy
      };

      // Save to Firestore with organization context
      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        organizations: {
          [organization.id]: {
            roles: [data.role],
            joinedAt: serverTimestamp(),
            active: true,
          }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userProfile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string, rememberMe: boolean = true): Promise<UserProfile> {
    try {
      // Set persistence based on rememberMe
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user profile from Firestore
      const userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        // Create basic profile if it doesn't exist
        const newProfile: UserProfile = {
          id: user.uid,
          email: user.email!,
          displayName: user.displayName || email.split('@')[0],
          photoUrl: user.photoURL,
          roles: ['employee'],
          permissions: [],
          portalAccess: this.createPortalAccess('employee', user.uid),
          active: true,
          language: 'en',
          onboardingCompleted: false,
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.uid,
          updatedBy: user.uid,
        };

        await setDoc(doc(db, 'users', user.uid), {
          ...newProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        return newProfile;
      }

      return userProfile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      const result = await signInWithPopup(auth, this.googleProvider);
      const user = result.user;

      // Check if user profile exists
      let userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        // Create organization for new Google users
        const orgName = user.displayName || user.email!.split('@')[0];
        const organization = await organizationService.createOrganization({
          name: `${orgName}'s Organization`,
          description: `Organization for ${orgName}`,
          settings: {
            timezone: 'UTC',
            currency: 'USD',
            language: 'en',
            dateFormat: 'MM/DD/YYYY',
          },
        }, user.uid);

        // Create profile for new Google users
        userProfile = {
          id: user.uid,
          email: user.email!,
          displayName: user.displayName || user.email!.split('@')[0],
          photoUrl: user.photoURL,
          roles: ['employee'],
          permissions: [],
          portalAccess: this.createPortalAccess('employee', user.uid),
          active: true,
          language: 'en',
          onboardingCompleted: false,
          emailVerified: true, // Google accounts are pre-verified
          currentOrganizationId: organization.id,
          organizationIds: [organization.id],
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: user.uid,
          updatedBy: user.uid,
        };

        await setDoc(doc(db, 'users', user.uid), {
          ...userProfile,
          organizations: {
            [organization.id]: {
              roles: ['employee'],
              joinedAt: serverTimestamp(),
              active: true,
            }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      return userProfile;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw { code: 'auth/no-user', message: 'No user is currently signed in' };
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);

      // Remove fields that shouldn't be updated
      const { id, email, createdAt, createdBy, ...safeUpdates } = updates as any;

      await updateDoc(userRef, {
        ...safeUpdates,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || userId,
      });

      // Update auth profile if display name or photo changed
      if (auth.currentUser && (updates.displayName || updates.photoUrl)) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName,
          photoURL: updates.photoUrl,
        });
      }
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: userDoc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Check if email is available
   */
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      // For security, we can't directly check if an email exists
      // Instead, we'll check Firestore users collection
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);

      return snapshot.empty;
    } catch (error: any) {
      // If we can't check, assume it's available
      console.error('Error checking email availability:', error);
      return true;
    }
  }

  /**
   * Verify email (mark as verified in Firestore)
   */
  async verifyEmail(userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        emailVerified: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(userId: string, profileData: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...profileData,
        onboardingCompleted: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw { code: 'auth/no-user', message: 'No user is currently signed in' };
      }

      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email`,
      });
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
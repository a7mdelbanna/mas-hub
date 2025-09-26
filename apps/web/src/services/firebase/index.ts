/**
 * Firebase Services Export
 * Central export point for all Firebase services
 */

export { BaseService } from './base.service';
export type { BaseDocument, QueryOptions, ServiceError, SubscriptionCallback } from './base.service';

export { authService } from './auth.service';
export type { SignUpData, UserProfile, AuthError } from './auth.service';

export { userService } from './user.service';
export type { User } from './user.service';

export { brandingService } from './branding.service';
export type { BrandColors, BrandingSettings } from './branding.service';

// Re-export commonly used Firebase functions
export {
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
} from 'firebase/auth';

export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

export {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// Export Firebase instances
export { auth, db, storage, functions } from '../../lib/firebase/config';
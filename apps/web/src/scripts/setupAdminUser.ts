import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

/**
 * Setup admin privileges for a user
 * This script should be run once to grant admin rights to the initial user
 */
export async function setupAdminUser(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.error('User not found:', userId);
      return false;
    }

    const currentData = userDoc.data();

    // Update user with admin role and full permissions
    await updateDoc(userRef, {
      roles: ['super_admin', 'admin', 'manager', 'employee'],
      permissions: ['*'],
      active: true,
      portalAccess: {
        employee: true,
        client: [],
        candidate: false
      }
    });

    console.log('Successfully granted admin privileges to user:', userId);
    return true;
  } catch (error) {
    console.error('Error setting up admin user:', error);
    return false;
  }
}

// Function to run from console
if (typeof window !== 'undefined') {
  (window as any).setupAdminUser = setupAdminUser;
}
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from './services/auth.service';

/**
 * Ensures that the given user has proper admin privileges in Firestore.
 * This is particularly useful for the initial admin setup.
 */
export async function ensureAdminUser(
  userId: string,
  email: string,
  displayName?: string | null
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    // Check if this is the initial admin (ahmed@mas.com)
    const isInitialAdmin = email.toLowerCase() === 'ahmed@mas.com';

    if (!userDoc.exists()) {
      // Create the user document with appropriate roles
      const userData: Partial<User> = {
        id: userId,
        email,
        name: displayName || email.split('@')[0],
        displayName: displayName || email.split('@')[0],
        phoneNumber: '',
        title: isInitialAdmin ? 'Chief Executive Officer' : 'Team Member',
        position: isInitialAdmin ? 'CEO' : 'Employee',
        department: isInitialAdmin ? 'Executive' : '',
        departmentId: '',
        managerId: '',
        active: true,
        roles: isInitialAdmin
          ? ['super_admin', 'admin', 'manager', 'employee']
          : ['employee'],
        permissions: isInitialAdmin ? ['*'] : [],
        portalAccess: {
          employee: true,
          client: [],
          candidate: false
        }
      };

      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`Created user profile for ${email} with ${isInitialAdmin ? 'admin' : 'employee'} role`);
    } else {
      // Update existing user if it's the initial admin and doesn't have admin role
      const existingData = userDoc.data();

      if (isInitialAdmin && (!existingData.roles || !existingData.roles.includes('admin'))) {
        await setDoc(userRef, {
          roles: ['super_admin', 'admin', 'manager', 'employee'],
          permissions: ['*'],
          active: true,
          portalAccess: {
            employee: true,
            client: [],
            candidate: false
          },
          updatedAt: serverTimestamp(),
        }, { merge: true });

        console.log(`Updated ${email} with admin privileges`);
      }
    }
  } catch (error) {
    console.error('Error ensuring admin user:', error);
  }
}
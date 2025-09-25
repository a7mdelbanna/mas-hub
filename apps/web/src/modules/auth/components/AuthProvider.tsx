import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase/config';
import { setUser, setLoading, setError } from '../../../store/slices/authSlice';
import { useAuthUser } from '../hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          dispatch(setLoading(true));

          if (firebaseUser) {
            // Get custom token claims for roles and permissions
            const tokenResult = await firebaseUser.getIdTokenResult();
            const customClaims = tokenResult.claims;

            // Try to fetch user profile from Firestore
            let userProfile: any = {};
            try {
              userProfile = await useAuthUser.getUserProfile(firebaseUser.uid);
            } catch (profileError) {
              console.log('User profile not found in Firestore, using auth data only');
            }

            // Create user object with sanitized data
            const user = {
              // Spread profile data first
              ...userProfile,
              // Override with auth data to ensure correct values
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName || userProfile.displayName || '',
              photoUrl: firebaseUser.photoURL || userProfile.photoUrl || null,
              // Add custom claims from token, fallback to Firestore profile
              roles: customClaims.roles || userProfile.roles || [],
              permissions: customClaims.permissions || userProfile.permissions || [],
              portalAccess: customClaims.portalAccess || userProfile.portalAccess || {
                admin: false,
                employee: false,
                client: [],
                candidate: false
              },
            };

            // Remove any non-serializable fields
            delete user.metadata;
            delete user.createdAt;
            delete user.updatedAt;

            dispatch(setUser(user));
          } else {
            dispatch(setUser(null));
          }
        } catch (error) {
          console.error('Auth state change error:', error);
          dispatch(setError(error instanceof Error ? error.message : 'Authentication error'));
        } finally {
          dispatch(setLoading(false));
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        dispatch(setError(error.message));
        dispatch(setLoading(false));
      }
    );

    return unsubscribe;
  }, [dispatch]);

  return <>{children}</>;
}
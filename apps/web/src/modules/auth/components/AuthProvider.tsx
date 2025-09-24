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

            // Fetch user profile from Firestore
            const userProfile = await useAuthUser.getUserProfile(firebaseUser.uid);

            const user = {
              ...userProfile,
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              photoUrl: firebaseUser.photoURL,
              // Add custom claims
              roles: customClaims.roles || [],
              permissions: customClaims.permissions || [],
            };

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
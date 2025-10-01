import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, setLoading } from '../../../store/slices/authSlice';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Mock user - no Firebase needed
const mockUser = {
  id: 'mock-user-123',
  email: 'admin@mashub.com',
  name: 'Admin User',
  displayName: 'Admin User',
  photoUrl: null,
  roles: ['admin'],
  permissions: ['all'],
  portalAccess: {
    admin: true,
    employee: true,
    client: [],
    candidate: false
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Auto-login with mock user after short delay
    dispatch(setLoading(true));

    setTimeout(() => {
      dispatch(setUser(mockUser));
      dispatch(setLoading(false));
    }, 500);
  }, [dispatch]);

  return <>{children}</>;
}
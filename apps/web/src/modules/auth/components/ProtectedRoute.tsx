import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { PortalType } from '../../../types/models';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  portalType?: PortalType | 'admin';
  requireAll?: boolean; // If true, user must have ALL permissions/roles, if false ANY
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  portalType,
  requireAll = false,
}: ProtectedRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is loading
  if (auth.isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!auth.isAuthenticated || !auth.user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check portal access if specified
  if (portalType && !auth.canAccessPortal(portalType)) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0) {
    const hasRequiredRoles = requireAll
      ? requiredRoles.every(role => auth.hasRole(role))
      : requiredRoles.some(role => auth.hasRole(role));

    if (!hasRequiredRoles) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ from: location, reason: 'insufficient_roles' }}
          replace
        />
      );
    }
  }

  // Check permission requirements
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? auth.hasAllPermissions(requiredPermissions)
      : auth.hasAnyPermission(requiredPermissions);

    if (!hasRequiredPermissions) {
      return (
        <Navigate
          to="/unauthorized"
          state={{ from: location, reason: 'insufficient_permissions' }}
          replace
        />
      );
    }
  }

  // All checks passed, render the protected component
  return <>{children}</>;
}
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { useAuth } from '../modules/auth/hooks/useAuth';
import { organizationService, type Organization } from '../lib/firebase/services/organization.service';
import { useDispatch } from 'react-redux';
import { addNotification } from '../store/slices/uiSlice';

interface OrganizationContextValue {
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  error: Error | null;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshOrganizations: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

/**
 * Hook to get current organization context
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    // If not within provider, return a standalone implementation
    const { user } = useAuth();
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
      if (!user) {
        setOrganization(null);
        setOrganizations([]);
        setLoading(false);
        return;
      }

      // Load user's organizations
      const loadOrganizations = async () => {
        try {
          setLoading(true);
          const orgs = await organizationService.getUserOrganizations(user.id);
          setOrganizations(orgs);

          // Set current organization
          if (user.currentOrganizationId) {
            const currentOrg = orgs.find(o => o.id === user.currentOrganizationId);
            setOrganization(currentOrg || null);
          } else if (orgs.length > 0) {
            // If no current org set, use the first one
            setOrganization(orgs[0]);
            await organizationService.setCurrentOrganization(user.id, orgs[0].id);
          }
        } catch (err) {
          console.error('Error loading organizations:', err);
          setError(err as Error);
        } finally {
          setLoading(false);
        }
      };

      loadOrganizations();
    }, [user]);

    // Subscribe to current organization changes
    useEffect(() => {
      if (!user?.currentOrganizationId) {
        return;
      }

      const unsubscribe = onSnapshot(
        doc(db, 'organizations', user.currentOrganizationId),
        (doc) => {
          if (doc.exists()) {
            setOrganization({ id: doc.id, ...doc.data() } as Organization);
          }
        },
        (error) => {
          console.error('Error watching organization:', error);
          setError(error as Error);
        }
      );

      return () => unsubscribe();
    }, [user?.currentOrganizationId]);

    const switchOrganization = async (orgId: string) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      try {
        await organizationService.setCurrentOrganization(user.id, orgId);
        const org = await organizationService.getOrganization(orgId);
        if (org) {
          setOrganization(org);
        }
      } catch (err) {
        console.error('Error switching organization:', err);
        throw err;
      }
    };

    const refreshOrganizations = async () => {
      if (!user) return;

      try {
        const orgs = await organizationService.getUserOrganizations(user.id);
        setOrganizations(orgs);
      } catch (err) {
        console.error('Error refreshing organizations:', err);
        setError(err as Error);
      }
    };

    const hasPermission = (permission: string): boolean => {
      if (!user || !organization) return false;

      // Check if user has permission in current organization
      // This is a simplified check - real implementation would check userOrganization record
      const userOrg = user.organizations?.[organization.id];
      if (!userOrg) return false;

      // Owners and admins have all permissions
      if (userOrg.roles?.includes('owner') || userOrg.roles?.includes('admin')) {
        return true;
      }

      // Check specific permission (would need to be implemented)
      return false;
    };

    const hasRole = (role: string): boolean => {
      if (!user || !organization) return false;

      const userOrg = user.organizations?.[organization.id];
      return userOrg?.roles?.includes(role) || false;
    };

    return {
      organization,
      organizations,
      loading,
      error,
      switchOrganization,
      refreshOrganizations,
      hasPermission,
      hasRole,
    };
  }

  return context;
}

/**
 * Provider component for organization context
 */
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load user's organizations on mount/user change
  useEffect(() => {
    if (!user) {
      setOrganization(null);
      setOrganizations([]);
      setLoading(false);
      return;
    }

    const loadOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user has any organizations
        const orgs = await organizationService.getUserOrganizations(user.id);
        setOrganizations(orgs);

        if (orgs.length === 0) {
          // User has no organizations - create a default one
          dispatch(addNotification({
            type: 'info',
            title: 'Creating Organization',
            message: 'Setting up your organization...',
          }));

          const newOrg = await organizationService.createOrganization({
            name: `${user.name || user.email.split('@')[0]}'s Organization`,
            description: 'Default organization',
          }, user.id);

          setOrganizations([newOrg]);
          setOrganization(newOrg);
        } else {
          // Set current organization
          if (user.currentOrganizationId) {
            const currentOrg = orgs.find(o => o.id === user.currentOrganizationId);
            if (currentOrg) {
              setOrganization(currentOrg);
            } else {
              // Current org not found, use first one
              setOrganization(orgs[0]);
              await organizationService.setCurrentOrganization(user.id, orgs[0].id);
            }
          } else {
            // No current org set, use the first one
            setOrganization(orgs[0]);
            await organizationService.setCurrentOrganization(user.id, orgs[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading organizations:', err);
        setError(err as Error);
        dispatch(addNotification({
          type: 'error',
          title: 'Organization Error',
          message: 'Failed to load organization data',
        }));
      } finally {
        setLoading(false);
      }
    };

    loadOrganizations();
  }, [user, dispatch]);

  // Subscribe to current organization changes
  useEffect(() => {
    if (!organization?.id) {
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'organizations', organization.id),
      (doc) => {
        if (doc.exists()) {
          const updatedOrg = { id: doc.id, ...doc.data() } as Organization;
          setOrganization(updatedOrg);

          // Update in organizations list too
          setOrganizations(prev =>
            prev.map(org => org.id === updatedOrg.id ? updatedOrg : org)
          );
        }
      },
      (error) => {
        console.error('Error watching organization:', error);
        setError(error as Error);
      }
    );

    return () => unsubscribe();
  }, [organization?.id]);

  const switchOrganization = useCallback(async (orgId: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      setLoading(true);

      // Verify user is member of organization
      const isMember = organizations.some(org => org.id === orgId);
      if (!isMember) {
        throw new Error('You are not a member of this organization');
      }

      // Switch organization
      await organizationService.setCurrentOrganization(user.id, orgId);

      // Update local state
      const org = organizations.find(o => o.id === orgId);
      if (org) {
        setOrganization(org);
        dispatch(addNotification({
          type: 'success',
          title: 'Organization Switched',
          message: `Switched to ${org.name}`,
        }));
      }

      // Reload the page to refresh all data with new organization context
      // In production, you might want to update all relevant stores instead
      window.location.reload();
    } catch (err) {
      console.error('Error switching organization:', err);
      dispatch(addNotification({
        type: 'error',
        title: 'Switch Failed',
        message: 'Failed to switch organization',
      }));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, organizations, dispatch]);

  const refreshOrganizations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const orgs = await organizationService.getUserOrganizations(user.id);
      setOrganizations(orgs);

      // Update current org if it's in the list
      if (organization) {
        const updated = orgs.find(o => o.id === organization.id);
        if (updated) {
          setOrganization(updated);
        }
      }
    } catch (err) {
      console.error('Error refreshing organizations:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user, organization]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user || !organization) return false;

    // Check user's permissions in current organization
    const userOrg = user.organizations?.[organization.id];
    if (!userOrg?.active) return false;

    // Owners and admins have all permissions
    if (userOrg.roles?.includes('owner') || userOrg.roles?.includes('admin')) {
      return true;
    }

    // For other roles, check specific permissions
    // This would need to be expanded based on your permission system
    const rolePermissions: Record<string, string[]> = {
      manager: ['users.view', 'projects.manage', 'tasks.manage'],
      employee: ['users.view', 'tasks.view', 'tasks.update'],
      hr: ['users.manage', 'users.view'],
    };

    for (const role of userOrg.roles || []) {
      if (rolePermissions[role]?.includes(permission)) {
        return true;
      }
    }

    return false;
  }, [user, organization]);

  const hasRole = useCallback((role: string): boolean => {
    if (!user || !organization) return false;

    const userOrg = user.organizations?.[organization.id];
    return userOrg?.active && userOrg?.roles?.includes(role) || false;
  }, [user, organization]);

  const value: OrganizationContextValue = {
    organization,
    organizations,
    loading,
    error,
    switchOrganization,
    refreshOrganizations,
    hasPermission,
    hasRole,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to check if user has specific permission in current org
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = useOrganization();
  return hasPermission(permission);
}

/**
 * Hook to check if user has specific role in current org
 */
export function useRole(role: string): boolean {
  const { hasRole } = useOrganization();
  return hasRole(role);
}
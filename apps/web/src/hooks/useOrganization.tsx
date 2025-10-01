import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '../modules/auth/hooks/useAuth';

export interface Organization {
  id: string;
  name: string;
  settings?: any;
}

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

// Mock organization data
const mockOrganization: Organization = {
  id: 'org-123',
  name: 'MAS Business',
  settings: {}
};

/**
 * Hook to get current organization context
 */
export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    // Return mock data when not within provider
    return {
      organization: mockOrganization,
      organizations: [mockOrganization],
      loading: false,
      error: null,
      switchOrganization: async () => {},
      refreshOrganizations: async () => {},
      hasPermission: () => true,
      hasRole: () => true,
    };
  }
  return context;
}

/**
 * Organization Provider Component
 */
export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(mockOrganization);
  const [organizations, setOrganizations] = useState<Organization[]>([mockOrganization]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Mock data is already set
    setLoading(false);
  }, [user]);

  const switchOrganization = async (orgId: string) => {
    console.log('Switching organization to:', orgId);
  };

  const refreshOrganizations = async () => {
    console.log('Refreshing organizations');
  };

  const hasPermission = (permission: string) => {
    // Mock - admin has all permissions
    return true;
  };

  const hasRole = (role: string) => {
    // Mock - user has admin role
    return role === 'admin';
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        organizations,
        loading,
        error,
        switchOrganization,
        refreshOrganizations,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}
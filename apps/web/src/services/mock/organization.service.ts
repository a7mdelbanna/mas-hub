// Mock Organization Service - Frontend Only

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class MockOrganizationService {
  private organizations: Organization[] = [
    {
      id: 'org-1',
      name: 'MAS Hub Corporation',
      domain: 'mashub.com',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      settings: {
        allowSignups: true,
        requireEmailVerification: true,
        maxUsersPerOrg: 100,
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'org-2',
      name: 'Acme Industries',
      domain: 'acme.com',
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      settings: {
        allowSignups: false,
        requireEmailVerification: true,
        maxUsersPerOrg: 50,
      },
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
    },
    {
      id: 'org-3',
      name: 'Global Tech Solutions',
      domain: 'globaltech.io',
      primaryColor: '#8B5CF6',
      secondaryColor: '#6D28D9',
      settings: {
        allowSignups: true,
        requireEmailVerification: false,
        maxUsersPerOrg: 200,
      },
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
    },
  ];

  private currentOrganization: Organization | null = null;

  async getOrganizations(): Promise<Organization[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.organizations];
  }

  async getOrganizationById(id: string): Promise<Organization | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.organizations.find(org => org.id === id);
  }

  async getCurrentOrganization(): Promise<Organization | null> {
    await new Promise(resolve => setTimeout(resolve, 200));

    // Get from localStorage or use first org as default
    const storedOrgId = localStorage.getItem('currentOrganizationId');
    if (storedOrgId) {
      this.currentOrganization = this.organizations.find(org => org.id === storedOrgId) || null;
    }

    if (!this.currentOrganization && this.organizations.length > 0) {
      this.currentOrganization = this.organizations[0];
      localStorage.setItem('currentOrganizationId', this.currentOrganization.id);
    }

    return this.currentOrganization;
  }

  async setCurrentOrganization(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const org = this.organizations.find(o => o.id === id);
    if (!org) {
      throw new Error('Organization not found');
    }

    this.currentOrganization = org;
    localStorage.setItem('currentOrganizationId', id);
  }

  async createOrganization(data: Partial<Organization>): Promise<Organization> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: data.name || 'New Organization',
      domain: data.domain,
      primaryColor: data.primaryColor || '#3B82F6',
      secondaryColor: data.secondaryColor || '#1E40AF',
      settings: data.settings || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.organizations.push(newOrg);
    return newOrg;
  }

  async updateOrganization(id: string, data: Partial<Organization>): Promise<Organization> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const orgIndex = this.organizations.findIndex(o => o.id === id);
    if (orgIndex === -1) {
      throw new Error('Organization not found');
    }

    const updatedOrg = {
      ...this.organizations[orgIndex],
      ...data,
      updatedAt: new Date(),
    };

    this.organizations[orgIndex] = updatedOrg;

    // Update current if it's the same org
    if (this.currentOrganization?.id === id) {
      this.currentOrganization = updatedOrg;
    }

    return updatedOrg;
  }
}

export const organizationService = new MockOrganizationService();
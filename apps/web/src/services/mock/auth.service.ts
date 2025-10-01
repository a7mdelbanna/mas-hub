// Mock Auth Service - Frontend Only
// This is a mock service for UI demonstration purposes only

export interface User {
  id: string;
  email: string;
  name: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  roles: string[];
  organizationId?: string;
  departmentId?: string;
  managerId?: string;
  position?: string;
  title?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  isMultiTenant?: boolean;
  tenantAccess?: string[];
}

class MockAuthService {
  private currentUser: User | null = null;
  private isAuthenticated = false;

  // Mock user for demo purposes
  private mockUser: User = {
    id: 'user-1',
    email: 'admin@mashub.com',
    name: 'Admin User',
    displayName: 'Admin',
    roles: ['admin', 'user'],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isMultiTenant: true,
    tenantAccess: ['org-1', 'org-2', 'org-3'],
  };

  async signIn(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock authentication - accept any email/password for demo
    this.currentUser = { ...this.mockUser, email };
    this.isAuthenticated = true;

    // Store in localStorage for persistence
    localStorage.setItem('mockUser', JSON.stringify(this.currentUser));
    localStorage.setItem('mockAuth', 'true');

    return this.currentUser;
  }

  async signUp(email: string, password: string, name: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      displayName: name,
      roles: ['user'],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.currentUser = newUser;
    this.isAuthenticated = true;

    localStorage.setItem('mockUser', JSON.stringify(this.currentUser));
    localStorage.setItem('mockAuth', 'true');

    return newUser;
  }

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    this.currentUser = null;
    this.isAuthenticated = false;

    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockAuth');
  }

  async getCurrentUser(): Promise<User | null> {
    // Check localStorage first
    if (!this.currentUser) {
      const storedUser = localStorage.getItem('mockUser');
      const storedAuth = localStorage.getItem('mockAuth');

      if (storedUser && storedAuth === 'true') {
        this.currentUser = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    }

    return this.currentUser;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    this.currentUser = { ...this.currentUser, ...updates, updatedAt: new Date() };
    localStorage.setItem('mockUser', JSON.stringify(this.currentUser));

    return this.currentUser;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  async resetPassword(email: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Mock password reset - just simulate success
    console.log(`Password reset email sent to ${email}`);
  }
}

export const authService = new MockAuthService();
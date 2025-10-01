// Mock User Service - Frontend Only
import type { User } from './auth.service';

export interface CreateUserRequest {
  email: string;
  name: string;
  displayName?: string;
  password?: string;
  roles: string[];
  phoneNumber?: string;
  departmentId?: string;
  position?: string;
  title?: string;
  managerId?: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
}

class MockUserService {
  // Mock data
  private users: User[] = [
    {
      id: 'user-1',
      email: 'admin@mashub.com',
      name: 'Admin User',
      displayName: 'Admin',
      roles: ['admin', 'user'],
      active: true,
      position: 'System Administrator',
      departmentId: 'dept-1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'user-2',
      email: 'john.doe@mashub.com',
      name: 'John Doe',
      displayName: 'John',
      roles: ['manager', 'user'],
      active: true,
      position: 'Department Manager',
      departmentId: 'dept-2',
      phoneNumber: '+1 (555) 123-4567',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
    },
    {
      id: 'user-3',
      email: 'jane.smith@mashub.com',
      name: 'Jane Smith',
      displayName: 'Jane',
      roles: ['employee', 'user'],
      active: true,
      position: 'Senior Developer',
      departmentId: 'dept-2',
      managerId: 'user-2',
      phoneNumber: '+1 (555) 234-5678',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
    },
    {
      id: 'user-4',
      email: 'bob.wilson@mashub.com',
      name: 'Bob Wilson',
      displayName: 'Bob',
      roles: ['employee'],
      active: false,
      position: 'Junior Developer',
      departmentId: 'dept-2',
      managerId: 'user-2',
      createdAt: new Date('2024-04-01'),
      updatedAt: new Date(),
    },
  ];

  private departments: Department[] = [
    { id: 'dept-1', name: 'Administration', description: 'System administration and management' },
    { id: 'dept-2', name: 'Engineering', description: 'Software development and engineering' },
    { id: 'dept-3', name: 'Sales', description: 'Sales and business development' },
    { id: 'dept-4', name: 'Marketing', description: 'Marketing and communications' },
    { id: 'dept-5', name: 'Support', description: 'Customer support and service' },
  ];

  private roles: Role[] = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access',
      permissions: ['all']
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Department management access',
      permissions: ['read', 'write', 'manage_users']
    },
    {
      id: 'employee',
      name: 'Employee',
      description: 'Standard employee access',
      permissions: ['read', 'write_own']
    },
    {
      id: 'user',
      name: 'User',
      description: 'Basic user access',
      permissions: ['read']
    },
  ];

  async getUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  async getUserById(id: string): Promise<User | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.find(u => u.id === id);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      displayName: data.displayName || data.name,
      roles: data.roles,
      phoneNumber: data.phoneNumber,
      departmentId: data.departmentId,
      position: data.position,
      title: data.title,
      managerId: data.managerId,
      active: data.active,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id: string, data: Partial<CreateUserRequest>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async deleteUser(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }

    this.users.splice(index, 1);
  }

  async getDepartments(): Promise<Department[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.departments];
  }

  async getRoles(): Promise<Role[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.roles];
  }

  async getManagers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users.filter(u => u.roles.includes('manager') && u.active);
  }
}

export const userService = new MockUserService();
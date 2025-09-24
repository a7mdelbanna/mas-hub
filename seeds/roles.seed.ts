import { Role, Permission } from '../src/types/models';

export const roles: Partial<Role>[] = [
  {
    id: 'role-admin',
    name: 'System Administrator',
    description: 'Full system access and configuration rights',
    permissions: [
      { resource: '*', actions: ['create', 'read', 'update', 'delete'], scope: 'all' }
    ],
    isSystem: true
  },
  {
    id: 'role-ceo',
    name: 'CEO/Executive',
    description: 'Executive dashboard and company-wide reporting',
    permissions: [
      { resource: 'projects', actions: ['read'], scope: 'all' },
      { resource: 'accounts', actions: ['read'], scope: 'all' },
      { resource: 'invoices', actions: ['read'], scope: 'all' },
      { resource: 'reports', actions: ['read'], scope: 'all' },
      { resource: 'analytics', actions: ['read'], scope: 'all' }
    ],
    isSystem: true
  },
  {
    id: 'role-department-manager',
    name: 'Department Manager',
    description: 'Manage department resources and approve timesheets',
    permissions: [
      { resource: 'projects', actions: ['create', 'read', 'update'], scope: 'department' },
      { resource: 'tasks', actions: ['create', 'read', 'update'], scope: 'department' },
      { resource: 'timesheets', actions: ['read', 'update'], scope: 'department' },
      { resource: 'users', actions: ['read'], scope: 'department' },
      { resource: 'reports', actions: ['read'], scope: 'department' }
    ],
    isSystem: true
  },
  {
    id: 'role-project-manager',
    name: 'Project Manager',
    description: 'Manage assigned projects and teams',
    permissions: [
      { resource: 'projects', actions: ['read', 'update'], scope: 'own' },
      { resource: 'tasks', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'timesheets', actions: ['read', 'update'], scope: 'own' },
      { resource: 'phases', actions: ['create', 'read', 'update'], scope: 'own' }
    ],
    isSystem: true
  },
  {
    id: 'role-employee',
    name: 'Employee',
    description: 'Standard employee portal access',
    permissions: [
      { resource: 'tasks', actions: ['read', 'update'], scope: 'own' },
      { resource: 'timesheets', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'projects', actions: ['read'], scope: 'own' },
      { resource: 'training', actions: ['read', 'update'], scope: 'own' }
    ],
    isSystem: true
  },
  {
    id: 'role-sales-rep',
    name: 'Sales Representative',
    description: 'CRM and sales pipeline management',
    permissions: [
      { resource: 'opportunities', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'accounts', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'quotes', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'contracts', actions: ['read'], scope: 'own' }
    ],
    isSystem: true
  },
  {
    id: 'role-finance-manager',
    name: 'Finance Manager',
    description: 'Financial operations and billing management',
    permissions: [
      { resource: 'invoices', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'payments', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'transactions', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'contracts', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'reports', actions: ['read'], scope: 'all' }
    ],
    isSystem: true
  },
  {
    id: 'role-support-agent',
    name: 'Support Agent',
    description: 'Handle support tickets and client issues',
    permissions: [
      { resource: 'tickets', actions: ['create', 'read', 'update'], scope: 'own' },
      { resource: 'accounts', actions: ['read'], scope: 'all' },
      { resource: 'assets', actions: ['read'], scope: 'all' },
      { resource: 'visits', actions: ['create', 'read', 'update'], scope: 'own' }
    ],
    isSystem: true
  },
  {
    id: 'role-hr-manager',
    name: 'HR Manager',
    description: 'Human resources and recruitment management',
    permissions: [
      { resource: 'candidates', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'interviews', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'users', actions: ['create', 'read', 'update'], scope: 'all' },
      { resource: 'training', actions: ['create', 'read', 'update'], scope: 'all' }
    ],
    isSystem: true
  },
  {
    id: 'role-client',
    name: 'Client Portal User',
    description: 'Access to client portal features',
    permissions: [
      { resource: 'projects', actions: ['read'], scope: 'own' },
      { resource: 'invoices', actions: ['read'], scope: 'own' },
      { resource: 'tickets', actions: ['create', 'read'], scope: 'own' },
      { resource: 'training', actions: ['read'], scope: 'own' }
    ],
    isSystem: true
  }
];
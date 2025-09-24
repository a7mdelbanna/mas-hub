import { User, Language } from '../src/types/models';

export const users: Partial<User>[] = [
  // Executive Team
  {
    id: 'user-ceo',
    email: 'ceo@mas.business',
    name: 'Ahmed El-Masry',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/ceo.jpg',
    phoneNumber: '+20-10-1234-5678',
    active: true,
    employeeId: 'EMP-001',
    title: 'Chief Executive Officer',
    startDate: new Date('2020-01-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // Department Managers
  {
    id: 'user-manager-pos',
    email: 'pos.manager@mas.business',
    name: 'Sarah Ahmed',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/pos-manager.jpg',
    phoneNumber: '+20-10-2345-6789',
    active: true,
    departmentId: 'dept-pos',
    employeeId: 'EMP-002',
    title: 'POS Systems Manager',
    startDate: new Date('2020-03-15'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-manager-tech',
    email: 'tech.manager@mas.business',
    name: 'Omar Hassan',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/tech-manager.jpg',
    phoneNumber: '+20-10-3456-7890',
    active: true,
    departmentId: 'dept-tech',
    employeeId: 'EMP-003',
    title: 'Technology Director',
    startDate: new Date('2020-02-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-manager-support',
    email: 'support.manager@mas.business',
    name: 'Maha Farouk',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/support-manager.jpg',
    phoneNumber: '+20-10-4567-8901',
    active: true,
    departmentId: 'dept-support',
    employeeId: 'EMP-004',
    title: 'Support Services Manager',
    startDate: new Date('2020-04-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-manager-marketing',
    email: 'marketing.manager@mas.business',
    name: 'Yasmin Nour',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/marketing-manager.jpg',
    phoneNumber: '+20-10-5678-9012',
    active: true,
    departmentId: 'dept-marketing',
    employeeId: 'EMP-005',
    title: 'Marketing & Sales Director',
    startDate: new Date('2020-05-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-manager-finance',
    email: 'finance.manager@mas.business',
    name: 'Karim Mostafa',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/finance-manager.jpg',
    phoneNumber: '+20-10-6789-0123',
    active: true,
    departmentId: 'dept-finance',
    employeeId: 'EMP-006',
    title: 'Finance Manager',
    startDate: new Date('2020-06-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-manager-hr',
    email: 'hr.manager@mas.business',
    name: 'Nadia Rashid',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/hr-manager.jpg',
    phoneNumber: '+20-10-7890-1234',
    active: true,
    departmentId: 'dept-hr',
    managerId: 'user-ceo',
    employeeId: 'EMP-007',
    title: 'HR Manager',
    startDate: new Date('2020-07-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // POS Department Team
  {
    id: 'user-pos-analyst',
    email: 'pos.analyst@mas.business',
    name: 'Mohamed Saeed',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/pos-analyst.jpg',
    phoneNumber: '+20-10-8901-2345',
    active: true,
    departmentId: 'dept-pos',
    managerId: 'user-manager-pos',
    employeeId: 'EMP-008',
    title: 'POS Systems Analyst',
    startDate: new Date('2021-01-15'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-pos-developer',
    email: 'pos.developer@mas.business',
    name: 'Amira Soliman',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/pos-developer.jpg',
    phoneNumber: '+20-10-9012-3456',
    active: true,
    departmentId: 'dept-pos',
    managerId: 'user-manager-pos',
    employeeId: 'EMP-009',
    title: 'POS Developer',
    startDate: new Date('2021-03-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // Technology Department Team
  {
    id: 'user-senior-developer',
    email: 'senior.dev@mas.business',
    name: 'Hossam Abdel-Rahman',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/senior-dev.jpg',
    phoneNumber: '+20-10-0123-4567',
    active: true,
    departmentId: 'dept-tech',
    managerId: 'user-manager-tech',
    employeeId: 'EMP-010',
    title: 'Senior Full-Stack Developer',
    startDate: new Date('2020-08-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-frontend-developer',
    email: 'frontend.dev@mas.business',
    name: 'Lina Mahmoud',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/frontend-dev.jpg',
    phoneNumber: '+20-10-1234-5678',
    active: true,
    departmentId: 'dept-tech',
    managerId: 'user-manager-tech',
    employeeId: 'EMP-011',
    title: 'Frontend Developer',
    startDate: new Date('2021-02-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-mobile-developer',
    email: 'mobile.dev@mas.business',
    name: 'Tarek Zaki',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/mobile-dev.jpg',
    phoneNumber: '+20-10-2345-6789',
    active: true,
    departmentId: 'dept-tech',
    managerId: 'user-manager-tech',
    employeeId: 'EMP-012',
    title: 'Mobile App Developer',
    startDate: new Date('2021-04-15'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // Support Department Team
  {
    id: 'user-support-lead',
    email: 'support.lead@mas.business',
    name: 'Fatma El-Sayed',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/support-lead.jpg',
    phoneNumber: '+20-10-3456-7890',
    active: true,
    departmentId: 'dept-support',
    managerId: 'user-manager-support',
    employeeId: 'EMP-013',
    title: 'Senior Support Specialist',
    startDate: new Date('2020-09-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-support-tech',
    email: 'support.tech@mas.business',
    name: 'Ahmed Farid',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/support-tech.jpg',
    phoneNumber: '+20-10-4567-8901',
    active: true,
    departmentId: 'dept-support',
    managerId: 'user-manager-support',
    employeeId: 'EMP-014',
    title: 'Technical Support Engineer',
    startDate: new Date('2021-01-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-field-engineer',
    email: 'field.engineer@mas.business',
    name: 'Mahmoud Gaber',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/field-engineer.jpg',
    phoneNumber: '+20-10-5678-9012',
    active: true,
    departmentId: 'dept-support',
    managerId: 'user-manager-support',
    employeeId: 'EMP-015',
    title: 'Field Support Engineer',
    startDate: new Date('2021-05-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // Marketing & Sales Team
  {
    id: 'user-sales-lead',
    email: 'sales.lead@mas.business',
    name: 'Rania Othman',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/sales-lead.jpg',
    phoneNumber: '+20-10-6789-0123',
    active: true,
    departmentId: 'dept-marketing',
    managerId: 'user-manager-marketing',
    employeeId: 'EMP-016',
    title: 'Senior Sales Executive',
    startDate: new Date('2020-10-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-sales-rep1',
    email: 'sales.rep1@mas.business',
    name: 'Khaled Hosny',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/sales-rep1.jpg',
    phoneNumber: '+20-10-7890-1234',
    active: true,
    departmentId: 'dept-marketing',
    managerId: 'user-manager-marketing',
    employeeId: 'EMP-017',
    title: 'Sales Representative',
    startDate: new Date('2021-06-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-marketing-specialist',
    email: 'marketing.specialist@mas.business',
    name: 'Dina Youssef',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/marketing-specialist.jpg',
    phoneNumber: '+20-10-8901-2345',
    active: true,
    departmentId: 'dept-marketing',
    managerId: 'user-manager-marketing',
    employeeId: 'EMP-018',
    title: 'Digital Marketing Specialist',
    startDate: new Date('2021-07-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // Finance Team
  {
    id: 'user-accountant',
    email: 'accountant@mas.business',
    name: 'Mariam Taha',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/accountant.jpg',
    phoneNumber: '+20-10-9012-3456',
    active: true,
    departmentId: 'dept-finance',
    managerId: 'user-manager-finance',
    employeeId: 'EMP-019',
    title: 'Senior Accountant',
    startDate: new Date('2020-11-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },
  {
    id: 'user-billing-specialist',
    email: 'billing@mas.business',
    name: 'Sherif Mansour',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/billing-specialist.jpg',
    phoneNumber: '+20-10-0123-4567',
    active: true,
    departmentId: 'dept-finance',
    managerId: 'user-manager-finance',
    employeeId: 'EMP-020',
    title: 'Billing Specialist',
    startDate: new Date('2021-08-01'),
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // HR Team
  {
    id: 'user-hr-recruiter',
    email: 'recruiter@mas.business',
    name: 'Eman Adel',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/recruiter.jpg',
    phoneNumber: '+20-10-1234-5678',
    active: true,
    departmentId: 'dept-hr',
    managerId: 'user-manager-hr',
    employeeId: 'EMP-021',
    title: 'HR Recruiter',
    startDate: new Date('2021-09-01'),
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: true,
      client: []
    }
  },

  // Client Portal Users (will be linked to accounts)
  {
    id: 'user-client-restaurant-owner',
    email: 'owner@goldenspoon.restaurant',
    name: 'Hassan Al-Rashid',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/client-restaurant.jpg',
    phoneNumber: '+20-10-2345-6789',
    active: true,
    title: 'Restaurant Owner',
    timezone: 'Africa/Cairo',
    language: 'ar' as Language,
    portalAccess: {
      employee: false,
      client: ['account-golden-spoon']
    }
  },
  {
    id: 'user-client-retail-manager',
    email: 'manager@techstore.com',
    name: 'Layla Mansour',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/client-retail.jpg',
    phoneNumber: '+20-10-3456-7890',
    active: true,
    title: 'Store Manager',
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: false,
      client: ['account-tech-store']
    }
  },
  {
    id: 'user-client-pharmacy-owner',
    email: 'owner@healthfirst.pharmacy',
    name: 'Dr. Amr Khalil',
    photoUrl: 'https://storage.googleapis.com/mashub-assets/avatars/client-pharmacy.jpg',
    phoneNumber: '+20-10-4567-8901',
    active: true,
    title: 'Pharmacy Owner',
    timezone: 'Africa/Cairo',
    language: 'en' as Language,
    portalAccess: {
      employee: false,
      client: ['account-health-first']
    }
  }
];

// User Role Assignments
export const userRoles = [
  { userId: 'user-ceo', roleId: 'role-ceo' },
  { userId: 'user-manager-pos', roleId: 'role-department-manager' },
  { userId: 'user-manager-tech', roleId: 'role-department-manager' },
  { userId: 'user-manager-support', roleId: 'role-department-manager' },
  { userId: 'user-manager-marketing', roleId: 'role-department-manager' },
  { userId: 'user-manager-finance', roleId: 'role-finance-manager' },
  { userId: 'user-manager-hr', roleId: 'role-hr-manager' },
  { userId: 'user-pos-analyst', roleId: 'role-project-manager' },
  { userId: 'user-pos-developer', roleId: 'role-employee' },
  { userId: 'user-senior-developer', roleId: 'role-project-manager' },
  { userId: 'user-frontend-developer', roleId: 'role-employee' },
  { userId: 'user-mobile-developer', roleId: 'role-employee' },
  { userId: 'user-support-lead', roleId: 'role-support-agent' },
  { userId: 'user-support-tech', roleId: 'role-support-agent' },
  { userId: 'user-field-engineer', roleId: 'role-support-agent' },
  { userId: 'user-sales-lead', roleId: 'role-sales-rep' },
  { userId: 'user-sales-rep1', roleId: 'role-sales-rep' },
  { userId: 'user-marketing-specialist', roleId: 'role-employee' },
  { userId: 'user-accountant', roleId: 'role-employee' },
  { userId: 'user-billing-specialist', roleId: 'role-employee' },
  { userId: 'user-hr-recruiter', roleId: 'role-employee' },
  { userId: 'user-client-restaurant-owner', roleId: 'role-client' },
  { userId: 'user-client-retail-manager', roleId: 'role-client' },
  { userId: 'user-client-pharmacy-owner', roleId: 'role-client' }
];
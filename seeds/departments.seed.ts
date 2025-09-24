import { Department } from '../src/types/models';

export const departments: Partial<Department>[] = [
  {
    id: 'dept-pos',
    name: 'POS Systems',
    code: 'POS',
    managerId: 'user-manager-pos',
    active: true
  },
  {
    id: 'dept-tech',
    name: 'Technology & Development',
    code: 'TECH',
    managerId: 'user-manager-tech',
    active: true
  },
  {
    id: 'dept-support',
    name: 'IT Support & Services',
    code: 'SUPPORT',
    managerId: 'user-manager-support',
    active: true
  },
  {
    id: 'dept-marketing',
    name: 'Marketing & Sales',
    code: 'MKT',
    managerId: 'user-manager-marketing',
    active: true
  },
  {
    id: 'dept-finance',
    name: 'Finance & Accounting',
    code: 'FIN',
    managerId: 'user-manager-finance',
    active: true
  },
  {
    id: 'dept-hr',
    name: 'Human Resources',
    code: 'HR',
    managerId: 'user-manager-hr',
    active: true
  }
];
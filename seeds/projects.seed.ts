import { ProjectType, ProjectTemplate, Project, Phase, Task, ProjectStatus, TaskStatus, Currency } from '../src/types/models';

export const projectTypes: Partial<ProjectType>[] = [
  {
    id: 'project-type-pos',
    name: 'POS System Implementation',
    code: 'POS',
    defaultDuration: 90, // 3 months
    active: true
  },
  {
    id: 'project-type-mobile',
    name: 'Mobile Application Development',
    code: 'MOBILE',
    defaultDuration: 120, // 4 months
    active: true
  },
  {
    id: 'project-type-hybrid',
    name: 'Hybrid Solution (POS + Mobile)',
    code: 'HYBRID',
    defaultDuration: 150, // 5 months
    active: true
  },
  {
    id: 'project-type-support',
    name: 'IT Support Contract',
    code: 'SUPPORT',
    defaultDuration: 365, // 1 year
    active: true
  },
  {
    id: 'project-type-training',
    name: 'Staff Training Program',
    code: 'TRAINING',
    defaultDuration: 30, // 1 month
    active: true
  }
];

export const projectTemplates: Partial<ProjectTemplate>[] = [
  {
    id: 'template-pos-standard',
    name: 'Standard POS Implementation',
    projectTypeId: 'project-type-pos',
    phases: [
      {
        name: 'Discovery & Analysis',
        duration: 14,
        weight: 15,
        defaultTasks: [
          {
            title: 'Requirements Gathering',
            description: 'Meet with client to understand business requirements',
            estimateHours: 16
          },
          {
            title: 'Site Survey',
            description: 'Assess physical location and technical requirements',
            estimateHours: 8
          },
          {
            title: 'Technical Specification',
            description: 'Create detailed technical specification document',
            estimateHours: 12
          }
        ]
      },
      {
        name: 'System Configuration',
        duration: 21,
        weight: 25,
        defaultTasks: [
          {
            title: 'Hardware Setup',
            description: 'Configure POS hardware and peripherals',
            estimateHours: 20
          },
          {
            title: 'Software Configuration',
            description: 'Setup POS software and customize settings',
            estimateHours: 24
          },
          {
            title: 'Integration Testing',
            description: 'Test integrations with payment gateways and peripherals',
            estimateHours: 16
          }
        ]
      },
      {
        name: 'Data Migration',
        duration: 14,
        weight: 20,
        defaultTasks: [
          {
            title: 'Data Extraction',
            description: 'Extract data from existing systems',
            estimateHours: 12
          },
          {
            title: 'Data Transformation',
            description: 'Clean and transform data to new format',
            estimateHours: 16
          },
          {
            title: 'Data Import',
            description: 'Import data into new POS system',
            estimateHours: 8
          }
        ]
      },
      {
        name: 'User Training',
        duration: 21,
        weight: 20,
        defaultTasks: [
          {
            title: 'Training Material Preparation',
            description: 'Create user manuals and training materials',
            estimateHours: 12
          },
          {
            title: 'Staff Training Sessions',
            description: 'Conduct training sessions for all staff',
            estimateHours: 24
          },
          {
            title: 'Training Assessment',
            description: 'Assess staff competency and provide additional training',
            estimateHours: 8
          }
        ]
      },
      {
        name: 'Go-Live & Support',
        duration: 20,
        weight: 20,
        defaultTasks: [
          {
            title: 'Pre-Go-Live Testing',
            description: 'Final system testing before go-live',
            estimateHours: 8
          },
          {
            title: 'Go-Live Support',
            description: 'On-site support during first week of operation',
            estimateHours: 40
          },
          {
            title: 'Post-Go-Live Optimization',
            description: 'System optimization based on initial usage',
            estimateHours: 12
          }
        ]
      }
    ]
  },
  {
    id: 'template-mobile-app',
    name: 'Mobile Application Development',
    projectTypeId: 'project-type-mobile',
    phases: [
      {
        name: 'Planning & Design',
        duration: 28,
        weight: 25,
        defaultTasks: [
          {
            title: 'Requirements Analysis',
            description: 'Analyze and document mobile app requirements',
            estimateHours: 20
          },
          {
            title: 'UI/UX Design',
            description: 'Create user interface and experience design',
            estimateHours: 40
          },
          {
            title: 'Technical Architecture',
            description: 'Design technical architecture and database schema',
            estimateHours: 24
          }
        ]
      },
      {
        name: 'Development',
        duration: 56,
        weight: 50,
        defaultTasks: [
          {
            title: 'Backend Development',
            description: 'Develop API and backend services',
            estimateHours: 80
          },
          {
            title: 'Mobile App Development',
            description: 'Develop native/hybrid mobile application',
            estimateHours: 120
          },
          {
            title: 'Integration & Testing',
            description: 'Integrate components and conduct testing',
            estimateHours: 40
          }
        ]
      },
      {
        name: 'Testing & QA',
        duration: 21,
        weight: 15,
        defaultTasks: [
          {
            title: 'Functional Testing',
            description: 'Comprehensive functional testing',
            estimateHours: 24
          },
          {
            title: 'Performance Testing',
            description: 'Load and performance testing',
            estimateHours: 16
          },
          {
            title: 'User Acceptance Testing',
            description: 'Client UAT and feedback incorporation',
            estimateHours: 20
          }
        ]
      },
      {
        name: 'Deployment & Launch',
        duration: 15,
        weight: 10,
        defaultTasks: [
          {
            title: 'App Store Submission',
            description: 'Submit to iOS App Store and Google Play Store',
            estimateHours: 12
          },
          {
            title: 'Production Deployment',
            description: 'Deploy backend services to production',
            estimateHours: 8
          },
          {
            title: 'Launch Support',
            description: 'Monitor launch and provide immediate support',
            estimateHours: 16
          }
        ]
      }
    ]
  }
];

export const projects: Partial<Project>[] = [
  // Active POS Projects
  {
    id: 'project-golden-spoon-pos',
    name: 'Golden Spoon Restaurant POS System',
    code: 'GS-POS-2024-001',
    accountId: 'account-golden-spoon',
    projectTypeId: 'project-type-pos',
    managerId: 'user-pos-analyst',
    description: 'Complete POS system implementation for 3-location restaurant chain including inventory management and reporting.',
    status: ProjectStatus.IN_PROGRESS,
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-04-15'),
    actualStartDate: new Date('2024-01-15'),
    estimateBudget: 45000,
    actualBudget: 32000,
    currency: 'USD' as Currency,
    completionPercentage: 65,
    members: ['user-pos-analyst', 'user-pos-developer', 'user-support-tech'],
    tags: ['restaurant', 'multi-location', 'inventory'],
    customFields: {
      clientPriority: 'High',
      complexity: 'Medium',
      riskLevel: 'Low'
    }
  },
  {
    id: 'project-pizza-palace-expansion',
    name: 'Pizza Palace Chain Expansion',
    code: 'PP-HYBRID-2024-002',
    accountId: 'account-pizza-palace',
    projectTypeId: 'project-type-hybrid',
    managerId: 'user-senior-developer',
    description: 'POS system upgrade and mobile ordering app for 12-location pizza chain.',
    status: ProjectStatus.PLANNING,
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2024-07-01'),
    estimateBudget: 125000,
    currency: 'USD' as Currency,
    completionPercentage: 15,
    members: ['user-senior-developer', 'user-pos-analyst', 'user-mobile-developer', 'user-frontend-developer'],
    tags: ['franchise', 'mobile-app', 'pos-upgrade'],
    customFields: {
      clientPriority: 'Critical',
      complexity: 'High',
      riskLevel: 'Medium'
    }
  },
  {
    id: 'project-health-first-pos',
    name: 'HealthFirst Pharmacy POS Implementation',
    code: 'HF-POS-2024-003',
    accountId: 'account-health-first',
    projectTypeId: 'project-type-pos',
    managerId: 'user-pos-analyst',
    description: 'Specialized pharmacy POS system with prescription management and insurance integration.',
    status: ProjectStatus.IN_PROGRESS,
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-03-31'),
    actualStartDate: new Date('2024-01-05'),
    estimateBudget: 65000,
    actualBudget: 48000,
    currency: 'USD' as Currency,
    completionPercentage: 80,
    members: ['user-pos-analyst', 'user-pos-developer'],
    tags: ['pharmacy', 'healthcare', 'insurance'],
    customFields: {
      clientPriority: 'High',
      complexity: 'High',
      riskLevel: 'Low'
    }
  },

  // Mobile App Projects
  {
    id: 'project-techstore-mobile',
    name: 'TechStore Mobile Shopping App',
    code: 'TS-MOBILE-2024-004',
    accountId: 'account-tech-store',
    projectTypeId: 'project-type-mobile',
    managerId: 'user-mobile-developer',
    description: 'E-commerce mobile application with product catalog, shopping cart, and payment integration.',
    status: ProjectStatus.IN_PROGRESS,
    startDate: new Date('2023-12-01'),
    dueDate: new Date('2024-04-01'),
    actualStartDate: new Date('2023-12-01'),
    estimateBudget: 55000,
    actualBudget: 41000,
    currency: 'USD' as Currency,
    completionPercentage: 75,
    members: ['user-mobile-developer', 'user-frontend-developer', 'user-senior-developer'],
    tags: ['e-commerce', 'mobile-app', 'payments'],
    customFields: {
      clientPriority: 'Medium',
      complexity: 'Medium',
      riskLevel: 'Low'
    }
  },
  {
    id: 'project-powergym-app',
    name: 'PowerGym Fitness App',
    code: 'PG-MOBILE-2024-005',
    accountId: 'account-fitness-center',
    projectTypeId: 'project-type-mobile',
    managerId: 'user-mobile-developer',
    description: 'Fitness tracking app with workout plans, membership management, and class booking.',
    status: ProjectStatus.PLANNING,
    startDate: new Date('2024-03-01'),
    dueDate: new Date('2024-07-01'),
    estimateBudget: 75000,
    currency: 'USD' as Currency,
    completionPercentage: 5,
    members: ['user-mobile-developer', 'user-frontend-developer'],
    tags: ['fitness', 'mobile-app', 'membership'],
    customFields: {
      clientPriority: 'Medium',
      complexity: 'Medium',
      riskLevel: 'Medium'
    }
  },

  // Support Projects
  {
    id: 'project-dental-support',
    name: 'Modern Dental Clinic IT Support',
    code: 'MDC-SUPPORT-2024-006',
    accountId: 'account-dental-clinic',
    projectTypeId: 'project-type-support',
    managerId: 'user-support-lead',
    description: '12-month IT support contract for dental practice management system and network infrastructure.',
    status: ProjectStatus.IN_PROGRESS,
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-12-31'),
    actualStartDate: new Date('2024-01-01'),
    estimateBudget: 24000,
    actualBudget: 6000, // 3 months in
    currency: 'USD' as Currency,
    completionPercentage: 25,
    members: ['user-support-lead', 'user-support-tech', 'user-field-engineer'],
    tags: ['support-contract', 'healthcare', 'ongoing'],
    customFields: {
      contractType: 'Annual Support',
      slaLevel: 'Standard',
      includesHardware: true
    }
  },

  // Completed Projects
  {
    id: 'project-beauty-salon-pos',
    name: 'Elite Beauty Salon POS System',
    code: 'EBS-POS-2023-007',
    accountId: 'account-beauty-salon',
    projectTypeId: 'project-type-pos',
    managerId: 'user-pos-analyst',
    description: 'Simple POS system for beauty salon with appointment booking integration.',
    status: ProjectStatus.COMPLETED,
    startDate: new Date('2023-10-01'),
    dueDate: new Date('2023-12-15'),
    actualStartDate: new Date('2023-10-01'),
    actualEndDate: new Date('2023-12-10'),
    estimateBudget: 18000,
    actualBudget: 17500,
    currency: 'USD' as Currency,
    completionPercentage: 100,
    members: ['user-pos-analyst', 'user-pos-developer'],
    tags: ['beauty-salon', 'appointments', 'completed'],
    customFields: {
      clientSatisfaction: 5,
      deliveredOnTime: true,
      withinBudget: true
    }
  },
  {
    id: 'project-fashion-hub-training',
    name: 'Fashion Hub Staff Training',
    code: 'FH-TRAINING-2024-008',
    accountId: 'account-fashion-hub',
    projectTypeId: 'project-type-training',
    managerId: 'user-hr-recruiter',
    description: 'Comprehensive POS and customer service training for fashion retail staff.',
    status: ProjectStatus.COMPLETED,
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    actualStartDate: new Date('2024-01-15'),
    actualEndDate: new Date('2024-02-12'),
    estimateBudget: 8000,
    actualBudget: 7500,
    currency: 'USD' as Currency,
    completionPercentage: 100,
    members: ['user-hr-recruiter', 'user-pos-analyst'],
    tags: ['training', 'retail', 'completed'],
    customFields: {
      traineesCount: 8,
      certificationRate: 100,
      clientFeedback: 'Excellent'
    }
  },

  // Prospect Projects (Future/Potential)
  {
    id: 'project-hotel-chain-proposal',
    name: 'Nile Grand Hotels POS & Hospitality System',
    code: 'NH-HYBRID-2024-009',
    accountId: 'account-hotel-chain',
    projectTypeId: 'project-type-hybrid',
    managerId: 'user-senior-developer',
    description: 'Enterprise hospitality management system with POS, room management, and guest mobile app.',
    status: ProjectStatus.DRAFT,
    startDate: new Date('2024-04-01'),
    dueDate: new Date('2024-10-01'),
    estimateBudget: 350000,
    currency: 'USD' as Currency,
    completionPercentage: 0,
    members: ['user-senior-developer', 'user-manager-tech'],
    tags: ['hospitality', 'enterprise', 'proposal'],
    customFields: {
      proposalStatus: 'Under Review',
      estimatedROI: '18 months',
      competitorCount: 2
    }
  },

  // Cancelled/On-Hold Projects
  {
    id: 'project-cancelled-example',
    name: 'Cancelled Retail Project',
    code: 'CAN-2023-010',
    accountId: 'account-fashion-hub',
    projectTypeId: 'project-type-pos',
    managerId: 'user-pos-analyst',
    description: 'Project cancelled due to client budget constraints.',
    status: ProjectStatus.CANCELLED,
    startDate: new Date('2023-11-01'),
    dueDate: new Date('2024-01-31'),
    actualStartDate: new Date('2023-11-01'),
    estimateBudget: 25000,
    actualBudget: 5000,
    currency: 'USD' as Currency,
    completionPercentage: 20,
    members: ['user-pos-analyst'],
    tags: ['cancelled', 'budget-constraints'],
    customFields: {
      cancellationReason: 'Client budget constraints',
      workCompleted: 'Initial analysis only',
      refundAmount: 15000
    }
  }
];

// Sample phases for active projects
export const phases: Partial<Phase>[] = [
  // Golden Spoon POS Project phases
  {
    id: 'phase-gs-discovery',
    projectId: 'project-golden-spoon-pos',
    name: 'Discovery & Analysis',
    description: 'Requirements gathering and site analysis',
    startDate: new Date('2024-01-15'),
    dueDate: new Date('2024-01-29'),
    actualStartDate: new Date('2024-01-15'),
    actualEndDate: new Date('2024-01-28'),
    weight: 15,
    status: ProjectStatus.COMPLETED,
    completionPercentage: 100,
    order: 1
  },
  {
    id: 'phase-gs-config',
    projectId: 'project-golden-spoon-pos',
    name: 'System Configuration',
    description: 'Hardware setup and software configuration',
    startDate: new Date('2024-01-29'),
    dueDate: new Date('2024-02-19'),
    actualStartDate: new Date('2024-01-29'),
    weight: 25,
    status: ProjectStatus.COMPLETED,
    completionPercentage: 100,
    order: 2
  },
  {
    id: 'phase-gs-migration',
    projectId: 'project-golden-spoon-pos',
    name: 'Data Migration',
    description: 'Migrate existing data to new system',
    startDate: new Date('2024-02-19'),
    dueDate: new Date('2024-03-05'),
    actualStartDate: new Date('2024-02-19'),
    weight: 20,
    status: ProjectStatus.IN_PROGRESS,
    completionPercentage: 80,
    order: 3
  },
  {
    id: 'phase-gs-training',
    projectId: 'project-golden-spoon-pos',
    name: 'User Training',
    description: 'Train staff across all locations',
    startDate: new Date('2024-03-05'),
    dueDate: new Date('2024-03-26'),
    weight: 20,
    status: ProjectStatus.PLANNING,
    completionPercentage: 0,
    order: 4
  },
  {
    id: 'phase-gs-golive',
    projectId: 'project-golden-spoon-pos',
    name: 'Go-Live & Support',
    description: 'System deployment and initial support',
    startDate: new Date('2024-03-26'),
    dueDate: new Date('2024-04-15'),
    weight: 20,
    status: ProjectStatus.PLANNING,
    completionPercentage: 0,
    order: 5
  }
];

// Sample tasks for active projects
export const tasks: Partial<Task>[] = [
  // Golden Spoon tasks (current phase)
  {
    id: 'task-gs-data-extraction',
    projectId: 'project-golden-spoon-pos',
    phaseId: 'phase-gs-migration',
    title: 'Extract Menu Data from Existing System',
    description: 'Export current menu items, pricing, and categories from legacy system',
    status: TaskStatus.COMPLETED,
    priority: 3,
    assigneeId: 'user-pos-developer',
    startDate: new Date('2024-02-19'),
    dueDate: new Date('2024-02-23'),
    estimateHours: 12,
    spentHours: 10,
    remainingHours: 0,
    labels: ['data-migration', 'menu']
  },
  {
    id: 'task-gs-data-transform',
    projectId: 'project-golden-spoon-pos',
    phaseId: 'phase-gs-migration',
    title: 'Transform Customer Data Format',
    description: 'Clean and transform customer data to match new system schema',
    status: TaskStatus.IN_PROGRESS,
    priority: 4,
    assigneeId: 'user-pos-developer',
    startDate: new Date('2024-02-26'),
    dueDate: new Date('2024-03-01'),
    estimateHours: 16,
    spentHours: 8,
    remainingHours: 8,
    labels: ['data-migration', 'customers']
  },
  {
    id: 'task-gs-inventory-import',
    projectId: 'project-golden-spoon-pos',
    phaseId: 'phase-gs-migration',
    title: 'Import Inventory Data',
    description: 'Import ingredient and inventory data into new system',
    status: TaskStatus.TODO,
    priority: 3,
    assigneeId: 'user-pos-developer',
    startDate: new Date('2024-03-01'),
    dueDate: new Date('2024-03-05'),
    estimateHours: 8,
    spentHours: 0,
    remainingHours: 8,
    labels: ['data-migration', 'inventory']
  },

  // TechStore Mobile App tasks
  {
    id: 'task-ts-payment-integration',
    projectId: 'project-techstore-mobile',
    title: 'Integrate Payment Gateway',
    description: 'Implement Stripe and Paymob payment processing',
    status: TaskStatus.IN_PROGRESS,
    priority: 5,
    assigneeId: 'user-mobile-developer',
    reviewerId: 'user-senior-developer',
    startDate: new Date('2024-02-15'),
    dueDate: new Date('2024-03-01'),
    estimateHours: 24,
    spentHours: 16,
    remainingHours: 8,
    labels: ['payment', 'integration', 'critical']
  },
  {
    id: 'task-ts-push-notifications',
    projectId: 'project-techstore-mobile',
    title: 'Implement Push Notifications',
    description: 'Setup Firebase push notifications for order updates',
    status: TaskStatus.TODO,
    priority: 2,
    assigneeId: 'user-mobile-developer',
    startDate: new Date('2024-03-01'),
    dueDate: new Date('2024-03-08'),
    estimateHours: 12,
    spentHours: 0,
    remainingHours: 12,
    labels: ['notifications', 'firebase']
  },
  {
    id: 'task-ts-user-testing',
    projectId: 'project-techstore-mobile',
    title: 'User Acceptance Testing',
    description: 'Coordinate UAT with client team',
    status: TaskStatus.REVIEW,
    priority: 4,
    assigneeId: 'user-frontend-developer',
    reviewerId: 'user-mobile-developer',
    startDate: new Date('2024-02-20'),
    dueDate: new Date('2024-02-28'),
    estimateHours: 20,
    spentHours: 18,
    remainingHours: 2,
    labels: ['testing', 'uat', 'client']
  },

  // Support project tasks
  {
    id: 'task-dental-monthly-maintenance',
    projectId: 'project-dental-support',
    title: 'March Monthly Maintenance',
    description: 'Perform monthly system maintenance and updates',
    status: TaskStatus.TODO,
    priority: 3,
    assigneeId: 'user-support-tech',
    startDate: new Date('2024-03-01'),
    dueDate: new Date('2024-03-07'),
    estimateHours: 8,
    spentHours: 0,
    remainingHours: 8,
    labels: ['maintenance', 'monthly', 'routine']
  },
  {
    id: 'task-dental-network-upgrade',
    projectId: 'project-dental-support',
    title: 'Network Infrastructure Upgrade',
    description: 'Upgrade network switches and improve WiFi coverage',
    status: TaskStatus.BLOCKED,
    priority: 4,
    assigneeId: 'user-field-engineer',
    startDate: new Date('2024-02-15'),
    dueDate: new Date('2024-03-15'),
    estimateHours: 32,
    spentHours: 8,
    remainingHours: 24,
    labels: ['network', 'upgrade', 'infrastructure'],
    blockedBy: ['Equipment procurement pending']
  }
];
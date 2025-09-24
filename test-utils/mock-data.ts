import {
  User, Project, Task, Invoice, Payment, Timesheet, Account,
  Opportunity, Candidate, Course, Assignment, Ticket,
  ProjectStatus, TaskStatus, InvoiceStatus, PaymentStatus,
  PaymentMethod, TicketStatus, TicketPriority, CandidateStage,
  OpportunityStage, TimesheetStatus, AssignmentStatus, CourseAudience
} from '../src/types/models';

/**
 * Test data factory functions for MAS Business OS
 * Provides consistent, realistic test data for all test scenarios
 */

// Utility function to generate random IDs
const generateId = (prefix: string = 'test') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Date utilities
const today = new Date();
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

// ==================== USER FACTORY ====================

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: generateId('user'),
  email: 'user@mas.com',
  name: 'Test User',
  photoUrl: 'https://example.com/avatar.jpg',
  phoneNumber: '+1234567890',
  active: true,
  departmentId: 'dept-dev',
  title: 'Software Developer',
  startDate: lastWeek,
  timezone: 'UTC',
  language: 'en',
  portalAccess: {
    employee: true,
    client: [],
  },
  createdAt: lastWeek,
  updatedAt: today,
  createdBy: 'admin',
  updatedBy: 'admin',
  ...overrides,
});

export const createProjectManager = (): User => createMockUser({
  email: 'pm@mas.com',
  name: 'Project Manager',
  title: 'Project Manager',
  departmentId: 'dept-projects',
});

export const createEmployee = (): User => createMockUser({
  email: 'employee@mas.com',
  name: 'John Employee',
  title: 'Software Developer',
  employeeId: 'EMP001',
});

export const createClient = (): User => createMockUser({
  email: 'client@clientcompany.com',
  name: 'Client User',
  title: 'IT Director',
  portalAccess: {
    employee: false,
    client: ['account-client'],
  },
});

export const createFinanceUser = (): User => createMockUser({
  email: 'finance@mas.com',
  name: 'Finance Manager',
  title: 'Finance Manager',
  departmentId: 'dept-finance',
});

export const createSalesRep = (): User => createMockUser({
  email: 'sales@mas.com',
  name: 'Sales Representative',
  title: 'Senior Sales Rep',
  departmentId: 'dept-sales',
});

export const createAdmin = (): User => createMockUser({
  email: 'admin@mas.com',
  name: 'System Administrator',
  title: 'System Administrator',
  departmentId: 'dept-it',
});

// ==================== ACCOUNT FACTORY ====================

export const createMockAccount = (overrides: Partial<Account> = {}): Account => ({
  id: generateId('account'),
  name: 'Test Client Company',
  type: 'customer',
  tier: 'gold',
  industry: 'Retail',
  website: 'https://testclient.com',
  phoneNumber: '+1987654321',
  email: 'contact@testclient.com',
  address: {
    billing: {
      street: '123 Business St',
      city: 'Business City',
      state: 'NY',
      country: 'USA',
      postalCode: '12345',
    },
  },
  creditLimit: 100000,
  paymentTerms: 30,
  createdAt: lastWeek,
  updatedAt: today,
  createdBy: 'sales-1',
  updatedBy: 'sales-1',
  ...overrides,
});

// ==================== PROJECT FACTORY ====================

export const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: generateId('proj'),
  name: 'Test Project',
  code: 'TEST-2024-001',
  accountId: 'account-client',
  projectTypeId: 'type-pos',
  managerId: 'pm-1',
  description: 'Test project description',
  status: ProjectStatus.IN_PROGRESS,
  startDate: today,
  dueDate: nextMonth,
  actualStartDate: today,
  estimateBudget: 50000,
  actualBudget: 25000,
  currency: 'USD',
  completionPercentage: 50,
  members: ['pm-1', 'dev-1', 'dev-2'],
  tags: ['test', 'development'],
  createdAt: lastWeek,
  updatedAt: today,
  createdBy: 'sales-1',
  updatedBy: 'pm-1',
  ...overrides,
});

export const createPOSProject = (): Project => createMockProject({
  name: 'POS System Development',
  code: 'POS-2024-001',
  projectTypeId: 'type-pos',
  tags: ['pos', 'retail', 'urgent'],
  estimateBudget: 75000,
});

export const createMobileAppProject = (): Project => createMockProject({
  name: 'Mobile App Development',
  code: 'MOB-2024-001',
  projectTypeId: 'type-mobile',
  tags: ['mobile', 'ios', 'android'],
  estimateBudget: 100000,
});

// ==================== TASK FACTORY ====================

export const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: generateId('task'),
  projectId: 'proj-1',
  title: 'Test Task',
  description: 'Test task description',
  status: TaskStatus.TODO,
  priority: 2,
  assigneeId: 'dev-1',
  dueDate: nextWeek,
  estimateHours: 8,
  spentHours: 0,
  remainingHours: 8,
  labels: ['development'],
  createdAt: today,
  updatedAt: today,
  createdBy: 'pm-1',
  updatedBy: 'pm-1',
  ...overrides,
});

export const createClientTask = (): Task => createMockTask({
  title: 'Client Review Required',
  description: 'Review and approve design mockups',
  assigneeId: 'client-1',
  priority: 1,
  estimateHours: 2,
  labels: ['review', 'client'],
});

// ==================== TIMESHEET FACTORY ====================

export const createMockTimesheet = (overrides: Partial<Timesheet> = {}): Timesheet => ({
  id: generateId('ts'),
  userId: 'emp-1',
  projectId: 'proj-1',
  taskId: 'task-1',
  date: today,
  hours: 8,
  billable: true,
  description: 'Worked on development tasks',
  status: TimesheetStatus.SUBMITTED,
  createdAt: today,
  updatedAt: today,
  createdBy: 'emp-1',
  updatedBy: 'emp-1',
  ...overrides,
});

export const createApprovedTimesheet = (): Timesheet => createMockTimesheet({
  status: TimesheetStatus.APPROVED,
  approvedBy: 'mgr-1',
  approvedAt: today,
});

// ==================== INVOICE FACTORY ====================

export const createMockInvoice = (overrides: Partial<Invoice> = {}): Invoice => ({
  id: generateId('inv'),
  invoiceNumber: 'INV-2024-001',
  accountId: 'account-client',
  type: 'milestone',
  status: InvoiceStatus.SENT,
  issueDate: today,
  dueDate: nextMonth,
  currency: 'USD',
  subtotal: 5000,
  tax: 500,
  total: 5500,
  paidAmount: 0,
  balanceDue: 5500,
  terms: 'Payment due within 30 days',
  lineItems: [{
    itemType: 'service',
    name: 'Development Services',
    description: 'Software development work',
    quantity: 1,
    unitPrice: 5000,
    lineTotal: 5000,
  }],
  createdAt: today,
  updatedAt: today,
  createdBy: 'finance-1',
  updatedBy: 'finance-1',
  ...overrides,
});

export const createPaidInvoice = (): Invoice => createMockInvoice({
  status: InvoiceStatus.PAID,
  paidAmount: 5500,
  balanceDue: 0,
});

// ==================== PAYMENT FACTORY ====================

export const createMockPayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: generateId('pay'),
  paymentNumber: 'PAY-2024-001',
  invoiceId: 'inv-1',
  accountId: 'account-client',
  amount: 5500,
  currency: 'USD',
  status: PaymentStatus.COMPLETED,
  method: PaymentMethod.STRIPE,
  paidAt: today,
  reference: 'stripe_pi_123',
  gatewayTransactionId: 'pi_stripe_123',
  receiptUrl: 'https://stripe.com/receipt/123',
  createdAt: today,
  updatedAt: today,
  createdBy: 'client-1',
  updatedBy: 'system',
  ...overrides,
});

export const createStripePayment = (): Payment => createMockPayment({
  method: PaymentMethod.STRIPE,
  gatewayTransactionId: 'pi_stripe_123',
  receiptUrl: 'https://stripe.com/receipt/123',
});

export const createPaymobPayment = (): Payment => createMockPayment({
  method: PaymentMethod.PAYMOB,
  gatewayTransactionId: 'paymob_txn_456',
  gatewayResponse: {
    payment_id: 'paymob_payment_123',
    order_id: 'order_456',
  },
});

// ==================== CRM FACTORY ====================

export const createMockOpportunity = (overrides: Partial<Opportunity> = {}): Opportunity => ({
  id: generateId('opp'),
  accountId: 'account-prospect',
  name: 'POS System Opportunity',
  stage: OpportunityStage.PROPOSAL,
  amount: 75000,
  currency: 'USD',
  probability: 75,
  expectedClose: nextMonth,
  ownerId: 'sales-1',
  source: 'Website',
  notes: 'Client interested in complete POS solution',
  createdAt: lastWeek,
  updatedAt: today,
  createdBy: 'sales-1',
  updatedBy: 'sales-1',
  ...overrides,
});

export const createWonDeal = (): Opportunity => createMockOpportunity({
  stage: OpportunityStage.WON,
  actualClose: today,
  probability: 100,
});

// ==================== HR FACTORY ====================

export const createMockCandidate = (overrides: Partial<Candidate> = {}): Candidate => ({
  id: generateId('cand'),
  name: 'Test Candidate',
  email: 'candidate@example.com',
  phoneNumber: '+1555123456',
  stage: CandidateStage.APPLIED,
  position: 'Software Developer',
  department: 'Development',
  source: 'LinkedIn',
  expectedSalary: 60000,
  noticePeriod: 30,
  skills: ['JavaScript', 'React', 'Node.js'],
  experience: 3,
  createdAt: lastWeek,
  updatedAt: today,
  createdBy: 'hr-1',
  updatedBy: 'hr-1',
  ...overrides,
});

export const createShortlistedCandidate = (): Candidate => createMockCandidate({
  stage: CandidateStage.SHORTLIST,
  portalInviteId: 'invite-123',
});

// ==================== LMS FACTORY ====================

export const createMockCourse = (overrides: Partial<Course> = {}): Course => ({
  id: generateId('course'),
  title: 'Test Course',
  description: 'Test course description',
  audience: CourseAudience.EMPLOYEE,
  duration: 40, // 40 hours
  thumbnail: 'https://example.com/course-thumbnail.jpg',
  active: true,
  passingScore: 80,
  tags: ['training', 'development'],
  createdAt: lastWeek,
  updatedAt: today,
  createdBy: 'hr-1',
  updatedBy: 'hr-1',
  ...overrides,
});

export const createEmployeeTrainingCourse = (): Course => createMockCourse({
  title: 'Employee Onboarding',
  audience: CourseAudience.EMPLOYEE,
  duration: 20,
});

export const createCandidateTrainingCourse = (): Course => createMockCourse({
  title: 'Pre-hire Assessment',
  audience: CourseAudience.CANDIDATE,
  duration: 10,
});

export const createClientTrainingCourse = (): Course => createMockCourse({
  title: 'POS System Training',
  audience: CourseAudience.CLIENT,
  productId: 'prod-pos',
  duration: 15,
});

export const createMockAssignment = (overrides: Partial<Assignment> = {}): Assignment => ({
  id: generateId('assign'),
  courseId: 'course-1',
  userId: 'emp-1',
  assignedBy: 'hr-1',
  dueDate: nextWeek,
  status: AssignmentStatus.NOT_STARTED,
  progressPct: 0,
  createdAt: today,
  updatedAt: today,
  createdBy: 'hr-1',
  updatedBy: 'hr-1',
  ...overrides,
});

// ==================== SUPPORT FACTORY ====================

export const createMockTicket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: generateId('ticket'),
  ticketNumber: 'TKT-2024-001',
  accountId: 'account-client',
  subject: 'Test Support Ticket',
  description: 'Test ticket description',
  status: TicketStatus.NEW,
  priority: TicketPriority.MEDIUM,
  category: 'Technical',
  slaBreached: false,
  createdAt: today,
  updatedAt: today,
  createdBy: 'client-1',
  updatedBy: 'client-1',
  ...overrides,
});

export const createUrgentTicket = (): Ticket => createMockTicket({
  subject: 'System Down - Urgent',
  priority: TicketPriority.CRITICAL,
  assigneeId: 'support-1',
});

// ==================== BATCH FACTORY FUNCTIONS ====================

export const createMockDataSet = () => ({
  users: {
    projectManager: createProjectManager(),
    employee: createEmployee(),
    client: createClient(),
    financeUser: createFinanceUser(),
    salesRep: createSalesRep(),
    admin: createAdmin(),
  },
  accounts: {
    client: createMockAccount(),
  },
  projects: {
    posProject: createPOSProject(),
    mobileProject: createMobileAppProject(),
  },
  tasks: [
    createMockTask(),
    createClientTask(),
  ],
  timesheets: [
    createMockTimesheet(),
    createApprovedTimesheet(),
  ],
  invoices: [
    createMockInvoice(),
    createPaidInvoice(),
  ],
  payments: [
    createStripePayment(),
    createPaymobPayment(),
  ],
  opportunities: [
    createMockOpportunity(),
    createWonDeal(),
  ],
  candidates: [
    createMockCandidate(),
    createShortlistedCandidate(),
  ],
  courses: [
    createEmployeeTrainingCourse(),
    createCandidateTrainingCourse(),
    createClientTrainingCourse(),
  ],
  assignments: [
    createMockAssignment(),
  ],
  tickets: [
    createMockTicket(),
    createUrgentTicket(),
  ],
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate multiple instances of any factory function
 */
export const createMultiple = <T>(factory: () => T, count: number): T[] => {
  return Array.from({ length: count }, factory);
};

/**
 * Create a test scenario with related data
 */
export const createProjectScenario = () => {
  const client = createClient();
  const projectManager = createProjectManager();
  const employee = createEmployee();
  const account = createMockAccount({ id: client.portalAccess.client![0] });
  const project = createPOSProject({
    accountId: account.id,
    managerId: projectManager.id,
    members: [projectManager.id, employee.id],
  });
  const tasks = [
    createMockTask({
      projectId: project.id,
      assigneeId: employee.id,
    }),
    createClientTask({
      projectId: project.id,
      assigneeId: client.id,
    }),
  ];
  const invoice = createMockInvoice({
    accountId: account.id,
    projectId: project.id,
  });

  return {
    client,
    projectManager,
    employee,
    account,
    project,
    tasks,
    invoice,
  };
};

/**
 * Create a payment flow scenario
 */
export const createPaymentScenario = () => {
  const scenario = createProjectScenario();
  const payment = createStripePayment({
    invoiceId: scenario.invoice.id,
    accountId: scenario.account.id,
  });

  return {
    ...scenario,
    payment,
  };
};

/**
 * Create a candidate hiring scenario
 */
export const createHiringScenario = () => {
  const candidate = createShortlistedCandidate();
  const course = createCandidateTrainingCourse();
  const assignment = createMockAssignment({
    courseId: course.id,
    candidateId: candidate.id,
  });

  return {
    candidate,
    course,
    assignment,
  };
};

// Export default dataset for quick testing
export const defaultMockData = createMockDataSet();
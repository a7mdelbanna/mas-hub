// ============================================
// Core Types and Enums
// ============================================

export type Currency = 'USD' | 'EGP' | 'EUR' | 'GBP' | 'AED';
export type Language = 'en' | 'ar' | 'ru';
export type PortalType = 'admin' | 'employee' | 'client' | 'candidate';

export const ProjectStatus = {
  DRAFT: 'draft',
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const

export const TaskStatus = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  BLOCKED: 'blocked',
  COMPLETED: 'completed'
} as const

export const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  VIEWED: 'viewed',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const

export const PaymentMethod = {
  STRIPE: 'stripe',
  PAYMOB: 'paymob',
  INSTAPAY: 'instapay',
  VODAFONE_CASH: 'vodafone_cash',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash'
} as const

export const TicketStatus = {
  NEW: 'new',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  WAITING_CUSTOMER: 'waiting_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
} as const

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const

export const CandidateStage = {
  APPLIED: 'applied',
  SHORTLIST: 'shortlist',
  INVITED: 'invited',
  TRAINING: 'training',
  INTERVIEW: 'interview',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected'
} as const

export const OpportunityStage = {
  LEAD: 'lead',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost'
} as const

export const TransactionType = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer'
} as const

export const TimesheetStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const ContractStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  RENEWED: 'renewed',
  TERMINATED: 'terminated'
} as const

export const AssetStatus = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  RETIRED: 'retired',
  DISPOSED: 'disposed'
} as const

export const CourseAudience = {
  EMPLOYEE: 'employee',
  CANDIDATE: 'candidate',
  CLIENT: 'client',
  MIXED: 'mixed'
} as const

export const AssignmentStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
} as const

// Type aliases for const objects
export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];
export type InvoiceStatus = typeof InvoiceStatus[keyof typeof InvoiceStatus];
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];
export type TicketPriority = typeof TicketPriority[keyof typeof TicketPriority];
export type CandidateStage = typeof CandidateStage[keyof typeof CandidateStage];
export type OpportunityStage = typeof OpportunityStage[keyof typeof OpportunityStage];
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];
export type TimesheetStatus = typeof TimesheetStatus[keyof typeof TimesheetStatus];
export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];
export type AssetStatus = typeof AssetStatus[keyof typeof AssetStatus];
export type CourseAudience = typeof CourseAudience[keyof typeof CourseAudience];
export type AssignmentStatus = typeof AssignmentStatus[keyof typeof AssignmentStatus];

// ============================================
// Base Interfaces
// ============================================

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  deletedBy?: string;
}

// ============================================
// Organization & Settings
// ============================================

export interface Organization extends BaseEntity {
  name: string;
  logo?: string;
  website?: string;
  baseCurrency: Currency;
  timezone: string;
  languages: Language[];
  defaultLanguage: Language;
  fiscalYearStart: number; // Month (1-12)
  taxId?: string;
  registrationNumber?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
}

export interface Settings extends BaseEntity {
  organizationId: string;
  modules: {
    projects: boolean;
    finance: boolean;
    crm: boolean;
    support: boolean;
    lms: boolean;
    hr: boolean;
    assets: boolean;
    portals: boolean;
    automations: boolean;
  };
  features: {
    multiCurrency: boolean;
    multiLanguage: boolean;
    approvalWorkflows: boolean;
    customFields: boolean;
    voipIntegration: boolean;
    eSignature: boolean;
  };
  integrations: {
    stripe?: {
      enabled: boolean;
      publicKey?: string;
    };
    paymob?: {
      enabled: boolean;
      merchantId?: string;
    };
    slack?: {
      enabled: boolean;
      webhookUrl?: string;
    };
    github?: {
      enabled: boolean;
      organization?: string;
    };
  };
}

export interface CustomField extends BaseEntity {
  entityType: string; // 'project' | 'account' | 'invoice' etc.
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect';
  label: string;
  required: boolean;
  options?: string[]; // For select/multiselect
  defaultValue?: any;
  visible: boolean;
  order: number;
}

// ============================================
// Identity & Access
// ============================================

export interface User extends SoftDeleteEntity {
  email: string;
  name: string;
  photoUrl?: string;
  phoneNumber?: string;
  active: boolean;
  departmentId?: string;
  managerId?: string;
  employeeId?: string;
  title?: string;
  startDate?: Date;
  endDate?: Date;
  timezone?: string;
  language: Language;
  portalAccess: {
    employee: boolean;
    client?: string[]; // Array of accountIds
  };
}

export interface Role extends BaseEntity {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean; // Cannot be deleted if true
}

export interface Permission {
  resource: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
  scope?: 'own' | 'department' | 'all';
}

export interface Department extends BaseEntity {
  name: string;
  code: string;
  managerId?: string;
  parentId?: string; // For hierarchical departments
  active: boolean;
}

export interface UserRole extends BaseEntity {
  userId: string;
  roleId: string;
  assignedBy: string;
  expiresAt?: Date;
}

// ============================================
// Projects & Tasks
// ============================================

export interface ProjectType extends BaseEntity {
  name: string;
  code: string;
  defaultTemplateId?: string;
  defaultPricebookId?: string;
  defaultDuration?: number; // in days
  active: boolean;
}

export interface ProjectTemplate extends BaseEntity {
  name: string;
  projectTypeId: string;
  phases: {
    name: string;
    duration: number; // in days
    weight: number; // percentage
    defaultTasks: {
      title: string;
      description?: string;
      estimateHours?: number;
    }[];
  }[];
}

export interface Project extends SoftDeleteEntity {
  name: string;
  code: string;
  accountId: string;
  projectTypeId: string;
  managerId: string;
  description?: string;
  status: ProjectStatus;
  startDate: Date;
  dueDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimateBudget: number;
  actualBudget?: number;
  currency: Currency;
  completionPercentage: number;
  members: string[]; // User IDs
  tags?: string[];
  customFields?: Record<string, any>;
  // TODO[PRD]: Add risk assessment fields
  // TODO[PRD]: Add resource capacity tracking
}

export interface Phase extends BaseEntity {
  projectId: string;
  name: string;
  description?: string;
  startDate: Date;
  dueDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  weight: number; // Percentage of project
  status: ProjectStatus;
  completionPercentage: number;
  order: number;
}

export interface Task extends SoftDeleteEntity {
  projectId: string;
  phaseId?: string;
  parentTaskId?: string; // For subtasks
  title: string;
  description?: string;
  status: TaskStatus;
  priority: number; // 1-5
  assigneeId?: string;
  reviewerId?: string;
  startDate?: Date;
  dueDate?: Date;
  estimateHours?: number;
  spentHours?: number;
  remainingHours?: number;
  labels?: string[];
  attachments?: string[];
  blockedBy?: string[]; // Task IDs
  customFields?: Record<string, any>;
}

export interface Timesheet extends BaseEntity {
  userId: string;
  projectId: string;
  taskId?: string;
  date: Date;
  hours: number;
  billable: boolean;
  description?: string;
  status: TimesheetStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  rate?: number; // Hourly rate for billing
}

// ============================================
// CRM & Sales
// ============================================

export interface Account extends SoftDeleteEntity {
  name: string;
  type: 'prospect' | 'customer' | 'partner' | 'vendor';
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  industry?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  taxId?: string;
  registrationNumber?: string;
  assignedTo?: string; // Sales rep
  address: {
    billing?: {
      street?: string;
      city?: string;
      state?: string;
      country: string;
      postalCode?: string;
    };
    shipping?: {
      street?: string;
      city?: string;
      state?: string;
      country: string;
      postalCode?: string;
    };
  };
  creditLimit?: number;
  paymentTerms?: number; // Days
  customFields?: Record<string, any>;
}

export interface Opportunity extends SoftDeleteEntity {
  accountId: string;
  name: string;
  stage: OpportunityStage;
  amount: number;
  currency: Currency;
  probability: number; // 0-100
  expectedClose: Date;
  actualClose?: Date;
  ownerId: string;
  source?: string;
  campaignId?: string;
  competitorNames?: string[];
  notes?: string;
  lostReason?: string;
  customFields?: Record<string, any>;
}

export interface Quote extends SoftDeleteEntity {
  opportunityId?: string;
  accountId: string;
  quoteNumber: string;
  pricebookId?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  validFrom: Date;
  validUntil: Date;
  currency: Currency;
  subtotal: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax: number;
  total: number;
  terms?: string;
  notes?: string;
  lineItems: QuoteLineItem[];
  customFields?: Record<string, any>;
}

export interface QuoteLineItem {
  itemId: string;
  itemType: 'product' | 'service' | 'bundle';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  lineTotal: number;
}

// ============================================
// Finance & Billing
// ============================================

export interface Contract extends SoftDeleteEntity {
  accountId: string;
  contractNumber: string;
  title: string;
  type: 'one-time' | 'recurring' | 'retainer';
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  renewalTermMonths?: number;
  value: number;
  currency: Currency;
  billingFrequency?: 'monthly' | 'quarterly' | 'annually';
  paymentTerms?: number; // Days
  slaPolicyId?: string;
  signedDate?: Date;
  signedBy?: string;
  attachments?: string[];
  entitlements?: {
    supportHours?: number;
    includedProducts?: string[];
    includedServices?: string[];
  };
  customFields?: Record<string, any>;
}

export interface Invoice extends SoftDeleteEntity {
  invoiceNumber: string;
  accountId: string;
  contractId?: string;
  projectId?: string;
  type: 'one-time' | 'milestone' | 'recurring';
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  currency: Currency;
  subtotal: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  terms?: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
  attachments?: string[];
  customFields?: Record<string, any>;
}

export interface InvoiceLineItem {
  itemId?: string;
  itemType: 'product' | 'service' | 'timesheet' | 'expense' | 'other';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  tax?: number;
  lineTotal: number;
}

export interface Payment extends BaseEntity {
  paymentNumber: string;
  invoiceId?: string;
  accountId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  method: PaymentMethod;
  paidAt?: Date;
  reference?: string;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  receiptUrl?: string;
  notes?: string;
}

export interface FinAccount extends BaseEntity {
  name: string;
  type: 'bank' | 'cash' | 'digital_wallet' | 'revenue' | 'expense' | 'asset' | 'liability';
  accountNumber?: string;
  currency: Currency;
  balance: number;
  bankName?: string;
  active: boolean;
}

export interface Transaction extends BaseEntity {
  transactionNumber: string;
  finAccountId: string;
  projectId?: string;
  type: TransactionType;
  category?: string;
  date: Date;
  amount: number;
  currency: Currency;
  description?: string;
  reference?: string;
  reconciled: boolean;
  reconciledAt?: Date;
  attachments?: string[];
}

// ============================================
// Support & Tickets
// ============================================

export interface Ticket extends SoftDeleteEntity {
  ticketNumber: string;
  accountId: string;
  projectId?: string;
  assetId?: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  assigneeId?: string;
  slaPolicyId?: string;
  slaBreached: boolean;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  rating?: number;
  feedback?: string;
  customFields?: Record<string, any>;
}

export interface TicketComment extends BaseEntity {
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  attachments?: string[];
}

export interface Visit extends BaseEntity {
  ticketId: string;
  clientSiteId?: string;
  scheduledAt: Date;
  assigneeId: string;
  duration?: number; // in hours
  billable: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  signature?: string; // Base64 image
}

export interface SLAPolicy extends BaseEntity {
  name: string;
  description?: string;
  active: boolean;
  targets: {
    priority: TicketPriority;
    firstResponseTime: number; // in minutes
    resolutionTime: number; // in minutes
    businessHours: boolean;
  }[];
  escalationRules?: {
    condition: string;
    action: string;
    notifyUsers: string[];
  }[];
}

// ============================================
// Learning Management System
// ============================================

export interface Course extends SoftDeleteEntity {
  title: string;
  description?: string;
  audience: CourseAudience;
  duration?: number; // in hours
  thumbnail?: string;
  active: boolean;
  productId?: string; // For product-specific training
  certificateTemplateId?: string;
  passingScore?: number; // Percentage
  tags?: string[];
}

export interface Lesson extends BaseEntity {
  courseId: string;
  title: string;
  description?: string;
  type: 'video' | 'document' | 'article' | 'interactive';
  content?: string; // For articles
  url?: string; // For videos/documents
  duration?: number; // in minutes
  order: number;
  required: boolean;
}

export interface Quiz extends BaseEntity {
  lessonId?: string;
  courseId?: string;
  title: string;
  description?: string;
  timeLimit?: number; // in minutes
  attempts?: number; // Max attempts allowed
  questions: Question[];
  randomizeQuestions: boolean;
  showResults: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | string[] | boolean;
  points: number;
  explanation?: string;
}

export interface Assignment extends BaseEntity {
  courseId: string;
  userId?: string;
  candidateId?: string;
  accountId?: string; // For client training
  assignedBy: string;
  dueDate?: Date;
  status: AssignmentStatus;
  startedAt?: Date;
  completedAt?: Date;
  progressPct: number;
  score?: number;
  certificate?: string; // URL to certificate
  lastActivity?: Date;
  lessonProgress?: {
    lessonId: string;
    completed: boolean;
    completedAt?: Date;
  }[];
  quizAttempts?: {
    quizId: string;
    attemptNumber: number;
    score: number;
    submittedAt: Date;
    answers: Record<string, any>;
  }[];
}

// ============================================
// Human Resources
// ============================================

export interface Candidate extends SoftDeleteEntity {
  name: string;
  email: string;
  phoneNumber?: string;
  stage: CandidateStage;
  position: string;
  department?: string;
  source?: string;
  cvUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  expectedSalary?: number;
  noticePeriod?: number; // in days
  skills?: string[];
  experience?: number; // in years
  referredBy?: string;
  portalInviteId?: string;
  notes?: string;
  customFields?: Record<string, any>;
}

export interface Interview extends BaseEntity {
  candidateId: string;
  type: 'phone' | 'technical' | 'hr' | 'final' | 'assessment';
  scheduledAt: Date;
  duration?: number; // in minutes
  interviewers: string[];
  location?: string;
  meetingUrl?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  result?: 'pass' | 'fail' | 'pending';
  feedback?: string;
  rating?: number; // 1-5
  notes?: string;
}

export interface OnboardingTemplate extends BaseEntity {
  name: string;
  department?: string;
  position?: string;
  tasks: {
    title: string;
    description?: string;
    category: 'documentation' | 'training' | 'access' | 'equipment' | 'meeting';
    assigneeRole?: string;
    daysFromStart: number; // When to assign relative to start date
    required: boolean;
  }[];
  active: boolean;
}

export interface OnboardingTask extends BaseEntity {
  userId: string;
  templateId?: string;
  title: string;
  description?: string;
  category: string;
  assigneeId?: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
}

// ============================================
// Assets & Inventory
// ============================================

export interface Product extends SoftDeleteEntity {
  sku: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  trackStock: boolean;
  minimumStock?: number;
  unit?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
  imageUrl?: string;
  warrantyPeriod?: number; // in months
  active: boolean;
  customFields?: Record<string, any>;
}

export interface Service extends SoftDeleteEntity {
  code: string;
  name: string;
  description?: string;
  category?: string;
  fixedFee: boolean;
  defaultFee?: number;
  unit?: string; // 'hour' | 'day' | 'month' | 'unit'
  slaPolicyId?: string;
  active: boolean;
  customFields?: Record<string, any>;
}

export interface Bundle extends BaseEntity {
  name: string;
  description?: string;
  pricebookId?: string;
  bundlePrice?: number;
  active: boolean;
  components: {
    itemId: string;
    itemType: 'product' | 'service';
    quantity: number;
  }[];
}

export interface Pricebook extends BaseEntity {
  name: string;
  description?: string;
  currency: Currency;
  validFrom: Date;
  validTo?: Date;
  region?: string;
  isDefault: boolean;
  active: boolean;
}

export interface PricebookEntry extends BaseEntity {
  pricebookId: string;
  itemId: string;
  itemType: 'product' | 'service' | 'bundle';
  unitPrice: number;
  minQuantity?: number;
  maxQuantity?: number;
  taxClass?: string;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}

export interface Inventory extends BaseEntity {
  productId: string;
  location?: string;
  quantity: number;
  reservedQuantity?: number;
  availableQuantity?: number;
  unitCost?: number;
  lastRestockedAt?: Date;
  serialNumbers?: string[];
  batchNumber?: string;
  expiryDate?: Date;
}

export interface ClientSite extends SoftDeleteEntity {
  accountId: string;
  name: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
  timezone?: string;
  accessInstructions?: string;
  active: boolean;
}

export interface InstalledAsset extends BaseEntity {
  clientSiteId: string;
  accountId: string;
  productId: string;
  serialNumber?: string;
  installDate: Date;
  warrantyEnd?: Date;
  status: AssetStatus;
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  notes?: string;
  customFields?: Record<string, any>;
}

// ============================================
// Automations & Workflows
// ============================================

export interface AutomationRule extends BaseEntity {
  name: string;
  description?: string;
  triggerType: 'event' | 'schedule' | 'webhook';
  trigger: {
    event?: string; // e.g., 'invoice.overdue'
    schedule?: string; // Cron expression
    webhookUrl?: string;
  };
  conditions?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
  actions: {
    type: 'create_task' | 'send_email' | 'update_field' | 'trigger_workflow' | 'webhook';
    config: Record<string, any>;
  }[];
  active: boolean;
  priority: number;
  lastTriggeredAt?: Date;
  triggerCount: number;
}

export interface ApprovalChain extends BaseEntity {
  name: string;
  entityType: string; // 'invoice' | 'quote' | 'expense' | 'timesheet'
  steps: {
    order: number;
    approverType: 'user' | 'role' | 'manager';
    approverId?: string;
    roleId?: string;
    threshold?: number; // Amount threshold
    autoApprove?: boolean;
    autoApproveConditions?: Record<string, any>;
  }[];
  active: boolean;
}

// ============================================
// Portal Management
// ============================================

export interface PortalInvite extends BaseEntity {
  email: string;
  portalType: PortalType;
  accountId?: string; // For client portal
  candidateId?: string; // For candidate portal
  userId?: string; // For employee portal
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  acceptedAt?: Date;
  customMessage?: string;
}

export interface Announcement extends BaseEntity {
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  targetAudience: ('all' | 'employees' | 'clients' | 'candidates' | string)[]; // Can include specific accountIds
  publishedAt?: Date;
  expiresAt?: Date;
  pinned: boolean;
  attachments?: string[];
}

// ============================================
// Audit & Logging
// ============================================

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// ============================================
// Notifications
// ============================================

export interface Notification extends BaseEntity {
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'task' | 'mention';
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: Date;
  emailSent: boolean;
  pushSent: boolean;
  metadata?: Record<string, any>;
}

// ============================================
// Utility Types
// ============================================

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type WithSoftDelete<T> = T & {
  deletedAt?: Date;
  deletedBy?: string;
};

export type WithCustomFields<T> = T & {
  customFields?: Record<string, any>;
};

export type PartialUpdate<T> = Partial<Omit<T, 'id' | 'createdAt' | 'createdBy'>>;

export type CreateInput<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>;

export type UpdateInput<T extends BaseEntity> = PartialUpdate<T>;
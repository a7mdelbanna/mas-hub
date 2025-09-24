import {
  collection,
  doc,
  CollectionReference,
  DocumentReference,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  DocumentData,
  serverTimestamp,
  FieldValue
} from 'firebase/firestore';
import { db } from './config';
import type {
  Organization,
  Settings,
  CustomField,
  User,
  Role,
  Department,
  UserRole,
  Project,
  Phase,
  Task,
  Timesheet,
  Account,
  Opportunity,
  Quote,
  Contract,
  Invoice,
  Payment,
  FinAccount,
  Transaction,
  Ticket,
  TicketComment,
  Visit,
  SLAPolicy,
  Course,
  Lesson,
  Quiz,
  Assignment,
  Candidate,
  Interview,
  OnboardingTemplate,
  OnboardingTask,
  Product,
  Service,
  Bundle,
  Pricebook,
  PricebookEntry,
  Inventory,
  ClientSite,
  InstalledAsset,
  AutomationRule,
  ApprovalChain,
  PortalInvite,
  Announcement,
  AuditLog,
  Notification,
  ProjectType,
  ProjectTemplate
} from '@/types/models';

// ============================================
// Collection Names
// ============================================

export const COLLECTIONS = {
  // Organization & Settings
  ORGANIZATIONS: 'organizations',
  SETTINGS: 'settings',
  CUSTOM_FIELDS: 'customFields',

  // Identity & Access
  USERS: 'users',
  ROLES: 'roles',
  DEPARTMENTS: 'departments',
  USER_ROLES: 'userRoles',

  // Projects
  PROJECT_TYPES: 'projectTypes',
  PROJECT_TEMPLATES: 'projectTemplates',
  PROJECTS: 'projects',
  PHASES: 'phases',
  TASKS: 'tasks',
  TIMESHEETS: 'timesheets',

  // CRM
  ACCOUNTS: 'accounts',
  OPPORTUNITIES: 'opportunities',
  QUOTES: 'quotes',

  // Finance
  CONTRACTS: 'contracts',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  FIN_ACCOUNTS: 'finAccounts',
  TRANSACTIONS: 'transactions',

  // Support
  TICKETS: 'tickets',
  TICKET_COMMENTS: 'comments',
  VISITS: 'visits',
  SLA_POLICIES: 'slaPolicies',

  // LMS
  COURSES: 'courses',
  LESSONS: 'lessons',
  QUIZZES: 'quizzes',
  ASSIGNMENTS: 'assignments',

  // HR
  CANDIDATES: 'candidates',
  INTERVIEWS: 'interviews',
  ONBOARDING_TEMPLATES: 'onboardingTemplates',
  ONBOARDING_TASKS: 'onboardingTasks',

  // Catalog & Assets
  PRODUCTS: 'products',
  SERVICES: 'services',
  BUNDLES: 'bundles',
  PRICEBOOKS: 'pricebooks',
  PRICEBOOK_ENTRIES: 'entries',
  INVENTORY: 'inventory',
  CLIENT_SITES: 'clientSites',
  INSTALLED_ASSETS: 'installedAssets',

  // Automation
  AUTOMATION_RULES: 'automationRules',
  APPROVAL_CHAINS: 'approvalChains',

  // Portal
  PORTAL_INVITES: 'portalInvites',
  ANNOUNCEMENTS: 'announcements',

  // System
  AUDIT_LOGS: 'auditLogs',
  NOTIFICATIONS: 'notifications',
} as const;

// ============================================
// Type Converters
// ============================================

/**
 * Base converter with automatic timestamp handling
 */
function createConverter<T extends { id?: string }>(
  fromFirestore: (data: DocumentData) => Omit<T, 'id'>,
  toFirestore: (data: WithFieldValue<T>) => DocumentData = (data) => data as DocumentData
): FirestoreDataConverter<T> {
  return {
    toFirestore: (data: WithFieldValue<T>): DocumentData => {
      const { id, ...rest } = data as any;
      const firestoreData = toFirestore(data);

      // Add server timestamps for new documents
      if (!firestoreData.createdAt) {
        firestoreData.createdAt = serverTimestamp();
      }
      firestoreData.updatedAt = serverTimestamp();

      return firestoreData;
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T => {
      const data = snapshot.data(options);
      const converted = fromFirestore(data);
      return {
        id: snapshot.id,
        ...converted,
      } as T;
    },
  };
}

/**
 * Date field converter helper
 */
function convertDateFields<T>(data: DocumentData, dateFields: string[]): T {
  const converted = { ...data };
  dateFields.forEach(field => {
    if (converted[field]?.toDate) {
      converted[field] = converted[field].toDate();
    }
  });
  return converted as T;
}

// ============================================
// Collection References with Type Safety
// ============================================

// Organization & Settings
export const organizationsCollection = () =>
  collection(db, COLLECTIONS.ORGANIZATIONS).withConverter(
    createConverter<Organization>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const settingsCollection = (orgId: string) =>
  collection(db, COLLECTIONS.ORGANIZATIONS, orgId, COLLECTIONS.SETTINGS).withConverter(
    createConverter<Settings>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const customFieldsCollection = (orgId: string) =>
  collection(db, COLLECTIONS.ORGANIZATIONS, orgId, COLLECTIONS.CUSTOM_FIELDS).withConverter(
    createConverter<CustomField>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

// Users & Identity
export const usersCollection = () =>
  collection(db, COLLECTIONS.USERS).withConverter(
    createConverter<User>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'startDate', 'endDate', 'deletedAt'])
    )
  );

export const rolesCollection = () =>
  collection(db, COLLECTIONS.ROLES).withConverter(
    createConverter<Role>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const departmentsCollection = () =>
  collection(db, COLLECTIONS.DEPARTMENTS).withConverter(
    createConverter<Department>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const userRolesCollection = () =>
  collection(db, COLLECTIONS.USER_ROLES).withConverter(
    createConverter<UserRole>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'expiresAt'])
    )
  );

// Projects
export const projectTypesCollection = () =>
  collection(db, COLLECTIONS.PROJECT_TYPES).withConverter(
    createConverter<ProjectType>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const projectTemplatesCollection = () =>
  collection(db, COLLECTIONS.PROJECT_TEMPLATES).withConverter(
    createConverter<ProjectTemplate>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const projectsCollection = () =>
  collection(db, COLLECTIONS.PROJECTS).withConverter(
    createConverter<Project>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'startDate', 'dueDate', 'actualStartDate', 'actualEndDate', 'deletedAt'])
    )
  );

export const phasesCollection = (projectId: string) =>
  collection(db, COLLECTIONS.PROJECTS, projectId, COLLECTIONS.PHASES).withConverter(
    createConverter<Phase>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'startDate', 'dueDate', 'actualStartDate', 'actualEndDate'])
    )
  );

export const tasksCollection = (projectId: string) =>
  collection(db, COLLECTIONS.PROJECTS, projectId, COLLECTIONS.TASKS).withConverter(
    createConverter<Task>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'startDate', 'dueDate', 'deletedAt'])
    )
  );

export const timesheetsCollection = () =>
  collection(db, COLLECTIONS.TIMESHEETS).withConverter(
    createConverter<Timesheet>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'date', 'approvedAt'])
    )
  );

// CRM
export const accountsCollection = () =>
  collection(db, COLLECTIONS.ACCOUNTS).withConverter(
    createConverter<Account>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'deletedAt'])
    )
  );

export const opportunitiesCollection = () =>
  collection(db, COLLECTIONS.OPPORTUNITIES).withConverter(
    createConverter<Opportunity>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'expectedClose', 'actualClose', 'deletedAt'])
    )
  );

export const quotesCollection = () =>
  collection(db, COLLECTIONS.QUOTES).withConverter(
    createConverter<Quote>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'validFrom', 'validUntil', 'deletedAt'])
    )
  );

// Finance
export const contractsCollection = () =>
  collection(db, COLLECTIONS.CONTRACTS).withConverter(
    createConverter<Contract>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'startDate', 'endDate', 'signedDate', 'deletedAt'])
    )
  );

export const invoicesCollection = () =>
  collection(db, COLLECTIONS.INVOICES).withConverter(
    createConverter<Invoice>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'issueDate', 'dueDate', 'deletedAt'])
    )
  );

export const paymentsCollection = () =>
  collection(db, COLLECTIONS.PAYMENTS).withConverter(
    createConverter<Payment>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'paidAt'])
    )
  );

export const finAccountsCollection = () =>
  collection(db, COLLECTIONS.FIN_ACCOUNTS).withConverter(
    createConverter<FinAccount>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const transactionsCollection = () =>
  collection(db, COLLECTIONS.TRANSACTIONS).withConverter(
    createConverter<Transaction>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'date', 'reconciledAt'])
    )
  );

// Support
export const ticketsCollection = () =>
  collection(db, COLLECTIONS.TICKETS).withConverter(
    createConverter<Ticket>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'firstResponseAt', 'resolvedAt', 'closedAt', 'deletedAt'])
    )
  );

export const ticketCommentsCollection = (ticketId: string) =>
  collection(db, COLLECTIONS.TICKETS, ticketId, COLLECTIONS.TICKET_COMMENTS).withConverter(
    createConverter<TicketComment>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const visitsCollection = () =>
  collection(db, COLLECTIONS.VISITS).withConverter(
    createConverter<Visit>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'scheduledAt', 'checkInTime', 'checkOutTime'])
    )
  );

export const slaPoliciesCollection = () =>
  collection(db, COLLECTIONS.SLA_POLICIES).withConverter(
    createConverter<SLAPolicy>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

// LMS
export const coursesCollection = () =>
  collection(db, COLLECTIONS.COURSES).withConverter(
    createConverter<Course>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'deletedAt'])
    )
  );

export const lessonsCollection = (courseId: string) =>
  collection(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.LESSONS).withConverter(
    createConverter<Lesson>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const quizzesCollection = (courseId: string) =>
  collection(db, COLLECTIONS.COURSES, courseId, COLLECTIONS.QUIZZES).withConverter(
    createConverter<Quiz>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const assignmentsCollection = () =>
  collection(db, COLLECTIONS.ASSIGNMENTS).withConverter(
    createConverter<Assignment>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'dueDate', 'startedAt', 'completedAt', 'lastActivity'])
    )
  );

// HR
export const candidatesCollection = () =>
  collection(db, COLLECTIONS.CANDIDATES).withConverter(
    createConverter<Candidate>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'deletedAt'])
    )
  );

export const interviewsCollection = (candidateId: string) =>
  collection(db, COLLECTIONS.CANDIDATES, candidateId, COLLECTIONS.INTERVIEWS).withConverter(
    createConverter<Interview>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'scheduledAt'])
    )
  );

export const onboardingTemplatesCollection = () =>
  collection(db, COLLECTIONS.ONBOARDING_TEMPLATES).withConverter(
    createConverter<OnboardingTemplate>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const onboardingTasksCollection = () =>
  collection(db, COLLECTIONS.ONBOARDING_TASKS).withConverter(
    createConverter<OnboardingTask>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'dueDate', 'completedAt'])
    )
  );

// Catalog & Assets
export const productsCollection = () =>
  collection(db, COLLECTIONS.PRODUCTS).withConverter(
    createConverter<Product>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'deletedAt'])
    )
  );

export const servicesCollection = () =>
  collection(db, COLLECTIONS.SERVICES).withConverter(
    createConverter<Service>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'deletedAt'])
    )
  );

export const bundlesCollection = () =>
  collection(db, COLLECTIONS.BUNDLES).withConverter(
    createConverter<Bundle>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const pricebooksCollection = () =>
  collection(db, COLLECTIONS.PRICEBOOKS).withConverter(
    createConverter<Pricebook>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'validFrom', 'validTo'])
    )
  );

export const pricebookEntriesCollection = (pricebookId: string) =>
  collection(db, COLLECTIONS.PRICEBOOKS, pricebookId, COLLECTIONS.PRICEBOOK_ENTRIES).withConverter(
    createConverter<PricebookEntry>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

export const inventoryCollection = () =>
  collection(db, COLLECTIONS.INVENTORY).withConverter(
    createConverter<Inventory>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'lastRestockedAt', 'expiryDate'])
    )
  );

export const clientSitesCollection = () =>
  collection(db, COLLECTIONS.CLIENT_SITES).withConverter(
    createConverter<ClientSite>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'deletedAt'])
    )
  );

export const installedAssetsCollection = () =>
  collection(db, COLLECTIONS.INSTALLED_ASSETS).withConverter(
    createConverter<InstalledAsset>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'installDate', 'warrantyEnd', 'lastMaintenanceDate', 'nextMaintenanceDate'])
    )
  );

// Automation
export const automationRulesCollection = () =>
  collection(db, COLLECTIONS.AUTOMATION_RULES).withConverter(
    createConverter<AutomationRule>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'lastTriggeredAt'])
    )
  );

export const approvalChainsCollection = () =>
  collection(db, COLLECTIONS.APPROVAL_CHAINS).withConverter(
    createConverter<ApprovalChain>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt'])
    )
  );

// Portal
export const portalInvitesCollection = () =>
  collection(db, COLLECTIONS.PORTAL_INVITES).withConverter(
    createConverter<PortalInvite>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'expiresAt', 'acceptedAt'])
    )
  );

export const announcementsCollection = () =>
  collection(db, COLLECTIONS.ANNOUNCEMENTS).withConverter(
    createConverter<Announcement>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'publishedAt', 'expiresAt'])
    )
  );

// System
export const auditLogsCollection = () =>
  collection(db, COLLECTIONS.AUDIT_LOGS).withConverter(
    createConverter<AuditLog>((data) =>
      convertDateFields(data, ['timestamp'])
    )
  );

export const notificationsCollection = (userId: string) =>
  collection(db, COLLECTIONS.USERS, userId, COLLECTIONS.NOTIFICATIONS).withConverter(
    createConverter<Notification>((data) =>
      convertDateFields(data, ['createdAt', 'updatedAt', 'readAt'])
    )
  );

// ============================================
// Document References
// ============================================

export const getDocRef = <T>(collectionRef: CollectionReference<T>, id: string): DocumentReference<T> =>
  doc(collectionRef, id);

export const getUserDoc = (userId: string) => doc(usersCollection(), userId);
export const getProjectDoc = (projectId: string) => doc(projectsCollection(), projectId);
export const getAccountDoc = (accountId: string) => doc(accountsCollection(), accountId);
export const getInvoiceDoc = (invoiceId: string) => doc(invoicesCollection(), invoiceId);
export const getTicketDoc = (ticketId: string) => doc(ticketsCollection(), ticketId);
export const getCourseDoc = (courseId: string) => doc(coursesCollection(), courseId);
export const getCandidateDoc = (candidateId: string) => doc(candidatesCollection(), candidateId);

// ============================================
// Helper Functions
// ============================================

/**
 * Get server timestamp for Firestore
 */
export const getServerTimestamp = (): FieldValue => serverTimestamp();

/**
 * Create a new document ID
 */
export const createId = (): string => doc(collection(db, 'temp')).id;

/**
 * Batch write helper
 */
export { writeBatch } from 'firebase/firestore';

/**
 * Transaction helper
 */
export { runTransaction } from 'firebase/firestore';

// TODO[PRD]: Add firebase/config.ts file with Firebase initialization
// TODO[PRD]: Add composite query helpers for complex PRD queries
// TODO[PRD]: Add real-time listener management utilities
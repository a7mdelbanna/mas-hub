import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export initialized services
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();
export const messaging = admin.messaging();

// Configure Firestore settings
db.settings({
  ignoreUndefinedProperties: true,
});

// Export admin and functions for use in other modules
export { admin, functions };

// Environment configuration
export const config = {
  // Firebase project configuration
  projectId: process.env.GCLOUD_PROJECT || 'mashub-a0725',

  // API configuration
  api: {
    baseUrl: functions.config().api?.base_url || 'https://api.mas-business.com',
    timeout: 30000, // 30 seconds
  },

  // Email configuration
  email: {
    sendgrid: {
      apiKey: functions.config().sendgrid?.api_key,
      fromEmail: functions.config().sendgrid?.from_email || 'noreply@mas-business.com',
      fromName: functions.config().sendgrid?.from_name || 'MAS Business OS',
    },
    templates: {
      welcome: functions.config().email?.template_welcome,
      passwordReset: functions.config().email?.template_password_reset,
      invoiceCreated: functions.config().email?.template_invoice_created,
      paymentReceived: functions.config().email?.template_payment_received,
      taskAssigned: functions.config().email?.template_task_assigned,
    },
  },

  // Payment gateway configuration
  payment: {
    stripe: {
      secretKey: functions.config().stripe?.secret_key,
      webhookSecret: functions.config().stripe?.webhook_secret,
      currency: 'usd',
    },
    paymob: {
      apiKey: functions.config().paymob?.api_key,
      integrationId: functions.config().paymob?.integration_id,
      merchantId: functions.config().paymob?.merchant_id,
      webhookSecret: functions.config().paymob?.webhook_secret,
    },
  },

  // Storage configuration
  storage: {
    bucketName: functions.config().storage?.bucket || `${process.env.GCLOUD_PROJECT}.appspot.com`,
    publicUrl: functions.config().storage?.public_url || `https://storage.googleapis.com`,
  },

  // JWT configuration
  jwt: {
    secret: functions.config().jwt?.secret || 'your-jwt-secret-key',
    expiresIn: '7d',
    refreshExpiresIn: '30d',
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Pagination defaults
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // System settings
  system: {
    timezone: 'UTC',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ar', 'ru'],
    currencies: ['USD', 'EGP', 'EUR', 'GBP', 'AED'],
  },
};

// Collection names
export const COLLECTIONS = {
  // Core collections
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  DEPARTMENTS: 'departments',
  ROLES: 'roles',

  // Project management
  PROJECTS: 'projects',
  PHASES: 'phases',
  TASKS: 'tasks',
  TIMESHEETS: 'timesheets',

  // CRM
  ACCOUNTS: 'accounts',
  OPPORTUNITIES: 'opportunities',
  QUOTES: 'quotes',
  LEADS: 'leads',

  // Finance
  CONTRACTS: 'contracts',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  TRANSACTIONS: 'transactions',
  FIN_ACCOUNTS: 'finAccounts',

  // Support
  TICKETS: 'tickets',
  TICKET_COMMENTS: 'ticketComments',
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

  // Assets
  PRODUCTS: 'products',
  SERVICES: 'services',
  BUNDLES: 'bundles',
  PRICEBOOKS: 'pricebooks',
  PRICEBOOK_ENTRIES: 'pricebookEntries',
  INVENTORY: 'inventory',
  CLIENT_SITES: 'clientSites',
  INSTALLED_ASSETS: 'installedAssets',

  // Portal & System
  PORTAL_INVITES: 'portalInvites',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',

  // Automation
  AUTOMATIONS: 'automations',
  APPROVAL_CHAINS: 'approvalChains',

  // Utility
  COUNTERS: 'counters',
  CUSTOM_FIELDS: 'customFields',
  SETTINGS: 'settings',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  // Authentication errors
  UNAUTHORIZED: 'User must be authenticated',
  FORBIDDEN: 'Insufficient permissions',
  INVALID_TOKEN: 'Invalid authentication token',
  TOKEN_EXPIRED: 'Authentication token has expired',

  // Validation errors
  VALIDATION_FAILED: 'Request validation failed',
  INVALID_INPUT: 'Invalid input data',
  MISSING_REQUIRED: 'Missing required fields',

  // Resource errors
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CONFLICT: 'Resource conflict',

  // Operation errors
  OPERATION_FAILED: 'Operation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',

  // Payment errors
  PAYMENT_FAILED: 'Payment processing failed',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  INVALID_PAYMENT_METHOD: 'Invalid payment method',
};

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  OPERATION_COMPLETED: 'Operation completed successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  EMAIL_SENT: 'Email sent successfully',
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};
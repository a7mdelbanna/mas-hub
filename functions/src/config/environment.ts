import * as functions from 'firebase-functions';

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Get current environment
export const getEnvironment = (): Environment => {
  const env = process.env.NODE_ENV || functions.config().app?.env || 'development';
  return env as Environment;
};

// Check if in production
export const isProduction = (): boolean => getEnvironment() === 'production';

// Check if in development
export const isDevelopment = (): boolean => getEnvironment() === 'development';

// Environment-specific configuration
export const environmentConfig = {
  development: {
    apiUrl: 'http://localhost:5001/mashub-a0725/us-central1',
    frontendUrl: 'http://localhost:3000',
    corsOrigins: ['http://localhost:3000', 'http://localhost:5173'],
    logLevel: 'debug',
    enableDebug: true,
  },
  staging: {
    apiUrl: 'https://mas-business-os-staging.cloudfunctions.net',
    frontendUrl: 'https://staging.mas-business.com',
    corsOrigins: ['https://staging.mas-business.com'],
    logLevel: 'info',
    enableDebug: false,
  },
  production: {
    apiUrl: 'https://api.mas-business.com',
    frontendUrl: 'https://app.mas-business.com',
    corsOrigins: ['https://app.mas-business.com', 'https://mas-business.com'],
    logLevel: 'error',
    enableDebug: false,
  },
};

// Get current environment configuration
export const getEnvConfig = () => environmentConfig[getEnvironment()];

// Feature flags
export const features = {
  // Payment features
  stripePayments: functions.config().features?.stripe_payments !== 'false',
  paymobPayments: functions.config().features?.paymob_payments !== 'false',

  // Module features
  projectsModule: functions.config().features?.projects_module !== 'false',
  financeModule: functions.config().features?.finance_module !== 'false',
  crmModule: functions.config().features?.crm_module !== 'false',
  supportModule: functions.config().features?.support_module !== 'false',
  lmsModule: functions.config().features?.lms_module !== 'false',
  hrModule: functions.config().features?.hr_module !== 'false',
  assetsModule: functions.config().features?.assets_module !== 'false',
  portalsModule: functions.config().features?.portals_module !== 'false',
  automationsModule: functions.config().features?.automations_module !== 'false',

  // Advanced features
  multiCurrency: functions.config().features?.multi_currency !== 'false',
  multiLanguage: functions.config().features?.multi_language !== 'false',
  approvalWorkflows: functions.config().features?.approval_workflows !== 'false',
  customFields: functions.config().features?.custom_fields !== 'false',
  voipIntegration: functions.config().features?.voip_integration === 'true',
  eSignature: functions.config().features?.e_signature === 'true',

  // Security features
  twoFactorAuth: functions.config().features?.two_factor_auth === 'true',
  ipWhitelisting: functions.config().features?.ip_whitelisting === 'true',
  auditLogging: functions.config().features?.audit_logging !== 'false',
};

// System limits
export const limits = {
  // Request limits
  maxRequestSize: '50mb',
  maxUploadSize: 100 * 1024 * 1024, // 100MB
  maxBatchSize: 100,

  // Pagination limits
  defaultPageSize: 20,
  maxPageSize: 100,

  // Rate limiting
  requestsPerMinute: {
    anonymous: 10,
    authenticated: 60,
    premium: 300,
    enterprise: 1000,
  },

  // Data limits
  maxAttachmentSize: 25 * 1024 * 1024, // 25MB
  maxCustomFields: 50,
  maxTeamMembers: 100,
  maxProjectTasks: 1000,

  // Time limits
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  refreshTokenExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days
  inviteExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days

  // Business limits
  maxInvoiceLineItems: 100,
  maxQuoteLineItems: 100,
  maxContractValue: 10000000, // 10 million
  maxPaymentAmount: 1000000, // 1 million
};

// Scheduled job configuration
export const schedules = {
  // Daily jobs
  checkOverdueInvoices: '0 9 * * *', // 9 AM daily
  slaMonitoring: '*/15 * * * *', // Every 15 minutes
  dataCleanup: '0 2 * * *', // 2 AM daily

  // Weekly jobs
  weeklyReports: '0 10 * * 1', // 10 AM every Monday
  backupData: '0 3 * * 0', // 3 AM every Sunday

  // Monthly jobs
  monthlyBilling: '0 0 1 * *', // Midnight on 1st of each month
  contractRenewal: '0 8 28 * *', // 8 AM on 28th of each month
  performanceReports: '0 12 1 * *', // Noon on 1st of each month
};

// External service timeouts
export const timeouts = {
  database: 10000, // 10 seconds
  email: 30000, // 30 seconds
  payment: 60000, // 60 seconds
  webhook: 30000, // 30 seconds
  report: 120000, // 2 minutes
  export: 300000, // 5 minutes
};

// Retry configuration
export const retryConfig = {
  email: {
    maxAttempts: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 60000, // 1 minute
    backoffMultiplier: 2,
  },
  payment: {
    maxAttempts: 3,
    initialDelay: 2000, // 2 seconds
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 3,
  },
  webhook: {
    maxAttempts: 5,
    initialDelay: 5000, // 5 seconds
    maxDelay: 300000, // 5 minutes
    backoffMultiplier: 2,
  },
};
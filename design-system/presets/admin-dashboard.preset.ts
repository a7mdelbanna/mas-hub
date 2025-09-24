/**
 * Admin Dashboard Preset Configuration
 * Design system preset for the MAS Admin Dashboard
 */

import { PortalPreset } from './employee-portal.preset';

export const adminDashboardPreset: PortalPreset = {
  name: 'Admin Dashboard',
  description: 'Comprehensive system administration and management dashboard',

  theme: {
    colors: {
      // Professional dark theme by default
      '--portal-primary': '#3b82f6', // System blue
      '--portal-secondary': '#8b5cf6', // Admin purple
      '--portal-accent': '#f59e0b', // Warning/attention amber

      // System status colors
      '--system-healthy': '#10b981',
      '--system-warning': '#f59e0b',
      '--system-critical': '#ef4444',
      '--system-maintenance': '#6b7280',

      // Performance indicators
      '--performance-excellent': '#10b981',
      '--performance-good': '#3b82f6',
      '--performance-average': '#f59e0b',
      '--performance-poor': '#ef4444',

      // Module status colors
      '--module-active': '#10b981',
      '--module-inactive': '#6b7280',
      '--module-error': '#ef4444',
      '--module-updating': '#f59e0b',

      // Dark theme backgrounds
      '--portal-header-bg': '#111827',
      '--portal-sidebar-bg': '#1f2937',
      '--portal-content-bg': '#111827',
      '--portal-card-bg': '#1f2937',
    },

    typography: {
      '--portal-font-family': '"JetBrains Mono", monospace',
      '--portal-heading-weight': '700',
      '--portal-body-weight': '400',
      '--portal-code-font': '"JetBrains Mono", monospace',
    },

    spacing: {
      '--portal-header-height': '56px',
      '--portal-sidebar-width': '280px',
      '--portal-sidebar-collapsed': '56px',
      '--portal-content-padding': 'var(--spacing-4)',
      '--portal-widget-gap': 'var(--spacing-3)',
    },
  },

  layout: {
    header: {
      height: '56px',
      sticky: true,
      elevation: 0,
      compact: true,
      showSystemStatus: true,
      showEnvironment: true,
      showVersion: true,
      showQuickActions: true,
      showCommandPalette: true,
      quickActions: [
        'systemHealth',
        'deployments',
        'alerts',
        'logs',
        'backup',
      ],
    },

    sidebar: {
      width: '280px',
      collapsible: true,
      defaultCollapsed: false,
      darkTheme: true,
      primaryNavigation: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/admin',
        },
        {
          id: 'monitoring',
          label: 'System Monitoring',
          icon: 'monitoring',
          path: '/admin/monitoring',
          badge: 'alerts',
        },
        {
          id: 'users',
          label: 'User Management',
          icon: 'users',
          path: '/admin/users',
        },
        {
          id: 'organizations',
          label: 'Organizations',
          icon: 'organization',
          path: '/admin/organizations',
        },
        {
          id: 'projects',
          label: 'All Projects',
          icon: 'projects',
          path: '/admin/projects',
        },
        {
          id: 'finance',
          label: 'Finance Overview',
          icon: 'finance',
          path: '/admin/finance',
        },
        {
          id: 'modules',
          label: 'Module Management',
          icon: 'modules',
          path: '/admin/modules',
        },
        {
          id: 'integrations',
          label: 'Integrations',
          icon: 'integrations',
          path: '/admin/integrations',
        },
        {
          id: 'audit',
          label: 'Audit Logs',
          icon: 'audit',
          path: '/admin/audit',
        },
      ],
      secondaryNavigation: [
        {
          id: 'settings',
          label: 'System Settings',
          icon: 'settings',
          path: '/admin/settings',
        },
        {
          id: 'backup',
          label: 'Backup & Recovery',
          icon: 'backup',
          path: '/admin/backup',
        },
        {
          id: 'security',
          label: 'Security',
          icon: 'security',
          path: '/admin/security',
        },
        {
          id: 'developer',
          label: 'Developer Tools',
          icon: 'code',
          path: '/admin/developer',
        },
      ],
    },

    content: {
      maxWidth: 'none', // Full width for admin
      padding: 'var(--spacing-4)',
      darkMode: true,
      showBreadcrumbs: false, // Use command palette instead
      densePacking: true,
    },
  },

  components: {
    // Dashboard Components
    dashboard: {
      layout: 'dense-grid',
      customizable: true,
      saveable: true,
      widgets: [
        {
          type: 'systemHealth',
          size: 'quarter',
          realTime: true,
          metrics: ['cpu', 'memory', 'disk', 'network'],
        },
        {
          type: 'activeUsers',
          size: 'quarter',
          showOnline: true,
          showByPortal: true,
        },
        {
          type: 'revenue',
          size: 'quarter',
          showToday: true,
          showTrend: true,
        },
        {
          type: 'alerts',
          size: 'quarter',
          showCritical: true,
          autoRefresh: true,
        },
        {
          type: 'realtimeMetrics',
          size: 'half',
          charts: ['requests', 'response', 'errors', 'throughput'],
        },
        {
          type: 'projectMetrics',
          size: 'half',
          showActive: true,
          showOverdue: true,
          showBudget: true,
        },
        {
          type: 'userActivity',
          size: 'third',
          heatmap: true,
          timeRange: '24h',
        },
        {
          type: 'systemLogs',
          size: 'third',
          severity: ['error', 'warning'],
          maxItems: 20,
        },
        {
          type: 'deployments',
          size: 'third',
          showRecent: true,
          showScheduled: true,
        },
        {
          type: 'databaseMetrics',
          size: 'half',
          showQueries: true,
          showConnections: true,
          showPerformance: true,
        },
        {
          type: 'apiMetrics',
          size: 'half',
          showEndpoints: true,
          showLatency: true,
          showErrors: true,
        },
      ],
    },

    // System Monitoring
    monitoring: {
      metrics: [
        'systemResources',
        'applicationPerformance',
        'databasePerformance',
        'apiPerformance',
        'networkTraffic',
        'errorRates',
        'userSessions',
        'businessMetrics',
      ],
      alerting: {
        channels: ['email', 'slack', 'webhook', 'sms'],
        severities: ['critical', 'high', 'medium', 'low'],
        rules: 'customizable',
        escalation: true,
      },
      visualization: {
        realTimeGraphs: true,
        historicalData: true,
        customDashboards: true,
        exportable: true,
      },
    },

    // User Management
    userManagement: {
      features: [
        'createUser',
        'editUser',
        'deleteUser',
        'bulkOperations',
        'roleAssignment',
        'permissionMatrix',
        'activityTracking',
        'sessionManagement',
        'passwordReset',
        'twoFactorAuth',
        'apiTokens',
        'impersonation',
      ],
      views: {
        list: true,
        grid: true,
        detailed: true,
      },
      filters: {
        role: true,
        status: true,
        portal: true,
        department: true,
        lastActive: true,
      },
    },

    // Finance Overview
    finance: {
      widgets: [
        'revenueChart',
        'expenseChart',
        'profitLoss',
        'cashFlow',
        'invoiceStatus',
        'paymentStatus',
        'subscriptions',
        'mrr',
        'arr',
        'churn',
      ],
      reports: [
        'daily',
        'weekly',
        'monthly',
        'quarterly',
        'annual',
        'custom',
      ],
      export: ['pdf', 'excel', 'csv'],
    },

    // Audit Logs
    auditLogs: {
      trackEvents: [
        'userActions',
        'systemChanges',
        'dataModifications',
        'securityEvents',
        'apiCalls',
        'errors',
      ],
      retention: 'configurable',
      search: {
        fullText: true,
        filters: true,
        timeRange: true,
        export: true,
      },
      compliance: {
        gdpr: true,
        hipaa: false,
        sox: false,
      },
    },

    // Developer Tools
    developerTools: {
      features: [
        'apiDocumentation',
        'apiTesting',
        'webhookManager',
        'eventViewer',
        'databaseQuery',
        'cacheManager',
        'queueMonitor',
        'cronJobs',
        'featureFlags',
        'abTesting',
      ],
      access: 'restricted',
    },

    // Command Palette
    commandPalette: {
      enabled: true,
      shortcut: 'cmd+k',
      features: [
        'navigation',
        'search',
        'actions',
        'settings',
        'userSwitch',
      ],
      ai: true, // AI-powered suggestions
    },
  },

  features: [
    'systemMonitoring',
    'userManagement',
    'organizationManagement',
    'projectOversight',
    'financeOverview',
    'moduleManagement',
    'integrationManagement',
    'auditLogging',
    'backupRecovery',
    'security',
    'developerTools',
    'commandPalette',
    'customization',
    'automation',
    'reporting',
    'alerting',
    'apiAccess',
    'multiTenancy',
    'roleBasedAccess',
    'dataExport',
  ],
};

/**
 * Admin Dashboard Component Styles
 */
export const adminDashboardStyles = {
  // System health indicators
  systemHealth: {
    critical: '#ef4444',
    warning: '#f59e0b',
    good: '#10b981',
    unknown: '#6b7280',
  },

  // Performance metrics
  performanceMetrics: {
    excellent: '#10b981',
    good: '#3b82f6',
    acceptable: '#f59e0b',
    poor: '#ef4444',
  },

  // Log levels
  logLevels: {
    error: '#ef4444',
    warn: '#f59e0b',
    info: '#3b82f6',
    debug: '#8b5cf6',
    trace: '#6b7280',
  },

  // User status
  userStatus: {
    active: '#10b981',
    inactive: '#6b7280',
    suspended: '#f59e0b',
    banned: '#ef4444',
  },

  // Module status
  moduleStatus: {
    running: '#10b981',
    stopped: '#6b7280',
    error: '#ef4444',
    maintenance: '#f59e0b',
    updating: '#3b82f6',
  },
};

/**
 * Admin Dashboard Configuration
 */
export const adminDashboardConfig = {
  // Feature flags
  features: {
    enableMonitoring: true,
    enableUserManagement: true,
    enableFinanceOverview: true,
    enableAuditLogs: true,
    enableDeveloperTools: true,
    enableBackup: true,
    enableSecurity: true,
    enableAutomation: true,
    enableCustomDashboards: true,
    enableCommandPalette: true,
    enableAIAssistant: false,
  },

  // Admin permissions (highest level)
  permissions: {
    all: true, // Super admin has all permissions
    systemConfiguration: true,
    userManagement: true,
    dataManagement: true,
    securityManagement: true,
    integrationManagement: true,
    financialAccess: true,
    auditAccess: true,
    developerAccess: true,
    impersonation: true,
  },

  // Monitoring configuration
  monitoring: {
    metricsRetention: 90, // days
    logsRetention: 30, // days
    alertRetention: 365, // days
    samplingRate: 100, // percentage
    realTimeInterval: 5000, // ms
  },

  // Alerting rules
  alerting: {
    cpu: { warning: 70, critical: 90 },
    memory: { warning: 80, critical: 95 },
    disk: { warning: 75, critical: 90 },
    errorRate: { warning: 5, critical: 10 }, // percentage
    responseTime: { warning: 1000, critical: 3000 }, // ms
  },

  // Backup configuration
  backup: {
    automatic: true,
    frequency: 'daily',
    retention: 30, // days
    encryption: true,
    locations: ['primary', 'secondary'],
  },

  // Security settings
  security: {
    enforceSSL: true,
    enforce2FA: true,
    sessionTimeout: 30, // minutes
    passwordPolicy: 'strong',
    ipWhitelist: false,
    auditAllActions: true,
  },

  // Data refresh intervals (ms)
  refreshIntervals: {
    systemHealth: 5000, // 5 seconds
    activeUsers: 10000, // 10 seconds
    metrics: 15000, // 15 seconds
    logs: 5000, // 5 seconds
    alerts: 3000, // 3 seconds
  },

  // Advanced features
  advanced: {
    customQueries: true,
    directDatabaseAccess: false,
    systemShell: false,
    codeExecution: false,
    configHotReload: true,
    experimentalFeatures: false,
  },
};

export default adminDashboardPreset;
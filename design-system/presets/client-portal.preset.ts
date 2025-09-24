/**
 * Client Portal Preset Configuration
 * Design system preset for the MAS Client Portal
 */

import { PortalPreset } from './employee-portal.preset';

export const clientPortalPreset: PortalPreset = {
  name: 'Client Portal',
  description: 'Professional client self-service portal',

  theme: {
    colors: {
      // Brand customizable colors
      '--portal-primary': 'var(--client-brand-primary, #2563eb)',
      '--portal-secondary': 'var(--client-brand-secondary, #10b981)',
      '--portal-accent': 'var(--client-brand-accent, #f59e0b)',

      // Status colors
      '--portal-success': '#10b981',
      '--portal-warning': '#f59e0b',
      '--portal-error': '#ef4444',
      '--portal-info': '#3b82f6',

      // Project status colors
      '--project-active': '#3b82f6',
      '--project-completed': '#10b981',
      '--project-pending': '#f59e0b',
      '--project-onhold': '#6b7280',

      // Invoice status colors
      '--invoice-paid': '#10b981',
      '--invoice-pending': '#f59e0b',
      '--invoice-overdue': '#ef4444',
      '--invoice-draft': '#6b7280',

      // Support ticket colors
      '--ticket-open': '#3b82f6',
      '--ticket-inprogress': '#f59e0b',
      '--ticket-resolved': '#10b981',
      '--ticket-closed': '#6b7280',
    },

    typography: {
      '--portal-font-family': 'Inter, system-ui, sans-serif',
      '--portal-heading-weight': '600',
      '--portal-body-weight': '400',
      '--portal-brand-font': 'var(--client-brand-font, Inter)',
    },

    spacing: {
      '--portal-header-height': '72px',
      '--portal-sidebar-width': '280px',
      '--portal-sidebar-collapsed': '0', // Hidden on client portal
      '--portal-content-padding': 'var(--spacing-8)',
      '--portal-card-spacing': 'var(--spacing-6)',
    },
  },

  layout: {
    header: {
      height: '72px',
      sticky: true,
      elevation: 2,
      brandCustomizable: true,
      showClientLogo: true,
      showSearch: true,
      showNotifications: true,
      showUserMenu: true,
      showLanguageSelector: true,
      quickActions: [
        'newTicket',
        'makePayment',
        'viewInvoices',
      ],
    },

    sidebar: {
      width: '280px',
      collapsible: false,
      defaultHidden: true, // Use top navigation instead
      mobileDrawer: true,
      primaryNavigation: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/client',
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: 'project',
          path: '/client/projects',
          badge: 'activeProjects',
        },
        {
          id: 'invoices',
          label: 'Invoices & Payments',
          icon: 'invoice',
          path: '/client/invoices',
          badge: 'unpaidInvoices',
        },
        {
          id: 'contracts',
          label: 'Contracts',
          icon: 'contract',
          path: '/client/contracts',
        },
        {
          id: 'support',
          label: 'Support',
          icon: 'support',
          path: '/client/support',
          badge: 'openTickets',
        },
        {
          id: 'training',
          label: 'Training & Docs',
          icon: 'education',
          path: '/client/training',
        },
        {
          id: 'assets',
          label: 'Assets',
          icon: 'hardware',
          path: '/client/assets',
        },
      ],
      secondaryNavigation: [
        {
          id: 'team',
          label: 'Team Members',
          icon: 'people',
          path: '/client/team',
        },
        {
          id: 'reports',
          label: 'Reports',
          icon: 'analytics',
          path: '/client/reports',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          path: '/client/settings',
        },
      ],
    },

    content: {
      maxWidth: '1600px',
      padding: 'var(--spacing-8)',
      showBreadcrumbs: true,
      showPageTitle: true,
      showPageActions: true,
      heroSection: true, // Welcome hero for dashboard
    },
  },

  components: {
    // Dashboard Components
    dashboard: {
      layout: 'grid',
      customizable: false,
      widgets: [
        {
          type: 'welcome',
          size: 'full',
          showCompanyName: true,
          showAccountManager: true,
          showQuickActions: true,
        },
        {
          type: 'projectsSummary',
          size: 'half',
          showActive: true,
          showProgress: true,
          showDeadlines: true,
        },
        {
          type: 'invoicesSummary',
          size: 'half',
          showOutstanding: true,
          showRecent: true,
          showUpcoming: true,
        },
        {
          type: 'supportTickets',
          size: 'third',
          showOpen: true,
          showRecent: true,
        },
        {
          type: 'trainingProgress',
          size: 'third',
          showTeamProgress: true,
          showCertifications: true,
        },
        {
          type: 'assets',
          size: 'third',
          showWarranties: true,
          showMaintenanceSchedule: true,
        },
        {
          type: 'recentActivity',
          size: 'full',
          showProjects: true,
          showPayments: true,
          showSupport: true,
          maxItems: 10,
        },
      ],
    },

    // Project View
    projectView: {
      defaultView: 'cards',
      availableViews: ['cards', 'list', 'timeline'],
      showFilters: true,
      filterBy: ['status', 'type', 'date'],
      showSearch: true,
      projectCard: {
        showProgress: true,
        showBudget: true,
        showDeadline: true,
        showTeam: true,
        showActions: true,
      },
      detailView: {
        showOverview: true,
        showMilestones: true,
        showTasks: true,
        showDocuments: true,
        showInvoices: true,
        showTeam: true,
        showActivity: true,
        allowComments: true,
      },
    },

    // Invoice Management
    invoices: {
      defaultView: 'list',
      availableViews: ['list', 'cards'],
      showFilters: true,
      filterBy: ['status', 'date', 'amount'],
      showSearch: true,
      allowDownload: true,
      downloadFormats: ['pdf', 'excel'],
      paymentMethods: [
        'creditCard',
        'bankTransfer',
        'stripe',
        'paymob',
      ],
      showPaymentHistory: true,
      allowAutoPay: true,
      sendReminders: true,
    },

    // Support System
    support: {
      allowNewTickets: true,
      ticketCategories: [
        'technical',
        'billing',
        'project',
        'training',
        'hardware',
        'other',
      ],
      priorityLevels: ['low', 'medium', 'high', 'critical'],
      showKnowledgeBase: true,
      showFAQ: true,
      allowAttachments: true,
      maxAttachmentSize: 10, // MB
      trackSLA: true,
      showResponseTime: true,
      allowRating: true,
    },

    // Training Portal
    training: {
      showProductTraining: true,
      showDocumentation: true,
      showVideoTutorials: true,
      allowTeamEnrollment: true,
      trackProgress: true,
      issueCertificates: true,
      categories: [
        'gettingStarted',
        'advanced',
        'troubleshooting',
        'bestPractices',
      ],
      downloadableResources: true,
    },

    // Asset Management
    assets: {
      showHardware: true,
      showSoftware: true,
      showWarranties: true,
      showMaintenanceSchedule: true,
      showSupportContracts: true,
      allowServiceRequests: true,
      trackLocation: true,
    },

    // Notifications
    notifications: {
      channels: ['inApp', 'email'],
      categories: [
        'projects',
        'invoices',
        'support',
        'training',
        'maintenance',
        'announcements',
      ],
      showUnreadCount: true,
      allowPreferences: true,
      digestOption: true,
    },
  },

  features: [
    'dashboard',
    'projectTracking',
    'invoiceManagement',
    'paymentProcessing',
    'supportTickets',
    'knowledgeBase',
    'training',
    'assetManagement',
    'teamManagement',
    'reporting',
    'notifications',
    'search',
    'multiLanguage',
    'brandCustomization',
    'dataExport',
    'apiAccess',
  ],
};

/**
 * Client Portal Component Styles
 */
export const clientPortalStyles = {
  // Project phase colors
  projectPhases: {
    planning: '#3b82f6',
    design: '#8b5cf6',
    development: '#f59e0b',
    testing: '#ec4899',
    deployment: '#10b981',
    maintenance: '#6b7280',
  },

  // Payment status
  paymentStatus: {
    pending: '#f59e0b',
    processing: '#3b82f6',
    completed: '#10b981',
    failed: '#ef4444',
    refunded: '#6b7280',
  },

  // SLA indicators
  slaStatus: {
    withinSLA: '#10b981',
    approachingSLA: '#f59e0b',
    breachedSLA: '#ef4444',
  },

  // Training progress
  trainingProgress: {
    notStarted: '#6b7280',
    inProgress: '#3b82f6',
    completed: '#10b981',
    certified: '#8b5cf6',
  },
};

/**
 * Client Portal Configuration
 */
export const clientPortalConfig = {
  // Feature flags
  features: {
    enableProjects: true,
    enableInvoices: true,
    enablePayments: true,
    enableSupport: true,
    enableTraining: true,
    enableAssets: true,
    enableTeamManagement: true,
    enableReporting: true,
    enableNotifications: true,
    enableSearch: true,
    enableMultiLanguage: true,
    enableBrandCustomization: true,
    enableDataExport: true,
    enableAPIAccess: false,
  },

  // Permission levels (per client account)
  permissions: {
    viewProjects: true,
    commentOnProjects: true,
    viewInvoices: true,
    makePayments: true,
    createTickets: true,
    viewTickets: true,
    accessTraining: true,
    manageTeam: 'admin',
    viewReports: true,
    exportData: 'admin',
    manageBranding: 'admin',
    manageNotifications: true,
  },

  // Notification preferences
  notifications: {
    projectUpdate: { inApp: true, email: true },
    milestoneCompleted: { inApp: true, email: true },
    invoiceGenerated: { inApp: true, email: true },
    paymentReceived: { inApp: true, email: true },
    paymentReminder: { inApp: true, email: true },
    ticketUpdate: { inApp: true, email: true },
    maintenanceScheduled: { inApp: true, email: true },
    trainingAvailable: { inApp: true, email: false },
  },

  // Branding options
  branding: {
    allowLogoUpload: true,
    allowColorCustomization: true,
    allowFontSelection: false,
    allowCustomCSS: false,
    allowWhiteLabeling: true,
    customDomain: 'premium',
  },

  // Data refresh intervals (ms)
  refreshIntervals: {
    dashboard: 120000, // 2 minutes
    projects: 60000, // 1 minute
    invoices: 300000, // 5 minutes
    tickets: 30000, // 30 seconds
    notifications: 20000, // 20 seconds
  },

  // Payment gateway configuration
  paymentGateways: {
    stripe: {
      enabled: true,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      supportedCards: ['visa', 'mastercard', 'amex'],
      supportedCurrencies: ['USD', 'EUR', 'EGP'],
    },
    paymob: {
      enabled: true,
      publicKey: process.env.PAYMOB_PUBLIC_KEY,
      supportedMethods: ['card', 'wallet'],
      supportedCurrencies: ['EGP'],
    },
  },
};

export default clientPortalPreset;
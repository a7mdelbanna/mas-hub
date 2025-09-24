/**
 * Employee Portal Preset Configuration
 * Design system preset for the MAS Employee Portal
 */

export interface PortalPreset {
  name: string;
  description: string;
  theme: {
    colors: Record<string, string>;
    typography: Record<string, any>;
    spacing: Record<string, string>;
  };
  layout: {
    header: Record<string, any>;
    sidebar: Record<string, any>;
    content: Record<string, any>;
  };
  components: Record<string, any>;
  features: string[];
}

export const employeePortalPreset: PortalPreset = {
  name: 'Employee Portal',
  description: 'Professional workspace for MAS employees',

  theme: {
    colors: {
      // Override brand colors for employee portal
      '--portal-primary': '#2563eb', // Professional blue
      '--portal-secondary': '#7c3aed', // Purple accent
      '--portal-success': '#16a34a',
      '--portal-warning': '#d97706',
      '--portal-error': '#dc2626',
      '--portal-info': '#0891b2',

      // Specific backgrounds
      '--portal-header-bg': 'var(--color-surface-primary)',
      '--portal-sidebar-bg': 'var(--color-bg-secondary)',
      '--portal-content-bg': 'var(--color-bg-primary)',

      // Status colors for timesheet
      '--timesheet-pending': '#f59e0b',
      '--timesheet-approved': '#10b981',
      '--timesheet-rejected': '#ef4444',
      '--timesheet-draft': '#6b7280',
    },

    typography: {
      '--portal-font-family': 'Inter, system-ui, sans-serif',
      '--portal-heading-weight': '600',
      '--portal-body-weight': '400',
    },

    spacing: {
      '--portal-header-height': '64px',
      '--portal-sidebar-width': '260px',
      '--portal-sidebar-collapsed': '64px',
      '--portal-content-padding': 'var(--spacing-6)',
    },
  },

  layout: {
    header: {
      height: '64px',
      sticky: true,
      elevation: 1,
      showLogo: true,
      showSearch: true,
      showNotifications: true,
      showUserMenu: true,
      quickActions: [
        'timeTracking',
        'quickTask',
        'calendar',
      ],
    },

    sidebar: {
      width: '260px',
      collapsible: true,
      defaultCollapsed: false,
      showUserInfo: true,
      showDepartment: true,
      primaryNavigation: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: 'dashboard',
          path: '/employee',
        },
        {
          id: 'tasks',
          label: 'My Tasks',
          icon: 'task',
          path: '/employee/tasks',
          badge: 'taskCount',
        },
        {
          id: 'projects',
          label: 'Projects',
          icon: 'project',
          path: '/employee/projects',
        },
        {
          id: 'timesheet',
          label: 'Timesheet',
          icon: 'clock',
          path: '/employee/timesheet',
          highlight: 'pendingTimesheet',
        },
        {
          id: 'calendar',
          label: 'Calendar',
          icon: 'calendar',
          path: '/employee/calendar',
        },
        {
          id: 'training',
          label: 'Training',
          icon: 'education',
          path: '/employee/training',
          badge: 'newCourses',
        },
      ],
      secondaryNavigation: [
        {
          id: 'payroll',
          label: 'Payroll',
          icon: 'payment',
          path: '/employee/payroll',
        },
        {
          id: 'documents',
          label: 'Documents',
          icon: 'document',
          path: '/employee/documents',
        },
        {
          id: 'support',
          label: 'IT Support',
          icon: 'support',
          path: '/employee/support',
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'settings',
          path: '/employee/settings',
        },
      ],
    },

    content: {
      maxWidth: '1440px',
      padding: 'var(--spacing-6)',
      showBreadcrumbs: true,
      showPageTitle: true,
      showPageActions: true,
    },
  },

  components: {
    // Dashboard Components
    dashboard: {
      layout: 'grid',
      widgets: [
        {
          type: 'welcome',
          size: 'full',
          showGreeting: true,
          showDate: true,
          showWeather: false,
        },
        {
          type: 'taskSummary',
          size: 'third',
          showOverdue: true,
          showToday: true,
          showUpcoming: true,
        },
        {
          type: 'timesheetStatus',
          size: 'third',
          showWeekly: true,
          showApprovalStatus: true,
        },
        {
          type: 'projectProgress',
          size: 'third',
          showActive: true,
          showDeadlines: true,
        },
        {
          type: 'announcements',
          size: 'half',
          maxItems: 5,
          showPinned: true,
        },
        {
          type: 'upcomingEvents',
          size: 'half',
          showMeetings: true,
          showDeadlines: true,
          showHolidays: true,
        },
        {
          type: 'quickLinks',
          size: 'full',
          showFrequent: true,
          customizable: true,
        },
      ],
    },

    // Task Management
    taskList: {
      defaultView: 'list',
      availableViews: ['list', 'kanban', 'calendar'],
      showFilters: true,
      showSearch: true,
      showBulkActions: true,
      columns: [
        'checkbox',
        'priority',
        'title',
        'project',
        'dueDate',
        'status',
        'assignee',
        'actions',
      ],
      kanbanColumns: [
        'todo',
        'inProgress',
        'review',
        'done',
      ],
    },

    // Timesheet
    timesheet: {
      defaultView: 'weekly',
      availableViews: ['daily', 'weekly', 'monthly'],
      allowedActions: [
        'add',
        'edit',
        'delete',
        'submit',
        'saveDraft',
      ],
      showProjectAllocation: true,
      showOvertimeWarning: true,
      requireComments: false,
      minEntry: 0.25, // 15 minutes
      maxEntry: 24, // hours
      showApprovalChain: true,
    },

    // Training Module
    training: {
      showCategories: true,
      categories: [
        'mandatory',
        'technical',
        'softSkills',
        'compliance',
        'optional',
      ],
      showProgress: true,
      showCertificates: true,
      showDeadlines: true,
      allowSelfEnrollment: true,
      trackCompletion: true,
    },

    // Notifications
    notifications: {
      channels: [
        'inApp',
        'email',
        'push',
      ],
      categories: [
        'tasks',
        'projects',
        'timesheet',
        'announcements',
        'training',
        'system',
      ],
      showUnreadCount: true,
      allowMarkAllRead: true,
      retentionDays: 30,
    },
  },

  features: [
    'dashboard',
    'taskManagement',
    'timeTracking',
    'projectView',
    'calendar',
    'training',
    'payrollView',
    'documentLibrary',
    'announcements',
    'notifications',
    'search',
    'profile',
    'settings',
    'support',
    'darkMode',
    'multiLanguage',
    'offlineMode',
    'mobileApp',
  ],
};

/**
 * Employee Portal Component Styles
 */
export const employeePortalStyles = {
  // Task priority colors
  taskPriority: {
    critical: '#991b1b',
    high: '#dc2626',
    medium: '#f59e0b',
    low: '#10b981',
    none: '#6b7280',
  },

  // Status indicators
  statusColors: {
    online: '#10b981',
    away: '#f59e0b',
    busy: '#ef4444',
    offline: '#6b7280',
  },

  // Project status
  projectStatus: {
    notStarted: '#6b7280',
    inProgress: '#3b82f6',
    onHold: '#f59e0b',
    completed: '#10b981',
    cancelled: '#ef4444',
    overdue: '#991b1b',
  },

  // Calendar event types
  calendarEvents: {
    meeting: '#3b82f6',
    deadline: '#ef4444',
    reminder: '#f59e0b',
    holiday: '#10b981',
    personal: '#8b5cf6',
    training: '#ec4899',
  },
};

/**
 * Employee Portal Configuration
 */
export const employeePortalConfig = {
  // Feature flags
  features: {
    enableTimeTracking: true,
    enableProjectManagement: true,
    enableTraining: true,
    enablePayroll: true,
    enableDocuments: true,
    enableAnnouncements: true,
    enableSupport: true,
    enableCalendar: true,
    enableNotifications: true,
    enableSearch: true,
    enableDarkMode: true,
    enableMultiLanguage: true,
    enableOfflineMode: false,
    enableMobileApp: true,
  },

  // Permission levels
  permissions: {
    viewOwnData: true,
    editOwnData: true,
    viewTeamData: false,
    editTeamData: false,
    viewDepartmentData: false,
    approveTimesheet: false,
    manageTasks: true,
    manageDocuments: true,
    createSupportTickets: true,
  },

  // Notification preferences
  notifications: {
    taskAssigned: { inApp: true, email: true, push: true },
    taskDue: { inApp: true, email: true, push: true },
    timesheetReminder: { inApp: true, email: true, push: false },
    timesheetApproved: { inApp: true, email: true, push: false },
    timesheetRejected: { inApp: true, email: true, push: true },
    announcement: { inApp: true, email: false, push: false },
    trainingAssigned: { inApp: true, email: true, push: false },
    trainingDeadline: { inApp: true, email: true, push: true },
    payrollProcessed: { inApp: true, email: true, push: true },
  },

  // Data refresh intervals (ms)
  refreshIntervals: {
    dashboard: 60000, // 1 minute
    tasks: 30000, // 30 seconds
    notifications: 15000, // 15 seconds
    calendar: 300000, // 5 minutes
    projects: 120000, // 2 minutes
  },
};

export default employeePortalPreset;
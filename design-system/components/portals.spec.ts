/**
 * Portal-Specific Component Specifications
 * Components tailored for Employee, Client, and Candidate portals
 */

import { ComponentSpec } from './layout.spec';

/**
 * Portal Header Component Specification
 */
export const PortalHeaderSpec: ComponentSpec = {
  name: 'PortalHeader',
  description: 'Unified header for all portal types with role-specific features',
  variants: {
    employee: {
      background: 'var(--color-surface-primary)',
      showModules: true,
      showNotifications: true,
      showTasks: true,
      showTimeTracking: true,
    },
    client: {
      background: 'var(--color-brand-primary)',
      showProjects: true,
      showInvoices: true,
      showSupport: true,
      brandCustomizable: true,
    },
    candidate: {
      background: 'var(--color-surface-secondary)',
      showApplicationStatus: true,
      showTraining: true,
      showSchedule: true,
      simplified: true,
    },
    admin: {
      background: 'var(--color-gray-900)',
      showSystemStatus: true,
      showQuickActions: true,
      showMetrics: true,
    },
  },
  props: {
    portalType: {
      type: "'employee' | 'client' | 'candidate' | 'admin'",
      required: true,
      description: 'Portal type',
    },
    user: {
      type: 'PortalUser',
      required: true,
      description: 'Current user information',
    },
    organization: {
      type: 'Organization',
      required: true,
      description: 'Organization details',
    },
    navigation: {
      type: 'NavigationItem[]',
      required: true,
      description: 'Navigation items based on role',
    },
    quickActions: {
      type: 'QuickAction[]',
      required: false,
      description: 'Quick action buttons',
    },
    brandConfig: {
      type: 'BrandConfig',
      required: false,
      description: 'Client brand customization',
    },
  },
  accessibility: {
    role: 'banner',
    landmark: true,
    skipToMain: true,
    announceNotifications: true,
  },
  responsive: {
    mobile: {
      collapsedMenu: true,
      priorityActions: true,
      hamburgerNav: true,
    },
    tablet: {
      condensedNav: true,
      iconOnlyActions: false,
    },
    desktop: {
      fullNav: true,
      expandedActions: true,
    },
  },
  rtl: {
    mirrored: true,
    userMenuPosition: 'start',
    notificationPosition: 'beforeUserMenu',
  },
};

/**
 * Project Status Widget Component Specification
 */
export const ProjectStatusWidgetSpec: ComponentSpec = {
  name: 'ProjectStatusWidget',
  description: 'Real-time project status display for client portal',
  variants: {
    default: {
      minHeight: '200px',
      showProgress: true,
      showMilestones: true,
      showBudget: true,
    },
    compact: {
      minHeight: '120px',
      summaryOnly: true,
    },
    detailed: {
      minHeight: '400px',
      showTasks: true,
      showTeam: true,
      showTimeline: true,
      showDocuments: true,
    },
  },
  props: {
    project: {
      type: 'Project',
      required: true,
      description: 'Project data',
    },
    viewMode: {
      type: "'summary' | 'detailed' | 'timeline'",
      default: 'summary',
      description: 'Display mode',
    },
    showActions: {
      type: 'boolean',
      default: true,
      description: 'Show action buttons',
    },
    onViewDetails: {
      type: '() => void',
      required: false,
      description: 'View details handler',
    },
    refreshInterval: {
      type: 'number',
      default: 60000,
      description: 'Auto-refresh interval (ms)',
    },
  },
  accessibility: {
    role: 'article',
    ariaLabel: 'Project status',
    liveRegion: 'polite',
    announceUpdates: true,
  },
  responsive: {
    mobile: {
      stackedLayout: true,
      essentialInfo: true,
      expandableDetails: true,
    },
    tablet: {
      twoColumnLayout: true,
      moderateDetail: true,
    },
    desktop: {
      fullLayout: true,
      allDetails: true,
      sidePanel: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    progressDirection: 'rtl',
    timelineDirection: 'rtl',
  },
};

/**
 * Timesheet Entry Component Specification
 */
export const TimesheetEntrySpec: ComponentSpec = {
  name: 'TimesheetEntry',
  description: 'Time tracking interface for employees',
  variants: {
    default: {
      layout: 'weekly',
      showProjects: true,
      showTasks: true,
      allowComments: true,
    },
    daily: {
      layout: 'daily',
      detailedEntry: true,
      showBreaks: true,
    },
    monthly: {
      layout: 'monthly',
      summaryView: true,
      showApprovalStatus: true,
    },
  },
  props: {
    viewType: {
      type: "'daily' | 'weekly' | 'monthly'",
      default: 'weekly',
      description: 'Timesheet view type',
    },
    entries: {
      type: 'TimesheetEntry[]',
      required: false,
      description: 'Existing timesheet entries',
    },
    projects: {
      type: 'Project[]',
      required: true,
      description: 'Available projects',
    },
    onSubmit: {
      type: '(entries: TimesheetEntry[]) => void',
      required: true,
      description: 'Submit handler',
    },
    onSaveDraft: {
      type: '(entries: TimesheetEntry[]) => void',
      required: false,
      description: 'Save draft handler',
    },
    approvalStatus: {
      type: "'pending' | 'approved' | 'rejected'",
      required: false,
      description: 'Current approval status',
    },
    allowOvertime: {
      type: 'boolean',
      default: true,
      description: 'Allow overtime entry',
    },
  },
  accessibility: {
    role: 'form',
    ariaLabel: 'Timesheet entry',
    keyboardNavigation: 'tab/arrow keys',
    fieldValidation: true,
  },
  responsive: {
    mobile: {
      simplifiedEntry: true,
      verticalLayout: true,
      quickEntry: true,
    },
    tablet: {
      standardGrid: true,
      dragAndDrop: false,
    },
    desktop: {
      fullGrid: true,
      dragAndDrop: true,
      bulkEntry: true,
    },
  },
  rtl: {
    mirrored: true,
    calendarDirection: 'rtl',
    weekStart: 'locale-specific',
  },
};

/**
 * Invoice Display Component Specification
 */
export const InvoiceDisplaySpec: ComponentSpec = {
  name: 'InvoiceDisplay',
  description: 'Invoice viewing and payment interface for clients',
  variants: {
    default: {
      showLineItems: true,
      showPaymentOptions: true,
      showDownload: true,
    },
    summary: {
      compactView: true,
      keyInfoOnly: true,
    },
    detailed: {
      showHistory: true,
      showRelatedDocuments: true,
      showPaymentSchedule: true,
    },
  },
  props: {
    invoice: {
      type: 'Invoice',
      required: true,
      description: 'Invoice data',
    },
    paymentMethods: {
      type: 'PaymentMethod[]',
      required: false,
      description: 'Available payment methods',
    },
    onPay: {
      type: '(method: PaymentMethod) => void',
      required: false,
      description: 'Payment handler',
    },
    onDownload: {
      type: '(format: "pdf" | "excel") => void',
      required: false,
      description: 'Download handler',
    },
    showActions: {
      type: 'boolean',
      default: true,
      description: 'Show action buttons',
    },
    currency: {
      type: 'string',
      default: 'USD',
      description: 'Display currency',
    },
  },
  accessibility: {
    role: 'article',
    headingHierarchy: true,
    tableSemantics: true,
    actionLabels: true,
  },
  responsive: {
    mobile: {
      stackedLineItems: true,
      simplifiedTable: true,
      prominentTotal: true,
    },
    tablet: {
      standardTable: true,
      twoColumnMeta: true,
    },
    desktop: {
      fullTable: true,
      sidebarActions: true,
      printOptimized: true,
    },
  },
  rtl: {
    mirrored: true,
    currencyPosition: 'locale-specific',
    numberFormat: 'locale-specific',
  },
};

/**
 * Training Module Component Specification
 */
export const TrainingModuleSpec: ComponentSpec = {
  name: 'TrainingModule',
  description: 'Training and course interface for all portal types',
  variants: {
    employee: {
      showMandatory: true,
      showOptional: true,
      showCertifications: true,
      trackProgress: true,
    },
    client: {
      showProductTraining: true,
      showDocumentation: true,
      allowTeamEnrollment: true,
    },
    candidate: {
      showPreHireModules: true,
      showAssessments: true,
      restrictedAccess: true,
    },
  },
  props: {
    courses: {
      type: 'Course[]',
      required: true,
      description: 'Available courses',
    },
    enrollments: {
      type: 'Enrollment[]',
      required: false,
      description: 'User enrollments',
    },
    portalType: {
      type: "'employee' | 'client' | 'candidate'",
      required: true,
      description: 'Portal context',
    },
    onEnroll: {
      type: '(courseId: string) => void',
      required: true,
      description: 'Enrollment handler',
    },
    onResume: {
      type: '(courseId: string, lessonId: string) => void',
      required: true,
      description: 'Resume course handler',
    },
    showCategories: {
      type: 'boolean',
      default: true,
      description: 'Show course categories',
    },
  },
  accessibility: {
    role: 'main',
    headingStructure: true,
    progressAnnouncement: true,
    keyboardNavigation: true,
  },
  responsive: {
    mobile: {
      cardLayout: true,
      verticalScroll: true,
      offlineMode: 'optional',
    },
    tablet: {
      gridLayout: '2 columns',
      filterSidebar: false,
    },
    desktop: {
      gridLayout: '3-4 columns',
      filterSidebar: true,
      detailedCards: true,
    },
  },
  rtl: {
    mirrored: true,
    progressDirection: 'rtl',
    contentAlignment: 'start',
  },
};

/**
 * Application Status Component Specification
 */
export const ApplicationStatusSpec: ComponentSpec = {
  name: 'ApplicationStatus',
  description: 'Job application tracking for candidate portal',
  variants: {
    default: {
      showTimeline: true,
      showDocuments: true,
      showNextSteps: true,
    },
    compact: {
      summaryOnly: true,
      currentStageHighlight: true,
    },
    detailed: {
      showInterviewSchedule: true,
      showFeedback: false,
      showContacts: true,
    },
  },
  props: {
    application: {
      type: 'JobApplication',
      required: true,
      description: 'Application data',
    },
    stages: {
      type: 'ApplicationStage[]',
      required: true,
      description: 'Application stages',
    },
    currentStage: {
      type: 'string',
      required: true,
      description: 'Current stage ID',
    },
    interviews: {
      type: 'Interview[]',
      required: false,
      description: 'Scheduled interviews',
    },
    documents: {
      type: 'Document[]',
      required: false,
      description: 'Application documents',
    },
    onUploadDocument: {
      type: '(file: File) => void',
      required: false,
      description: 'Document upload handler',
    },
  },
  accessibility: {
    role: 'article',
    progressSemantics: true,
    stageAnnouncement: true,
    actionLabels: true,
  },
  responsive: {
    mobile: {
      verticalTimeline: true,
      collapsibleSections: true,
      essentialInfo: true,
    },
    tablet: {
      horizontalTimeline: 'optional',
      expandedSections: true,
    },
    desktop: {
      horizontalTimeline: true,
      allSections: true,
      sidePanel: true,
    },
  },
  rtl: {
    mirrored: true,
    timelineDirection: 'rtl',
    stageProgression: 'rtl',
  },
};

/**
 * Support Ticket Component Specification
 */
export const SupportTicketSpec: ComponentSpec = {
  name: 'SupportTicket',
  description: 'Support ticket interface for client portal',
  variants: {
    create: {
      showCategories: true,
      showPriority: true,
      allowAttachments: true,
      templateSelection: true,
    },
    view: {
      showHistory: true,
      showStatus: true,
      allowComments: true,
      showSLA: true,
    },
    list: {
      sortable: true,
      filterable: true,
      searchable: true,
      bulkActions: false,
    },
  },
  props: {
    mode: {
      type: "'create' | 'view' | 'list'",
      required: true,
      description: 'Component mode',
    },
    ticket: {
      type: 'SupportTicket',
      required: false,
      description: 'Ticket data (for view mode)',
    },
    tickets: {
      type: 'SupportTicket[]',
      required: false,
      description: 'Tickets list (for list mode)',
    },
    categories: {
      type: 'TicketCategory[]',
      required: false,
      description: 'Ticket categories',
    },
    onSubmit: {
      type: '(ticket: SupportTicket) => void',
      required: false,
      description: 'Submit handler',
    },
    onComment: {
      type: '(comment: string, attachments?: File[]) => void',
      required: false,
      description: 'Comment handler',
    },
  },
  accessibility: {
    role: 'form | article | list',
    fieldLabels: true,
    statusAnnouncement: true,
    actionConfirmation: true,
  },
  responsive: {
    mobile: {
      simplifiedForm: true,
      stackedView: true,
      swipeActions: 'in list',
    },
    tablet: {
      standardForm: true,
      twoColumnView: true,
    },
    desktop: {
      fullForm: true,
      threeColumnView: 'optional',
      richTextEditor: true,
    },
  },
  rtl: {
    mirrored: true,
    textDirection: 'rtl',
    timestampPosition: 'end',
  },
};

/**
 * Announcement Board Component Specification
 */
export const AnnouncementBoardSpec: ComponentSpec = {
  name: 'AnnouncementBoard',
  description: 'Company announcements for employee portal',
  variants: {
    default: {
      showPinned: true,
      showCategories: true,
      allowComments: false,
      showAuthor: true,
    },
    compact: {
      titleOnly: true,
      limitedPreview: true,
      iconIndicators: true,
    },
    detailed: {
      fullContent: true,
      showAttachments: true,
      showReadReceipts: true,
      allowReactions: true,
    },
  },
  props: {
    announcements: {
      type: 'Announcement[]',
      required: true,
      description: 'Announcements list',
    },
    categories: {
      type: 'string[]',
      required: false,
      description: 'Filter categories',
    },
    onRead: {
      type: '(id: string) => void',
      required: false,
      description: 'Mark as read handler',
    },
    onReact: {
      type: '(id: string, reaction: string) => void',
      required: false,
      description: 'Reaction handler',
    },
    showUnreadOnly: {
      type: 'boolean',
      default: false,
      description: 'Filter unread only',
    },
    maxVisible: {
      type: 'number',
      default: 10,
      description: 'Maximum visible items',
    },
  },
  accessibility: {
    role: 'feed',
    ariaLabel: 'Company announcements',
    headingHierarchy: true,
    unreadAnnouncement: true,
  },
  responsive: {
    mobile: {
      cardLayout: true,
      collapsibleContent: true,
      swipeToRead: true,
    },
    tablet: {
      listLayout: true,
      previewPane: true,
    },
    desktop: {
      splitView: true,
      detailPane: true,
      multiColumn: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    textAlignment: 'start',
    datePosition: 'end',
  },
};
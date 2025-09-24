/**
 * Candidate Portal Preset Configuration
 * Design system preset for the MAS Candidate Portal
 */

import { PortalPreset } from './employee-portal.preset';

export const candidatePortalPreset: PortalPreset = {
  name: 'Candidate Portal',
  description: 'Pre-hire training and application tracking portal',

  theme: {
    colors: {
      // Welcoming and professional colors
      '--portal-primary': '#10b981', // Positive green
      '--portal-secondary': '#3b82f6', // Trust blue
      '--portal-accent': '#8b5cf6', // Creative purple

      // Status colors
      '--portal-success': '#10b981',
      '--portal-warning': '#f59e0b',
      '--portal-error': '#ef4444',
      '--portal-info': '#3b82f6',

      // Application status colors
      '--application-applied': '#3b82f6',
      '--application-screening': '#f59e0b',
      '--application-interview': '#8b5cf6',
      '--application-assessment': '#ec4899',
      '--application-offer': '#10b981',
      '--application-rejected': '#ef4444',
      '--application-withdrawn': '#6b7280',

      // Training status colors
      '--training-notstarted': '#6b7280',
      '--training-inprogress': '#3b82f6',
      '--training-completed': '#10b981',
      '--training-failed': '#ef4444',
      '--training-certified': '#8b5cf6',

      // Background colors
      '--portal-header-bg': 'var(--color-surface-primary)',
      '--portal-sidebar-bg': 'var(--color-bg-secondary)',
      '--portal-content-bg': 'var(--color-bg-primary)',
    },

    typography: {
      '--portal-font-family': 'Inter, system-ui, sans-serif',
      '--portal-heading-weight': '600',
      '--portal-body-weight': '400',
      '--portal-welcome-font-size': 'var(--text-2xl)',
    },

    spacing: {
      '--portal-header-height': '64px',
      '--portal-content-padding': 'var(--spacing-6)',
      '--portal-card-spacing': 'var(--spacing-4)',
      '--portal-section-spacing': 'var(--spacing-8)',
    },
  },

  layout: {
    header: {
      height: '64px',
      sticky: true,
      elevation: 1,
      showLogo: true,
      showApplicationStatus: true,
      showProgress: true,
      showNotifications: true,
      showUserMenu: true,
      showHelp: true,
      minimal: true, // Simplified header
    },

    sidebar: {
      hidden: true, // No sidebar for candidates
      mobileMenu: true, // Mobile hamburger menu only
    },

    content: {
      maxWidth: '1200px',
      padding: 'var(--spacing-6)',
      centered: true,
      showProgress: true,
      showGuidance: true,
      welcomeMessage: true,
    },
  },

  components: {
    // Dashboard Components
    dashboard: {
      layout: 'stacked', // Simple vertical layout
      widgets: [
        {
          type: 'welcome',
          size: 'full',
          personalized: true,
          showProgress: true,
          showNextSteps: true,
        },
        {
          type: 'applicationStatus',
          size: 'full',
          showTimeline: true,
          showCurrentStage: true,
          showRequiredActions: true,
          showDocuments: true,
        },
        {
          type: 'trainingModules',
          size: 'full',
          showMandatory: true,
          showOptional: false,
          showProgress: true,
          showDeadlines: true,
        },
        {
          type: 'assessments',
          size: 'full',
          showPending: true,
          showCompleted: true,
          showScores: false, // Hide scores from candidates
        },
        {
          type: 'interviews',
          size: 'full',
          showScheduled: true,
          showPast: true,
          showPreparationMaterials: true,
        },
        {
          type: 'documents',
          size: 'half',
          showRequired: true,
          showUploaded: true,
          allowUpload: true,
        },
        {
          type: 'messages',
          size: 'half',
          showRecruiter: true,
          allowReply: true,
          showHistory: true,
        },
      ],
    },

    // Application Tracker
    applicationTracker: {
      showTimeline: true,
      showStageDetails: true,
      showEstimatedTime: true,
      stages: [
        {
          id: 'applied',
          label: 'Application Submitted',
          icon: 'check',
        },
        {
          id: 'screening',
          label: 'Initial Screening',
          icon: 'search',
        },
        {
          id: 'assessment',
          label: 'Skills Assessment',
          icon: 'clipboard',
        },
        {
          id: 'interview1',
          label: 'First Interview',
          icon: 'video',
        },
        {
          id: 'interview2',
          label: 'Technical Interview',
          icon: 'code',
        },
        {
          id: 'finalInterview',
          label: 'Final Interview',
          icon: 'people',
        },
        {
          id: 'offer',
          label: 'Offer',
          icon: 'star',
        },
      ],
    },

    // Training Portal
    training: {
      categories: [
        'preHire',
        'companyOverview',
        'roleSpecific',
        'compliance',
        'skills',
      ],
      showModuleDetails: true,
      showDuration: true,
      showProgress: true,
      allowResume: true,
      trackAttempts: true,
      showCertificates: true,
      requireCompletion: true,
      features: {
        videoContent: true,
        interactiveQuizzes: true,
        downloadableResources: false, // Restricted for candidates
        offlineMode: false,
        mobileOptimized: true,
      },
    },

    // Assessment Center
    assessments: {
      types: [
        'technical',
        'aptitude',
        'personality',
        'language',
        'roleSpecific',
      ],
      showInstructions: true,
      showDuration: true,
      showAttempts: true,
      timedTests: true,
      autoSave: true,
      preventCheating: {
        disableCopyPaste: true,
        fullScreen: true,
        tabSwitchWarning: true,
        webcamMonitoring: false, // Privacy consideration
      },
    },

    // Interview Scheduler
    interviews: {
      showAvailableSlots: true,
      allowReschedule: true,
      rescheduleLimit: 2,
      showInterviewerInfo: false, // Hide interviewer details
      showPreparationGuide: true,
      showLocation: true,
      videoInterview: {
        platform: 'integrated',
        testConnection: true,
        showInstructions: true,
      },
      reminders: {
        email: true,
        sms: false,
        inApp: true,
      },
    },

    // Document Management
    documents: {
      requiredDocuments: [
        'resume',
        'coverLetter',
        'identification',
        'education',
        'references',
      ],
      allowedFormats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      maxFileSize: 5, // MB
      scanQuality: true,
      expiryTracking: true,
      verification: {
        status: true,
        feedback: false, // Don't show verification details
      },
    },

    // Communication
    messaging: {
      allowedContacts: ['recruiter', 'hr'],
      showChatHistory: true,
      allowAttachments: false,
      responseTime: 'business hours',
      autoResponder: true,
      templates: false, // No templates for candidates
    },

    // Notifications
    notifications: {
      channels: ['inApp', 'email'],
      categories: [
        'applicationUpdate',
        'interviewScheduled',
        'assessmentDue',
        'trainingAssigned',
        'documentRequest',
        'message',
      ],
      mandatory: [
        'applicationUpdate',
        'interviewScheduled',
      ],
      frequency: 'immediate',
    },
  },

  features: [
    'dashboard',
    'applicationTracking',
    'training',
    'assessments',
    'interviews',
    'documents',
    'messaging',
    'notifications',
    'profile',
    'help',
    'multiLanguage',
    'mobileResponsive',
    'accessibility',
  ],
};

/**
 * Candidate Portal Component Styles
 */
export const candidatePortalStyles = {
  // Progress indicators
  progressColors: {
    0: '#e5e7eb', // Not started
    25: '#fbbf24', // Started
    50: '#60a5fa', // Half way
    75: '#a78bfa', // Almost complete
    100: '#10b981', // Complete
  },

  // Assessment scores (internal only)
  scoreRanges: {
    excellent: '#10b981',
    good: '#3b82f6',
    average: '#f59e0b',
    belowAverage: '#ef4444',
  },

  // Priority indicators
  priority: {
    urgent: '#ef4444',
    high: '#f59e0b',
    normal: '#3b82f6',
    low: '#6b7280',
  },

  // Module types
  moduleTypes: {
    video: '#ef4444',
    reading: '#3b82f6',
    quiz: '#f59e0b',
    assignment: '#8b5cf6',
    live: '#10b981',
  },
};

/**
 * Candidate Portal Configuration
 */
export const candidatePortalConfig = {
  // Feature flags
  features: {
    enableApplicationTracking: true,
    enableTraining: true,
    enableAssessments: true,
    enableInterviews: true,
    enableDocuments: true,
    enableMessaging: true,
    enableNotifications: true,
    enableProfile: true,
    enableHelp: true,
    enableMultiLanguage: true,
    enableAccessibilityMode: true,
  },

  // Candidate permissions
  permissions: {
    viewOwnApplication: true,
    editProfile: true,
    uploadDocuments: true,
    takeAssessments: true,
    scheduleInterviews: true,
    accessTraining: true,
    contactRecruiter: true,
    withdrawApplication: true,
  },

  // Access restrictions
  restrictions: {
    maxLoginAttempts: 5,
    sessionTimeout: 30, // minutes
    documentDownload: false,
    copyPasteInAssessments: false,
    multipleTabsInAssessments: false,
    accessAfterRejection: false,
    accessAfterHiring: false, // Transitions to employee portal
  },

  // Notification settings
  notifications: {
    applicationReceived: { inApp: true, email: true },
    statusUpdate: { inApp: true, email: true },
    interviewInvite: { inApp: true, email: true },
    interviewReminder: { inApp: true, email: true },
    assessmentAssigned: { inApp: true, email: true },
    assessmentDeadline: { inApp: true, email: true },
    trainingAssigned: { inApp: true, email: true },
    documentRequest: { inApp: true, email: true },
    offerLetter: { inApp: true, email: true },
  },

  // Training configuration
  training: {
    mandatoryModules: [
      'companyOverview',
      'cultureAndValues',
      'policiesAndProcedures',
      'roleOverview',
    ],
    passingScore: 70, // percentage
    maxAttempts: 3,
    completionRequired: true,
    certificateGeneration: true,
    progressTracking: true,
  },

  // Assessment configuration
  assessment: {
    types: {
      technical: { duration: 120, attempts: 1 },
      aptitude: { duration: 60, attempts: 2 },
      personality: { duration: 30, attempts: 1 },
      language: { duration: 45, attempts: 2 },
    },
    proctoring: false, // Privacy-friendly
    autoSubmit: true,
    showResults: false, // Don't show scores to candidates
    feedbackDelay: 48, // hours
  },

  // Data retention
  dataRetention: {
    activeApplication: 'unlimited',
    rejectedApplication: 180, // days
    withdrawnApplication: 30, // days
    hiredCandidate: 'transition', // Move to employee records
    assessmentResults: 365, // days
    documents: 365, // days
  },

  // UI customization
  ui: {
    showProgressBar: true,
    showEstimatedTime: true,
    showHelpButton: true,
    showFAQ: true,
    simplifiedNavigation: true,
    guidedExperience: true,
    contextualHelp: true,
  },
};

export default candidatePortalPreset;
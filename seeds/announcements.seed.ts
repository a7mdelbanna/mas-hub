import { Announcement, Notification, PortalInvite } from '../src/types/models';

export const announcements: Partial<Announcement>[] = [
  {
    id: 'announcement-welcome-2024',
    title: 'Welcome to MAS Business OS',
    content: 'We are excited to announce the launch of our new integrated business operating system. This platform will streamline all our operations and improve collaboration across departments. Please complete your profile setup and explore the new features available in your portal.',
    type: 'success',
    targetAudience: ['employees'],
    publishedAt: new Date('2024-03-01T09:00:00Z'),
    expiresAt: new Date('2024-04-01T09:00:00Z'),
    pinned: true,
    attachments: [
      'https://storage.googleapis.com/mashub-assets/docs/mas-business-os-guide.pdf'
    ]
  },
  {
    id: 'announcement-system-maintenance',
    title: 'Scheduled System Maintenance',
    content: 'Please be informed that we will be performing scheduled system maintenance on Saturday, March 30th from 2:00 AM to 6:00 AM (Egypt Time). The system will be temporarily unavailable during this time. We apologize for any inconvenience and appreciate your understanding.',
    type: 'warning',
    targetAudience: ['all'],
    publishedAt: new Date('2024-03-25T14:00:00Z'),
    expiresAt: new Date('2024-03-31T09:00:00Z'),
    pinned: true
  },
  {
    id: 'announcement-training-program',
    title: 'New Employee Training Program Available',
    content: 'We have launched a comprehensive online training program for all new employees. The program covers company policies, system usage, and role-specific skills. Please check your assigned courses in the Learning Management System and complete them by the due dates.',
    type: 'info',
    targetAudience: ['employees'],
    publishedAt: new Date('2024-03-15T10:00:00Z'),
    pinned: false
  },
  {
    id: 'announcement-client-portal-features',
    title: 'New Client Portal Features',
    content: 'We have added exciting new features to the client portal including real-time project tracking, invoice management with online payment options, and direct communication channels with your project team. Log in to your portal to explore these enhancements and provide feedback.',
    type: 'success',
    targetAudience: ['clients'],
    publishedAt: new Date('2024-03-10T11:00:00Z'),
    attachments: [
      'https://storage.googleapis.com/mashub-assets/docs/client-portal-features-guide.pdf'
    ]
  },
  {
    id: 'announcement-security-update',
    title: 'Important Security Update',
    content: 'As part of our commitment to data security, we have implemented additional security measures including enhanced password requirements and optional two-factor authentication. Please update your passwords to meet the new requirements and consider enabling 2FA for enhanced account protection.',
    type: 'warning',
    targetAudience: ['all'],
    publishedAt: new Date('2024-03-20T15:30:00Z'),
    expiresAt: new Date('2024-04-20T15:30:00Z'),
    pinned: true
  },
  {
    id: 'announcement-q1-results',
    title: 'Q1 2024 Company Results',
    content: 'We are pleased to share our strong Q1 2024 results with the team. Thanks to everyone\'s hard work, we have exceeded our targets with 25% revenue growth and successful completion of all major client projects. Congratulations to all team members for this achievement!',
    type: 'success',
    targetAudience: ['employees'],
    publishedAt: new Date('2024-03-28T16:00:00Z'),
    pinned: true
  },
  {
    id: 'announcement-new-partnership',
    title: 'Strategic Partnership Announcement',
    content: 'We are excited to announce our new strategic partnership with DevSolutions Partners, expanding our technology integration capabilities. This partnership will enable us to offer enhanced payment processing solutions and API integration services to our clients.',
    type: 'info',
    targetAudience: ['employees', 'clients'],
    publishedAt: new Date('2024-03-22T12:00:00Z')
  },
  {
    id: 'announcement-candidate-portal-launch',
    title: 'Candidate Portal Now Available',
    content: 'We have launched our new candidate portal to streamline the recruitment process. Shortlisted candidates can now access pre-hire training materials, schedule interviews, and track their application status through a dedicated portal. This enhancement will provide a better experience for potential team members.',
    type: 'info',
    targetAudience: ['employees'],
    publishedAt: new Date('2024-03-18T13:30:00Z')
  },
  {
    id: 'announcement-mobile-app-update',
    title: 'Mobile App Version 2.1 Released',
    content: 'We have released version 2.1 of our mobile POS application with improved performance, new reporting features, and enhanced offline capabilities. Existing clients can update through their app stores, and new installation packages are available for download.',
    type: 'success',
    targetAudience: ['clients'],
    publishedAt: new Date('2024-03-24T10:15:00Z'),
    attachments: [
      'https://storage.googleapis.com/mashub-assets/releases/mobile-app-v2.1-release-notes.pdf'
    ]
  },
  {
    id: 'announcement-office-expansion',
    title: 'Office Expansion Complete',
    content: 'Our office expansion project is now complete! We have added 50% more workspace, upgraded our technical infrastructure, and created new collaboration areas. The expanded facilities will support our growing team and enable us to serve more clients effectively.',
    type: 'success',
    targetAudience: ['employees'],
    publishedAt: new Date('2024-03-12T14:20:00Z'),
    attachments: [
      'https://storage.googleapis.com/mashub-assets/photos/office-expansion-photos.pdf'
    ]
  }
];

// Sample notifications for different users
export const notifications: Partial<Notification>[] = [
  // CEO Notifications
  {
    id: 'notif-ceo-monthly-report',
    userId: 'user-ceo',
    type: 'info',
    title: 'Monthly Executive Report Available',
    message: 'The March 2024 executive dashboard report is ready for your review. Revenue is up 15% compared to last month.',
    entityType: 'report',
    entityId: 'report-executive-march-2024',
    actionUrl: '/reports/executive',
    read: false,
    emailSent: true,
    pushSent: false
  },
  {
    id: 'notif-ceo-sla-breach',
    userId: 'user-ceo',
    type: 'warning',
    title: 'SLA Breach Alert',
    message: 'Ticket #TKT-2024-010 has breached SLA. Customer: TechStore Electronics. Response was 2 hours late.',
    entityType: 'ticket',
    entityId: 'ticket-sla-breached-example',
    actionUrl: '/tickets/ticket-sla-breached-example',
    read: false,
    emailSent: true,
    pushSent: true
  },

  // Project Manager Notifications
  {
    id: 'notif-pm-budget-warning',
    userId: 'user-pos-analyst',
    type: 'warning',
    title: 'Project Budget Warning',
    message: 'Golden Spoon POS project has reached 85% of budget allocation. Current spending: $32,000 of $45,000.',
    entityType: 'project',
    entityId: 'project-golden-spoon-pos',
    actionUrl: '/projects/project-golden-spoon-pos',
    read: true,
    readAt: new Date('2024-03-25T10:30:00Z'),
    emailSent: true,
    pushSent: false
  },
  {
    id: 'notif-pm-milestone-complete',
    userId: 'user-senior-developer',
    type: 'success',
    title: 'Milestone Completed',
    message: 'TechStore Mobile App - Backend Development milestone has been completed successfully.',
    entityType: 'project',
    entityId: 'project-techstore-mobile',
    actionUrl: '/projects/project-techstore-mobile',
    read: false,
    emailSent: true,
    pushSent: false
  },

  // Support Team Notifications
  {
    id: 'notif-support-ticket-assigned',
    userId: 'user-support-tech',
    type: 'task',
    title: 'New Ticket Assigned',
    message: 'New high priority ticket assigned: "Inventory Not Syncing Between Locations" from HealthFirst Pharmacy.',
    entityType: 'ticket',
    entityId: 'ticket-health-first-inventory-sync',
    actionUrl: '/tickets/ticket-health-first-inventory-sync',
    read: false,
    emailSent: true,
    pushSent: true
  },
  {
    id: 'notif-support-sla-warning',
    userId: 'user-field-engineer',
    type: 'warning',
    title: 'SLA Warning',
    message: 'Ticket #TKT-2024-006 (PowerGym) will breach SLA in 30 minutes. Please provide status update.',
    entityType: 'ticket',
    entityId: 'ticket-powergym-feature-request',
    actionUrl: '/tickets/ticket-powergym-feature-request',
    read: false,
    emailSent: true,
    pushSent: true
  },

  // Finance Team Notifications
  {
    id: 'notif-finance-payment-received',
    userId: 'user-manager-finance',
    type: 'success',
    title: 'Payment Received',
    message: 'Payment of $15,000 received from Golden Spoon Restaurant via Paymob for Invoice #INV-2024-012.',
    entityType: 'payment',
    entityId: 'payment-golden-spoon-partial',
    actionUrl: '/payments/payment-golden-spoon-partial',
    read: true,
    readAt: new Date('2024-03-10T14:25:00Z'),
    emailSent: true,
    pushSent: false
  },
  {
    id: 'notif-finance-invoice-overdue',
    userId: 'user-billing-specialist',
    type: 'error',
    title: 'Invoice Overdue',
    message: 'Invoice #INV-2024-005 from Fashion Hub Boutique is 25 days overdue. Amount: $5,750.',
    entityType: 'invoice',
    entityId: 'invoice-fashion-hub-overdue',
    actionUrl: '/invoices/invoice-fashion-hub-overdue',
    read: false,
    emailSent: true,
    pushSent: false
  },

  // HR Notifications
  {
    id: 'notif-hr-interview-scheduled',
    userId: 'user-hr-recruiter',
    type: 'info',
    title: 'Interview Scheduled',
    message: 'Technical interview scheduled for Yasmin Nader (UI/UX Designer) on March 28th at 3:00 PM.',
    entityType: 'interview',
    entityId: 'interview-yasmin-designer-portfolio',
    actionUrl: '/candidates/candidate-designer-interview',
    read: false,
    emailSent: true,
    pushSent: false
  },
  {
    id: 'notif-hr-training-completed',
    userId: 'user-manager-hr',
    type: 'success',
    title: 'Training Completed',
    message: 'Karim El-Wakil has completed the pre-hire sales training with a score of 88%. Ready for final interview.',
    entityType: 'assignment',
    entityId: 'assignment-tech-assessment-candidate1',
    actionUrl: '/candidates/candidate-sales-rep-training',
    read: false,
    emailSent: true,
    pushSent: false
  },

  // Employee Notifications
  {
    id: 'notif-employee-task-due',
    userId: 'user-mobile-developer',
    type: 'warning',
    title: 'Task Due Tomorrow',
    message: 'Task "Implement Push Notifications" for TechStore Mobile App is due tomorrow.',
    entityType: 'task',
    entityId: 'task-ts-push-notifications',
    actionUrl: '/tasks/task-ts-push-notifications',
    read: false,
    emailSent: false,
    pushSent: true
  },
  {
    id: 'notif-employee-timesheet-reminder',
    userId: 'user-frontend-developer',
    type: 'info',
    title: 'Timesheet Reminder',
    message: 'Please submit your timesheet for this week. 3 days remaining until deadline.',
    entityType: 'timesheet',
    actionUrl: '/timesheets/current-week',
    read: false,
    emailSent: false,
    pushSent: false
  },

  // Client Notifications (for client portal users)
  {
    id: 'notif-client-project-update',
    userId: 'user-client-restaurant-owner',
    type: 'info',
    title: 'Project Update',
    message: 'Your Golden Spoon POS project has reached 65% completion. Data migration phase is in progress.',
    entityType: 'project',
    entityId: 'project-golden-spoon-pos',
    actionUrl: '/client-portal/projects/project-golden-spoon-pos',
    read: true,
    readAt: new Date('2024-03-24T09:15:00Z'),
    emailSent: true,
    pushSent: false
  },
  {
    id: 'notif-client-invoice-available',
    userId: 'user-client-retail-manager',
    type: 'info',
    title: 'New Invoice Available',
    message: 'Invoice #INV-2024-018 for $25,300 is now available in your portal. Due date: March 26, 2024.',
    entityType: 'invoice',
    entityId: 'invoice-techstore-milestone1',
    actionUrl: '/client-portal/invoices/invoice-techstore-milestone1',
    read: false,
    emailSent: true,
    pushSent: false
  }
];

// Portal invites for client and candidate access
export const portalInvites: Partial<PortalInvite>[] = [
  // Client Portal Invites
  {
    id: 'invite-client-golden-spoon',
    email: 'owner@goldenspoon.restaurant',
    portalType: 'client',
    accountId: 'account-golden-spoon',
    token: 'client-invite-token-12345',
    status: 'accepted',
    expiresAt: new Date('2024-04-15T23:59:59Z'),
    acceptedAt: new Date('2024-01-20T14:30:00Z'),
    customMessage: 'Welcome to your MAS Business Solutions client portal. Here you can track your POS implementation project, view invoices, and communicate with our team.'
  },
  {
    id: 'invite-client-techstore',
    email: 'manager@techstore.com',
    portalType: 'client',
    accountId: 'account-tech-store',
    token: 'client-invite-token-67890',
    status: 'accepted',
    expiresAt: new Date('2024-04-10T23:59:59Z'),
    acceptedAt: new Date('2024-02-05T10:15:00Z'),
    customMessage: 'Your client portal provides access to your mobile app development project status, documentation, and billing information.'
  },
  {
    id: 'invite-client-healthfirst',
    email: 'owner@healthfirst.pharmacy',
    portalType: 'client',
    accountId: 'account-health-first',
    token: 'client-invite-token-abcde',
    status: 'accepted',
    expiresAt: new Date('2024-04-05T23:59:59Z'),
    acceptedAt: new Date('2024-01-10T16:45:00Z'),
    customMessage: 'Access your pharmacy POS project details, training materials, and support resources through this portal.'
  },
  {
    id: 'invite-client-powergym',
    email: 'membership@powergym.fitness',
    portalType: 'client',
    accountId: 'account-fitness-center',
    token: 'client-invite-token-fghij',
    status: 'pending',
    expiresAt: new Date('2024-04-30T23:59:59Z'),
    customMessage: 'Welcome to PowerGym! Use this portal to access your fitness app project information and billing details.'
  },

  // Candidate Portal Invites
  {
    id: 'invite-candidate-001',
    email: 'karim.elwakil@email.com',
    portalType: 'candidate',
    candidateId: 'candidate-sales-rep-training',
    token: 'candidate-invite-token-xyz123',
    status: 'accepted',
    expiresAt: new Date('2024-04-15T23:59:59Z'),
    acceptedAt: new Date('2024-03-15T11:00:00Z'),
    customMessage: 'Congratulations on being shortlisted! Please complete the pre-hire training modules and assessments available in your candidate portal.'
  },
  {
    id: 'invite-candidate-002',
    email: 'sara.zaki@email.com',
    portalType: 'candidate',
    candidateId: 'candidate-accountant-training',
    token: 'candidate-invite-token-abc456',
    status: 'accepted',
    expiresAt: new Date('2024-04-20T23:59:59Z'),
    acceptedAt: new Date('2024-03-18T13:30:00Z'),
    customMessage: 'Welcome to the MAS team! Please complete your pre-hire accounting systems training before your start date.'
  },
  {
    id: 'invite-candidate-003',
    email: 'mariam.farouk@email.com',
    portalType: 'candidate',
    candidateId: 'candidate-mobile-developer-invited',
    token: 'candidate-invite-token-def789',
    status: 'pending',
    expiresAt: new Date('2024-04-10T23:59:59Z'),
    customMessage: 'Thank you for your interest in the Mobile Developer position. Please complete the technical assessment in your candidate portal within 7 days.'
  },
  {
    id: 'invite-candidate-004',
    email: 'heba.mostafa@email.com',
    portalType: 'candidate',
    candidateId: 'candidate-hr-coordinator',
    token: 'candidate-invite-token-ghi012',
    status: 'pending',
    expiresAt: new Date('2024-04-25T23:59:59Z'),
    customMessage: 'Welcome to the next stage of our recruitment process. Please complete the HR competency assessment and company overview materials.'
  },

  // Employee Portal Invites (for new hires)
  {
    id: 'invite-employee-new',
    email: 'new.employee@mas.business',
    portalType: 'employee',
    userId: 'candidate-data-analyst-hired', // Will be converted to employee
    token: 'employee-invite-token-new001',
    status: 'pending',
    expiresAt: new Date('2024-04-15T23:59:59Z'),
    customMessage: 'Welcome to the MAS team! Your employee portal access will be activated on your start date. Please keep this invitation for your records.'
  },

  // Expired Invites
  {
    id: 'invite-expired-candidate',
    email: 'expired.candidate@email.com',
    portalType: 'candidate',
    token: 'expired-candidate-token',
    status: 'expired',
    expiresAt: new Date('2024-03-01T23:59:59Z'),
    customMessage: 'Technical assessment invitation - this invitation has expired.'
  }
];
import { Ticket, TicketComment, Visit, SLAPolicy, TicketStatus, TicketPriority } from '../src/types/models';

// SLA Policies first
export const slaPolicies: Partial<SLAPolicy>[] = [
  {
    id: 'sla-standard-support',
    name: 'Standard Support SLA',
    description: 'Standard support service level agreement for regular clients',
    active: true,
    targets: [
      {
        priority: TicketPriority.CRITICAL,
        firstResponseTime: 15, // 15 minutes
        resolutionTime: 240, // 4 hours
        businessHours: true
      },
      {
        priority: TicketPriority.HIGH,
        firstResponseTime: 60, // 1 hour
        resolutionTime: 480, // 8 hours
        businessHours: true
      },
      {
        priority: TicketPriority.MEDIUM,
        firstResponseTime: 240, // 4 hours
        resolutionTime: 1440, // 24 hours
        businessHours: true
      },
      {
        priority: TicketPriority.LOW,
        firstResponseTime: 1440, // 24 hours
        resolutionTime: 4320, // 72 hours
        businessHours: true
      }
    ],
    escalationRules: [
      {
        condition: 'sla_breach_imminent',
        action: 'notify_manager',
        notifyUsers: ['user-manager-support']
      },
      {
        condition: 'sla_breached',
        action: 'escalate_to_senior',
        notifyUsers: ['user-support-lead', 'user-manager-support']
      }
    ]
  },
  {
    id: 'sla-premium-support',
    name: 'Premium Support SLA',
    description: 'Premium support with faster response times for Gold/Platinum clients',
    active: true,
    targets: [
      {
        priority: TicketPriority.CRITICAL,
        firstResponseTime: 5, // 5 minutes
        resolutionTime: 120, // 2 hours
        businessHours: false // 24/7 support
      },
      {
        priority: TicketPriority.HIGH,
        firstResponseTime: 30, // 30 minutes
        resolutionTime: 240, // 4 hours
        businessHours: false
      },
      {
        priority: TicketPriority.MEDIUM,
        firstResponseTime: 120, // 2 hours
        resolutionTime: 720, // 12 hours
        businessHours: true
      },
      {
        priority: TicketPriority.LOW,
        firstResponseTime: 480, // 8 hours
        resolutionTime: 2160, // 36 hours
        businessHours: true
      }
    ],
    escalationRules: [
      {
        condition: 'sla_breach_imminent',
        action: 'notify_senior_management',
        notifyUsers: ['user-manager-support', 'user-ceo']
      }
    ]
  }
];

export const tickets: Partial<Ticket>[] = [
  // Recent Critical Tickets
  {
    id: 'ticket-golden-spoon-system-down',
    ticketNumber: 'TKT-2024-001',
    accountId: 'account-golden-spoon',
    projectId: 'project-golden-spoon-pos',
    subject: 'POS System Not Starting - Main Location',
    description: 'The POS system at our main Tahrir location is not starting up. Getting a black screen after power on. This is affecting our ability to process orders and we need immediate assistance.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.CRITICAL,
    category: 'Hardware Issue',
    assigneeId: 'user-field-engineer',
    slaPolicyId: 'sla-premium-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-25T09:05:00Z'),
    resolvedAt: new Date('2024-03-25T11:30:00Z'),
    rating: 5,
    feedback: 'Excellent response time and professional service. Issue resolved quickly.',
    customFields: {
      urgency: 'Business Critical',
      affectedUsers: 8,
      affectedLocations: 1
    }
  },
  {
    id: 'ticket-pizza-palace-payment-issue',
    ticketNumber: 'TKT-2024-002',
    accountId: 'account-pizza-palace',
    subject: 'Payment Gateway Integration Error',
    description: 'Customers are unable to pay with credit cards. Getting error message "Payment processor unavailable". Cash payments are working fine.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.HIGH,
    category: 'Payment Integration',
    assigneeId: 'user-support-tech',
    slaPolicyId: 'sla-premium-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-24T14:25:00Z'),
    resolvedAt: new Date('2024-03-24T17:45:00Z'),
    rating: 4,
    feedback: 'Good technical support, resolved within acceptable time frame.',
    customFields: {
      affectedPaymentMethods: ['Visa', 'Mastercard'],
      affectedLocations: 12,
      revenueImpact: 'High'
    }
  },

  // Active High Priority Tickets
  {
    id: 'ticket-health-first-inventory-sync',
    ticketNumber: 'TKT-2024-003',
    accountId: 'account-health-first',
    projectId: 'project-health-first-pos',
    subject: 'Inventory Not Syncing Between Locations',
    description: 'Inventory levels are not syncing properly between our 4 pharmacy locations. Stock shows available at one location but system says out of stock at others.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    category: 'Data Synchronization',
    assigneeId: 'user-support-tech',
    slaPolicyId: 'sla-premium-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-26T08:15:00Z'),
    customFields: {
      affectedLocations: 4,
      syncIssueType: 'Inventory',
      estimatedResolution: '2024-03-27'
    }
  },
  {
    id: 'ticket-techstore-report-error',
    ticketNumber: 'TKT-2024-004',
    accountId: 'account-tech-store',
    projectId: 'project-techstore-mobile',
    subject: 'Daily Sales Report Generation Failed',
    description: 'The daily sales report is not generating correctly. Report shows blank data for yesterday and today. Monthly reports are working fine.',
    status: TicketStatus.ASSIGNED,
    priority: TicketPriority.MEDIUM,
    category: 'Reporting Issue',
    assigneeId: 'user-support-tech',
    slaPolicyId: 'sla-standard-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-26T10:30:00Z'),
    customFields: {
      reportType: 'Daily Sales',
      affectedDateRange: '2024-03-25 to 2024-03-26',
      workaroundAvailable: true
    }
  },

  // Medium Priority Tickets
  {
    id: 'ticket-dental-clinic-training',
    ticketNumber: 'TKT-2024-005',
    accountId: 'account-dental-clinic',
    projectId: 'project-dental-support',
    subject: 'Additional Staff Training Request',
    description: 'We have hired 2 new reception staff and need training on the POS system. Please schedule training sessions at our earliest convenience.',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.MEDIUM,
    category: 'Training Request',
    assigneeId: 'user-hr-recruiter',
    slaPolicyId: 'sla-standard-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-25T16:45:00Z'),
    customFields: {
      trainingType: 'New Staff Onboarding',
      numberOfTrainees: 2,
      preferredDate: '2024-04-01'
    }
  },
  {
    id: 'ticket-powergym-feature-request',
    ticketNumber: 'TKT-2024-006',
    accountId: 'account-fitness-center',
    subject: 'Custom Membership Package Configuration',
    description: 'Need help configuring a new corporate membership package with special pricing and billing cycles for our business clients.',
    status: TicketStatus.NEW,
    priority: TicketPriority.MEDIUM,
    category: 'Configuration',
    slaPolicyId: 'sla-premium-support',
    slaBreached: false,
    customFields: {
      requestType: 'Configuration Change',
      membershipType: 'Corporate',
      estimatedComplexity: 'Medium'
    }
  },

  // Low Priority Tickets
  {
    id: 'ticket-beauty-salon-cosmetic',
    ticketNumber: 'TKT-2024-007',
    accountId: 'account-beauty-salon',
    subject: 'Logo Update on Receipt Template',
    description: 'Please update our logo on the receipt template. We have a new logo design and want to update it across all printed materials.',
    status: TicketStatus.NEW,
    priority: TicketPriority.LOW,
    category: 'Customization',
    slaPolicyId: 'sla-standard-support',
    slaBreached: false,
    customFields: {
      changeType: 'Visual/Cosmetic',
      urgency: 'When Convenient',
      newLogoUrl: 'https://storage.googleapis.com/client-assets/beauty-salon-new-logo.png'
    }
  },
  {
    id: 'ticket-fashion-hub-question',
    ticketNumber: 'TKT-2024-008',
    accountId: 'account-fashion-hub',
    subject: 'Question About Discount Codes',
    description: 'How do we set up seasonal discount codes in the system? We want to create a 20% off code for spring collection.',
    status: TicketStatus.ASSIGNED,
    priority: TicketPriority.LOW,
    category: 'How-To Question',
    assigneeId: 'user-support-tech',
    slaPolicyId: 'sla-standard-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-26T14:20:00Z'),
    customFields: {
      questionType: 'Feature Usage',
      discountType: 'Percentage',
      discountValue: 20
    }
  },

  // Closed/Resolved Tickets with Different Scenarios
  {
    id: 'ticket-resolved-printer-issue',
    ticketNumber: 'TKT-2024-009',
    accountId: 'account-golden-spoon',
    subject: 'Receipt Printer Jamming Frequently',
    description: 'Receipt printer is jamming multiple times per day. Customers are complaining about wait times.',
    status: TicketStatus.CLOSED,
    priority: TicketPriority.HIGH,
    category: 'Hardware Issue',
    assigneeId: 'user-field-engineer',
    slaPolicyId: 'sla-premium-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-20T09:15:00Z'),
    resolvedAt: new Date('2024-03-20T15:30:00Z'),
    closedAt: new Date('2024-03-22T10:00:00Z'),
    rating: 5,
    feedback: 'Perfect service. Technician replaced the printer and provided maintenance tips.',
    customFields: {
      resolutionType: 'Hardware Replacement',
      partsUsed: ['Thermal Printer Model TP-80'],
      onSiteTime: '2 hours'
    }
  },
  {
    id: 'ticket-sla-breached-example',
    ticketNumber: 'TKT-2024-010',
    accountId: 'account-tech-store',
    subject: 'System Performance Very Slow',
    description: 'The entire POS system has become very slow. Transactions are taking 3-4 minutes to process.',
    status: TicketStatus.RESOLVED,
    priority: TicketPriority.HIGH,
    category: 'Performance Issue',
    assigneeId: 'user-support-tech',
    slaPolicyId: 'sla-standard-support',
    slaBreached: true, // This one breached SLA
    firstResponseAt: new Date('2024-03-18T11:30:00Z'), // Response was late
    resolvedAt: new Date('2024-03-19T16:45:00Z'),
    rating: 3,
    feedback: 'Issue was resolved but response time was slower than expected.',
    customFields: {
      performanceIssue: 'Database Optimization Needed',
      resolutionNotes: 'Optimized database queries and cleared cache'
    }
  },

  // Waiting on Customer
  {
    id: 'ticket-waiting-customer',
    ticketNumber: 'TKT-2024-011',
    accountId: 'account-dental-clinic',
    subject: 'Network Configuration for New Branch',
    description: 'Need help setting up network configuration for our new branch location.',
    status: TicketStatus.WAITING_CUSTOMER,
    priority: TicketPriority.MEDIUM,
    category: 'Network Setup',
    assigneeId: 'user-field-engineer',
    slaPolicyId: 'sla-standard-support',
    slaBreached: false,
    firstResponseAt: new Date('2024-03-24T13:15:00Z'),
    customFields: {
      waitingFor: 'Network access credentials from customer',
      lastCustomerContact: '2024-03-25T09:00:00Z',
      followUpScheduled: '2024-03-27T10:00:00Z'
    }
  }
];

// Sample ticket comments/conversation
export const ticketComments: Partial<TicketComment>[] = [
  // Comments for the critical POS system down ticket
  {
    id: 'comment-001',
    ticketId: 'ticket-golden-spoon-system-down',
    authorId: 'user-field-engineer',
    content: 'I have received your ticket and am immediately dispatching to your location. ETA: 15 minutes. Please ensure the power cable is firmly connected and try a power cycle while I am en route.',
    isInternal: false
  },
  {
    id: 'comment-002',
    ticketId: 'ticket-golden-spoon-system-down',
    authorId: 'user-client-restaurant-owner',
    content: 'Thank you for the quick response! We tried power cycling as suggested but still getting black screen. We will wait for your arrival.',
    isInternal: false
  },
  {
    id: 'comment-003',
    ticketId: 'ticket-golden-spoon-system-down',
    authorId: 'user-field-engineer',
    content: 'On-site now. Issue identified: faulty display cable connection. Replacing cable now.',
    isInternal: false
  },
  {
    id: 'comment-004',
    ticketId: 'ticket-golden-spoon-system-down',
    authorId: 'user-field-engineer',
    content: 'System is now operational. Performed full system test including payment processing. All functions working normally. Provided maintenance schedule to prevent future issues.',
    isInternal: false
  },

  // Comments for payment gateway issue
  {
    id: 'comment-005',
    ticketId: 'ticket-pizza-palace-payment-issue',
    authorId: 'user-support-tech',
    content: 'Thank you for reporting this issue. I can see the payment gateway connection is timing out. Checking with our payment provider for any known issues.',
    isInternal: false
  },
  {
    id: 'comment-006',
    ticketId: 'ticket-pizza-palace-payment-issue',
    authorId: 'user-support-tech',
    content: 'Internal note: Stripe API showing elevated error rates. Switching to backup payment processor temporarily.',
    isInternal: true
  },
  {
    id: 'comment-007',
    ticketId: 'ticket-pizza-palace-payment-issue',
    authorId: 'user-support-tech',
    content: 'I have switched you to our backup payment processor while we resolve the issue with the primary gateway. Credit card payments should now work normally. Please test and confirm.',
    isInternal: false
  },

  // Comments for ongoing inventory sync issue
  {
    id: 'comment-008',
    ticketId: 'ticket-health-first-inventory-sync',
    authorId: 'user-support-tech',
    content: 'I am investigating the inventory synchronization issue between your locations. Can you please confirm which location is showing the correct inventory levels?',
    isInternal: false
  },
  {
    id: 'comment-009',
    ticketId: 'ticket-health-first-inventory-sync',
    authorId: 'user-client-pharmacy-owner',
    content: 'The main branch (Medical District) seems to have accurate counts. The other 3 branches are showing incorrect data.',
    isInternal: false
  },
  {
    id: 'comment-010',
    ticketId: 'ticket-health-first-inventory-sync',
    authorId: 'user-support-tech',
    content: 'Thank you for the clarification. I found the issue - the sync service was not running on the satellite locations. Restarting the service now and will monitor for 24 hours to ensure stability.',
    isInternal: false
  },

  // Comments for training request
  {
    id: 'comment-011',
    ticketId: 'ticket-dental-clinic-training',
    authorId: 'user-hr-recruiter',
    content: 'Thank you for your training request. I can schedule training for your new staff members. Are you available for a 2-hour session next Tuesday at 10 AM?',
    isInternal: false
  },
  {
    id: 'comment-012',
    ticketId: 'ticket-dental-clinic-training',
    authorId: 'user-client-dental-manager',
    content: 'Tuesday 10 AM works perfectly. Both new staff members will be available. Should they complete any pre-training materials?',
    isInternal: false
  },
  {
    id: 'comment-013',
    ticketId: 'ticket-dental-clinic-training',
    authorId: 'user-hr-recruiter',
    content: 'Perfect! I will send them access to our online orientation course. Please have them complete it before Tuesday. I will also bring training materials and hands-on exercises.',
    isInternal: false
  }
];

// Sample field visits for on-site support
export const visits: Partial<Visit>[] = [
  {
    id: 'visit-golden-spoon-emergency',
    ticketId: 'ticket-golden-spoon-system-down',
    clientSiteId: 'site-golden-spoon-main',
    scheduledAt: new Date('2024-03-25T09:30:00Z'),
    assigneeId: 'user-field-engineer',
    duration: 2.5,
    billable: false, // Emergency covered under warranty
    status: 'completed',
    checkInTime: new Date('2024-03-25T09:25:00Z'),
    checkOutTime: new Date('2024-03-25T11:55:00Z'),
    notes: 'Emergency repair - replaced faulty display cable. System tested and operational. Provided preventive maintenance recommendations.',
    signature: 'base64_signature_data_here'
  },
  {
    id: 'visit-printer-replacement',
    ticketId: 'ticket-resolved-printer-issue',
    clientSiteId: 'site-golden-spoon-main',
    scheduledAt: new Date('2024-03-20T14:00:00Z'),
    assigneeId: 'user-field-engineer',
    duration: 2,
    billable: true,
    status: 'completed',
    checkInTime: new Date('2024-03-20T13:55:00Z'),
    checkOutTime: new Date('2024-03-20T15:55:00Z'),
    notes: 'Replaced thermal printer due to frequent jamming. Installed new TP-80 model, configured settings, and tested with sample receipts. Provided usage and maintenance guidelines.',
    signature: 'base64_signature_data_printer_replacement'
  },
  {
    id: 'visit-training-scheduled',
    ticketId: 'ticket-dental-clinic-training',
    clientSiteId: 'site-dental-clinic-main',
    scheduledAt: new Date('2024-04-02T10:00:00Z'),
    assigneeId: 'user-hr-recruiter',
    duration: 2,
    billable: true,
    status: 'scheduled',
    notes: 'Scheduled training for 2 new reception staff members. Will cover basic POS operations, appointment booking, and payment processing.'
  },
  {
    id: 'visit-network-setup-pending',
    ticketId: 'ticket-waiting-customer',
    clientSiteId: 'site-dental-clinic-branch2',
    scheduledAt: new Date('2024-03-28T09:00:00Z'),
    assigneeId: 'user-field-engineer',
    duration: 4,
    billable: true,
    status: 'scheduled',
    notes: 'Network configuration for new branch. Waiting for network access credentials from customer before proceeding.'
  }
];
/**
 * Demo Scenario: Complete Project Lifecycle
 *
 * This scenario demonstrates a complete project from initial lead to final delivery
 * using the Golden Spoon Restaurant POS implementation as an example.
 *
 * Flow:
 * 1. Lead qualification and opportunity creation
 * 2. Quote generation and approval
 * 3. Deal won and contract signed
 * 4. Project creation and team assignment
 * 5. Project execution through phases
 * 6. Milestone billing and payments
 * 7. Training and go-live
 * 8. Project completion and support handover
 */

export const projectLifecycleScenario = {
  name: 'Complete Project Lifecycle - Golden Spoon Restaurant',
  description: 'End-to-end project delivery from lead to completion',
  duration: '3 months',

  // Key entities involved
  entities: {
    account: 'account-golden-spoon',
    project: 'project-golden-spoon-pos',
    opportunity: 'opportunity-golden-spoon',
    quote: 'quote-golden-spoon-001',
    contract: 'contract-golden-spoon-pos',
    invoices: [
      'invoice-golden-spoon-milestone1',
      'invoice-golden-spoon-milestone2',
      'invoice-golden-spoon-final'
    ],
    users: {
      salesRep: 'user-sales-lead',
      projectManager: 'user-pos-analyst',
      developer: 'user-pos-developer',
      supportEngineer: 'user-support-tech',
      client: 'user-client-restaurant-owner'
    }
  },

  // Step-by-step walkthrough
  steps: [
    {
      phase: 'Lead Qualification',
      duration: '3 days',
      description: 'Initial client contact and requirements gathering',
      activities: [
        {
          day: 1,
          actor: 'Sales Rep',
          action: 'Receives inbound lead from restaurant owner',
          data: {
            leadSource: 'Website Contact Form',
            initialNeed: '3-location restaurant chain needs POS system',
            budget: '$40,000 - $60,000'
          }
        },
        {
          day: 2,
          actor: 'Sales Rep',
          action: 'Conducts discovery call',
          data: {
            requirements: [
              'Multi-location inventory sync',
              'Kitchen display integration',
              'Online ordering capability',
              'Detailed reporting'
            ],
            timeline: 'ASAP - current system failing'
          }
        },
        {
          day: 3,
          actor: 'Sales Rep',
          action: 'Creates qualified opportunity in CRM',
          data: {
            opportunityValue: '$45,000',
            probability: '60%',
            expectedClose: '2024-01-30'
          }
        }
      ]
    },

    {
      phase: 'Solution Design & Quote',
      duration: '1 week',
      description: 'Technical assessment and solution proposal',
      activities: [
        {
          day: 4,
          actor: 'POS Analyst',
          action: 'Conducts site survey at main location',
          data: {
            findings: [
              'Good network infrastructure',
              'Need 3 POS terminals total',
              'Kitchen display system required',
              'Existing data in Excel format'
            ]
          }
        },
        {
          day: 6,
          actor: 'Sales Rep',
          action: 'Creates and sends quote',
          data: {
            lineItems: [
              'POS Hardware Package (3 locations): $9,600',
              'Restaurant POS Software License: $3,600',
              'Implementation Services: $4,800',
              'Data Migration: $2,500',
              'Staff Training: $1,200',
              'Project Management: $3,300'
            ],
            total: '$25,000',
            terms: '50% upfront, 25% at go-live, 25% 30 days after'
          }
        },
        {
          day: 8,
          actor: 'Client',
          action: 'Reviews and negotiates quote',
          data: {
            feedback: 'Interested but wants extended warranty',
            negotiation: 'Add 1-year extended warranty for same price'
          }
        }
      ]
    },

    {
      phase: 'Deal Closure',
      duration: '1 week',
      description: 'Contract negotiation and signing',
      activities: [
        {
          day: 10,
          actor: 'Sales Rep',
          action: 'Updates quote with extended warranty',
          data: {
            adjustment: 'Added 1-year extended warranty (value $2,400)',
            finalTotal: '$45,000',
            margin: 'Acceptable within discount parameters'
          }
        },
        {
          day: 12,
          actor: 'Client',
          action: 'Accepts quote and signs contract',
          data: {
            signedValue: '$45,000',
            paymentTerms: 'Net 30',
            startDate: '2024-01-15',
            expectedCompletion: '2024-04-15'
          }
        },
        {
          day: 13,
          actor: 'Sales Rep',
          action: 'Converts opportunity to project',
          data: {
            conversionNotes: 'Client eager to start, priority implementation',
            projectPriority: 'High'
          }
        }
      ]
    },

    {
      phase: 'Project Initiation',
      duration: '1 week',
      description: 'Project setup and team assignment',
      activities: [
        {
          day: 14,
          actor: 'Project Manager',
          action: 'Creates project from POS template',
          data: {
            projectCode: 'GS-POS-2024-001',
            phases: [
              'Discovery & Analysis (2 weeks)',
              'System Configuration (3 weeks)',
              'Data Migration (2 weeks)',
              'User Training (3 weeks)',
              'Go-Live & Support (3 weeks)'
            ],
            team: [
              'POS Analyst (Lead)',
              'POS Developer',
              'Support Engineer'
            ]
          }
        },
        {
          day: 15,
          actor: 'Project Manager',
          action: 'Schedules kickoff meeting',
          data: {
            attendees: 'Client + full project team',
            agenda: [
              'Project overview and timeline',
              'Team introductions',
              'Communication plan',
              'Next steps and scheduling'
            ]
          }
        },
        {
          day: 16,
          actor: 'Finance',
          action: 'Generates first milestone invoice',
          data: {
            invoiceNumber: 'INV-2024-001',
            amount: '$15,000',
            milestone: 'Project Initiation - Discovery Phase',
            dueDate: '2024-02-29'
          }
        }
      ]
    },

    {
      phase: 'Discovery & Analysis',
      duration: '2 weeks',
      description: 'Detailed requirements and technical analysis',
      activities: [
        {
          week: '1-2',
          actor: 'POS Analyst',
          action: 'Conducts detailed requirements gathering',
          data: {
            deliverables: [
              'Business requirements document',
              'Technical specification',
              'Network assessment report',
              'Data mapping document'
            ]
          }
        },
        {
          week: 2,
          actor: 'Client',
          action: 'Pays first milestone invoice',
          data: {
            paymentMethod: 'Bank Transfer',
            amount: '$17,250', // Including tax
            reference: 'BANK-REF-789456123'
          }
        }
      ]
    },

    {
      phase: 'System Configuration',
      duration: '3 weeks',
      description: 'Hardware setup and software configuration',
      activities: [
        {
          week: '3-4',
          actor: 'POS Developer',
          action: 'Configures POS software for restaurant operations',
          data: {
            configurations: [
              'Menu setup with categories and modifiers',
              'Kitchen display system integration',
              'Payment gateway configuration',
              'Reporting templates customization'
            ]
          }
        },
        {
          week: 5,
          actor: 'Support Engineer',
          action: 'Installs hardware at all locations',
          data: {
            locations: [
              'Main Branch (Tahrir): 1 POS terminal, 1 kitchen display',
              'Zamalek Branch: 1 POS terminal',
              'Maadi Branch: 1 POS terminal'
            ]
          }
        },
        {
          week: 5,
          actor: 'Finance',
          action: 'Generates second milestone invoice',
          data: {
            invoiceNumber: 'INV-2024-012',
            amount: '$20,000',
            milestone: 'System Configuration Complete',
            status: 'Partially paid ($15,000 received)'
          }
        }
      ]
    },

    {
      phase: 'Data Migration',
      duration: '2 weeks',
      description: 'Transfer existing business data',
      activities: [
        {
          week: 6,
          actor: 'POS Developer',
          action: 'Migrates menu and customer data',
          data: {
            migratedData: [
              '250 menu items with pricing',
              '1,200 customer records',
              '50 suppliers',
              'Historical sales data (6 months)'
            ]
          }
        },
        {
          week: 7,
          actor: 'Client',
          action: 'Reviews migrated data accuracy',
          data: {
            accuracy: '99.2%',
            issues: 'Minor price discrepancies on 12 items (corrected)',
            approval: 'Data migration approved'
          }
        }
      ]
    },

    {
      phase: 'User Training',
      duration: '3 weeks',
      description: 'Staff training across all locations',
      activities: [
        {
          week: 8,
          actor: 'HR Trainer',
          action: 'Delivers POS system training',
          data: {
            sessions: [
              'Manager training (8 hours): System admin, reports',
              'Staff training (4 hours): Order processing, payments',
              'Kitchen staff (2 hours): Kitchen display system'
            ],
            trainees: 18,
            completionRate: '100%'
          }
        },
        {
          week: 9,
          actor: 'Client',
          action: 'Conducts user acceptance testing',
          data: {
            testScenarios: [
              'Peak hour order processing',
              'Split payments and discounts',
              'Kitchen display workflow',
              'End-of-day reporting'
            ],
            results: 'All tests passed successfully'
          }
        }
      ]
    },

    {
      phase: 'Go-Live & Support',
      duration: '3 weeks',
      description: 'System deployment and stabilization',
      activities: [
        {
          week: 10,
          actor: 'Project Manager',
          action: 'Coordinates go-live across all locations',
          data: {
            goLiveSchedule: [
              'Day 1: Main branch (Tahrir)',
              'Day 3: Zamalek branch',
              'Day 5: Maadi branch'
            ]
          }
        },
        {
          week: 11,
          actor: 'Support Engineer',
          action: 'Provides on-site support during first week',
          data: {
            supportHours: '40 hours total',
            issues: [
              '3 minor hardware adjustments',
              '2 staff re-training sessions',
              '1 network connectivity issue (resolved)'
            ]
          }
        },
        {
          week: 12,
          actor: 'Project Manager',
          action: 'Conducts project closure activities',
          data: {
            deliverables: [
              'System documentation handover',
              'Administrator training completion',
              'Support contract activation',
              'Project success metrics review'
            ]
          }
        }
      ]
    }
  ],

  // Success metrics for this scenario
  outcomes: {
    timeline: {
      planned: '90 days',
      actual: '87 days',
      variance: '-3 days (ahead of schedule)'
    },
    budget: {
      planned: '$45,000',
      actual: '$45,000',
      variance: '$0 (on budget)'
    },
    quality: {
      clientSatisfaction: '5/5',
      defects: '0 critical, 2 minor (resolved)',
      trainingCompletion: '100%',
      userAdoption: '95% after 30 days'
    },
    business_impact: {
      orderProcessingTime: 'Reduced by 40%',
      inventoryAccuracy: 'Improved to 99.5%',
      dailyReportingTime: 'Reduced from 2 hours to 15 minutes',
      customerSatisfaction: 'Improved due to faster service'
    }
  },

  // Key learnings and best practices
  lessons: [
    {
      category: 'Project Management',
      lesson: 'Early client engagement in testing phase reduced go-live issues',
      impact: 'Smooth deployment with minimal disruption'
    },
    {
      category: 'Technical',
      lesson: 'Phased go-live approach allowed for issue resolution before full deployment',
      impact: 'Higher confidence and reduced risk'
    },
    {
      category: 'Training',
      lesson: 'Role-specific training sessions more effective than generic training',
      impact: 'Better user adoption and system utilization'
    },
    {
      category: 'Communication',
      lesson: 'Regular client updates and transparency built strong relationship',
      impact: 'Client became reference customer and provided testimonial'
    }
  ],

  // Follow-up activities
  followUp: [
    {
      timeline: '30 days post go-live',
      activity: 'Performance review and optimization',
      owner: 'Support Engineer'
    },
    {
      timeline: '60 days post go-live',
      activity: 'Advanced features training',
      owner: 'POS Analyst'
    },
    {
      timeline: '90 days post go-live',
      activity: 'ROI assessment and success story documentation',
      owner: 'Sales Rep'
    }
  ]
};
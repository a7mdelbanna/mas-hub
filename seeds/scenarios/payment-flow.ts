/**
 * Demo Scenario: Complete Payment Flow
 *
 * This scenario demonstrates various payment scenarios including
 * invoice generation, payment processing, partial payments, and overdue handling
 * using multiple clients and payment methods.
 */

export const paymentFlowScenario = {
  name: 'Complete Payment Processing Flow',
  description: 'End-to-end payment lifecycle from invoice generation to collection',
  duration: 'Ongoing process',

  // Different payment scenarios
  scenarios: [
    {
      name: 'Successful Online Payment (Stripe)',
      client: 'Elite Beauty Salon',
      description: 'Client pays invoice promptly via online portal',

      flow: [
        {
          step: 1,
          actor: 'Finance Team',
          action: 'Generates final project invoice',
          data: {
            invoiceNumber: 'INV-2023-045',
            amount: '$20,700',
            services: [
              'POS Terminal: $2,500',
              'Software License: $3,000',
              'Installation: $4,500',
              'Training (8 hours): $1,200',
              'Project Management: $6,800'
            ],
            taxAmount: '$2,700',
            dueDate: '2024-01-09'
          }
        },
        {
          step: 2,
          actor: 'System',
          action: 'Sends automated invoice notification',
          data: {
            channels: ['Email', 'Client Portal Notification'],
            emailTemplate: 'invoice_sent',
            portalLink: '/client-portal/invoices/invoice-beauty-salon-final'
          }
        },
        {
          step: 3,
          actor: 'Client',
          action: 'Views invoice in client portal',
          data: {
            accessTime: '2023-12-15 10:30 AM',
            viewDuration: '5 minutes',
            invoiceStatus: 'viewed',
            paymentOptions: ['Stripe', 'Bank Transfer', 'Paymob']
          }
        },
        {
          step: 4,
          actor: 'Client',
          action: 'Initiates online payment via Stripe',
          data: {
            paymentMethod: 'Credit Card (Visa ending 4242)',
            processingTime: '3 seconds',
            stripeTransactionId: 'ch_3LvQa02eZvKYlo2C1234567',
            receiptGenerated: true
          }
        },
        {
          step: 5,
          actor: 'System',
          action: 'Processes payment confirmation',
          data: {
            paymentStatus: 'completed',
            accountingEntry: 'Auto-generated',
            clientNotification: 'Payment receipt sent',
            invoiceStatus: 'paid'
          }
        }
      ],

      outcome: {
        paymentTime: '13 days before due date',
        processingFee: '$6.21 (0.03%)',
        clientSatisfaction: 'High - praised easy payment process',
        accountsReceivable: 'Immediately updated'
      }
    },

    {
      name: 'Partial Payment with Balance Due',
      client: 'Golden Spoon Restaurant',
      description: 'Client makes partial payment, balance tracking',

      flow: [
        {
          step: 1,
          actor: 'Project Manager',
          action: 'Completes milestone and requests invoice',
          data: {
            milestone: 'System Configuration Phase',
            completionDate: '2024-02-20',
            deliverables: [
              'POS Hardware Package (3 locations)',
              'Software Configuration',
              'Integration Testing'
            ]
          }
        },
        {
          step: 2,
          actor: 'Finance Team',
          action: 'Generates milestone invoice',
          data: {
            invoiceNumber: 'INV-2024-012',
            amount: '$23,000',
            breakdown: [
              'Hardware (3 locations): $12,000',
              'Software Configuration: $5,000',
              'Integration Testing: $3,000'
            ],
            totalWithTax: '$23,000',
            dueDate: '2024-03-21'
          }
        },
        {
          step: 3,
          actor: 'Client',
          action: 'Makes partial payment via Paymob',
          data: {
            paymentAmount: '$15,000',
            paymentDate: '2024-03-10',
            paymentMethod: 'Paymob Mobile Wallet',
            remainingBalance: '$8,000'
          }
        },
        {
          step: 4,
          actor: 'System',
          action: 'Updates invoice status to partially paid',
          data: {
            paidAmount: '$15,000',
            balanceDue: '$8,000',
            invoiceStatus: 'partially_paid',
            paymentReminder: 'Scheduled for 7 days before due date'
          }
        },
        {
          step: 5,
          actor: 'Finance Team',
          action: 'Follows up on remaining balance',
          data: {
            followUpDate: '2024-03-18',
            communicationChannel: 'Phone call + email',
            clientResponse: 'Will pay by due date'
          }
        }
      ],

      outcome: {
        partialPaymentPercentage: '65.2%',
        remainingBalance: '$8,000',
        clientCommunication: 'Proactive follow-up',
        riskLevel: 'Low - good payment history'
      }
    },

    {
      name: 'Overdue Invoice Management',
      client: 'Fashion Hub Boutique',
      description: 'Invoice becomes overdue, escalation process',

      flow: [
        {
          step: 1,
          actor: 'System',
          action: 'Detects overdue invoice',
          data: {
            invoiceNumber: 'INV-2024-005',
            originalDueDate: '2024-01-30',
            daysOverdue: 25,
            amount: '$5,750',
            overdueCategory: 'Medium risk (under $10k)'
          }
        },
        {
          step: 2,
          actor: 'Automation System',
          action: 'Sends first overdue reminder',
          data: {
            reminderType: 'Automated email',
            tone: 'Polite reminder',
            copyTo: ['Account Manager', 'Finance Manager'],
            escalationScheduled: '+7 days if no response'
          }
        },
        {
          step: 3,
          actor: 'Client',
          action: 'Responds with payment difficulty',
          data: {
            responseTime: '2 days after reminder',
            reason: 'Temporary cash flow issues',
            requestedExtension: '30 days',
            proposedPartialPayment: '$2,000 immediately'
          }
        },
        {
          step: 4,
          actor: 'Account Manager',
          action: 'Negotiates payment plan',
          data: {
            agreedPlan: [
              'Immediate payment: $2,000',
              'Remaining balance: $3,750 in 2 weeks'
            ],
            documentedAgreement: true,
            managementApproval: 'Required and obtained'
          }
        },
        {
          step: 5,
          actor: 'System',
          action: 'Updates payment terms and monitoring',
          data: {
            newDueDate: '2024-03-15',
            paymentPlanActive: true,
            autoEscalation: 'Disabled pending plan completion',
            followUpScheduled: true
          }
        }
      ],

      outcome: {
        resolutionTime: '5 days from overdue',
        clientRelationship: 'Maintained through flexible approach',
        paymentPlan: 'Successfully negotiated',
        precedent: 'Documented for future similar cases'
      }
    },

    {
      name: 'Recurring Payment Processing',
      client: 'Modern Dental Clinic',
      description: 'Automated recurring billing for support contract',

      flow: [
        {
          step: 1,
          actor: 'System Scheduler',
          action: 'Triggers quarterly billing',
          data: {
            billingDate: '2024-04-01',
            contractId: 'contract-dental-support-2024',
            billingFrequency: 'Quarterly',
            amount: '$6,900' // $6,000 + 15% tax
          }
        },
        {
          step: 2,
          actor: 'System',
          action: 'Generates recurring invoice automatically',
          data: {
            invoiceNumber: 'INV-2024-020',
            invoiceType: 'recurring',
            servicesPeriod: 'Q2 2024 (April-June)',
            autoEmailSent: true
          }
        },
        {
          step: 3,
          actor: 'Client',
          action: 'Automatic payment via saved method',
          data: {
            paymentMethod: 'Saved bank account (ACH)',
            automaticPayment: true,
            processingTime: '3 business days',
            paymentStatus: 'scheduled'
          }
        },
        {
          step: 4,
          actor: 'System',
          action: 'Confirms successful payment',
          data: {
            paymentDate: '2024-04-04',
            bankConfirmation: 'Received',
            receiptSent: 'Automatically',
            nextBillingScheduled: '2024-07-01'
          }
        }
      ],

      outcome: {
        automationSuccess: 'Fully automated process',
        clientEffort: 'Zero - completely hands-off',
        paymentReliability: 'Perfect track record',
        administrativeOverhead: 'Minimal'
      }
    },

    {
      name: 'Failed Payment Recovery',
      client: 'Fashion Hub Boutique',
      description: 'Payment failure and recovery process',

      flow: [
        {
          step: 1,
          actor: 'Client',
          action: 'Attempts payment via Stripe',
          data: {
            paymentAttempt: 'Credit card payment',
            failureReason: 'Card declined - insufficient funds',
            stripeErrorCode: 'card_declined',
            automaticRetry: false
          }
        },
        {
          step: 2,
          actor: 'System',
          action: 'Records failed payment attempt',
          data: {
            failureLogged: true,
            clientNotified: 'Immediate email sent',
            supportTeamAlerted: true,
            alternativeOptionsProvided: [
              'Try different payment method',
              'Contact support for assistance',
              'Bank transfer instructions'
            ]
          }
        },
        {
          step: 3,
          actor: 'Client',
          action: 'Contacts support for assistance',
          data: {
            contactMethod: 'Phone call',
            supportAgent: 'Billing Specialist',
            issueIdentified: 'Payment method expired',
            solutionProvided: 'Updated payment method'
          }
        },
        {
          step: 4,
          actor: 'Client',
          action: 'Successful payment with updated method',
          data: {
            newPaymentMethod: 'Different credit card',
            paymentSuccess: true,
            processingTime: '2 seconds',
            clientSatisfaction: 'High - appreciated quick support'
          }
        }
      ],

      outcome: {
        recoveryTime: '2 hours from failure',
        supportEffectiveness: 'Excellent customer service',
        processImprovement: 'Added payment method validation',
        clientRetention: 'Maintained positive relationship'
      }
    }
  ],

  // Payment analytics and insights
  analytics: {
    paymentMethodDistribution: {
      stripe: '45%',
      bankTransfer: '30%',
      paymob: '20%',
      cash: '5%'
    },

    averagePaymentTimes: {
      onlinePayments: '8 days before due date',
      bankTransfers: '2 days before due date',
      cashPayments: '1 day after due date'
    },

    collectionEfficiency: {
      paidOnTime: '78%',
      paidWithin30Days: '92%',
      overdueRate: '8%',
      badDebt: '<1%'
    },

    automationImpact: {
      processingTimeReduction: '85%',
      manualInterventionRequired: '15%',
      errorRate: '0.2%',
      clientSatisfaction: '4.7/5'
    }
  },

  // Key processes and workflows
  workflows: {
    invoiceGeneration: {
      trigger: 'Milestone completion or scheduled billing',
      automation: 'Automated with manual review option',
      approvalRequired: 'Invoices >$10,000',
      deliveryMethod: 'Email + Client Portal'
    },

    paymentProcessing: {
      onlinePayments: 'Real-time processing with instant confirmation',
      bankTransfers: '1-3 business days with manual reconciliation',
      recurringPayments: 'Fully automated with failure handling',
      refunds: 'Manual approval required'
    },

    overdueManagement: {
      earlyWarning: '7 days before due date',
      firstReminder: 'Due date + 3 days',
      escalation: 'Due date + 14 days',
      collections: 'Due date + 30 days'
    }
  },

  // Success metrics
  successMetrics: {
    financialMetrics: {
      daysToPayment: 'Average 12 days',
      collectionRate: '97.8%',
      processingCosts: 'Reduced by 60%',
      cashFlowImprovement: '35% faster collection'
    },

    operationalMetrics: {
      invoiceAccuracy: '99.5%',
      automaticProcessing: '85%',
      disputeRate: '0.8%',
      clientSatisfaction: '4.6/5'
    },

    systemMetrics: {
      paymentGatewayUptime: '99.9%',
      processingSpeed: 'Sub-second for online payments',
      reconciliationAccuracy: '99.99%',
      fraudPrevention: '100% effective'
    }
  },

  // Integration points
  integrations: {
    paymentGateways: [
      {
        provider: 'Stripe',
        features: ['Credit Cards', 'Digital Wallets', 'Subscriptions'],
        processingFee: '2.9% + $0.30',
        settlementTime: '2 business days'
      },
      {
        provider: 'Paymob',
        features: ['Mobile Wallets', 'Bank Cards', 'Local Methods'],
        processingFee: '3.5%',
        settlementTime: '3 business days'
      }
    ],

    bankingConnections: [
      {
        bank: 'Commercial International Bank',
        services: ['Wire Transfers', 'ACH', 'Account Reconciliation'],
        apiConnectivity: true
      }
    ],

    accountingIntegration: {
      system: 'Internal Finance Module',
      realTimeSync: true,
      doubleEntryBookkeeping: true,
      taxCalculation: 'Automated'
    }
  }
};
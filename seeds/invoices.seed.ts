import { Invoice, Payment, Transaction, Contract, InvoiceStatus, PaymentStatus, PaymentMethod, TransactionType, ContractStatus, Currency } from '../src/types/models';

// Contracts first (some invoices reference contracts)
export const contracts: Partial<Contract>[] = [
  {
    id: 'contract-dental-support-2024',
    accountId: 'account-dental-clinic',
    contractNumber: 'CONT-2024-001',
    title: 'Annual IT Support Contract',
    type: 'recurring',
    status: ContractStatus.ACTIVE,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    autoRenew: true,
    renewalTermMonths: 12,
    value: 24000,
    currency: 'USD' as Currency,
    billingFrequency: 'quarterly',
    paymentTerms: 30,
    signedDate: new Date('2023-12-15'),
    signedBy: 'Dr. Sarah Dentist',
    entitlements: {
      supportHours: 40,
      includedServices: ['maintenance', 'updates', 'basic-support']
    }
  },
  {
    id: 'contract-powergym-support',
    accountId: 'account-fitness-center',
    contractNumber: 'CONT-2024-002',
    title: 'Fitness System Maintenance Contract',
    type: 'retainer',
    status: ContractStatus.ACTIVE,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2025-01-31'),
    autoRenew: true,
    renewalTermMonths: 12,
    value: 15000,
    currency: 'USD' as Currency,
    billingFrequency: 'monthly',
    paymentTerms: 15,
    signedDate: new Date('2024-01-25'),
    signedBy: 'Mahmoud Fitness Manager',
    entitlements: {
      supportHours: 20,
      includedServices: ['system-monitoring', 'updates', 'phone-support']
    }
  },
  {
    id: 'contract-pizza-palace-development',
    accountId: 'account-pizza-palace',
    contractNumber: 'CONT-2024-003',
    title: 'Mobile App Development Contract',
    type: 'one-time',
    status: ContractStatus.ACTIVE,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-07-01'),
    autoRenew: false,
    value: 125000,
    currency: 'USD' as Currency,
    paymentTerms: 30,
    signedDate: new Date('2024-01-28'),
    signedBy: 'Omar Franchise Director'
  }
];

export const invoices: Partial<Invoice>[] = [
  // Paid Invoices
  {
    id: 'invoice-golden-spoon-milestone1',
    invoiceNumber: 'INV-2024-001',
    accountId: 'account-golden-spoon',
    projectId: 'project-golden-spoon-pos',
    type: 'milestone',
    status: InvoiceStatus.PAID,
    issueDate: new Date('2024-01-30'),
    dueDate: new Date('2024-02-29'),
    currency: 'USD' as Currency,
    subtotal: 15000,
    tax: 2250, // 15% VAT
    total: 17250,
    paidAmount: 17250,
    balanceDue: 0,
    terms: 'Payment due within 30 days. 15% VAT included.',
    notes: 'Milestone 1: Discovery & Analysis phase completed',
    lineItems: [
      {
        itemType: 'service',
        name: 'POS System Analysis',
        description: 'Requirements gathering and technical analysis',
        quantity: 1,
        unitPrice: 8000,
        lineTotal: 8000
      },
      {
        itemType: 'service',
        name: 'Site Survey & Documentation',
        description: 'Physical site assessment and documentation',
        quantity: 3,
        unitPrice: 1500,
        lineTotal: 4500
      },
      {
        itemType: 'service',
        name: 'Technical Specification',
        description: 'Detailed technical specification document',
        quantity: 1,
        unitPrice: 2500,
        lineTotal: 2500
      }
    ]
  },
  {
    id: 'invoice-beauty-salon-final',
    invoiceNumber: 'INV-2023-045',
    accountId: 'account-beauty-salon',
    projectId: 'project-beauty-salon-pos',
    type: 'one-time',
    status: InvoiceStatus.PAID,
    issueDate: new Date('2023-12-10'),
    dueDate: new Date('2024-01-09'),
    currency: 'USD' as Currency,
    subtotal: 18000,
    tax: 2700,
    total: 20700,
    paidAmount: 20700,
    balanceDue: 0,
    terms: 'Final invoice for completed POS system project',
    notes: 'Project completed successfully. Thank you for your business!',
    lineItems: [
      {
        itemType: 'product',
        name: 'POS Terminal',
        description: 'Touch screen POS terminal with receipt printer',
        quantity: 1,
        unitPrice: 2500,
        lineTotal: 2500
      },
      {
        itemType: 'service',
        name: 'POS Software License',
        description: 'Annual software license',
        quantity: 1,
        unitPrice: 3000,
        lineTotal: 3000
      },
      {
        itemType: 'service',
        name: 'Installation & Configuration',
        description: 'Professional installation and setup',
        quantity: 1,
        unitPrice: 4500,
        lineTotal: 4500
      },
      {
        itemType: 'service',
        name: 'Staff Training',
        description: '8 hours of staff training',
        quantity: 8,
        unitPrice: 150,
        lineTotal: 1200
      },
      {
        itemType: 'service',
        name: 'Project Management',
        description: 'Project management and coordination',
        quantity: 1,
        unitPrice: 6800,
        lineTotal: 6800
      }
    ]
  },

  // Partially Paid Invoices
  {
    id: 'invoice-golden-spoon-milestone2',
    invoiceNumber: 'INV-2024-012',
    accountId: 'account-golden-spoon',
    projectId: 'project-golden-spoon-pos',
    type: 'milestone',
    status: InvoiceStatus.PARTIALLY_PAID,
    issueDate: new Date('2024-02-20'),
    dueDate: new Date('2024-03-21'),
    currency: 'USD' as Currency,
    subtotal: 20000,
    tax: 3000,
    total: 23000,
    paidAmount: 15000,
    balanceDue: 8000,
    terms: 'Payment due within 30 days. Partial payment received.',
    notes: 'Milestone 2: System Configuration phase completed',
    lineItems: [
      {
        itemType: 'product',
        name: 'POS Hardware Package',
        description: 'Complete POS hardware for 3 locations',
        quantity: 3,
        unitPrice: 4000,
        lineTotal: 12000
      },
      {
        itemType: 'service',
        name: 'Software Configuration',
        description: 'Custom software configuration and setup',
        quantity: 1,
        unitPrice: 5000,
        lineTotal: 5000
      },
      {
        itemType: 'service',
        name: 'Integration Testing',
        description: 'Payment gateway and peripheral integration testing',
        quantity: 1,
        unitPrice: 3000,
        lineTotal: 3000
      }
    ]
  },

  // Pending/Sent Invoices
  {
    id: 'invoice-techstore-milestone1',
    invoiceNumber: 'INV-2024-018',
    accountId: 'account-tech-store',
    projectId: 'project-techstore-mobile',
    type: 'milestone',
    status: InvoiceStatus.SENT,
    issueDate: new Date('2024-02-25'),
    dueDate: new Date('2024-03-26'),
    currency: 'USD' as Currency,
    subtotal: 22000,
    tax: 3300,
    total: 25300,
    paidAmount: 0,
    balanceDue: 25300,
    terms: 'Payment due within 30 days',
    notes: 'Mobile app development - Phase 1 completed',
    lineItems: [
      {
        itemType: 'service',
        name: 'Mobile App UI/UX Design',
        description: 'Complete mobile application design',
        quantity: 1,
        unitPrice: 8000,
        lineTotal: 8000
      },
      {
        itemType: 'service',
        name: 'Backend API Development',
        description: 'REST API development for mobile app',
        quantity: 1,
        unitPrice: 10000,
        lineTotal: 10000
      },
      {
        itemType: 'service',
        name: 'Database Design & Setup',
        description: 'Database architecture and initial setup',
        quantity: 1,
        unitPrice: 4000,
        lineTotal: 4000
      }
    ]
  },
  {
    id: 'invoice-health-first-milestone3',
    invoiceNumber: 'INV-2024-015',
    accountId: 'account-health-first',
    projectId: 'project-health-first-pos',
    type: 'milestone',
    status: InvoiceStatus.VIEWED,
    issueDate: new Date('2024-02-15'),
    dueDate: new Date('2024-03-17'),
    currency: 'USD' as Currency,
    subtotal: 18000,
    tax: 2700,
    total: 20700,
    paidAmount: 0,
    balanceDue: 20700,
    terms: 'Payment due within 30 days',
    notes: 'Pharmacy POS - Final milestone nearing completion',
    lineItems: [
      {
        itemType: 'service',
        name: 'Data Migration',
        description: 'Migration of existing prescription and customer data',
        quantity: 1,
        unitPrice: 6000,
        lineTotal: 6000
      },
      {
        itemType: 'service',
        name: 'Staff Training',
        description: 'Comprehensive staff training across 4 locations',
        quantity: 4,
        unitPrice: 2000,
        lineTotal: 8000
      },
      {
        itemType: 'service',
        name: 'Go-Live Support',
        description: 'On-site support during system launch',
        quantity: 1,
        unitPrice: 4000,
        lineTotal: 4000
      }
    ]
  },

  // Overdue Invoices
  {
    id: 'invoice-fashion-hub-overdue',
    invoiceNumber: 'INV-2024-005',
    accountId: 'account-fashion-hub',
    type: 'one-time',
    status: InvoiceStatus.OVERDUE,
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-01-30'),
    currency: 'USD' as Currency,
    subtotal: 5000,
    tax: 750,
    total: 5750,
    paidAmount: 0,
    balanceDue: 5750,
    terms: 'Payment due within 15 days. Account now overdue.',
    notes: 'Additional POS customization and training materials',
    lineItems: [
      {
        itemType: 'service',
        name: 'POS Customization',
        description: 'Custom reports and interface modifications',
        quantity: 1,
        unitPrice: 3000,
        lineTotal: 3000
      },
      {
        itemType: 'service',
        name: 'Additional Training',
        description: 'Extra training sessions for new staff',
        quantity: 4,
        unitPrice: 250,
        lineTotal: 1000
      },
      {
        itemType: 'service',
        name: 'Training Materials',
        description: 'Printed manuals and quick reference guides',
        quantity: 1,
        unitPrice: 1000,
        lineTotal: 1000
      }
    ]
  },

  // Contract-based Recurring Invoices
  {
    id: 'invoice-dental-q1-2024',
    invoiceNumber: 'INV-2024-003',
    accountId: 'account-dental-clinic',
    contractId: 'contract-dental-support-2024',
    projectId: 'project-dental-support',
    type: 'recurring',
    status: InvoiceStatus.PAID,
    issueDate: new Date('2024-01-01'),
    dueDate: new Date('2024-01-31'),
    currency: 'USD' as Currency,
    subtotal: 6000,
    tax: 900,
    total: 6900,
    paidAmount: 6900,
    balanceDue: 0,
    terms: 'Quarterly IT support payment - Q1 2024',
    notes: 'IT support contract - quarterly payment',
    lineItems: [
      {
        itemType: 'service',
        name: 'IT Support Services',
        description: 'Quarterly IT support and maintenance (Q1 2024)',
        quantity: 1,
        unitPrice: 6000,
        lineTotal: 6000
      }
    ]
  },
  {
    id: 'invoice-dental-q2-2024',
    invoiceNumber: 'INV-2024-020',
    accountId: 'account-dental-clinic',
    contractId: 'contract-dental-support-2024',
    projectId: 'project-dental-support',
    type: 'recurring',
    status: InvoiceStatus.SENT,
    issueDate: new Date('2024-04-01'),
    dueDate: new Date('2024-05-01'),
    currency: 'USD' as Currency,
    subtotal: 6000,
    tax: 900,
    total: 6900,
    paidAmount: 0,
    balanceDue: 6900,
    terms: 'Quarterly IT support payment - Q2 2024',
    notes: 'IT support contract - quarterly payment',
    lineItems: [
      {
        itemType: 'service',
        name: 'IT Support Services',
        description: 'Quarterly IT support and maintenance (Q2 2024)',
        quantity: 1,
        unitPrice: 6000,
        lineTotal: 6000
      }
    ]
  },
  {
    id: 'invoice-powergym-feb-2024',
    invoiceNumber: 'INV-2024-008',
    accountId: 'account-fitness-center',
    contractId: 'contract-powergym-support',
    type: 'recurring',
    status: InvoiceStatus.PAID,
    issueDate: new Date('2024-02-01'),
    dueDate: new Date('2024-02-16'),
    currency: 'USD' as Currency,
    subtotal: 1250,
    tax: 187.50,
    total: 1437.50,
    paidAmount: 1437.50,
    balanceDue: 0,
    terms: 'Monthly retainer payment - February 2024',
    notes: 'Fitness system maintenance contract - monthly payment',
    lineItems: [
      {
        itemType: 'service',
        name: 'System Maintenance',
        description: 'Monthly system maintenance and monitoring (February 2024)',
        quantity: 1,
        unitPrice: 1250,
        lineTotal: 1250
      }
    ]
  },
  {
    id: 'invoice-powergym-mar-2024',
    invoiceNumber: 'INV-2024-017',
    accountId: 'account-fitness-center',
    contractId: 'contract-powergym-support',
    type: 'recurring',
    status: InvoiceStatus.OVERDUE,
    issueDate: new Date('2024-03-01'),
    dueDate: new Date('2024-03-16'),
    currency: 'USD' as Currency,
    subtotal: 1250,
    tax: 187.50,
    total: 1437.50,
    paidAmount: 0,
    balanceDue: 1437.50,
    terms: 'Monthly retainer payment - March 2024. Payment overdue.',
    notes: 'Fitness system maintenance contract - monthly payment',
    lineItems: [
      {
        itemType: 'service',
        name: 'System Maintenance',
        description: 'Monthly system maintenance and monitoring (March 2024)',
        quantity: 1,
        unitPrice: 1250,
        lineTotal: 1250
      }
    ]
  }
];

// Payments
export const payments: Partial<Payment>[] = [
  // Successful Payments
  {
    id: 'payment-golden-spoon-milestone1',
    paymentNumber: 'PAY-2024-001',
    invoiceId: 'invoice-golden-spoon-milestone1',
    accountId: 'account-golden-spoon',
    amount: 17250,
    currency: 'USD' as Currency,
    status: PaymentStatus.COMPLETED,
    method: PaymentMethod.BANK_TRANSFER,
    paidAt: new Date('2024-02-15'),
    reference: 'BANK-REF-789456123',
    notes: 'Bank transfer received - milestone payment'
  },
  {
    id: 'payment-beauty-salon-stripe',
    paymentNumber: 'PAY-2024-002',
    invoiceId: 'invoice-beauty-salon-final',
    accountId: 'account-beauty-salon',
    amount: 20700,
    currency: 'USD' as Currency,
    status: PaymentStatus.COMPLETED,
    method: PaymentMethod.STRIPE,
    paidAt: new Date('2023-12-28'),
    reference: 'STRIPE-ch_3456789',
    gatewayTransactionId: 'ch_3LvQa02eZvKYlo2C1234567',
    gatewayResponse: {
      id: 'ch_3LvQa02eZvKYlo2C1234567',
      status: 'succeeded',
      amount: 2070000, // in cents
      currency: 'usd'
    },
    receiptUrl: 'https://pay.stripe.com/receipts/payment_intent_123',
    notes: 'Online payment via Stripe'
  },
  {
    id: 'payment-golden-spoon-partial',
    paymentNumber: 'PAY-2024-003',
    invoiceId: 'invoice-golden-spoon-milestone2',
    accountId: 'account-golden-spoon',
    amount: 15000,
    currency: 'USD' as Currency,
    status: PaymentStatus.COMPLETED,
    method: PaymentMethod.PAYMOB,
    paidAt: new Date('2024-03-10'),
    reference: 'PAYMOB-TXN-456789123',
    gatewayTransactionId: 'PAYMOB_123456789',
    gatewayResponse: {
      id: 'PAYMOB_123456789',
      status: 'success',
      amount_cents: 1500000,
      currency: 'USD'
    },
    notes: 'Partial payment via Paymob - remaining balance due'
  },
  {
    id: 'payment-dental-q1',
    paymentNumber: 'PAY-2024-004',
    invoiceId: 'invoice-dental-q1-2024',
    accountId: 'account-dental-clinic',
    amount: 6900,
    currency: 'USD' as Currency,
    status: PaymentStatus.COMPLETED,
    method: PaymentMethod.BANK_TRANSFER,
    paidAt: new Date('2024-01-25'),
    reference: 'DENTAL-Q1-PAYMENT',
    notes: 'Quarterly support contract payment - Q1 2024'
  },
  {
    id: 'payment-powergym-feb',
    paymentNumber: 'PAY-2024-005',
    invoiceId: 'invoice-powergym-feb-2024',
    accountId: 'account-fitness-center',
    amount: 1437.50,
    currency: 'USD' as Currency,
    status: PaymentStatus.COMPLETED,
    method: PaymentMethod.STRIPE,
    paidAt: new Date('2024-02-14'),
    reference: 'STRIPE-ch_powergym_feb',
    gatewayTransactionId: 'ch_3LvQa02eZvKYlo2C7654321',
    gatewayResponse: {
      id: 'ch_3LvQa02eZvKYlo2C7654321',
      status: 'succeeded',
      amount: 143750, // in cents
      currency: 'usd'
    },
    receiptUrl: 'https://pay.stripe.com/receipts/payment_intent_456',
    notes: 'Monthly maintenance fee - February 2024'
  },

  // Pending/Processing Payments
  {
    id: 'payment-techstore-pending',
    paymentNumber: 'PAY-2024-006',
    invoiceId: 'invoice-techstore-milestone1',
    accountId: 'account-tech-store',
    amount: 25300,
    currency: 'USD' as Currency,
    status: PaymentStatus.PENDING,
    method: PaymentMethod.BANK_TRANSFER,
    reference: 'PENDING-BANK-TRANSFER-789',
    notes: 'Bank transfer initiated by client - awaiting confirmation'
  },

  // Failed Payments
  {
    id: 'payment-fashion-failed',
    paymentNumber: 'PAY-2024-007',
    invoiceId: 'invoice-fashion-hub-overdue',
    accountId: 'account-fashion-hub',
    amount: 5750,
    currency: 'USD' as Currency,
    status: PaymentStatus.FAILED,
    method: PaymentMethod.STRIPE,
    reference: 'STRIPE-ch_failed_123',
    gatewayTransactionId: 'ch_3LvQa02eZvKYlo2C0000000',
    gatewayResponse: {
      id: 'ch_3LvQa02eZvKYlo2C0000000',
      status: 'failed',
      failure_code: 'card_declined',
      failure_message: 'Your card was declined.'
    },
    notes: 'Payment failed - insufficient funds. Client notified.'
  }
];

// Financial Transactions
export const transactions: Partial<Transaction>[] = [
  // Revenue transactions from payments
  {
    id: 'txn-golden-spoon-milestone1',
    transactionNumber: 'TXN-2024-001',
    finAccountId: 'account-revenue-main',
    projectId: 'project-golden-spoon-pos',
    type: TransactionType.INCOME,
    category: 'Project Revenue',
    date: new Date('2024-02-15'),
    amount: 17250,
    currency: 'USD' as Currency,
    description: 'Golden Spoon POS - Milestone 1 payment',
    reference: 'PAY-2024-001',
    reconciled: true,
    reconciledAt: new Date('2024-02-16')
  },
  {
    id: 'txn-beauty-salon-final',
    transactionNumber: 'TXN-2024-002',
    finAccountId: 'account-revenue-main',
    projectId: 'project-beauty-salon-pos',
    type: TransactionType.INCOME,
    category: 'Project Revenue',
    date: new Date('2023-12-28'),
    amount: 20700,
    currency: 'USD' as Currency,
    description: 'Elite Beauty Salon - Final project payment',
    reference: 'PAY-2024-002',
    reconciled: true,
    reconciledAt: new Date('2023-12-29')
  },
  {
    id: 'txn-golden-spoon-partial',
    transactionNumber: 'TXN-2024-003',
    finAccountId: 'account-revenue-main',
    projectId: 'project-golden-spoon-pos',
    type: TransactionType.INCOME,
    category: 'Project Revenue',
    date: new Date('2024-03-10'),
    amount: 15000,
    currency: 'USD' as Currency,
    description: 'Golden Spoon POS - Milestone 2 partial payment',
    reference: 'PAY-2024-003',
    reconciled: true,
    reconciledAt: new Date('2024-03-11')
  },

  // Expense transactions
  {
    id: 'txn-hardware-purchase',
    transactionNumber: 'TXN-2024-101',
    finAccountId: 'account-expense-hardware',
    projectId: 'project-golden-spoon-pos',
    type: TransactionType.EXPENSE,
    category: 'Hardware Purchase',
    date: new Date('2024-02-01'),
    amount: 8500,
    currency: 'USD' as Currency,
    description: 'POS hardware for Golden Spoon project',
    reference: 'PO-2024-015',
    reconciled: true,
    reconciledAt: new Date('2024-02-02')
  },
  {
    id: 'txn-software-license',
    transactionNumber: 'TXN-2024-102',
    finAccountId: 'account-expense-software',
    type: TransactionType.EXPENSE,
    category: 'Software License',
    date: new Date('2024-01-01'),
    amount: 15000,
    currency: 'USD' as Currency,
    description: 'Annual software licenses renewal',
    reference: 'LICENSE-2024-RENEWAL',
    reconciled: true,
    reconciledAt: new Date('2024-01-02')
  },
  {
    id: 'txn-office-rent',
    transactionNumber: 'TXN-2024-103',
    finAccountId: 'account-expense-overhead',
    type: TransactionType.EXPENSE,
    category: 'Office Rent',
    date: new Date('2024-03-01'),
    amount: 8000,
    currency: 'USD' as Currency,
    description: 'Monthly office rent - March 2024',
    reference: 'RENT-2024-03',
    reconciled: true,
    reconciledAt: new Date('2024-03-01')
  },
  {
    id: 'txn-employee-salaries',
    transactionNumber: 'TXN-2024-104',
    finAccountId: 'account-expense-payroll',
    type: TransactionType.EXPENSE,
    category: 'Salaries',
    date: new Date('2024-02-28'),
    amount: 45000,
    currency: 'USD' as Currency,
    description: 'Employee salaries - February 2024',
    reference: 'PAYROLL-2024-02',
    reconciled: true,
    reconciledAt: new Date('2024-02-28')
  },

  // Transfer transactions
  {
    id: 'txn-bank-transfer',
    transactionNumber: 'TXN-2024-201',
    finAccountId: 'account-bank-main',
    type: TransactionType.TRANSFER,
    category: 'Internal Transfer',
    date: new Date('2024-03-15'),
    amount: 25000,
    currency: 'USD' as Currency,
    description: 'Transfer to business savings account',
    reference: 'TRANSFER-SAVINGS-001',
    reconciled: true,
    reconciledAt: new Date('2024-03-15')
  }
];

// Financial Accounts (referenced by transactions)
export const finAccounts = [
  {
    id: 'account-revenue-main',
    name: 'Main Revenue Account',
    type: 'revenue',
    currency: 'USD' as Currency,
    balance: 125250,
    active: true
  },
  {
    id: 'account-bank-main',
    name: 'Main Business Bank Account',
    type: 'bank',
    accountNumber: 'ACCT-123456789',
    currency: 'USD' as Currency,
    balance: 87500,
    bankName: 'Commercial International Bank',
    active: true
  },
  {
    id: 'account-expense-hardware',
    name: 'Hardware Expenses',
    type: 'expense',
    currency: 'USD' as Currency,
    balance: -23500,
    active: true
  },
  {
    id: 'account-expense-software',
    name: 'Software & Licenses',
    type: 'expense',
    currency: 'USD' as Currency,
    balance: -31000,
    active: true
  },
  {
    id: 'account-expense-overhead',
    name: 'Office & Overhead',
    type: 'expense',
    currency: 'USD' as Currency,
    balance: -24000,
    active: true
  },
  {
    id: 'account-expense-payroll',
    name: 'Payroll & Benefits',
    type: 'expense',
    currency: 'USD' as Currency,
    balance: -135000,
    active: true
  }
];
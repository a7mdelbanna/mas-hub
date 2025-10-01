import { Account, Invoice, Payment, PayrollEntry, Budget, FinancialReport, TaxEntry, FinanceStats } from '../types/finance.types';

class FinanceService {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    // Mock implementation
    return [
      {
        id: '1',
        name: 'Business Checking',
        type: 'asset',
        category: 'Current Assets',
        code: '1100',
        balance: 125000,
        description: 'Main business checking account',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Accounts Receivable',
        type: 'asset',
        category: 'Current Assets',
        code: '1200',
        balance: 45000,
        description: 'Outstanding customer invoices',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Office Equipment',
        type: 'asset',
        category: 'Fixed Assets',
        code: '1500',
        balance: 25000,
        description: 'Computers, furniture, and office equipment',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Service Revenue',
        type: 'revenue',
        category: 'Operating Revenue',
        code: '4000',
        balance: 180000,
        description: 'Revenue from services provided',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      }
    ];
  }

  async createAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return {
      ...account,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return [
      {
        id: '1',
        number: 'INV-2024-001',
        clientId: '1',
        client: {
          id: '1',
          name: 'TechCorp Solutions',
          email: 'billing@techcorp.com',
          address: '123 Business St, Tech City, TC 12345'
        },
        type: 'invoice',
        status: 'paid',
        issueDate: new Date('2024-03-01'),
        dueDate: new Date('2024-03-31'),
        items: [
          {
            id: '1',
            description: 'Web Development Services',
            quantity: 40,
            rate: 150,
            amount: 6000
          },
          {
            id: '2',
            description: 'UI/UX Design',
            quantity: 20,
            rate: 120,
            amount: 2400
          }
        ],
        subtotal: 8400,
        taxAmount: 840,
        total: 9240,
        currency: 'USD',
        paidAmount: 9240,
        paidDate: new Date('2024-03-25'),
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: '2',
        number: 'INV-2024-002',
        clientId: '2',
        client: {
          id: '2',
          name: 'FinanceHub',
          email: 'accounts@financehub.com'
        },
        type: 'invoice',
        status: 'overdue',
        issueDate: new Date('2024-03-15'),
        dueDate: new Date('2024-04-15'),
        items: [
          {
            id: '3',
            description: 'Mobile App Development',
            quantity: 80,
            rate: 175,
            amount: 14000
          }
        ],
        subtotal: 14000,
        taxAmount: 1400,
        total: 15400,
        currency: 'USD',
        paidAmount: 0,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-15')
      }
    ];
  }

  // Payments
  async getPayments(): Promise<Payment[]> {
    return [
      {
        id: '1',
        type: 'received',
        amount: 9240,
        currency: 'USD',
        method: 'bank',
        status: 'completed',
        reference: 'TXN-001',
        description: 'Payment for INV-2024-001',
        invoiceId: '1',
        clientId: '1',
        date: new Date('2024-03-25'),
        createdAt: new Date('2024-03-25'),
        updatedAt: new Date('2024-03-25')
      },
      {
        id: '2',
        type: 'sent',
        amount: 3500,
        currency: 'USD',
        method: 'bank',
        status: 'completed',
        reference: 'TXN-002',
        description: 'Office rent payment',
        date: new Date('2024-03-01'),
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01')
      }
    ];
  }

  // Payroll
  async getPayrollEntries(): Promise<PayrollEntry[]> {
    return [
      {
        id: '1',
        employeeId: '1',
        employee: {
          id: '1',
          name: 'John Smith',
          position: 'Senior Developer',
          department: 'Engineering'
        },
        payPeriod: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-15')
        },
        baseSalary: 4000,
        overtime: 500,
        bonuses: 200,
        deductions: 150,
        grossPay: 4700,
        taxes: 940,
        netPay: 3760,
        status: 'paid',
        payDate: new Date('2024-03-20'),
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-20')
      }
    ];
  }

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    return [
      {
        id: '1',
        name: '2024 Annual Budget',
        year: 2024,
        type: 'annual',
        categories: [
          {
            id: '1',
            accountId: '4000',
            accountName: 'Service Revenue',
            budgetedAmount: 500000,
            actualAmount: 180000,
            variance: -320000,
            percentageUsed: 36
          },
          {
            id: '2',
            accountId: '5000',
            accountName: 'Operating Expenses',
            budgetedAmount: 350000,
            actualAmount: 125000,
            variance: 225000,
            percentageUsed: 36
          }
        ],
        totalBudget: 500000,
        totalActual: 180000,
        totalVariance: -320000,
        status: 'active',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date()
      }
    ];
  }

  // Tax Management
  async getTaxEntries(): Promise<TaxEntry[]> {
    return [
      {
        id: '1',
        type: 'income',
        name: 'Quarterly Income Tax',
        rate: 25,
        amount: 12500,
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-03-31')
        },
        dueDate: new Date('2024-04-15'),
        status: 'pending',
        createdAt: new Date('2024-03-31'),
        updatedAt: new Date('2024-03-31')
      },
      {
        id: '2',
        type: 'sales',
        name: 'Sales Tax',
        rate: 8.5,
        amount: 2240,
        period: {
          start: new Date('2024-03-01'),
          end: new Date('2024-03-31')
        },
        dueDate: new Date('2024-04-20'),
        status: 'filed',
        filedDate: new Date('2024-04-18'),
        createdAt: new Date('2024-03-31'),
        updatedAt: new Date('2024-04-18')
      }
    ];
  }

  // Financial Reports
  async getFinancialReports(): Promise<FinancialReport[]> {
    return [
      {
        id: '1',
        type: 'profit-loss',
        name: 'Profit & Loss - Q1 2024',
        period: {
          start: new Date('2024-01-01'),
          end: new Date('2024-03-31')
        },
        data: {
          revenue: 180000,
          expenses: 125000,
          netIncome: 55000
        },
        generatedAt: new Date(),
        generatedBy: 'system'
      }
    ];
  }

  // Finance Statistics
  async getFinanceStats(): Promise<FinanceStats> {
    return {
      totalRevenue: 180000,
      totalExpenses: 125000,
      netIncome: 55000,
      totalAssets: 195000,
      totalLiabilities: 35000,
      cashFlow: 25000,
      outstandingInvoices: 15400,
      overdueInvoices: 15400,
      averagePaymentTime: 24,
      profitMargin: 30.6
    };
  }
}

export const financeService = new FinanceService();
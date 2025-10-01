export interface Account {
  id: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  code: string;
  balance: number;
  description?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: {
    id: string;
    name: string;
    email: string;
    address?: string;
  };
  type: 'invoice' | 'quote' | 'credit-note';
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  paidAmount: number;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxRate?: number;
}

export interface Payment {
  id: string;
  type: 'received' | 'sent';
  amount: number;
  currency: string;
  method: 'cash' | 'bank' | 'card' | 'check' | 'online';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description: string;
  fromAccount?: string;
  toAccount?: string;
  invoiceId?: string;
  clientId?: string;
  vendorId?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    name: string;
    position: string;
    department: string;
  };
  payPeriod: {
    start: Date;
    end: Date;
  };
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  taxes: number;
  netPay: number;
  status: 'draft' | 'approved' | 'paid';
  payDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  name: string;
  year: number;
  month?: number;
  type: 'annual' | 'monthly' | 'quarterly';
  categories: BudgetCategory[];
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  status: 'draft' | 'approved' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetCategory {
  id: string;
  accountId: string;
  accountName: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  percentageUsed: number;
}

export interface FinancialReport {
  id: string;
  type: 'profit-loss' | 'balance-sheet' | 'cash-flow' | 'trial-balance';
  name: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface TaxEntry {
  id: string;
  type: 'income' | 'sales' | 'payroll' | 'property';
  name: string;
  rate: number;
  amount: number;
  period: {
    start: Date;
    end: Date;
  };
  dueDate: Date;
  status: 'pending' | 'filed' | 'paid' | 'overdue';
  filedDate?: Date;
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceStats {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  cashFlow: number;
  outstandingInvoices: number;
  overdueInvoices: number;
  averagePaymentTime: number;
  profitMargin: number;
}
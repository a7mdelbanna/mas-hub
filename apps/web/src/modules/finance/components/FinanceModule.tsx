import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FinanceDashboard from './FinanceDashboard';
import AccountsList from './AccountsList';
import InvoicesList from './InvoicesList';
import PaymentsList from './PaymentsList';
import PayrollList from './PayrollList';
import BudgetsList from './BudgetsList';
import TaxManagement from './TaxManagement';
import FinancialReports from './FinancialReports';

export default function FinanceModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FinanceDashboard />} />
        <Route path="accounts" element={<AccountsList />} />
        <Route path="invoices" element={<InvoicesList />} />
        <Route path="payments" element={<PaymentsList />} />
        <Route path="payroll" element={<PayrollList />} />
        <Route path="budgets" element={<BudgetsList />} />
        <Route path="tax" element={<TaxManagement />} />
        <Route path="reports" element={<FinancialReports />} />
      </Routes>
    </div>
  );
}
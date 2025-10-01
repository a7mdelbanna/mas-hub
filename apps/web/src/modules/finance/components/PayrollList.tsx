import React, { useState, useEffect } from 'react';
import { Users, Plus, DollarSign } from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { PayrollEntry } from '../../../types/finance.types';

export default function PayrollList() {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadPayrollEntries();
    setMounted(true);
  }, []);

  const loadPayrollEntries = async () => {
    try {
      const data = await financeService.getPayrollEntries();
      setPayrollEntries(data);
    } catch (error) {
      console.error('Failed to load payroll entries:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 dark:from-gray-950 dark:via-purple-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Payroll Processing
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage employee payroll and compensation</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Process Payroll
                </button>
              </div>

              <div className="space-y-4">
                {payrollEntries.map((entry) => (
                  <div key={entry.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                          <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{entry.employee.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{entry.employee.position} • {entry.employee.department}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(entry.payPeriod.start).toLocaleDateString()} - {new Date(entry.payPeriod.end).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">${entry.netPay.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Net Pay</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
                          entry.status === 'paid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                          entry.status === 'approved' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
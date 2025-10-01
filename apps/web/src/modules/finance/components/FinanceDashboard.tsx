import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Users,
  Calculator,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { FinanceStats } from '../../../types/finance.types';

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStats();
    setMounted(true);
  }, []);

  const loadStats = async () => {
    try {
      const data = await financeService.getFinanceStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load finance stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Create Invoice',
      description: 'Generate new invoice',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/admin/finance/invoices')
    },
    {
      name: 'Record Payment',
      description: 'Add payment entry',
      icon: CreditCard,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => navigate('/admin/finance/payments')
    },
    {
      name: 'Run Payroll',
      description: 'Process employee payroll',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/admin/finance/payroll')
    },
    {
      name: 'View Reports',
      description: 'Financial reports',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      onClick: () => navigate('/admin/finance/reports')
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 dark:from-gray-950 dark:via-emerald-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Header */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-[1px]">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-600/10 to-purple-600/10 opacity-50"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg">
                      <DollarSign className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Finance Dashboard
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">Manage your financial operations</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              ${stats.totalRevenue.toLocaleString()}
                            </p>
                            <div className="flex items-center mt-2">
                              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                              <span className="text-sm text-emerald-600">+12.5%</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">
                              ${stats.totalExpenses.toLocaleString()}
                            </p>
                            <div className="flex items-center mt-2">
                              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                              <span className="text-sm text-red-600">-8.2%</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Net Income</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ${stats.netIncome.toLocaleString()}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-blue-600">{stats.profitMargin.toFixed(1)}% margin</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Calculator className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Cash Flow</p>
                            <p className="text-2xl font-bold text-purple-600">
                              ${stats.cashFlow.toLocaleString()}
                            </p>
                            <div className="flex items-center mt-2">
                              <ArrowUpRight className="h-4 w-4 text-purple-500 mr-1" />
                              <span className="text-sm text-purple-600">Positive</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`transition-all duration-700 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={action.name}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>

                <button
                  onClick={action.onClick}
                  className="relative w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{action.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{action.description}</p>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity & Outstanding Items */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Outstanding Invoices */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h3>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-600 font-medium">${stats?.outstandingInvoices.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">INV-2024-002</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">FinanceHub • $15,400</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-amber-600">Overdue</p>
                    <p className="text-xs text-gray-500">5 days</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/finance/invoices')}
                  className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View All Invoices
                </button>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Payments</h3>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">TechCorp Solutions</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Bank Transfer • INV-2024-001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-emerald-600">$9,240</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/finance/payments')}
                  className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View All Payments
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {[
            { name: 'Chart of Accounts', path: '/admin/finance/accounts', icon: FileText, color: 'from-blue-500 to-blue-600' },
            { name: 'Budget Planning', path: '/admin/finance/budgets', icon: PieChart, color: 'from-purple-500 to-purple-600' },
            { name: 'Tax Management', path: '/admin/finance/tax', icon: Calculator, color: 'from-orange-500 to-orange-600' },
            { name: 'Financial Reports', path: '/admin/finance/reports', icon: BarChart3, color: 'from-emerald-500 to-emerald-600' }
          ].map((item, index) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="group relative text-left"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${item.color} mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
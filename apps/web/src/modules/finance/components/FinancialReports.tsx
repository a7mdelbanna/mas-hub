import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Download, Eye, TrendingUp } from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { FinancialReport } from '../../../types/finance.types';

export default function FinancialReports() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadReports();
    setMounted(true);
  }, []);

  const loadReports = async () => {
    try {
      const data = await financeService.getFinancialReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const reportTypes = {
    'profit-loss': { name: 'Profit & Loss', color: 'from-emerald-500 to-emerald-600' },
    'balance-sheet': { name: 'Balance Sheet', color: 'from-blue-500 to-blue-600' },
    'cash-flow': { name: 'Cash Flow', color: 'from-purple-500 to-purple-600' },
    'trial-balance': { name: 'Trial Balance', color: 'from-orange-500 to-orange-600' }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/40 dark:from-gray-950 dark:via-green-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-green-300 dark:bg-green-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Financial Reports
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Generate and view financial analytics</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Generate Report
                </button>
              </div>

              {/* Quick Report Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Object.entries(reportTypes).map(([type, config]) => (
                  <button
                    key={type}
                    className="group relative text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${config.color} mb-4`}>
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{config.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Generate {config.name.toLowerCase()}</p>
                  </button>
                ))}
              </div>

              {/* Recent Reports */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Reports</h2>
                {reports.map((report) => (
                  <div key={report.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${reportTypes[report.type]?.color || 'from-gray-500 to-gray-600'}`}>
                          <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{report.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reportTypes[report.type]?.name || report.type} • {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Generated: {new Date(report.generatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Eye className="h-5 w-5 text-gray-400" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Download className="h-5 w-5 text-gray-400" />
                        </button>
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
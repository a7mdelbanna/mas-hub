import React, { useState, useEffect } from 'react';
import { Calculator, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { TaxEntry } from '../../../types/finance.types';

export default function TaxManagement() {
  const [taxEntries, setTaxEntries] = useState<TaxEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadTaxEntries();
    setMounted(true);
  }, []);

  const loadTaxEntries = async () => {
    try {
      const data = await financeService.getTaxEntries();
      setTaxEntries(data);
    } catch (error) {
      console.error('Failed to load tax entries:', error);
    }
  };

  const statusIcons = {
    pending: AlertCircle,
    filed: CheckCircle2,
    paid: CheckCircle2,
    overdue: AlertCircle
  };

  const statusColors = {
    pending: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
    filed: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    paid: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    overdue: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/40 dark:from-gray-950 dark:via-orange-950/30 dark:to-red-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-orange-300 dark:bg-orange-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                    <Calculator className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Tax Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Track tax obligations and compliance</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Add Tax Entry
                </button>
              </div>

              <div className="space-y-4">
                {taxEntries.map((entry) => {
                  const StatusIcon = statusIcons[entry.status];
                  return (
                    <div key={entry.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                            <StatusIcon className="h-6 w-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{entry.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} Tax • {entry.rate}% rate
                            </p>
                            <p className="text-xs text-gray-500">
                              Period: {new Date(entry.period.start).toLocaleDateString()} - {new Date(entry.period.end).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-600">${entry.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Due: {new Date(entry.dueDate).toLocaleDateString()}</p>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[entry.status]}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { PieChart, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { financeService } from '../../../services/finance.service';
import { Budget } from '../../../types/finance.types';

export default function BudgetsList() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadBudgets();
    setMounted(true);
  }, []);

  const loadBudgets = async () => {
    try {
      const data = await financeService.getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Failed to load budgets:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <PieChart className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Budget Planning
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Plan and track financial budgets</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Create Budget
                </button>
              </div>

              <div className="space-y-6">
                {budgets.map((budget) => (
                  <div key={budget.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{budget.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{budget.type} budget for {budget.year}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">${budget.totalBudget.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Budget</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Budgeted</p>
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-200">${budget.totalBudget.toLocaleString()}</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Actual</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-200">${budget.totalActual.toLocaleString()}</p>
                      </div>
                      <div className={`rounded-lg p-4 ${
                        budget.totalVariance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <p className={`text-sm mb-1 ${
                          budget.totalVariance >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-600 dark:text-red-300'
                        }`}>Variance</p>
                        <p className={`text-lg font-bold flex items-center ${
                          budget.totalVariance >= 0 ? 'text-emerald-700 dark:text-emerald-200' : 'text-red-700 dark:text-red-200'
                        }`}>
                          {budget.totalVariance >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          ${Math.abs(budget.totalVariance).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {budget.categories.slice(0, 3).map((category) => (
                        <div key={category.id} className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{category.accountName}</span>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ${category.actualAmount.toLocaleString()} / ${category.budgetedAmount.toLocaleString()}
                              </span>
                              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                <div
                                  className={`h-full rounded-full ${
                                    category.percentageUsed <= 80 ? 'bg-emerald-500' :
                                    category.percentageUsed <= 100 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(category.percentageUsed, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                              {category.percentageUsed.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
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
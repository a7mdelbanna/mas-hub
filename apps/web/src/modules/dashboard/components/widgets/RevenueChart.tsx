import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function RevenueChart() {
  const monthlyData = [
    { month: 'Jan', revenue: 45000, projects: 8 },
    { month: 'Feb', revenue: 52000, projects: 10 },
    { month: 'Mar', revenue: 48000, projects: 9 },
    { month: 'Apr', revenue: 65000, projects: 12 },
    { month: 'May', revenue: 72000, projects: 14 },
    { month: 'Jun', revenue: 85000, projects: 16 },
    { month: 'Jul', revenue: 125430, projects: 24 }
  ];

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Overview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly performance
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-semibold">+18.2%</span>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-3">
        {monthlyData.map((data, index) => {
          const percentage = (data.revenue / maxRevenue) * 100;
          const isCurrentMonth = index === monthlyData.length - 1;

          return (
            <div key={data.month} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${isCurrentMonth ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {data.month}
                </span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ${(data.revenue / 1000).toFixed(1)}k
                </span>
              </div>
              <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ${
                    isCurrentMonth
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                      : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                >
                  {isCurrentMonth && (
                    <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Average</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">$70.5k</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">$492k</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Projects</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">93</p>
          </div>
        </div>
      </div>
    </div>
  );
}
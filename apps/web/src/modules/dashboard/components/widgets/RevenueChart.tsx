import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Zap } from 'lucide-react';

export default function RevenueChart() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

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
    <div className="group relative">
      {/* Glassmorphic Container */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50 transition-all duration-500 hover:shadow-indigo-500/20">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-400/10 to-blue-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative z-10 p-8">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative p-4 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-50 rounded-2xl animate-pulse-slow"></div>
                <BarChart3 className="relative h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Revenue Overview
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Monthly performance tracking</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 animate-bounce-subtle" />
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">+18.2%</span>
            </div>
          </div>

          {/* Advanced Chart with 3D Bars */}
          <div className="space-y-4">
            {monthlyData.map((data, index) => {
              const percentage = (data.revenue / maxRevenue) * 100;
              const isCurrentMonth = index === monthlyData.length - 1;
              const isHovered = hoveredBar === index;

              return (
                <div
                  key={data.month}
                  className="group/bar space-y-2"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-bold transition-all duration-300 ${
                      isCurrentMonth || isHovered
                        ? 'text-indigo-600 dark:text-indigo-400 text-base'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {data.month}
                    </span>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {data.projects} projects
                      </span>
                      <span className={`font-bold transition-all duration-300 ${
                        isCurrentMonth || isHovered
                          ? 'text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        ${(data.revenue / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>

                  {/* 3D Bar with Glassmorphism */}
                  <div className="relative h-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                    {/* Bar Fill */}
                    <div
                      className={`relative h-full rounded-full transition-all duration-1000 ease-out transform ${
                        isHovered ? 'scale-y-110' : ''
                      } ${
                        isCurrentMonth
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>

                      {/* Glow for current month */}
                      {isCurrentMonth && (
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 blur-md opacity-50 animate-pulse"></div>
                      )}

                      {/* Value label on hover */}
                      {isHovered && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg border border-indigo-200 dark:border-indigo-800">
                          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                            ${data.revenue.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Summary Cards */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-3 gap-6">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-4 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Average</p>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">$70.5k</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-4 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Total</p>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent">$492k</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/10 p-4 border border-pink-200/50 dark:border-pink-800/50">
                <div className="flex items-center space-x-3 mb-2">
                  <Zap className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Projects</p>
                </div>
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-pink-800 dark:from-pink-400 dark:to-pink-300 bg-clip-text text-transparent">93</p>
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-400/20 rounded-full blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
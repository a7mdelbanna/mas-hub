import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Users, Target } from 'lucide-react';
import { supportService } from '../../../services/support.service';
import { SupportStats } from '../../../types/support.types';

export default function SupportAnalytics() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStats();
    setMounted(true);
  }, []);

  const loadStats = async () => {
    try {
      const data = await supportService.getSupportStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
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
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Support Analytics
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Performance metrics and insights</p>
                </div>
              </div>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="h-6 w-6 text-blue-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Resolution Time</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageResolutionTime}h</p>
                    <p className="text-sm text-emerald-600">-15% from last month</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Users className="h-6 w-6 text-emerald-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer Satisfaction</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.customerSatisfaction}%</p>
                    <p className="text-sm text-emerald-600">+2.3% from last month</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">SLA Compliance</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.slaCompliance}%</p>
                    <p className="text-sm text-emerald-600">On target</p>
                  </div>

                  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                        <BarChart3 className="h-6 w-6 text-orange-600" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <h3 className="text-sm text-gray-500 dark:text-gray-400 mb-1">Response Time</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageResponseTime}h</p>
                    <p className="text-sm text-emerald-600">Under SLA</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
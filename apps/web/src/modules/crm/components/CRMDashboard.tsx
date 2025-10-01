import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  Phone,
  Plus,
  ArrowUpRight,
  BarChart3,
  Activity,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { crmService } from '../../../services/crm.service';
import { CRMStats } from '../../../types/crm.types';

export default function CRMDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStats();
    setMounted(true);
  }, []);

  const loadStats = async () => {
    try {
      const data = await crmService.getCRMStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load CRM stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Add Contact',
      description: 'Create new contact',
      icon: UserPlus,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/admin/crm/contacts')
    },
    {
      name: 'New Deal',
      description: 'Create new deal',
      icon: Target,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => navigate('/admin/crm/deals')
    },
    {
      name: 'Schedule Activity',
      description: 'Plan follow-up',
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/admin/crm/activities')
    },
    {
      name: 'View Pipeline',
      description: 'Sales pipeline',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      onClick: () => navigate('/admin/crm/pipeline')
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Header */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 p-[1px]">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10 opacity-50"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        CRM Dashboard
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">Manage customer relationships and sales</p>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Contacts</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {stats.totalContacts}
                            </p>
                            <div className="flex items-center mt-2">
                              <ArrowUpRight className="h-4 w-4 text-blue-500 mr-1" />
                              <span className="text-sm text-blue-600">+{stats.monthlyGrowth}%</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Active Leads</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {stats.totalLeads}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-purple-600">{stats.conversionRate}% conversion</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Zap className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Deals</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {stats.totalDeals}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-emerald-600">${(stats.averageDealSize / 1000).toFixed(0)}k avg</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Target className="h-6 w-6 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                            <p className="text-2xl font-bold text-orange-600">
                              ${(stats.totalRevenue / 1000).toFixed(0)}k
                            </p>
                            <div className="flex items-center mt-2">
                              <TrendingUp className="h-4 w-4 text-orange-500 mr-1" />
                              <span className="text-sm text-orange-600">This year</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                            <DollarSign className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pipeline Value</p>
                            <p className="text-2xl font-bold text-indigo-600">
                              ${(stats.pipelineValue / 1000).toFixed(0)}k
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-indigo-600">{stats.salesCycleLength} days cycle</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <BarChart3 className="h-6 w-6 text-indigo-600" />
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

        {/* Recent Activity & Upcoming Tasks */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Recent Activity */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <Activity className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Deal closed with TechCorp</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">$75,000 • 2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Email sent to Startup Inc</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Follow-up proposal • 4 hours ago</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/crm/activities')}
                  className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View All Activities
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
                <Clock className="h-5 w-5 text-purple-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Phone className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Call TechCorp CTO</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Implementation discussion • Tomorrow 2:00 PM</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Demo for Startup Inc</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Product demonstration • Friday 10:00 AM</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/crm/activities')}
                  className="w-full py-2 text-center text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  View All Tasks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {[
            { name: 'Sales Pipeline', path: '/admin/crm/pipeline', icon: BarChart3, color: 'from-blue-500 to-blue-600' },
            { name: 'Campaign Management', path: '/admin/crm/campaigns', icon: Mail, color: 'from-purple-500 to-purple-600' },
            { name: 'Customer Analytics', path: '/admin/crm/analytics', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600' }
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
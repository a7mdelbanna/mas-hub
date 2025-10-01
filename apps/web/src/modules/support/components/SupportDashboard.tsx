import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Headphones,
  Ticket,
  Calendar,
  Book,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  MapPin,
  Plus,
  BarChart3
} from 'lucide-react';
import { supportService } from '../../../services/support.service';
import { SupportStats } from '../../../types/support.types';

export default function SupportDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [loading, setLoading] = useState(true);
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
      console.error('Failed to load support stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'New Ticket',
      description: 'Create support ticket',
      icon: Ticket,
      color: 'from-blue-500 to-blue-600',
      onClick: () => navigate('/admin/support/tickets')
    },
    {
      name: 'Schedule Visit',
      description: 'Book site visit',
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => navigate('/admin/support/visits')
    },
    {
      name: 'Knowledge Base',
      description: 'Browse articles',
      icon: Book,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/admin/support/knowledge-base')
    },
    {
      name: 'View Analytics',
      description: 'Support metrics',
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600',
      onClick: () => navigate('/admin/support/analytics')
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-emerald-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Header */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-emerald-600 to-purple-600 p-[1px]">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-emerald-600/10 to-purple-600/10 opacity-50"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-600 shadow-lg">
                      <Headphones className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Support Dashboard
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">Manage customer support and service operations</p>
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
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Tickets</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {stats.openTickets}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-blue-600">of {stats.totalTickets} total</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                            <Ticket className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Resolution</p>
                            <p className="text-2xl font-bold text-emerald-600">
                              {stats.averageResolutionTime}h
                            </p>
                            <div className="flex items-center mt-2">
                              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                              <span className="text-sm text-emerald-600">Improving</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <Clock className="h-6 w-6 text-emerald-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Satisfaction</p>
                            <p className="text-2xl font-bold text-purple-600">
                              {stats.customerSatisfaction}%
                            </p>
                            <div className="flex items-center mt-2">
                              <CheckCircle2 className="h-4 w-4 text-purple-500 mr-1" />
                              <span className="text-sm text-purple-600">Excellent</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Users className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">SLA Compliance</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {stats.slaCompliance}%
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-orange-600">On target</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                            <BarChart3 className="h-6 w-6 text-orange-600" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="group relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Site Visits</p>
                            <p className="text-2xl font-bold text-indigo-600">
                              {stats.scheduledVisits}
                            </p>
                            <div className="flex items-center mt-2">
                              <span className="text-sm text-indigo-600">Scheduled</span>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                            <MapPin className="h-6 w-6 text-indigo-600" />
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
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>

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

        {/* Recent Tickets & Upcoming Visits */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Recent Tickets */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Tickets</h3>
                <Ticket className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">POS System Connection Issues</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">TK-2024-001 • High Priority • 2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Mobile App Login Problems</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">TK-2024-002 • Medium Priority • 4 hours ago</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/support/tickets')}
                  className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  View All Tickets
                </button>
              </div>
            </div>
          </div>

          {/* Upcoming Site Visits */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Site Visits</h3>
                <MapPin className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">RetailMax - POS Repair</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tomorrow 2:00 PM • Alex Johnson</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">FoodService Plus - Installation</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Friday 10:00 AM • David Chen</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/support/visits')}
                  className="w-full py-2 text-center text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  View All Visits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
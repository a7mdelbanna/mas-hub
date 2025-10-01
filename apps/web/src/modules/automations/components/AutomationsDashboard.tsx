import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Activity,
  GitBranch,
  Layers
} from 'lucide-react';
import { automationsService } from '../../../services/automations.service';
import { AutomationStats } from '../../../types/automations.types';

export default function AutomationsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStats();
    setMounted(true);
  }, []);

  const loadStats = async () => {
    try {
      const data = await automationsService.getAutomationStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load automation stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Create Workflow',
      description: 'Build new automation',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/admin/automations/builder'
    },
    {
      name: 'Browse Templates',
      description: 'Use pre-built workflows',
      icon: Layers,
      gradient: 'from-purple-500 to-pink-500',
      path: '/admin/automations/templates'
    },
    {
      name: 'Manage Triggers',
      description: 'Configure automation triggers',
      icon: GitBranch,
      gradient: 'from-emerald-500 to-teal-500',
      path: '/admin/automations/triggers'
    },
    {
      name: 'View Analytics',
      description: 'Performance insights',
      icon: BarChart3,
      gradient: 'from-orange-500 to-red-500',
      path: '/admin/automations/analytics'
    }
  ];

  const metrics = [
    {
      name: 'Total Workflows',
      value: stats?.totalWorkflows || 0,
      change: '+15%',
      trend: 'up',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Active Workflows',
      value: stats?.activeWorkflows || 0,
      change: '+8%',
      trend: 'up',
      icon: Play,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Total Executions',
      value: stats?.totalExecutions || 0,
      change: '+22%',
      trend: 'up',
      icon: Activity,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Success Rate',
      value: `${stats ? ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1) : 0}%`,
      change: '+1.2%',
      trend: 'up',
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Avg Execution Time',
      value: `${stats ? (stats.averageExecutionTime / 1000).toFixed(1) : 0}s`,
      change: '-5%',
      trend: 'down',
      icon: Clock,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Connected Integrations',
      value: `${stats?.connectedIntegrations || 0}/${stats?.totalIntegrations || 0}`,
      change: '+2',
      trend: 'up',
      icon: Settings,
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Automation Dashboard
            </h1>
            <p className="text-purple-200 text-lg">
              Create, manage, and monitor your workflow automations
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action, index) => (
              <div
                key={action.name}
                className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => navigate(action.path)}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/20 transition-all duration-500"></div>
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500 rounded-3xl`}></div>

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-purple-200 transition-colors duration-300">
                    {action.name}
                  </h3>
                  <p className="text-purple-200 text-sm group-hover:text-purple-100 transition-colors duration-300">
                    {action.description}
                  </p>
                  <ArrowUpRight className="w-5 h-5 text-purple-300 absolute top-6 right-6 group-hover:scale-110 group-hover:text-white transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div
                key={metric.name}
                className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${(index + 4) * 100}ms` }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${metric.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${metric.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                      metric.trend === 'up'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{metric.change}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform duration-300">
                      {typeof metric.value === 'string' ? metric.value : metric.value.toLocaleString()}
                    </div>
                    <div className="text-purple-200 text-sm font-medium">
                      {metric.name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Execution Categories */}
            <div className={`relative overflow-hidden rounded-3xl p-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl"></div>

              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-3 text-blue-400" />
                  Executions by Category
                </h3>

                <div className="space-y-4">
                  {stats?.executionsByCategory.map((category, index) => {
                    const total = stats.executionsByCategory.reduce((sum, cat) => sum + cat.count, 0);
                    const percentage = (category.count / total) * 100;
                    return (
                      <div key={category.category} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200 font-medium">{category.category}</span>
                          <span className="text-white font-semibold">{category.count}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 group-hover:from-purple-500 group-hover:to-pink-500"
                            style={{
                              width: `${percentage}%`,
                              transitionDelay: `${index * 200}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`relative overflow-hidden rounded-3xl p-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1200ms' }}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl"></div>

              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-purple-400" />
                  Recent Activity
                </h3>

                <div className="space-y-4">
                  {stats?.upcomingScheduled.map((scheduled, index) => (
                    <div
                      key={index}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 bg-blue-500/20 text-blue-300">
                            <Clock className="w-3 h-3 mr-1" />
                            Scheduled
                          </div>
                          <h4 className="text-white font-medium text-sm mb-1 group-hover:text-purple-200 transition-colors duration-300">
                            {scheduled.workflowName}
                          </h4>
                          <p className="text-purple-300 text-xs">
                            Next: {new Date(scheduled.nextExecution).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-400 ml-3 mt-2"></div>
                      </div>
                    </div>
                  ))}

                  {stats?.errorRates.map((error, index) => (
                    <div
                      key={index}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 bg-yellow-500/20 text-yellow-300">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Error Rate
                          </div>
                          <h4 className="text-white font-medium text-sm mb-1">
                            {error.period}
                          </h4>
                          <p className="text-purple-300 text-xs">
                            {error.rate}% failure rate
                          </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400 ml-3 mt-2"></div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  View All Activity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
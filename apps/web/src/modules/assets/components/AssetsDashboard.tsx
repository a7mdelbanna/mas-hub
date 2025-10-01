import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Monitor,
  Code,
  Wrench,
  QrCode,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Shield,
  BarChart3,
  Plus,
  ArrowUpRight,
  Users,
  Clock,
  Archive
} from 'lucide-react';
import { assetsService } from '../../../services/assets.service';
import { AssetStats } from '../../../types/assets.types';

export default function AssetsDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadStats();
    setMounted(true);
  }, []);

  const loadStats = async () => {
    try {
      const data = await assetsService.getAssetStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load asset stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      name: 'Add Asset',
      description: 'Register new equipment',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/admin/assets/inventory'
    },
    {
      name: 'Check Out Asset',
      description: 'Assign to employee',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      path: '/admin/assets/checkout'
    },
    {
      name: 'Schedule Maintenance',
      description: 'Plan equipment service',
      icon: Wrench,
      gradient: 'from-emerald-500 to-teal-500',
      path: '/admin/assets/maintenance'
    },
    {
      name: 'Generate QR Codes',
      description: 'Create asset labels',
      icon: QrCode,
      gradient: 'from-orange-500 to-red-500',
      path: '/admin/assets/qr-codes'
    }
  ];

  const metrics = [
    {
      name: 'Total Assets',
      value: stats?.totalAssets || 0,
      change: '+8%',
      trend: 'up',
      icon: Package,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Total Value',
      value: `$${(stats?.totalValue || 0).toLocaleString()}`,
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'In Use',
      value: stats?.assetsByStatus.find(s => s.status === 'In Use')?.count || 0,
      change: '+5%',
      trend: 'up',
      icon: CheckCircle2,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Maintenance Due',
      value: stats?.maintenanceOverdue || 0,
      change: '-15%',
      trend: 'down',
      icon: Wrench,
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Warranty Expiring',
      value: stats?.warrantyExpiring || 0,
      change: '+3%',
      trend: 'up',
      icon: Shield,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      name: 'Utilization Rate',
      value: `${(stats?.utilizationRate || 0).toFixed(1)}%`,
      change: '+2%',
      trend: 'up',
      icon: BarChart3,
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  const alerts = [
    {
      type: 'warning',
      title: 'Maintenance Overdue',
      message: '5 assets require immediate maintenance',
      priority: 'high'
    },
    {
      type: 'info',
      title: 'Warranty Expiring',
      message: '12 warranties expire within 30 days',
      priority: 'medium'
    },
    {
      type: 'success',
      title: 'New Assets Added',
      message: '8 new assets added this week',
      priority: 'low'
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
              Asset Management Dashboard
            </h1>
            <p className="text-purple-200 text-lg">
              Track, manage, and optimize your organization's physical and digital assets
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Asset Categories Breakdown */}
            <div className={`lg:col-span-2 relative overflow-hidden rounded-3xl p-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1000ms' }}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Package className="w-6 h-6 mr-3 text-blue-400" />
                    Asset Categories
                  </h3>
                </div>

                <div className="space-y-4">
                  {stats?.assetsByCategory.map((category, index) => {
                    const percentage = (category.count / (stats?.totalAssets || 1)) * 100;
                    return (
                      <div key={category.category} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200 font-medium">{category.category}</span>
                          <div className="text-right">
                            <span className="text-white font-semibold">{category.count}</span>
                            <span className="text-emerald-300 text-sm ml-2">${category.value.toLocaleString()}</span>
                          </div>
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

            {/* Alerts & Notifications */}
            <div className={`relative overflow-hidden rounded-3xl p-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1200ms' }}>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl"></div>

              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-purple-400" />
                  Alerts & Updates
                </h3>

                <div className="space-y-4">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                            alert.type === 'warning'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : alert.type === 'info'
                              ? 'bg-blue-500/20 text-blue-300'
                              : 'bg-green-500/20 text-green-300'
                          }`}>
                            {alert.type === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {alert.type === 'info' && <Clock className="w-3 h-3 mr-1" />}
                            {alert.type === 'success' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}
                          </div>
                          <h4 className="text-white font-medium text-sm mb-1 group-hover:text-purple-200 transition-colors duration-300">
                            {alert.title}
                          </h4>
                          <p className="text-purple-300 text-xs">{alert.message}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ml-3 mt-2 ${
                          alert.priority === 'high' ? 'bg-red-400' :
                          alert.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center justify-center">
                  <Plus className="w-4 h-4 mr-2" />
                  View All Alerts
                </button>
              </div>
            </div>
          </div>

          {/* Asset Status Overview */}
          <div className={`mt-8 relative overflow-hidden rounded-3xl p-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: '1400ms' }}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl"></div>

            <div className="relative z-10">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-indigo-400" />
                Asset Status Distribution
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats?.assetsByStatus.map((status, index) => {
                  const getStatusIcon = (statusName: string) => {
                    switch (statusName.toLowerCase()) {
                      case 'in use': return CheckCircle2;
                      case 'available': return Package;
                      case 'maintenance': return Wrench;
                      case 'disposed': return Archive;
                      default: return Package;
                    }
                  };

                  const getStatusColor = (statusName: string) => {
                    switch (statusName.toLowerCase()) {
                      case 'in use': return 'from-emerald-500 to-teal-500';
                      case 'available': return 'from-blue-500 to-cyan-500';
                      case 'maintenance': return 'from-yellow-500 to-orange-500';
                      case 'disposed': return 'from-gray-500 to-slate-500';
                      default: return 'from-purple-500 to-pink-500';
                    }
                  };

                  const StatusIcon = getStatusIcon(status.status);

                  return (
                    <div key={status.status} className="text-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${getStatusColor(status.status)} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                        <StatusIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">{status.count}</div>
                      <div className="text-purple-200 text-sm">{status.status}</div>
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
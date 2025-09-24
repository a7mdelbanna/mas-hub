import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  FolderKanban,
  DollarSign,
  HeadphonesIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const stats = [
    {
      title: 'Active Projects',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: FolderKanban,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Revenue',
      value: '$125,430',
      change: '+8.2%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Active Users',
      value: '89',
      change: '+3.1%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Support Tickets',
      value: '12',
      change: '-15%',
      changeType: 'negative',
      icon: HeadphonesIcon,
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New project created',
      user: 'John Smith',
      timestamp: '2 minutes ago',
      icon: FolderKanban,
      color: 'text-blue-500'
    },
    {
      id: 2,
      action: 'Invoice paid',
      user: 'Acme Corp',
      timestamp: '15 minutes ago',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 3,
      action: 'Support ticket opened',
      user: 'Jane Doe',
      timestamp: '1 hour ago',
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      id: 4,
      action: 'Task completed',
      user: 'Mike Wilson',
      timestamp: '2 hours ago',
      icon: CheckCircle,
      color: 'text-green-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className={`text-sm mt-2 flex items-center ${
                  stat.changeType === 'positive'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-600 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {activity.user}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full btn btn-primary text-left justify-start">
              <FolderKanban className="h-4 w-4 mr-3" />
              Create New Project
            </button>
            <button className="w-full btn btn-outline text-left justify-start">
              <Users className="h-4 w-4 mr-3" />
              Add New User
            </button>
            <button className="w-full btn btn-outline text-left justify-start">
              <DollarSign className="h-4 w-4 mr-3" />
              Generate Invoice
            </button>
            <button className="w-full btn btn-outline text-left justify-start">
              <HeadphonesIcon className="h-4 w-4 mr-3" />
              View Support Tickets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import {
  FolderKanban,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  UserPlus,
  FileText,
  Clock
} from 'lucide-react';

const activities = [
  {
    id: 1,
    action: 'New project created',
    description: 'E-Commerce Platform for Acme Corp',
    user: 'John Smith',
    timestamp: '2 minutes ago',
    icon: FolderKanban,
    color: 'text-blue-500',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 2,
    action: 'Invoice paid',
    description: 'Invoice #INV-2024-001 ($15,000)',
    user: 'Acme Corp',
    timestamp: '15 minutes ago',
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  {
    id: 3,
    action: 'Support ticket opened',
    description: 'Critical bug in payment gateway',
    user: 'Jane Doe',
    timestamp: '1 hour ago',
    icon: AlertTriangle,
    color: 'text-orange-500',
    bg: 'bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 4,
    action: 'Task completed',
    description: 'Database optimization task finished',
    user: 'Mike Wilson',
    timestamp: '2 hours ago',
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  {
    id: 5,
    action: 'New team member',
    description: 'Sarah Johnson joined as UX Designer',
    user: 'HR Department',
    timestamp: '3 hours ago',
    icon: UserPlus,
    color: 'text-purple-500',
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  {
    id: 6,
    action: 'Document uploaded',
    description: 'Project requirements document',
    user: 'Alex Brown',
    timestamp: '5 hours ago',
    icon: FileText,
    color: 'text-indigo-500',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30'
  }
];

export default function RecentActivity() {
  return (
    <div className="relative">
      {/* Glassmorphic Container */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-blue-50/30 dark:from-indigo-950/10 dark:via-purple-950/5 dark:to-blue-950/10"></div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="relative z-10 p-8">
          {/* Premium Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Recent Activity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live updates from your team</span>
                </p>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-300">
              View All
            </button>
          </div>

          {/* Ultra-Premium Activity Feed */}
          <div className="space-y-5 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative group/item">
                {/* Timeline Line with Gradient */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600 dark:to-transparent"></div>
                )}

                {/* Activity Item */}
                <div className="relative overflow-hidden rounded-2xl bg-white/50 dark:bg-gray-700/30 backdrop-blur-sm p-4 border border-gray-200/50 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-700/50 hover:scale-[1.02] transition-all duration-300">
                  <div className="flex items-start space-x-4">
                    {/* Icon with 3D Effect */}
                    <div className={`flex-shrink-0 p-3 rounded-xl ${activity.bg} relative z-10 shadow-lg group-hover/item:scale-110 transition-transform duration-300`}>
                      <div className={`absolute inset-0 ${activity.bg} blur-md opacity-50 rounded-xl`}></div>
                      <activity.icon className={`relative h-5 w-5 ${activity.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-3 mt-3">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-600/50">
                              {activity.user}
                            </span>
                            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{activity.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
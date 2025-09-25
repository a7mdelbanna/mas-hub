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
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latest updates from your team
          </p>
        </div>
        <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium">
          View All
        </button>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative">
            {/* Timeline Line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            )}

            {/* Activity Item */}
            <div className="flex items-start space-x-3 group">
              {/* Icon */}
              <div className={`flex-shrink-0 p-2 rounded-lg ${activity.bg} relative z-10`}>
                <activity.icon className={`h-4 w-4 ${activity.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
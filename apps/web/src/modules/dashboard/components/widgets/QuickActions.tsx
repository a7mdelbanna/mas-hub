import React from 'react';
import {
  FolderKanban,
  Users,
  DollarSign,
  HeadphonesIcon,
  FileText,
  UserPlus,
  Zap
} from 'lucide-react';

const actions = [
  {
    id: 1,
    label: 'New Project',
    icon: FolderKanban,
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700'
  },
  {
    id: 2,
    label: 'Add User',
    icon: UserPlus,
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700'
  },
  {
    id: 3,
    label: 'Generate Invoice',
    icon: DollarSign,
    color: 'from-emerald-500 to-emerald-600',
    hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
  },
  {
    id: 4,
    label: 'Support Tickets',
    icon: HeadphonesIcon,
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:from-orange-600 hover:to-orange-700'
  },
  {
    id: 5,
    label: 'Create Report',
    icon: FileText,
    color: 'from-pink-500 to-pink-600',
    hoverColor: 'hover:from-pink-600 hover:to-pink-700'
  },
  {
    id: 6,
    label: 'Automations',
    icon: Zap,
    color: 'from-yellow-500 to-yellow-600',
    hoverColor: 'hover:from-yellow-600 hover:to-yellow-700'
  }
];

export default function QuickActions() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Quick Actions
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Common tasks and shortcuts
        </p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            className="group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.color} ${action.hoverColor} transition-all duration-300`}></div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-white dark:bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

            {/* Content */}
            <div className="relative z-10">
              <action.icon className="h-6 w-6 text-white mb-2" />
              <p className="text-sm font-medium text-white">
                {action.label}
              </p>
            </div>

            {/* Decorative Circle */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          </button>
        ))}
      </div>

      {/* View All Link */}
      <button className="mt-6 w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
        View All Actions
      </button>
    </div>
  );
}
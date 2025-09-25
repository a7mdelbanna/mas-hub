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
    <div className="group relative h-full">
      {/* Glassmorphic Container */}
      <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:border-gray-700/50 h-full flex flex-col">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-pink-950/10"></div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <div className="relative z-10 p-8 flex flex-col h-full">
          {/* Premium Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Quick Actions
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-[52px] flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span>Common tasks at your fingertips</span>
            </p>
          </div>

          {/* Ultra-Premium Actions Grid */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {actions.map((action, index) => (
              <button
                key={action.id}
                className="group/action relative overflow-hidden rounded-2xl text-left transition-all duration-500 hover:scale-105 transform-gpu"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Background with Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} ${action.hoverColor} transition-all duration-500`}></div>
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${action.color} blur-xl opacity-0 group-hover/action:opacity-50 transition-opacity duration-500`}></div>

                {/* Glassmorphic Overlay */}
                <div className="absolute inset-0 bg-black/10 backdrop-blur-sm opacity-0 group-hover/action:opacity-100 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative z-10 p-5">
                  <div className="flex flex-col h-full justify-between">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm inline-flex w-fit mb-3 group-hover/action:scale-110 group-hover/action:rotate-6 transition-all duration-300">
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-bold text-white group-hover/action:translate-x-1 transition-transform duration-300">
                      {action.label}
                    </p>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full group-hover/action:scale-150 transition-transform duration-700"></div>
                <div className="absolute top-0 left-0 w-12 h-12 bg-white/5 rounded-full group-hover/action:scale-150 transition-transform duration-700"></div>

                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/action:translate-x-full transition-transform duration-1000"></div>
              </button>
            ))}
          </div>

          {/* Premium View All Button */}
          <button className="mt-6 relative group/btn overflow-hidden rounded-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <div className="relative py-4 px-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 group-hover/btn:border-transparent transition-all duration-300">
              <span className="text-gray-700 dark:text-gray-300 font-bold group-hover/btn:text-white transition-colors duration-300">
                View All Actions
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
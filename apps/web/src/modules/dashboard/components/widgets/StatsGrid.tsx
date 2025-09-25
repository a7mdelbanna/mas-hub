import React from 'react';
import {
  Users,
  FolderKanban,
  DollarSign,
  HeadphonesIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  {
    id: 1,
    title: 'Active Projects',
    value: '24',
    change: '+12%',
    changeType: 'positive' as const,
    icon: FolderKanban,
    color: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    description: 'From last month'
  },
  {
    id: 2,
    title: 'Total Revenue',
    value: '$125,430',
    change: '+8.2%',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    description: 'Monthly growth'
  },
  {
    id: 3,
    title: 'Active Users',
    value: '89',
    change: '+3.1%',
    changeType: 'positive' as const,
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    description: 'Team members'
  },
  {
    id: 4,
    title: 'Support Tickets',
    value: '12',
    change: '-15%',
    changeType: 'negative' as const,
    icon: HeadphonesIcon,
    color: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    description: 'Better than last week'
  }
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          className="group relative perspective-1000"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* 3D Card Container with Glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/50 transform-gpu hover:-translate-y-2 hover:scale-105 hover:rotate-y-5">
            {/* Animated Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

            {/* Glow Effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>

            {/* Decorative Elements */}
            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${stat.color} opacity-5 rounded-full -mr-20 -mt-20 group-hover:scale-150 group-hover:opacity-10 transition-all duration-700`}></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/10 to-transparent rounded-full -ml-10 -mb-10"></div>

            <div className="relative z-10">
              {/* 3D Icon with Glow */}
              <div className={`relative inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-500`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                <stat.icon className="relative h-6 w-6 text-white" />
              </div>

              {/* Title with Animation */}
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 tracking-wide uppercase">
                {stat.title}
              </p>

              {/* Value and Change */}
              <div className="flex items-end justify-between mb-3">
                <h3 className="text-4xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300 origin-left">
                  {stat.value}
                </h3>

                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                  stat.changeType === 'positive'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-4 w-4 animate-bounce-subtle" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 animate-bounce-subtle" />
                  )}
                  <span className="text-sm font-bold">{stat.change}</span>
                </div>
              </div>

              {/* Description with Subtle Animation */}
              <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></span>
                <span>{stat.description}</span>
              </p>

              {/* Progress Bar */}
              <div className="mt-4 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000 ease-out group-hover:animate-shimmer`}
                  style={{ width: `${stat.changeType === 'positive' ? '75%' : '45%'}` }}
                ></div>
              </div>
            </div>

            {/* Shine Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
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
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:scale-105"
        >
          {/* Background Gradient Decoration */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>

          <div className="relative z-10">
            {/* Icon */}
            <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-4`}>
              <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
            </div>

            {/* Title */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {stat.title}
            </p>

            {/* Value and Change */}
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>

              <div className={`flex items-center space-x-1 ${
                stat.changeType === 'positive'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm font-semibold">{stat.change}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
import React from 'react';
import { Users, TrendingUp, Award, Target } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Senior Developer',
    avatar: 'SJ',
    tasksCompleted: 24,
    efficiency: 95,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 2,
    name: 'Mike Wilson',
    role: 'Project Manager',
    avatar: 'MW',
    tasksCompleted: 18,
    efficiency: 88,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 3,
    name: 'Alex Brown',
    role: 'UI/UX Designer',
    avatar: 'AB',
    tasksCompleted: 22,
    efficiency: 92,
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    id: 4,
    name: 'Emily Davis',
    role: 'Backend Developer',
    avatar: 'ED',
    tasksCompleted: 20,
    efficiency: 85,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 5,
    name: 'John Smith',
    role: 'DevOps Engineer',
    avatar: 'JS',
    tasksCompleted: 16,
    efficiency: 90,
    color: 'from-pink-500 to-pink-600'
  }
];

export default function TeamPerformance() {
  const avgEfficiency = Math.round(
    teamMembers.reduce((acc, member) => acc + member.efficiency, 0) / teamMembers.length
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This month's overview
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
          <TrendingUp className="h-4 w-4" />
          <span className="text-sm font-semibold">{avgEfficiency}% avg</span>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
              <Award className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">100</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Tasks Done</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
              <Target className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Projects</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-lg bg-white dark:bg-gray-800">
              <Users className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Members</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-semibold shadow-lg`}>
              {member.avatar}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {member.name}
                </h4>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {member.tasksCompleted} tasks
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {member.role}
              </p>

              {/* Efficiency Bar */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${member.color} rounded-full transition-all duration-500`}
                    style={{ width: `${member.efficiency}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {member.efficiency}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Team Button */}
      <button className="mt-4 w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
        View Full Team
      </button>
    </div>
  );
}
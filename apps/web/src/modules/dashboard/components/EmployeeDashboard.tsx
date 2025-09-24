import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Clock, GraduationCap, Banknote, Calendar } from 'lucide-react';

export default function EmployeeDashboard() {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, Employee!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's your work overview for today.
        </p>
      </div>

      {/* Employee-specific dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Tasks</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">3 due today</p>
            </div>
            <CheckSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time Today</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">6.5h</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target: 8h</p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Training</h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">2</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Courses pending</p>
            </div>
            <GraduationCap className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Employee Portal Features Coming Soon
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This portal will include task management, timesheet tracking, training modules, and more!
        </p>
      </div>
    </div>
  );
}
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileUser, GraduationCap, ClipboardCheck, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function CandidateDashboard() {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to your Candidate Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your application progress, complete training, and prepare for interviews.
        </p>
      </div>

      {/* Application Status */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Application Status
        </h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Progress</span>
              <span>70%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">In Progress</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Senior Developer</p>
          </div>
        </div>
      </div>

      {/* Current Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Tasks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Complete React Training</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">2 modules remaining</p>
              </div>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>

            <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Technical Assessment</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Due in 3 days</p>
              </div>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completed Tasks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Initial Application</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submitted successfully</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Phone Screening</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Passed - HR Interview</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Upcoming Interviews
        </h3>
        <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Technical Interview</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                With John Smith, Senior Developer
              </p>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2">
                Tomorrow at 2:00 PM
              </p>
            </div>
            <button className="btn btn-primary btn-sm">
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
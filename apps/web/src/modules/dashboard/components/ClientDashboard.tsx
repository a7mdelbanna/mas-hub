import React from 'react';
import { useTranslation } from 'react-i18next';
import { FolderKanban, Receipt, HeadphonesIcon, GraduationCap } from 'lucide-react';

export default function ClientDashboard() {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to your Client Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track your projects, invoices, and get support.
        </p>
      </div>

      {/* Client-specific dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Projects</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">3</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">2 on track, 1 delayed</p>
            </div>
            <FolderKanban className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h3>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">$5,240</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">2 invoices due</p>
            </div>
            <Receipt className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-600">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Client Portal Features
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Your dedicated portal provides access to project updates, billing information, support tickets, and training materials.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <FolderKanban className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="font-medium">Project Tracking</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <Receipt className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium">Invoice Management</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <HeadphonesIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="font-medium">Support Tickets</p>
          </div>
          <div className="text-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <GraduationCap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="font-medium">Training Materials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
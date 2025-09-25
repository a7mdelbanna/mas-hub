import React from 'react';
import { useTranslation } from 'react-i18next';
import StatsGrid from './widgets/StatsGrid';
import RevenueChart from './widgets/RevenueChart';
import ProjectsOverview from './widgets/ProjectsOverview';
import RecentActivity from './widgets/RecentActivity';
import QuickActions from './widgets/QuickActions';
import TeamPerformance from './widgets/TeamPerformance';
import UpcomingTasks from './widgets/UpcomingTasks';

export default function AdminDashboard() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 space-y-6">
      {/* Welcome Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome Back, Admin
          </h1>
          <p className="text-blue-100 text-lg">
            Here's what's happening with your business today.
          </p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
      </div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Projects and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectsOverview />
        <RecentActivity />
      </div>

      {/* Team Performance and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TeamPerformance />
        </div>
        <div className="lg:col-span-1">
          <UpcomingTasks />
        </div>
      </div>
    </div>
  );
}
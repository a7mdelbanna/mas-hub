import React from 'react';
import { Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Building2, Users, Palette, Tag, Settings as SettingsIcon } from 'lucide-react';

// Lazy load settings components
const OrganizationSettings = React.lazy(() => import('./OrganizationSettings'));
const UserManagement = React.lazy(() => import('./UserManagement'));
const ThemeSettings = React.lazy(() => import('./ThemeSettings'));
const BrandingSettings = React.lazy(() => import('./BrandingSettings'));
const TestFirebasePermissions = React.lazy(() => import('../../../components/TestFirebasePermissions'));
const InitializeDatabase = React.lazy(() => import('../../../components/InitializeDatabase'));

const settingsTabs = [
  {
    id: 'organization',
    label: 'Organization',
    path: '/admin/settings/organization',
    icon: Building2,
    description: 'Company details and preferences'
  },
  {
    id: 'users',
    label: 'Users & Roles',
    path: '/admin/settings/users',
    icon: Users,
    description: 'Manage users and permissions'
  },
  {
    id: 'theme',
    label: 'Theme',
    path: '/admin/settings/theme',
    icon: Palette,
    description: 'Customize appearance'
  },
  {
    id: 'branding',
    label: 'Branding',
    path: '/admin/settings/branding',
    icon: Tag,
    description: 'Logos and brand identity'
  }
];

export default function SettingsModule() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your application preferences and configuration
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 shadow-lg border border-gray-100 dark:border-gray-700">
            <nav className="space-y-2">
              {settingsTabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    `flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex-shrink-0 mt-0.5">
                        <tab.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{tab.label}</p>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {tab.description}
                        </p>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl bg-white dark:bg-gray-800 p-8 shadow-lg border border-gray-100 dark:border-gray-700">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Navigate to="/admin/settings/organization" replace />} />
                <Route path="/organization" element={<OrganizationSettings />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/theme" element={<ThemeSettings />} />
                <Route path="/branding" element={<BrandingSettings />} />
                <Route path="/debug" element={
                  <div className="space-y-6">
                    <TestFirebasePermissions />
                    <InitializeDatabase />
                  </div>
                } />
                <Route path="*" element={
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">Settings page not found</p>
                  </div>
                } />
              </Routes>
            </React.Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
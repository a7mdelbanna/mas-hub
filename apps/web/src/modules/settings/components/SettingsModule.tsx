import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder settings components
const OrganizationSettings = React.lazy(() => import('./OrganizationSettings'));
const UserManagement = React.lazy(() => import('./UserManagement'));

export default function SettingsModule() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Settings
      </h1>

      <Routes>
        <Route path="/" element={<Navigate to="/admin/settings/organization" replace />} />
        <Route path="/organization" element={<OrganizationSettings />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="*" element={<div>Settings page not found</div>} />
      </Routes>
    </div>
  );
}
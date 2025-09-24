import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../../../components/layouts/PortalLayout';
import { useAuth } from '../../auth/hooks/useAuth';

// Lazy load employee modules
const EmployeeDashboard = React.lazy(() => import('../../dashboard/components/EmployeeDashboard'));

export default function EmployeePortal() {
  const auth = useAuth();

  return (
    <PortalLayout
      portalType="employee"
      user={auth.user}
      sidebarItems={[
        { id: 'dashboard', label: 'Dashboard', path: '/employee/dashboard', icon: 'LayoutDashboard' },
        { id: 'tasks', label: 'My Tasks', path: '/employee/tasks', icon: 'CheckSquare' },
        { id: 'projects', label: 'Projects', path: '/employee/projects', icon: 'FolderKanban' },
        { id: 'timesheet', label: 'Timesheet', path: '/employee/timesheet', icon: 'Clock' },
        { id: 'learning', label: 'Learning', path: '/employee/learning', icon: 'GraduationCap' },
        { id: 'payroll', label: 'Payroll', path: '/employee/payroll', icon: 'Banknote' },
        { id: 'profile', label: 'Profile', path: '/employee/profile', icon: 'User' },
      ]}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />

        {/* Placeholder routes for other modules */}
        <Route path="/tasks" element={<div className="p-6">My Tasks (Coming Soon)</div>} />
        <Route path="/projects/*" element={<div className="p-6">Projects (Coming Soon)</div>} />
        <Route path="/timesheet" element={<div className="p-6">Timesheet (Coming Soon)</div>} />
        <Route path="/learning/*" element={<div className="p-6">Learning (Coming Soon)</div>} />
        <Route path="/payroll" element={<div className="p-6">Payroll (Coming Soon)</div>} />
        <Route path="/profile" element={<div className="p-6">Profile (Coming Soon)</div>} />
      </Routes>
    </PortalLayout>
  );
}
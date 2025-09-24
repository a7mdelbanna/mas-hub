import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../../../components/layouts/PortalLayout';
import { useAuth } from '../../auth/hooks/useAuth';

// Lazy load admin modules
const AdminDashboard = React.lazy(() => import('../../dashboard/components/AdminDashboard'));
const SettingsModule = React.lazy(() => import('../../settings/components/SettingsModule'));

export default function AdminPortal() {
  const auth = useAuth();

  return (
    <PortalLayout
      portalType="admin"
      user={auth.user}
      sidebarItems={[
        { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
        { id: 'projects', label: 'Projects', path: '/admin/projects', icon: 'FolderKanban' },
        { id: 'finance', label: 'Finance', path: '/admin/finance', icon: 'DollarSign' },
        { id: 'crm', label: 'CRM', path: '/admin/crm', icon: 'Users' },
        { id: 'support', label: 'Support', path: '/admin/support', icon: 'HeadphonesIcon' },
        { id: 'lms', label: 'Learning', path: '/admin/lms', icon: 'GraduationCap' },
        { id: 'hr', label: 'Human Resources', path: '/admin/hr', icon: 'UserCheck' },
        { id: 'assets', label: 'Assets', path: '/admin/assets', icon: 'Package' },
        { id: 'automations', label: 'Automations', path: '/admin/automations', icon: 'Zap' },
        { id: 'settings', label: 'Settings', path: '/admin/settings', icon: 'Settings' },
      ]}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/settings/*" element={<SettingsModule />} />

        {/* Placeholder routes for other modules */}
        <Route path="/projects/*" element={<div className="p-6">Projects Module (Coming Soon)</div>} />
        <Route path="/finance/*" element={<div className="p-6">Finance Module (Coming Soon)</div>} />
        <Route path="/crm/*" element={<div className="p-6">CRM Module (Coming Soon)</div>} />
        <Route path="/support/*" element={<div className="p-6">Support Module (Coming Soon)</div>} />
        <Route path="/lms/*" element={<div className="p-6">LMS Module (Coming Soon)</div>} />
        <Route path="/hr/*" element={<div className="p-6">HR Module (Coming Soon)</div>} />
        <Route path="/assets/*" element={<div className="p-6">Assets Module (Coming Soon)</div>} />
        <Route path="/automations/*" element={<div className="p-6">Automations Module (Coming Soon)</div>} />
      </Routes>
    </PortalLayout>
  );
}
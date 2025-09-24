import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../../../components/layouts/PortalLayout';
import { useAuth } from '../../auth/hooks/useAuth';

// Lazy load client modules
const ClientDashboard = React.lazy(() => import('../../dashboard/components/ClientDashboard'));

export default function ClientPortal() {
  const auth = useAuth();

  return (
    <PortalLayout
      portalType="client"
      user={auth.user}
      sidebarItems={[
        { id: 'dashboard', label: 'Dashboard', path: '/client/dashboard', icon: 'LayoutDashboard' },
        { id: 'projects', label: 'Projects', path: '/client/projects', icon: 'FolderKanban' },
        { id: 'invoices', label: 'Invoices', path: '/client/invoices', icon: 'Receipt' },
        { id: 'support', label: 'Support', path: '/client/support', icon: 'HeadphonesIcon' },
        { id: 'training', label: 'Training', path: '/client/training', icon: 'GraduationCap' },
        { id: 'documents', label: 'Documents', path: '/client/documents', icon: 'FileText' },
        { id: 'profile', label: 'Profile', path: '/client/profile', icon: 'Building2' },
      ]}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/client/dashboard" replace />} />
        <Route path="/dashboard" element={<ClientDashboard />} />

        {/* Placeholder routes for other modules */}
        <Route path="/projects/*" element={<div className="p-6">Projects (Coming Soon)</div>} />
        <Route path="/invoices" element={<div className="p-6">Invoices (Coming Soon)</div>} />
        <Route path="/support/*" element={<div className="p-6">Support (Coming Soon)</div>} />
        <Route path="/training/*" element={<div className="p-6">Training (Coming Soon)</div>} />
        <Route path="/documents" element={<div className="p-6">Documents (Coming Soon)</div>} />
        <Route path="/profile" element={<div className="p-6">Profile (Coming Soon)</div>} />
      </Routes>
    </PortalLayout>
  );
}
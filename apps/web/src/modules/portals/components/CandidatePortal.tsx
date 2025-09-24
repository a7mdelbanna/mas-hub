import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../../../components/layouts/PortalLayout';
import { useAuth } from '../../auth/hooks/useAuth';

// Lazy load candidate modules
const CandidateDashboard = React.lazy(() => import('../../dashboard/components/CandidateDashboard'));

export default function CandidatePortal() {
  const auth = useAuth();

  return (
    <PortalLayout
      portalType="candidate"
      user={auth.user}
      sidebarItems={[
        { id: 'dashboard', label: 'Dashboard', path: '/candidate/dashboard', icon: 'LayoutDashboard' },
        { id: 'application', label: 'Application', path: '/candidate/application', icon: 'FileUser' },
        { id: 'training', label: 'Training', path: '/candidate/training', icon: 'GraduationCap' },
        { id: 'assessments', label: 'Assessments', path: '/candidate/assessments', icon: 'ClipboardCheck' },
        { id: 'interviews', label: 'Interviews', path: '/candidate/interviews', icon: 'Calendar' },
        { id: 'documents', label: 'Documents', path: '/candidate/documents', icon: 'FileText' },
        { id: 'profile', label: 'Profile', path: '/candidate/profile', icon: 'User' },
      ]}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/candidate/dashboard" replace />} />
        <Route path="/dashboard" element={<CandidateDashboard />} />

        {/* Placeholder routes for other modules */}
        <Route path="/application" element={<div className="p-6">Application Status (Coming Soon)</div>} />
        <Route path="/training/*" element={<div className="p-6">Training (Coming Soon)</div>} />
        <Route path="/assessments" element={<div className="p-6">Assessments (Coming Soon)</div>} />
        <Route path="/interviews" element={<div className="p-6">Interviews (Coming Soon)</div>} />
        <Route path="/documents" element={<div className="p-6">Documents (Coming Soon)</div>} />
        <Route path="/profile" element={<div className="p-6">Profile (Coming Soon)</div>} />
      </Routes>
    </PortalLayout>
  );
}
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../modules/auth/components/ProtectedRoute';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy load portal components
const LoginPage = React.lazy(() => import('../modules/auth/components/LoginPage'));
const AdminPortal = React.lazy(() => import('../modules/portals/components/AdminPortal'));
const EmployeePortal = React.lazy(() => import('../modules/portals/components/EmployeePortal'));
const ClientPortal = React.lazy(() => import('../modules/portals/components/ClientPortal'));
const CandidatePortal = React.lazy(() => import('../modules/portals/components/CandidatePortal'));
const NotFoundPage = React.lazy(() => import('../components/ui/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Portal Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/*"
          element={
            <ProtectedRoute requiredRoles={['employee', 'manager', 'admin']}>
              <EmployeePortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/client/*"
          element={
            <ProtectedRoute portalType="client">
              <ClientPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute portalType="candidate">
              <CandidatePortal />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/employee" replace />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
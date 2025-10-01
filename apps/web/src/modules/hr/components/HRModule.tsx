import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HRDashboard from './HRDashboard';
import EmployeeDirectory from './EmployeeDirectory';
import RecruitmentPipeline from './RecruitmentPipeline';
import InterviewScheduling from './InterviewScheduling';
import OnboardingWorkflows from './OnboardingWorkflows';
import LeaveManagement from './LeaveManagement';
import PerformanceReviews from './PerformanceReviews';
import AttendanceTracking from './AttendanceTracking';
import DepartmentManagement from './DepartmentManagement';

export default function HRModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="employees" element={<EmployeeDirectory />} />
        <Route path="recruitment" element={<RecruitmentPipeline />} />
        <Route path="interviews" element={<InterviewScheduling />} />
        <Route path="onboarding" element={<OnboardingWorkflows />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="reviews" element={<PerformanceReviews />} />
        <Route path="attendance" element={<AttendanceTracking />} />
        <Route path="departments" element={<DepartmentManagement />} />
      </Routes>
    </div>
  );
}
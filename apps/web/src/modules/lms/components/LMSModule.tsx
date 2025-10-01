import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LMSDashboard from './LMSDashboard';
import CoursesList from './CoursesList';
import EnrollmentsList from './EnrollmentsList';
import AssignmentsList from './AssignmentsList';
import QuizzesList from './QuizzesList';
import CertificatesList from './CertificatesList';

export default function LMSModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LMSDashboard />} />
        <Route path="courses" element={<CoursesList />} />
        <Route path="enrollments" element={<EnrollmentsList />} />
        <Route path="assignments" element={<AssignmentsList />} />
        <Route path="quizzes" element={<QuizzesList />} />
        <Route path="certificates" element={<CertificatesList />} />
      </Routes>
    </div>
  );
}
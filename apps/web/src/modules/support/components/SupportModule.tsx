import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SupportDashboard from './SupportDashboard';
import TicketsList from './TicketsList';
import SiteVisitsList from './SiteVisitsList';
import KnowledgeBase from './KnowledgeBase';
import SupportAnalytics from './SupportAnalytics';

export default function SupportModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SupportDashboard />} />
        <Route path="tickets" element={<TicketsList />} />
        <Route path="visits" element={<SiteVisitsList />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="analytics" element={<SupportAnalytics />} />
      </Routes>
    </div>
  );
}
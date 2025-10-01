import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CRMDashboard from './CRMDashboard';
import ContactsList from './ContactsList';
import LeadsList from './LeadsList';
import DealsList from './DealsList';
import SalesPipeline from './SalesPipeline';
import CampaignsList from './CampaignsList';
import ActivitiesList from './ActivitiesList';

export default function CRMModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<CRMDashboard />} />
        <Route path="contacts" element={<ContactsList />} />
        <Route path="leads" element={<LeadsList />} />
        <Route path="deals" element={<DealsList />} />
        <Route path="pipeline" element={<SalesPipeline />} />
        <Route path="campaigns" element={<CampaignsList />} />
        <Route path="activities" element={<ActivitiesList />} />
      </Routes>
    </div>
  );
}
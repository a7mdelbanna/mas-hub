import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AutomationsDashboard from './AutomationsDashboard';
import WorkflowBuilder from './WorkflowBuilder';
import TriggerManagement from './TriggerManagement';
import TemplateLibrary from './TemplateLibrary';
import ExecutionHistory from './ExecutionHistory';
import IntegrationSettings from './IntegrationSettings';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function AutomationsModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AutomationsDashboard />} />
        <Route path="builder" element={<WorkflowBuilder />} />
        <Route path="triggers" element={<TriggerManagement />} />
        <Route path="templates" element={<TemplateLibrary />} />
        <Route path="history" element={<ExecutionHistory />} />
        <Route path="integrations" element={<IntegrationSettings />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
      </Routes>
    </div>
  );
}
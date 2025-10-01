import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProjectList from './ProjectList';
import ProjectDetails from './ProjectDetails';
import CreateProject from './CreateProject';
import ProjectKanban from './ProjectKanban';
import ProjectGantt from './ProjectGantt';
import ProjectTimeline from './ProjectTimeline';

export default function ProjectsModule() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={`min-h-screen relative transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <Routes>
        <Route path="/" element={<Navigate to="list" replace />} />
        <Route path="list" element={<ProjectList />} />
        <Route path="kanban" element={<ProjectKanban />} />
        <Route path="timeline" element={<ProjectTimeline />} />
        <Route path="gantt" element={<ProjectGantt />} />
        <Route path="create" element={<CreateProject />} />
        <Route path=":projectId/*" element={<ProjectDetails />} />
      </Routes>
    </div>
  );
}
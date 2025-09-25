import React from 'react';
import { FolderKanban, Clock, CheckCircle, AlertCircle, MoreVertical } from 'lucide-react';

const projects = [
  {
    id: 1,
    name: 'E-Commerce Platform',
    client: 'Acme Corp',
    progress: 75,
    status: 'on-track',
    dueDate: '2 days',
    team: 5
  },
  {
    id: 2,
    name: 'Mobile App Redesign',
    client: 'TechStart Inc',
    progress: 45,
    status: 'on-track',
    dueDate: '1 week',
    team: 3
  },
  {
    id: 3,
    name: 'POS System Integration',
    client: 'RetailCo',
    progress: 90,
    status: 'ahead',
    dueDate: '5 days',
    team: 4
  },
  {
    id: 4,
    name: 'API Development',
    client: 'DataFlow Ltd',
    progress: 30,
    status: 'at-risk',
    dueDate: '3 days',
    team: 2
  }
];

const statusConfig = {
  'on-track': {
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'On Track'
  },
  'ahead': {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    label: 'Ahead'
  },
  'at-risk': {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'At Risk'
  }
};

export default function ProjectsOverview() {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <FolderKanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Active Projects
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {projects.length} projects in progress
            </p>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <MoreVertical className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => {
          const status = statusConfig[project.status];
          return (
            <div
              key={project.id}
              className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200"
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {project.client}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{project.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Meta */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Due in {project.dueDate}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>{project.team} members</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All Button */}
      <button className="mt-4 w-full py-3 px-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
        View All Projects
      </button>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useParams, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FolderKanban,
  Users,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  Settings,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Download,
  Upload,
  MessageSquare,
  Bell,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';
import { Project } from '../../../types';
import { projectsService } from '../../../services/projects.service';

const mockProject: Project = {
  id: '1',
  name: 'E-Commerce Platform',
  code: 'ECOM-001',
  accountId: '1',
  projectTypeId: '1',
  managerId: '1',
  status: 'active',
  startDate: new Date('2024-01-15'),
  dueDate: new Date('2024-06-15'),
  estimateBudget: 75000,
  actualBudget: 45000,
  currency: 'USD',
  completionPercentage: 65,
  members: ['1', '2', '3'],
  description: 'Building a modern e-commerce platform with React and Node.js. The platform will include product catalog, shopping cart, payment integration, admin dashboard, and analytics.',
  tags: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date(),
  createdBy: 'admin',
  updatedBy: 'admin'
};

const tabs = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'tasks', label: 'Tasks', icon: CheckCircle },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'activity', label: 'Activity', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadProject();
    setMounted(true);
  }, [projectId]);

  const loadProject = async () => {
    try {
      // Use mock data for now
      setProject(mockProject);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'from-emerald-500 to-green-600',
      completed: 'from-blue-500 to-indigo-600',
      'on-hold': 'from-amber-500 to-orange-600',
      planning: 'from-purple-500 to-purple-600',
      pending: 'from-gray-500 to-gray-600',
      'in-progress': 'from-blue-500 to-indigo-600'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
                  </div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {project.progress}%
                  </p>
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Budget Used</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${(project.spent / 1000).toFixed(0)}k
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    of ${(project.budget / 1000).toFixed(0)}k total
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {project.team.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    members assigned
                  </p>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Time Left</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    days remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Project Description</h3>
              <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {project.tags?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-gray-700 dark:text-gray-300 border border-blue-200 dark:border-blue-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Phases */}
            <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Project Phases</h3>
              <div className="space-y-4">
                {project.phases?.map((phase) => (
                  <div key={phase.id} className="relative">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${getStatusColor(phase.status)} mt-1`}>
                        {phase.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : phase.status === 'in-progress' ? (
                          <Clock className="h-5 w-5 text-white" />
                        ) : (
                          <Target className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{phase.name}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(phase.startDate).toLocaleDateString()} - {new Date(phase.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{phase.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getStatusColor(phase.status)} transition-all duration-500`}
                              style={{ width: `${phase.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deliverables:</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.deliverables.map((deliverable, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                  {deliverable}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.team.map((member) => (
                <div key={member.id} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                  <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    {member.allocation && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Allocation</span>
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{member.allocation}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                            style={{ width: `${member.allocation}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50">
            <p className="text-gray-500 dark:text-gray-400">Content for {activeTab} tab coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Header */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/projects')}
                className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  <FolderKanban className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {project.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{project.client.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Download className="h-5 w-5" />
              </button>
              <button className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`transition-all duration-700 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
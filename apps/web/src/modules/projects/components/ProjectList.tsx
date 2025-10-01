import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  BarChart3,
  FolderKanban,
  Clock,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Target,
  Briefcase,
  Package
} from 'lucide-react';
import { projectsService } from '../../../services/projects.service';
import { Project } from '../../../types';

const mockProjects: Project[] = [
  {
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
    description: 'Building a modern e-commerce platform with React and Node.js',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    code: 'BANK-002',
    accountId: '2',
    projectTypeId: '2',
    managerId: '2',
    status: 'active',
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2024-07-30'),
    estimateBudget: 120000,
    actualBudget: 35000,
    currency: 'USD',
    completionPercentage: 30,
    members: ['4', '5'],
    description: 'Secure mobile banking application for iOS and Android',
    tags: ['React Native', 'Firebase', 'Biometric Auth', 'Encryption'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '3',
    name: 'POS System Upgrade',
    code: 'POS-003',
    accountId: '3',
    projectTypeId: '3',
    managerId: '3',
    status: 'review',
    startDate: new Date('2023-12-01'),
    dueDate: new Date('2024-03-15'),
    estimateBudget: 45000,
    actualBudget: 42000,
    currency: 'USD',
    completionPercentage: 90,
    members: ['6'],
    description: 'Upgrading legacy POS system with modern cloud-based solution',
    tags: ['Hardware', 'Cloud', 'Integration', 'Training'],
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '4',
    name: 'Marketing Dashboard',
    code: 'DASH-004',
    accountId: '4',
    projectTypeId: '1',
    managerId: '4',
    status: 'completed',
    startDate: new Date('2023-10-15'),
    dueDate: new Date('2024-01-15'),
    estimateBudget: 25000,
    actualBudget: 24500,
    currency: 'USD',
    completionPercentage: 100,
    members: [],
    description: 'Analytics dashboard for marketing campaigns',
    tags: ['Analytics', 'Dashboard', 'React', 'D3.js'],
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '5',
    name: 'Healthcare Portal',
    code: 'HEALTH-005',
    accountId: '5',
    projectTypeId: '4',
    managerId: '2',
    status: 'planning',
    startDate: new Date('2024-04-01'),
    dueDate: new Date('2024-10-01'),
    estimateBudget: 95000,
    actualBudget: 0,
    currency: 'USD',
    completionPercentage: 5,
    members: [],
    description: 'Patient management system with mobile app',
    tags: ['HIPAA', 'React', 'Flutter', 'PostgreSQL'],
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '6',
    name: 'Logistics Platform',
    code: 'LOG-006',
    accountId: '6',
    projectTypeId: '1',
    managerId: '3',
    status: 'on_hold',
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-05-01'),
    estimateBudget: 60000,
    actualBudget: 15000,
    currency: 'USD',
    completionPercentage: 25,
    members: [],
    description: 'Real-time logistics tracking and management platform',
    tags: ['Real-time', 'Maps', 'Node.js', 'WebSocket'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  }
];

const statusColors = {
  active: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  completed: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', icon: CheckCircle2 },
  'on-hold': { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', icon: Timer },
  cancelled: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', icon: XCircle },
  planning: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-700 dark:text-purple-300', icon: Target },
  review: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-300', icon: AlertCircle }
};

const priorityColors = {
  critical: 'from-red-500 to-rose-600',
  high: 'from-orange-500 to-amber-600',
  medium: 'from-blue-500 to-indigo-600',
  low: 'from-gray-400 to-gray-500'
};

const typeIcons = {
  web: { icon: Briefcase, color: 'from-blue-500 to-blue-600' },
  mobile: { icon: Package, color: 'from-purple-500 to-purple-600' },
  pos: { icon: FolderKanban, color: 'from-green-500 to-green-600' },
  hybrid: { icon: Sparkles, color: 'from-pink-500 to-pink-600' }
};

export default function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadProjects();
    setMounted(true);
  }, []);

  const loadProjects = async () => {
    try {
      // Use mock data for now
      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getProjectMetrics = () => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'active').length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = projects.reduce((sum, p) => sum + p.spent, 0);

    return { total, active, completed, totalBudget, totalSpent };
  };

  const metrics = getProjectMetrics();

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Header with Metrics */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[1px]">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                      <FolderKanban className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Projects
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">Manage and track all your projects</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/admin/projects/create')}
                    className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>New Project</span>
                    </span>
                  </button>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Projects</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {metrics.total}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Active</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {metrics.active}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {metrics.completed}
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Budget</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        ${(metrics.totalBudget / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-white/20 dark:border-gray-700/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                        ${(metrics.totalSpent / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and View Controls */}
        <div className={`flex flex-wrap items-center justify-between gap-4 transition-all duration-700 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
              <option value="planning">Planning</option>
              <option value="review">Review</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={() => navigate('/admin/projects/kanban')}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FolderKanban className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/admin/projects/timeline')}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Calendar className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/admin/projects/gantt')}
              className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className={`transition-all duration-700 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>

                  <div
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                    className="relative cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {/* Priority Badge */}
                    <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full bg-gradient-to-r ${priorityColors[project.priority]} animate-pulse`}></div>

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-xl bg-gradient-to-r ${typeIcons[project.type].color} shadow-lg`}>
                          {React.createElement(typeIcons[project.type].icon, { className: 'h-5 w-5 text-white' })}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{project.client.name}</p>
                        </div>
                      </div>
                      <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Status */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                        {React.createElement(statusColors[project.status].icon, { className: 'h-3 w-3 mr-1' })}
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      {project.dueDate && (
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(project.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{project.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${
                            project.progress >= 80 ? 'from-emerald-500 to-green-600' :
                            project.progress >= 50 ? 'from-blue-500 to-indigo-600' :
                            project.progress >= 30 ? 'from-amber-500 to-orange-600' :
                            'from-red-500 to-rose-600'
                          } transition-all duration-500 ease-out`}
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Budget</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                          {project.spent <= project.budget * 0.8 ? (
                            <>
                              <ArrowDownRight className="h-3 w-3 text-emerald-500" />
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">On track</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="h-3 w-3 text-amber-500" />
                              <span className="text-xs text-amber-600 dark:text-amber-400">
                                {Math.round((project.spent / project.budget) * 100)}% used
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800">
                            +{project.team.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{project.team.length} members</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {project.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((project, index) => (
                <div
                  key={project.id}
                  className="group relative"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>

                  <div
                    onClick={() => navigate(`/admin/projects/${project.id}`)}
                    className="relative cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-6 hover:shadow-xl transform hover:scale-[1.01] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${typeIcons[project.type].color} shadow-lg`}>
                          {React.createElement(typeIcons[project.type].icon, { className: 'h-6 w-6 text-white' })}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{project.name}</h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status].bg} ${statusColors[project.status].text}`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${priorityColors[project.priority]} text-white`}>
                              {project.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{project.client.name} • {project.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.progress}%</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Progress</p>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${(project.budget / 1000).toFixed(0)}k
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Budget</p>
                        </div>

                        <div className="flex -space-x-2">
                          {project.team.slice(0, 4).map((member, i) => (
                            <div
                              key={i}
                              className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
                            >
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                          {project.team.length > 4 && (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold border-2 border-white dark:border-gray-800">
                              +{project.team.length - 4}
                            </div>
                          )}
                        </div>

                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <MoreVertical className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
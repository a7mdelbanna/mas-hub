import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  User,
  FileText,
  Monitor,
  Key,
  Users,
  Plus,
  Play,
  Pause
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { OnboardingTask } from '../../../types/hr.types';

export default function OnboardingWorkflows() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadTasks();
    setMounted(true);
  }, []);

  const loadTasks = async () => {
    try {
      const data = await hrService.getOnboardingTasks();
      setTasks(data);
    } catch (error) {
      console.error('Failed to load onboarding tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'paperwork': return FileText;
      case 'training': return Play;
      case 'equipment': return Monitor;
      case 'access': return Key;
      case 'introduction': return Users;
      default: return CheckCircle2;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'skipped': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Onboarding Workflows
                </h1>
                <p className="text-purple-200 text-lg">
                  Manage new employee onboarding process and tasks
                </p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Workflow
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tasks.map((task, index) => {
              const IconComponent = getCategoryIcon(task.category);

              return (
                <div
                  key={task.id}
                  className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{task.title}</h3>
                          <p className="text-purple-300 text-sm">{task.employeeName}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-purple-200 text-sm">{task.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-purple-300 text-sm">Category:</span>
                        <span className="text-white text-sm">{task.category.charAt(0).toUpperCase() + task.category.slice(1)}</span>
                      </div>
                      {task.assignee && (
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">Assignee:</span>
                          <span className="text-white text-sm">{task.assignee.name}</span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-purple-300 text-sm">Due Date:</span>
                          <span className="text-white text-sm">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </button>
                      <button className="flex-1 py-2 px-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                        <User className="w-4 h-4 mr-1" />
                        Assign
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
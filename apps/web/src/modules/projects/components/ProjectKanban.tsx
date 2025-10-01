import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  MoreVertical,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Circle,
  ArrowRight,
  Filter,
  Search,
  Calendar,
  Flag,
  Paperclip,
  MessageCircle
} from 'lucide-react';
import { Task } from '../../../types';

const mockTasks: Task[] = [
  {
    id: '1',
    projectId: 'proj-1',
    title: 'Design homepage mockup',
    description: 'Create initial design mockup for the homepage with all components',
    status: 'todo',
    priority: 3,
    assigneeId: '1',
    dueDate: new Date('2024-03-20'),
    estimateHours: 8,
    labels: ['design', 'ui/ux'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '2',
    projectId: 'proj-1',
    title: 'Setup authentication flow',
    description: 'Implement JWT authentication with refresh tokens',
    status: 'in_progress',
    priority: 5,
    assigneeId: '2',
    dueDate: new Date('2024-03-18'),
    estimateHours: 16,
    spentHours: 12,
    labels: ['backend', 'security'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '3',
    projectId: 'proj-1',
    title: 'Database schema design',
    description: 'Design and implement the database schema',
    status: 'review',
    priority: 4,
    assigneeId: '3',
    dueDate: new Date('2024-03-15'),
    estimateHours: 12,
    spentHours: 10,
    labels: ['database', 'architecture'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '4',
    projectId: 'proj-1',
    title: 'API documentation',
    description: 'Write comprehensive API documentation',
    status: 'completed',
    priority: 2,
    assigneeId: '4',
    dueDate: new Date('2024-03-10'),
    estimateHours: 6,
    spentHours: 7,
    labels: ['documentation'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  },
  {
    id: '5',
    projectId: 'proj-1',
    title: 'Payment gateway integration',
    status: 'blocked',
    priority: 5,
    description: 'Integrate Stripe payment gateway',
    assigneeId: '2',
    labels: ['backend', 'payments'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin'
  }
];

const columns = [
  { id: 'todo', title: 'To Do', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50 dark:bg-gray-900/50', icon: Circle },
  { id: 'in_progress', title: 'In Progress', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50 dark:bg-blue-900/50', icon: ArrowRight },
  { id: 'review', title: 'Review', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/50', icon: AlertCircle },
  { id: 'completed', title: 'Done', color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/50', icon: CheckCircle2 },
  { id: 'blocked', title: 'Blocked', color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50 dark:bg-red-900/50', icon: AlertCircle }
];

const priorityColors = {
  urgent: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  medium: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  low: { bg: 'bg-gray-100 dark:bg-gray-700/30', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' }
};

export default function ProjectKanban() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTasks(mockTasks);
    setMounted(true);
  }, []);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === draggedTask.id
            ? { ...task, status: newStatus as Task['status'] }
            : task
        )
      );
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesStatus && matchesSearch && matchesPriority;
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative p-8 space-y-6">
        {/* Header */}
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Project Kanban Board
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Drag and drop tasks to update their status</p>
            </div>
            <button className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Task</span>
              </span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Kanban Board */}
        <div className={`flex gap-6 overflow-x-auto pb-4 transition-all duration-700 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {columns.map((column, index) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Column Header */}
              <div className={`relative overflow-hidden rounded-t-2xl bg-gradient-to-r ${column.color} p-[1px]`}>
                <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {React.createElement(column.icon, {
                        className: `h-5 w-5 bg-gradient-to-r ${column.color} bg-clip-text text-transparent`
                      })}
                      <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {getTasksByStatus(column.id).length}
                      </span>
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Plus className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column Body */}
              <div
                className={`min-h-[500px] rounded-b-2xl p-4 transition-all duration-300 ${
                  dragOverColumn === column.id
                    ? 'bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent ring-2 ring-blue-500 ring-opacity-50'
                    : `${column.bgColor}`
                }`}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="space-y-3">
                  {getTasksByStatus(column.id).map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onDragEnd={handleDragEnd}
                      className={`group relative cursor-move transition-all duration-300 ${
                        draggedTask?.id === task.id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'
                      }`}
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>

                      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl border border-white/20 dark:border-gray-700/50 p-4 shadow-sm hover:shadow-lg">
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white flex-1 pr-2">
                            {task.title}
                          </h4>
                          <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Priority and Due Date */}
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text}`}>
                            <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority].dot} mr-1`}></span>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                          {task.dueDate && (
                            <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Labels */}
                        {task.labels && task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.labels.map((label, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            {task.assignee && (
                              <div className="flex items-center space-x-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                  {task.assignee.name.split(' ').map(n => n[0]).join('')}
                                </div>
                              </div>
                            )}
                            {task.estimatedHours && (
                              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="h-3 w-3 mr-1" />
                                {task.estimatedHours}h
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.attachments && (
                              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Paperclip className="h-3 w-3" />
                              </span>
                            )}
                            {task.comments && (
                              <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {task.comments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { CheckCircle, Circle, Clock, Flag } from 'lucide-react';

const tasks = [
  {
    id: 1,
    title: 'Review project proposal',
    project: 'E-Commerce Platform',
    priority: 'high',
    dueTime: '2 hours',
    completed: false
  },
  {
    id: 2,
    title: 'Client meeting preparation',
    project: 'Mobile App Redesign',
    priority: 'medium',
    dueTime: '4 hours',
    completed: false
  },
  {
    id: 3,
    title: 'Code review for PR #234',
    project: 'API Development',
    priority: 'high',
    dueTime: '6 hours',
    completed: false
  },
  {
    id: 4,
    title: 'Update documentation',
    project: 'POS System',
    priority: 'low',
    dueTime: 'Tomorrow',
    completed: false
  },
  {
    id: 5,
    title: 'Team standup meeting',
    project: 'General',
    priority: 'medium',
    dueTime: 'Tomorrow',
    completed: true
  }
];

const priorityConfig = {
  high: {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    icon: '🔴'
  },
  medium: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    icon: '🟡'
  },
  low: {
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    icon: '🟢'
  }
};

export default function UpcomingTasks() {
  const [taskStates, setTaskStates] = React.useState(tasks);

  const toggleTask = (taskId: number) => {
    setTaskStates((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const pendingTasks = taskStates.filter((t) => !t.completed).length;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg border border-gray-100 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Clock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Tasks
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pendingTasks} tasks pending
            </p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar">
        {taskStates.map((task) => {
          const priority = priorityConfig[task.priority];
          return (
            <div
              key={task.id}
              className={`p-3 rounded-xl border ${
                task.completed
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              } transition-all duration-200`}
            >
              <div className="flex items-start space-x-3">
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-indigo-500 transition-colors" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium mb-1 ${
                      task.completed
                        ? 'text-gray-400 dark:text-gray-500 line-through'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {task.project}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">
                        {task.dueTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Badge */}
                {!task.completed && (
                  <span className={`text-xs px-2 py-1 rounded-lg ${priority.bg} ${priority.color} font-medium`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Button */}
      <button className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
        + Add New Task
      </button>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Phone, Mail, Users, Clock } from 'lucide-react';
import { crmService } from '../../../services/crm.service';
import { Activity } from '../../../types/crm.types';

export default function ActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadActivities();
    setMounted(true);
  }, []);

  const loadActivities = async () => {
    try {
      const data = await crmService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to load activities:', error);
    }
  };

  const activityIcons = {
    call: Phone,
    email: Mail,
    meeting: Users,
    task: Clock,
    note: Calendar,
    demo: Users
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/40 dark:from-gray-950 dark:via-teal-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-teal-300 dark:bg-teal-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-600 via-blue-600 to-purple-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Activities & Tasks
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage follow-ups and customer interactions</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Schedule Activity
                </button>
              </div>

              <div className="space-y-4">
                {activities.map((activity) => {
                  const ActivityIcon = activityIcons[activity.type];
                  return (
                    <div key={activity.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            activity.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                            activity.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            activity.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' :
                            'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <ActivityIcon className={`h-6 w-6 ${
                              activity.status === 'completed' ? 'text-emerald-600' :
                              activity.status === 'scheduled' ? 'text-blue-600' :
                              activity.status === 'overdue' ? 'text-red-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{activity.subject}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} • {activity.assignedUser.name}
                            </p>
                            <p className="text-xs text-gray-500">{activity.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                            activity.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            activity.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </span>
                          {activity.dueDate && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {activity.status === 'completed' && activity.completedDate
                                ? `Completed: ${new Date(activity.completedDate).toLocaleDateString()}`
                                : `Due: ${new Date(activity.dueDate).toLocaleDateString()}`
                              }
                            </p>
                          )}
                          {activity.duration && (
                            <p className="text-xs text-gray-500 mt-1">{activity.duration} minutes</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
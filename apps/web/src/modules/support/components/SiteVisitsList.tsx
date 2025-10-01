import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, User, Wrench } from 'lucide-react';
import { supportService } from '../../../services/support.service';
import { SiteVisit } from '../../../types/support.types';

export default function SiteVisitsList() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadVisits();
    setMounted(true);
  }, []);

  const loadVisits = async () => {
    try {
      const data = await supportService.getSiteVisits();
      setVisits(data);
    } catch (error) {
      console.error('Failed to load site visits:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 dark:from-gray-950 dark:via-emerald-950/30 dark:to-blue-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-300 dark:bg-emerald-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 shadow-lg">
                    <MapPin className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Site Visit Scheduling
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Schedule and manage on-site service visits</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Schedule Visit
                </button>
              </div>

              <div className="space-y-6">
                {visits.map((visit) => (
                  <div key={visit.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {visit.customer.company || visit.customer.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{visit.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{visit.customer.address}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        visit.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        visit.status === 'in-progress' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        visit.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <Calendar className="h-5 w-5 text-blue-600 mb-2" />
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Scheduled</p>
                        <p className="font-bold text-blue-700 dark:text-blue-200">
                          {new Date(visit.scheduledDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-blue-600">
                          {new Date(visit.scheduledDate).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <User className="h-5 w-5 text-emerald-600 mb-2" />
                        <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Technician</p>
                        <p className="font-bold text-emerald-700 dark:text-emerald-200">
                          {visit.technician.name}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {visit.estimatedDuration}h estimated
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <Wrench className="h-5 w-5 text-purple-600 mb-2" />
                        <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Service Type</p>
                        <p className="font-bold text-purple-700 dark:text-purple-200">
                          {visit.serviceType.charAt(0).toUpperCase() + visit.serviceType.slice(1)}
                        </p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">Total Cost</p>
                        <p className="font-bold text-orange-700 dark:text-orange-200">
                          ${visit.totalCost.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {visit.materials.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Materials</h4>
                        <div className="space-y-2">
                          {visit.materials.map((material) => (
                            <div key={material.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-900 dark:text-white">{material.name}</span>
                                <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">x{material.quantity}</span>
                              </div>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                ${material.totalCost.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Technician Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {visit.technician.skills.map((skill) => (
                          <span key={skill} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {(visit.workPerformed || visit.notes) && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        {visit.workPerformed && (
                          <div className="mb-2">
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Work Performed:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{visit.workPerformed}</p>
                          </div>
                        )}
                        {visit.notes && (
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white mb-1">Notes:</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{visit.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
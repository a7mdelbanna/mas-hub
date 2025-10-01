import React, { useState, useEffect } from 'react';
import { Plus, Zap, TrendingUp } from 'lucide-react';
import { crmService } from '../../../services/crm.service';
import { Lead } from '../../../types/crm.types';

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadLeads();
    setMounted(true);
  }, []);

  const loadLeads = async () => {
    try {
      const data = await crmService.getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Failed to load leads:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/40 dark:from-gray-950 dark:via-purple-950/30 dark:to-pink-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Lead Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Track and nurture potential customers</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Add Lead
                </button>
              </div>

              <div className="space-y-4">
                {leads.map((lead) => (
                  <div key={lead.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                          {lead.contact.firstName[0]}{lead.contact.lastName[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            {lead.contact.firstName} {lead.contact.lastName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {lead.contact.company} • Score: {lead.score}/100
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">${lead.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{lead.probability}% probability</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          lead.stage === 'qualified' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                          lead.stage === 'new' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        }`}>
                          {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                        </span>
                      </div>
                    </div>
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
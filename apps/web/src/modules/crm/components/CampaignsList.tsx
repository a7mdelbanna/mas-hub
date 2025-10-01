import React, { useState, useEffect } from 'react';
import { Plus, Mail, TrendingUp, DollarSign } from 'lucide-react';
import { crmService } from '../../../services/crm.service';
import { Campaign } from '../../../types/crm.types';

export default function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadCampaigns();
    setMounted(true);
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await crmService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-pink-50/30 to-orange-50/40 dark:from-gray-950 dark:via-pink-950/30 dark:to-orange-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-orange-600 to-red-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-600 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Campaign Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage marketing campaigns and track performance</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  Create Campaign
                </button>
              </div>

              <div className="space-y-6">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign • {campaign.targetAudience}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        campaign.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        campaign.status === 'completed' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Budget</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                          ${campaign.budget.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">${campaign.spent.toLocaleString()} spent</p>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Leads Generated</p>
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-200">
                          {campaign.metrics.leads}
                        </p>
                        <p className="text-xs text-gray-500">{campaign.metrics.conversions} conversions</p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Revenue</p>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-200">
                          ${campaign.metrics.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{campaign.metrics.sales} sales</p>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <p className="text-sm text-orange-600 dark:text-orange-300 mb-1">ROI</p>
                        <p className="text-lg font-bold text-orange-700 dark:text-orange-200 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {campaign.metrics.roi.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Campaign Goals</h4>
                      <div className="space-y-2">
                        {campaign.goals.map((goal) => (
                          <div key={goal.id} className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} ({goal.unit})
                            </span>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {goal.current} / {goal.target}
                                </span>
                                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                                  <div
                                    className={`h-full rounded-full ${
                                      (goal.current / goal.target) >= 1 ? 'bg-emerald-500' :
                                      (goal.current / goal.target) >= 0.7 ? 'bg-blue-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                                {Math.round((goal.current / goal.target) * 100)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                      <span>
                        {campaign.metrics.impressions.toLocaleString()} impressions • {campaign.metrics.clicks.toLocaleString()} clicks
                      </span>
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
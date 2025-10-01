import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { crmService } from '../../../services/crm.service';
import { Pipeline, Deal } from '../../../types/crm.types';

export default function SalesPipeline() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadPipeline();
    loadDeals();
    setMounted(true);
  }, []);

  const loadPipeline = async () => {
    try {
      const data = await crmService.getPipelines();
      setPipeline(data[0]);
    } catch (error) {
      console.error('Failed to load pipeline:', error);
    }
  };

  const loadDeals = async () => {
    try {
      const data = await crmService.getDeals();
      setDeals(data);
    } catch (error) {
      console.error('Failed to load deals:', error);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/40 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/40">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
      </div>

      <div className="relative p-8">
        <div className={`transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-[1px]">
            <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8">
              <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Sales Pipeline
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Visualize your sales process and deal flow</p>
                </div>
              </div>

              {pipeline && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {pipeline.stages.map((stage) => (
                    <div key={stage.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white">{stage.name}</h3>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {stage.probability}%
                        </span>
                      </div>

                      <div className="space-y-3">
                        {deals.filter(deal => deal.stage === stage.name.toLowerCase().replace(' ', '-')).map((deal) => (
                          <div key={deal.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{deal.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {deal.contact.company}
                            </p>
                            <p className="text-lg font-bold text-indigo-600">
                              ${deal.value.toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${deals.filter(deal => deal.stage === stage.name.toLowerCase().replace(' ', '-'))
                              .reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
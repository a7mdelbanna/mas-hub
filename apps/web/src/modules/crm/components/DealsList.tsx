import React, { useState, useEffect } from 'react';
import { Plus, Target, DollarSign } from 'lucide-react';
import { crmService } from '../../../services/crm.service';
import { Deal } from '../../../types/crm.types';

export default function DealsList() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadDeals();
    setMounted(true);
  }, []);

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
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                      Deal Tracking
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage sales opportunities and deals</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 inline mr-2" />
                  New Deal
                </button>
              </div>

              <div className="space-y-6">
                {deals.map((deal) => (
                  <div key={deal.id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{deal.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {deal.contact.firstName} {deal.contact.lastName} • {deal.contact.company}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">${deal.value.toLocaleString()}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{deal.probability}% probability</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4">
                        <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Stage</p>
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-200">
                          {deal.stage.charAt(0).toUpperCase() + deal.stage.slice(1)}
                        </p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-300 mb-1">Expected Close</p>
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-200">
                          {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                        <p className="text-sm text-purple-600 dark:text-purple-300 mb-1">Assigned To</p>
                        <p className="text-lg font-bold text-purple-700 dark:text-purple-200">
                          {deal.assignedUser.name}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Products/Services</h4>
                      <div className="space-y-2">
                        {deal.products.map((product) => (
                          <div key={product.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">x{product.quantity}</span>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${product.totalPrice.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {deal.notes && (
                      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400">{deal.notes}</p>
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
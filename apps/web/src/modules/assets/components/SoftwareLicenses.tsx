import React, { useState, useEffect } from 'react';
import { Code, Key, Users, Plus } from 'lucide-react';
import { assetsService } from '../../../services/assets.service';
import { SoftwareLicense } from '../../../types/assets.types';

export default function SoftwareLicenses() {
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadLicenses();
    setMounted(true);
  }, []);

  const loadLicenses = async () => {
    try {
      const data = await assetsService.getSoftwareLicenses();
      setLicenses(data);
    } catch (error) {
      console.error('Failed to load licenses:', error);
    } finally {
      setLoading(false);
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
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Software Licenses
                </h1>
                <p className="text-purple-200 text-lg">Manage software licenses and subscriptions</p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add License
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {licenses.map((license, index) => (
              <div
                key={license.id}
                className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Code className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{license.name}</h3>
                        <p className="text-purple-300 text-sm">{license.vendor}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      license.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                      'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Type:</span>
                      <span className="text-white text-sm">{license.licenseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Users:</span>
                      <span className="text-white text-sm">{license.currentUsers}/{license.maxUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Expires:</span>
                      <span className="text-white text-sm">
                        {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300 text-sm">Cost:</span>
                      <span className="text-emerald-300 text-sm font-semibold">${license.cost.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${(license.currentUsers / license.maxUsers) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center">
                      <Users className="w-4 h-4 mr-1" />
                      Manage Users
                    </button>
                    <button className="py-2 px-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                      <Key className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
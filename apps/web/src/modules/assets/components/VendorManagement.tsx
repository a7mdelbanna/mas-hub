import React, { useState, useEffect } from 'react';
import { Building, Star, Plus } from 'lucide-react';

export default function VendorManagement() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Vendor Management
            </h1>
            <p className="text-purple-200 text-lg">Manage suppliers and service providers</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
            <div className="text-center py-12">
              <Building className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Vendor Directory</h3>
              <p className="text-purple-200 mb-6">Comprehensive vendor management system</p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                <Plus className="w-5 h-5 mr-2" />
                Add Vendor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
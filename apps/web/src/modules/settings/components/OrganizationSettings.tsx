import React, { useState, useEffect } from 'react';
import { Building2, Globe, DollarSign, Clock, Save, Sparkles, CheckCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';

export default function OrganizationSettings() {
  const [mounted, setMounted] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: 'MAS Technologies',
    website: 'https://mas.com',
    currency: 'USD',
    timezone: 'America/New_York',
    fiscalYearStart: 'January',
    defaultLanguage: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
  });
  const dispatch = useDispatch();

  useEffect(() => {
    setMounted(true);
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('organizationSettings');
    if (savedSettings) {
      setFormData(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('organizationSettings', JSON.stringify(formData));

    // Show success message
    setShowSuccessMessage(true);
    dispatch(addNotification({
      type: 'success',
      title: 'Settings Saved',
      message: 'Organization settings have been saved successfully.',
    }));

    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleReset = () => {
    const defaultSettings = {
      organizationName: 'MAS Technologies',
      website: 'https://mas.com',
      currency: 'USD',
      timezone: 'America/New_York',
      fiscalYearStart: 'January',
      defaultLanguage: 'en',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
    };
    setFormData(defaultSettings);
    localStorage.setItem('organizationSettings', JSON.stringify(defaultSettings));

    dispatch(addNotification({
      type: 'info',
      title: 'Settings Reset',
      message: 'Organization settings have been reset to defaults.',
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background with Mesh Gradients */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/40">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-300 dark:bg-blue-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative p-8 space-y-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className={`fixed top-24 right-8 z-50 p-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl shadow-green-500/25 animate-slideInRight transition-all duration-500`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold">Settings Saved!</p>
                <p className="text-sm text-white/90">Organization settings have been updated successfully.</p>
              </div>
            </div>
          </div>
        )}
        {/* Ultra-Premium Header */}
        <div className={`relative group transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          {/* Glassmorphic Container */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-[1px] shadow-2xl">
            <div className="relative overflow-hidden rounded-3xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-8">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 opacity-50"></div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/30 animate-pulse-slow">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
                      Organization Settings
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      Manage your organization's core configuration and preferences
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Main Settings Form */}
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Glassmorphic Container */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-8 flex items-center space-x-3">
                  <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span>Basic Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-blue-500" />
                      <span>Organization Name</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-green-500" />
                      <span>Website</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                      <span>Base Currency</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 appearance-none">
                        <option value="USD">USD - US Dollar</option>
                        <option value="EGP">EGP - Egyptian Pound</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span>Timezone</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300 appearance-none">
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="Europe/London">London Time</option>
                        <option value="Asia/Dubai">Dubai Time</option>
                      </select>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>
                </div>

                {/* Save Button Section */}
                <div className="mt-10 pt-8 border-t border-white/10 dark:border-gray-700/30">
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleReset}
                      className="relative group px-8 py-4 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/30 dark:hover:bg-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">Reset to Default</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-3xl hover:shadow-blue-500/40 transition-all duration-500 hover:scale-105 overflow-hidden">
                      {/* Button background animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative flex items-center space-x-2">
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
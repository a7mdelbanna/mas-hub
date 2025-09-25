import React, { useState } from 'react';
import { Upload, Image as ImageIcon, X, Eye, Save } from 'lucide-react';

export default function BrandingSettings() {
  const [logos, setLogos] = useState({
    primary: null as File | null,
    secondary: null as File | null,
    favicon: null as File | null
  });

  const [brandColors, setBrandColors] = useState({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937'
  });

  const [brandInfo, setBrandInfo] = useState({
    companyName: 'MAS Technologies',
    tagline: 'Innovative Business Solutions',
    description: 'Leading provider of enterprise software solutions'
  });

  const handleFileUpload = (type: 'primary' | 'secondary' | 'favicon', file: File | null) => {
    setLogos({ ...logos, [type]: file });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Branding Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your brand identity across all portals
        </p>
      </div>

      {/* Logo Management */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Logo Management
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Primary Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Primary Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              {logos.primary ? (
                <div className="space-y-3">
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {logos.primary.name}
                  </p>
                  <button
                    onClick={() => handleFileUpload('primary', null)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center justify-center space-x-1 w-full"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG (max. 2MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/svg+xml,image/png"
                    onChange={(e) => handleFileUpload('primary', e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used in headers and main navigation
            </p>
          </div>

          {/* Secondary Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Secondary Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              {logos.secondary ? (
                <div className="space-y-3">
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {logos.secondary.name}
                  </p>
                  <button
                    onClick={() => handleFileUpload('secondary', null)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center justify-center space-x-1 w-full"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-500">SVG, PNG (max. 2MB)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/svg+xml,image/png"
                    onChange={(e) => handleFileUpload('secondary', e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Used in emails and documents
            </p>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Favicon
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              {logos.favicon ? (
                <div className="space-y-3">
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {logos.favicon.name}
                  </p>
                  <button
                    onClick={() => handleFileUpload('favicon', null)}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center justify-center space-x-1 w-full"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-500">ICO, PNG (32x32)</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/x-icon,image/png"
                    onChange={(e) => handleFileUpload('favicon', e.target.files?.[0] || null)}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Browser tab icon
            </p>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Brand Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Brand Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={brandColors.primary}
                onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={brandColors.primary}
                onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                className="input flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Brand Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors({ ...brandColors, secondary: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={brandColors.secondary}
                onChange={(e) => setBrandColors({ ...brandColors, secondary: e.target.value })}
                className="input flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Background Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={brandColors.background}
                onChange={(e) => setBrandColors({ ...brandColors, background: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={brandColors.background}
                onChange={(e) => setBrandColors({ ...brandColors, background: e.target.value })}
                className="input flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={brandColors.text}
                onChange={(e) => setBrandColors({ ...brandColors, text: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={brandColors.text}
                onChange={(e) => setBrandColors({ ...brandColors, text: e.target.value })}
                className="input flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Brand Information */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Brand Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={brandInfo.companyName}
              onChange={(e) => setBrandInfo({ ...brandInfo, companyName: e.target.value })}
              className="input w-full"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={brandInfo.tagline}
              onChange={(e) => setBrandInfo({ ...brandInfo, tagline: e.target.value })}
              className="input w-full"
              placeholder="Your company tagline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={brandInfo.description}
              onChange={(e) => setBrandInfo({ ...brandInfo, description: e.target.value })}
              className="input w-full min-h-24"
              placeholder="Brief company description"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>Brand Preview</span>
        </h3>
        <div
          className="p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700"
          style={{ backgroundColor: brandColors.background }}
        >
          <div className="text-center space-y-4">
            <div
              className="w-24 h-24 mx-auto rounded-xl flex items-center justify-center"
              style={{ backgroundColor: brandColors.primary }}
            >
              <ImageIcon className="h-12 w-12 text-white" />
            </div>
            <h2
              className="text-3xl font-bold"
              style={{ color: brandColors.text }}
            >
              {brandInfo.companyName}
            </h2>
            <p
              className="text-lg"
              style={{ color: brandColors.secondary }}
            >
              {brandInfo.tagline}
            </p>
            <p
              className="text-sm max-w-md mx-auto"
              style={{ color: brandColors.text, opacity: 0.7 }}
            >
              {brandInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button className="px-6 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-gray-400 transition-colors">
          Reset to Default
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>Save Branding</span>
        </button>
      </div>
    </div>
  );
}
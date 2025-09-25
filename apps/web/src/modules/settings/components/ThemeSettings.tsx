import React, { useState } from 'react';
import { useTheme } from '../../../components/ui/ThemeProvider';
import { Sun, Moon, Monitor, Check, Palette } from 'lucide-react';

const themePresets = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic blue and purple gradient',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#ec4899'
    },
    preview: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue tones',
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#22d3ee'
    },
    preview: 'from-sky-500 to-cyan-600'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink',
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#f43f5e'
    },
    preview: 'from-orange-500 to-pink-600'
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green shades',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#14b8a6'
    },
    preview: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Deep purple and gold',
    colors: {
      primary: '#7c3aed',
      secondary: '#6366f1',
      accent: '#f59e0b'
    },
    preview: 'from-violet-600 to-amber-500'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark blue elegance',
    colors: {
      primary: '#1e40af',
      secondary: '#1e3a8a',
      accent: '#3b82f6'
    },
    preview: 'from-blue-800 to-blue-600'
  }
];

export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState('default');
  const [customColors, setCustomColors] = useState({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899'
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Theme Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Customize the appearance of your application
        </p>
      </div>

      {/* Color Mode Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Color Mode
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'light'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Sun className={`h-5 w-5 ${theme === 'light' ? 'text-indigo-600' : 'text-gray-400'}`} />
              {theme === 'light' && <Check className="h-5 w-5 text-indigo-600" />}
            </div>
            <p className="font-medium text-gray-900 dark:text-white text-left">Light</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Bright and clear</p>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Moon className={`h-5 w-5 ${theme === 'dark' ? 'text-indigo-600' : 'text-gray-400'}`} />
              {theme === 'dark' && <Check className="h-5 w-5 text-indigo-600" />}
            </div>
            <p className="font-medium text-gray-900 dark:text-white text-left">Dark</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Easy on the eyes</p>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              theme === 'system'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Monitor className={`h-5 w-5 ${theme === 'system' ? 'text-indigo-600' : 'text-gray-400'}`} />
              {theme === 'system' && <Check className="h-5 w-5 text-indigo-600" />}
            </div>
            <p className="font-medium text-gray-900 dark:text-white text-left">System</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Auto adjust</p>
          </button>
        </div>
      </div>

      {/* Theme Presets */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Color Scheme Presets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themePresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setSelectedPreset(preset.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                selectedPreset === preset.id
                  ? 'border-indigo-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              {/* Preview Gradient */}
              <div className={`h-16 rounded-lg bg-gradient-to-r ${preset.preview} mb-3 relative overflow-hidden`}>
                {selectedPreset === preset.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-1 rounded-full bg-white">
                      <Check className="h-4 w-4 text-indigo-600" />
                    </div>
                  </div>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                {preset.name}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {preset.description}
              </p>

              {/* Color Swatches */}
              <div className="flex space-x-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: preset.colors.primary }}
                ></div>
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: preset.colors.secondary }}
                ></div>
                <div
                  className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: preset.colors.accent }}
                ></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Custom Colors
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customColors.primary}
                onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={customColors.primary}
                onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                className="input flex-1"
                placeholder="#6366f1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Secondary Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customColors.secondary}
                onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={customColors.secondary}
                onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                className="input flex-1"
                placeholder="#8b5cf6"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Accent Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={customColors.accent}
                onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <input
                type="text"
                value={customColors.accent}
                onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                className="input flex-1"
                placeholder="#ec4899"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview
        </h3>
        <div className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 space-y-4">
          <div className="flex items-center space-x-4">
            <div
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: customColors.primary }}
            >
              Primary Button
            </div>
            <div
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: customColors.secondary }}
            >
              Secondary Button
            </div>
            <div
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: customColors.accent }}
            >
              Accent Button
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button className="px-6 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:border-gray-400 transition-colors">
          Reset to Default
        </button>
        <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
          Save Theme Settings
        </button>
      </div>
    </div>
  );
}
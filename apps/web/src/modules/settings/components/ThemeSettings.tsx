import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../components/ui/ThemeProvider';
import { Sun, Moon, Monitor, Check, Palette, Paintbrush, Sparkles } from 'lucide-react';

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
  const { theme, setTheme, colorScheme, setColorScheme, applyPreset } = useTheme();
  const [selectedPreset, setSelectedPreset] = useState(() => {
    return localStorage.getItem('mas-color-preset') || 'default';
  });
  const [customColors, setCustomColors] = useState(colorScheme);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCustomColors(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30 animate-pulse-slow">
                    <Palette className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
                      Theme Settings
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                      Customize the visual identity and appearance of your application
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl -mr-48 -mt-48 group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Color Mode Selection */}
        <div className={`transition-all duration-1000 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
                  <Sun className="h-6 w-6 text-yellow-500" />
                  <span>Color Mode</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setTheme('light')}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-500 group overflow-hidden ${
                      theme === 'light'
                        ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 shadow-2xl shadow-yellow-500/25'
                        : 'border-white/20 dark:border-gray-700/30 hover:border-yellow-400/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${
                          theme === 'light' ? 'bg-yellow-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        } transition-all duration-300`}>
                          <Sun className="h-6 w-6" />
                        </div>
                        {theme === 'light' && (
                          <div className="p-1 rounded-full bg-yellow-500 animate-pulse">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-left mb-2">Light Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Bright and clear interface</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-500 group overflow-hidden ${
                      theme === 'dark'
                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-2xl shadow-blue-500/25'
                        : 'border-white/20 dark:border-gray-700/30 hover:border-blue-400/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${
                          theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        } transition-all duration-300`}>
                          <Moon className="h-6 w-6" />
                        </div>
                        {theme === 'dark' && (
                          <div className="p-1 rounded-full bg-blue-500 animate-pulse">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-left mb-2">Dark Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Easy on the eyes</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setTheme('system')}
                    className={`relative p-6 rounded-2xl border-2 transition-all duration-500 group overflow-hidden ${
                      theme === 'system'
                        ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 shadow-2xl shadow-purple-500/25'
                        : 'border-white/20 dark:border-gray-700/30 hover:border-purple-400/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-xl ${
                          theme === 'system' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        } transition-all duration-300`}>
                          <Monitor className="h-6 w-6" />
                        </div>
                        {theme === 'system' && (
                          <div className="p-1 rounded-full bg-purple-500 animate-pulse">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white text-left mb-2">System</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 text-left">Auto adjust</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-yellow-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Theme Presets */}
        <div className={`transition-all duration-1000 delay-300 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
                  <Paintbrush className="h-6 w-6 text-purple-500" />
                  <span>Color Scheme Presets</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {themePresets.map((preset, index) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset.id);
                        applyPreset(preset.id);
                        setCustomColors(preset.colors);
                      }}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-500 text-left group overflow-hidden ${
                        selectedPreset === preset.id
                          ? 'border-purple-400 shadow-2xl shadow-purple-500/25 scale-105'
                          : 'border-white/20 dark:border-gray-700/30 hover:border-purple-400/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm hover:scale-102'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      <div className="relative z-10">
                        {/* Preview Gradient */}
                        <div className={`h-20 rounded-xl bg-gradient-to-r ${preset.preview} mb-4 relative overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-300`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                          {selectedPreset === preset.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="p-2 rounded-full bg-white shadow-lg animate-pulse">
                                <Check className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                          )}
                          {selectedPreset === preset.id && (
                            <div className="absolute top-2 right-2">
                              <Sparkles className="h-5 w-5 text-white animate-pulse" />
                            </div>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
                          {preset.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {preset.description}
                        </p>

                        {/* Color Swatches */}
                        <div className="flex space-x-3">
                          <div
                            className="w-8 h-8 rounded-xl border-2 border-white/30 dark:border-gray-600/30 shadow-lg hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: preset.colors.primary }}
                          ></div>
                          <div
                            className="w-8 h-8 rounded-xl border-2 border-white/30 dark:border-gray-600/30 shadow-lg hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: preset.colors.secondary }}
                          ></div>
                          <div
                            className="w-8 h-8 rounded-xl border-2 border-white/30 dark:border-gray-600/30 shadow-lg hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: preset.colors.accent }}
                          ></div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Custom Colors */}
        <div className={`transition-all duration-1000 delay-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-blue-500/5 group-hover:from-pink-500/10 group-hover:via-purple-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-pink-900 to-purple-900 dark:from-white dark:via-pink-100 dark:to-purple-100 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
                  <Palette className="h-6 w-6 text-pink-500" />
                  <span>Custom Colors</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Primary Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={customColors.primary}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customColors.primary}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                          placeholder="#6366f1"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>Secondary Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                          placeholder="#8b5cf6"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      <span>Accent Color</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={customColors.accent}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className="h-14 w-14 rounded-2xl border-2 border-white/30 dark:border-gray-600/30 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={customColors.accent}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className="w-full px-4 py-3 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-300"
                          placeholder="#ec4899"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/10 to-red-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className={`transition-all duration-1000 delay-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 p-[1px] shadow-2xl shadow-primary/20 hover:shadow-3xl hover:shadow-primary/30 transition-all duration-500 group hover:scale-[1.02]">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-xl p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500"></div>

              <div className="relative z-10">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent mb-6 flex items-center space-x-3">
                  <Sparkles className="h-6 w-6 text-blue-500" />
                  <span>Live Preview</span>
                </h3>
                <div className="p-8 rounded-2xl border border-white/10 dark:border-gray-700/30 bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      className="relative px-6 py-3 rounded-2xl text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 overflow-hidden group"
                      style={{ backgroundColor: customColors.primary }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">Primary Button</span>
                    </button>
                    <button
                      className="relative px-6 py-3 rounded-2xl text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 overflow-hidden group"
                      style={{ backgroundColor: customColors.secondary }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">Secondary Button</span>
                    </button>
                    <button
                      className="relative px-6 py-3 rounded-2xl text-white font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 overflow-hidden group"
                      style={{ backgroundColor: customColors.accent }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">Accent Button</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-8 right-8 z-50 p-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-2xl shadow-emerald-500/25 animate-bounce">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-white/20">
                <Check className="h-5 w-5" />
              </div>
              <p className="font-bold">
                Theme settings saved successfully!
              </p>
            </div>
          </div>
        )}

        {/* Save Button Section */}
        <div className={`transition-all duration-1000 delay-900 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex justify-end space-x-4 pt-8 border-t border-white/10 dark:border-gray-700/30">
            <button
              onClick={() => {
                setSelectedPreset('default');
                applyPreset('default');
                setCustomColors(themePresets[0].colors);
              }}
              className="relative group px-8 py-4 rounded-2xl bg-white/20 dark:bg-gray-800/20 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 text-gray-700 dark:text-gray-300 font-semibold hover:bg-white/30 dark:hover:bg-gray-700/30 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/10 to-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Reset to Default</span>
            </button>
            <button
              onClick={() => {
                setColorScheme(customColors);
                setShowSuccessMessage(true);
                setTimeout(() => setShowSuccessMessage(false), 3000);
              }}
              className="relative group px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40 transition-all duration-500 hover:scale-105 overflow-hidden"
            >
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-100 group-hover:opacity-90 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <span>Save Theme Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
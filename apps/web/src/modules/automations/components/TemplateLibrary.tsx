import React, { useState, useEffect } from 'react';
import { Layers, Download, Plus } from 'lucide-react';
import { automationsService } from '../../../services/automations.service';
import { WorkflowTemplate } from '../../../types/automations.types';

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadTemplates();
    setMounted(true);
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await automationsService.getWorkflowTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
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
            <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Template Library
            </h1>
            <p className="text-purple-200 text-lg">Pre-built workflow templates for common automation tasks</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Layers className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{template.name}</h3>
                        <p className="text-purple-300 text-sm">{template.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                      <span className="text-sm font-medium">{template.popularity}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-purple-200 text-sm">{template.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 px-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center">
                      <Download className="w-4 h-4 mr-1" />
                      Use Template
                    </button>
                    <button className="py-2 px-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                      Preview
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
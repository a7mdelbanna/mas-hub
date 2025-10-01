import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  User,
  DollarSign,
  MapPin,
  Edit,
  Plus,
  Eye,
  MoreVertical
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { Department } from '../../../types/hr.types';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadDepartments();
    setMounted(true);
  }, []);

  const loadDepartments = async () => {
    try {
      const data = await hrService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
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
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Department Management
                </h1>
                <p className="text-purple-200 text-lg">
                  Organize and manage company departments and teams
                </p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Department
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {departments.map((department, index) => (
              <div
                key={department.id}
                className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg">{department.name}</h3>
                        <p className="text-purple-300 text-sm">{department.employeeCount} employees</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white transition-all duration-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  {department.description && (
                    <div className="mb-4">
                      <p className="text-purple-200 text-sm">{department.description}</p>
                    </div>
                  )}

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 text-sm flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Manager
                      </span>
                      <span className="text-white text-sm">{department.manager.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-purple-300 text-sm flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Employees
                      </span>
                      <span className="text-emerald-300 text-sm font-semibold">{department.employeeCount}</span>
                    </div>

                    {department.budget && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 text-sm flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Budget
                        </span>
                        <span className="text-emerald-300 text-sm font-semibold">
                          ${department.budget.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {department.location && (
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 text-sm flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Location
                        </span>
                        <span className="text-white text-sm">{department.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center justify-center">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                    <button className="flex-1 py-2 px-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
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
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  Building2,
  Users,
  MoreVertical,
  Edit,
  Eye,
  UserX
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { Employee } from '../../../types/hr.types';

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadEmployees();
    setMounted(true);
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, departmentFilter, statusFilter]);

  const loadEmployees = async () => {
    try {
      const data = await hrService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    if (searchTerm) {
      filtered = filtered.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const departments = Array.from(new Set(employees.map(emp => emp.department)));
  const statuses = Array.from(new Set(employees.map(emp => emp.status)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'inactive': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'terminated': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'on-leave': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
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
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Employee Directory
                </h1>
                <p className="text-purple-200 text-lg">
                  Manage your team members and their information
                </p>
              </div>
              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Employee
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all" className="bg-slate-800">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-800">{dept}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all" className="bg-slate-800">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status} className="bg-slate-800">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Results Count */}
                <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
                  <Users className="w-5 h-5 text-purple-300 mr-2" />
                  <span className="text-white font-medium">{filteredEmployees.length} employees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map((employee, index) => (
              <div
                key={employee.id}
                className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => setSelectedEmployee(employee)}
              >
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>

                {/* Gradient Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                        {employee.avatar ? (
                          <img src={employee.avatar} alt={`${employee.firstName} ${employee.lastName}`} className="w-full h-full object-cover" />
                        ) : (
                          `${employee.firstName[0]}${employee.lastName[0]}`
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg group-hover:text-purple-200 transition-colors duration-300">
                          {employee.firstName} {employee.lastName}
                        </h3>
                        <p className="text-purple-300 text-sm">{employee.employeeId}</p>
                      </div>
                    </div>

                    <div className="relative">
                      <button className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white transition-all duration-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor(employee.status)}`}>
                    {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                  </div>

                  {/* Position & Department */}
                  <div className="mb-4">
                    <p className="text-white font-medium mb-1">{employee.position}</p>
                    <p className="text-purple-200 text-sm flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {employee.department}
                    </p>
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <p className="text-purple-200 text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {employee.email}
                    </p>
                    {employee.phone && (
                      <p className="text-purple-200 text-sm flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {employee.phone}
                      </p>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-purple-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {new Date(employee.startDate).toLocaleDateString()}
                    </span>
                    <span className="text-emerald-300 font-medium">
                      ${employee.salary.toLocaleString()}
                    </span>
                  </div>

                  {/* Skills Preview */}
                  {employee.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {employee.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {employee.skills.length > 3 && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30">
                            +{employee.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No employees found</h3>
              <p className="text-purple-200 mb-6">Try adjusting your search criteria or add a new employee.</p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                <Plus className="w-5 h-5 mr-2" />
                Add Employee
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                    {selectedEmployee.avatar ? (
                      <img src={selectedEmployee.avatar} alt={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      `${selectedEmployee.firstName[0]}${selectedEmployee.lastName[0]}`
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedEmployee.firstName} {selectedEmployee.lastName}
                    </h2>
                    <p className="text-purple-200">{selectedEmployee.position}</p>
                    <p className="text-purple-300 text-sm">{selectedEmployee.employeeId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white transition-all duration-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-purple-200">
                      <Mail className="w-5 h-5 mr-3 text-purple-400" />
                      {selectedEmployee.email}
                    </div>
                    {selectedEmployee.phone && (
                      <div className="flex items-center text-purple-200">
                        <Phone className="w-5 h-5 mr-3 text-purple-400" />
                        {selectedEmployee.phone}
                      </div>
                    )}
                    {selectedEmployee.address && (
                      <div className="flex items-center text-purple-200">
                        <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                        {selectedEmployee.address}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Employment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Department:</span>
                      <span className="text-white">{selectedEmployee.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Start Date:</span>
                      <span className="text-white">{new Date(selectedEmployee.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Salary:</span>
                      <span className="text-emerald-300 font-semibold">${selectedEmployee.salary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Status:</span>
                      <span className={`px-2 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedEmployee.status)}`}>
                        {selectedEmployee.status.charAt(0).toUpperCase() + selectedEmployee.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedEmployee.skills.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-xl border border-blue-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 mt-8">
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Employee
                </button>
                <button className="flex-1 py-3 px-4 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
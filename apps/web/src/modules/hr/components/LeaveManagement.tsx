import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  Coffee,
  Heart,
  Briefcase,
  Umbrella,
  Home,
  MoreVertical
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { LeaveRequest } from '../../../types/hr.types';

export default function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLeaveRequests();
    setMounted(true);
  }, []);

  const loadLeaveRequests = async () => {
    try {
      const data = await hrService.getLeaveRequests();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Failed to load leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation': return Umbrella;
      case 'sick': return Heart;
      case 'personal': return User;
      case 'maternity': return Home;
      case 'paternity': return Home;
      case 'unpaid': return Briefcase;
      default: return Coffee;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'approved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'sick': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'personal': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'maternity': return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'paternity': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'unpaid': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const filteredRequests = leaveRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesSearch = searchTerm === '' ||
      request.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
  });

  const leaveStats = {
    pending: leaveRequests.filter(r => r.status === 'pending').length,
    approved: leaveRequests.filter(r => r.status === 'approved').length,
    rejected: leaveRequests.filter(r => r.status === 'rejected').length,
    totalDays: leaveRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days, 0)
  };

  const approveRequest = async (requestId: string) => {
    try {
      await hrService.approveLeaveRequest(requestId, 'current-user-id');
      loadLeaveRequests();
    } catch (error) {
      console.error('Failed to approve leave request:', error);
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
                  Leave Management
                </h1>
                <p className="text-purple-200 text-lg">
                  Manage employee time-off requests and approvals
                </p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                New Leave Request
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <AlertCircle className="w-8 h-8 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{leaveStats.pending}</span>
                  </div>
                  <p className="text-purple-200 font-medium">Pending Requests</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    <span className="text-2xl font-bold text-white">{leaveStats.approved}</span>
                  </div>
                  <p className="text-purple-200 font-medium">Approved</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <XCircle className="w-8 h-8 text-red-400" />
                    <span className="text-2xl font-bold text-white">{leaveStats.rejected}</span>
                  </div>
                  <p className="text-purple-200 font-medium">Rejected</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">{leaveStats.totalDays}</span>
                  </div>
                  <p className="text-purple-200 font-medium">Total Days Approved</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all" className="bg-slate-800">All Statuses</option>
                  <option value="pending" className="bg-slate-800">Pending</option>
                  <option value="approved" className="bg-slate-800">Approved</option>
                  <option value="rejected" className="bg-slate-800">Rejected</option>
                  <option value="cancelled" className="bg-slate-800">Cancelled</option>
                </select>

                {/* Type Filter */}
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all" className="bg-slate-800">All Types</option>
                  <option value="vacation" className="bg-slate-800">Vacation</option>
                  <option value="sick" className="bg-slate-800">Sick Leave</option>
                  <option value="personal" className="bg-slate-800">Personal</option>
                  <option value="maternity" className="bg-slate-800">Maternity</option>
                  <option value="paternity" className="bg-slate-800">Paternity</option>
                  <option value="unpaid" className="bg-slate-800">Unpaid</option>
                </select>

                {/* Results Count */}
                <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
                  <Clock className="w-5 h-5 text-purple-300 mr-2" />
                  <span className="text-white font-medium">{filteredRequests.length} requests</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRequests.map((request, index) => {
              const IconComponent = getLeaveTypeIcon(request.type);

              return (
                <div
                  key={request.id}
                  className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Glassmorphism Background */}
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>

                  {/* Gradient Border */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg group-hover:text-purple-200 transition-colors duration-300">
                            {request.employeeName}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getTypeColor(request.type)}`}>
                            {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                        <button className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white transition-all duration-300">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-purple-200 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-purple-200 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {request.days} {request.days === 1 ? 'day' : 'days'}
                      </div>
                    </div>

                    {/* Reason */}
                    {request.reason && (
                      <div className="mb-4">
                        <p className="text-purple-300 text-sm font-medium mb-1">Reason:</p>
                        <p className="text-purple-200 text-sm">{request.reason}</p>
                      </div>
                    )}

                    {/* Approval Info */}
                    {request.approver && (
                      <div className="mb-4 p-3 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-emerald-300 text-sm font-medium">
                          Approved by {request.approver.name}
                        </p>
                        {request.approvedAt && (
                          <p className="text-purple-300 text-xs">
                            on {new Date(request.approvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    {request.notes && (
                      <div className="mb-4">
                        <p className="text-purple-300 text-sm font-medium mb-1">Notes:</p>
                        <p className="text-purple-200 text-sm">{request.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => approveRequest(request.id)}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button className="flex-1 py-2 px-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl text-white text-sm font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Request Date */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-purple-300 text-xs">
                        Requested on {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <Coffee className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No leave requests found</h3>
              <p className="text-purple-200 mb-6">No requests match your current filters.</p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center mx-auto">
                <Plus className="w-5 h-5 mr-2" />
                Create Leave Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
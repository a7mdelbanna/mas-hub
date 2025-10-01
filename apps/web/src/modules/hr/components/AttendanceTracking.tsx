import React, { useState, useEffect } from 'react';
import {
  Clock,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Filter,
  Download
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { Attendance } from '../../../types/hr.types';

export default function AttendanceTracking() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadAttendance();
    setMounted(true);
  }, []);

  const loadAttendance = async () => {
    try {
      const data = await hrService.getAttendance();
      setAttendance(data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'absent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'late': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'half-day': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'remote': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return CheckCircle2;
      case 'absent': return XCircle;
      case 'late': return AlertTriangle;
      case 'half-day': return Clock;
      case 'remote': return MapPin;
      default: return Clock;
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
                  Attendance Tracking
                </h1>
                <p className="text-purple-200 text-lg">
                  Monitor employee attendance and working hours
                </p>
              </div>
              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </button>
                <button className="px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {attendance.map((record, index) => {
              const StatusIcon = getStatusIcon(record.status);

              return (
                <div
                  key={record.id}
                  className={`group relative overflow-hidden rounded-3xl p-6 transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{record.employeeName}</h3>
                          <p className="text-purple-300 text-sm">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(record.status)} flex items-center`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {record.checkIn && (
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 text-sm">Check In:</span>
                          <span className="text-white text-sm">{new Date(record.checkIn).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {record.checkOut && (
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 text-sm">Check Out:</span>
                          <span className="text-white text-sm">{new Date(record.checkOut).toLocaleTimeString()}</span>
                        </div>
                      )}
                      {record.totalHours && (
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 text-sm">Total Hours:</span>
                          <span className="text-emerald-300 text-sm font-semibold">{record.totalHours}h</span>
                        </div>
                      )}
                      {record.location && (
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 text-sm">Location:</span>
                          <span className="text-white text-sm">{record.location}</span>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-purple-200 text-sm">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
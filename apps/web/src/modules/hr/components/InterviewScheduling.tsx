import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Phone,
  MapPin,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Link,
  User
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { Interview } from '../../../types/hr.types';

export default function InterviewScheduling() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadInterviews();
    setMounted(true);
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await hrService.getInterviews();
      setInterviews(data);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in-person': return MapPin;
      case 'technical': return Calendar;
      case 'panel': return Users;
      default: return Calendar;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'rescheduled': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const upcomingInterviews = interviews.filter(interview =>
    interview.status === 'scheduled' && new Date(interview.scheduledDate) > new Date()
  );

  const todayInterviews = interviews.filter(interview => {
    const today = new Date();
    const interviewDate = new Date(interview.scheduledDate);
    return interviewDate.toDateString() === today.toDateString();
  });

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
                  Interview Scheduling
                </h1>
                <p className="text-purple-200 text-lg">
                  Manage and track all candidate interviews
                </p>
              </div>
              <div className="flex space-x-4">
                <div className="flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-1">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      viewMode === 'list'
                        ? 'bg-white/20 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                      viewMode === 'calendar'
                        ? 'bg-white/20 text-white'
                        : 'text-purple-300 hover:text-white'
                    }`}
                  >
                    Calendar
                  </button>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{todayInterviews.length}</span>
                  </div>
                  <p className="text-purple-200 font-medium">Today's Interviews</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-emerald-400" />
                    <span className="text-2xl font-bold text-white">{upcomingInterviews.length}</span>
                  </div>
                  <p className="text-purple-200 font-medium">Upcoming Interviews</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-8 h-8 text-purple-400" />
                    <span className="text-2xl font-bold text-white">
                      {interviews.filter(i => i.status === 'completed').length}
                    </span>
                  </div>
                  <p className="text-purple-200 font-medium">Completed</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl p-6">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <XCircle className="w-8 h-8 text-orange-400" />
                    <span className="text-2xl font-bold text-white">
                      {interviews.filter(i => i.status === 'cancelled').length}
                    </span>
                  </div>
                  <p className="text-purple-200 font-medium">Cancelled</p>
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="space-y-6">
              {/* Today's Interviews */}
              {todayInterviews.length > 0 && (
                <div className={`transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-blue-400" />
                    Today's Interviews
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {todayInterviews.map((interview, index) => (
                      <InterviewCard key={interview.id} interview={interview} index={index} onSelect={setSelectedInterview} />
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Interviews */}
              <div className={`transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Clock className="w-6 h-6 mr-3 text-emerald-400" />
                  Upcoming Interviews
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {upcomingInterviews.map((interview, index) => (
                    <InterviewCard key={interview.id} interview={interview} index={index} onSelect={setSelectedInterview} />
                  ))}
                </div>
              </div>

              {/* All Interviews */}
              <div className={`transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-400" />
                  All Interviews
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {interviews.map((interview, index) => (
                    <InterviewCard key={interview.id} interview={interview} index={index} onSelect={setSelectedInterview} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Calendar View */
            <div className={`transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '300ms' }}>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Calendar View</h3>
                  <p className="text-purple-200">Calendar integration coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {React.createElement(getInterviewTypeIcon(selectedInterview.type), {
                      className: "w-8 h-8 text-white"
                    })}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedInterview.candidateName}
                    </h2>
                    <p className="text-purple-200">{selectedInterview.type.charAt(0).toUpperCase() + selectedInterview.type.slice(1)} Interview</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(selectedInterview.status)}`}>
                      {selectedInterview.status.charAt(0).toUpperCase() + selectedInterview.status.slice(1)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white transition-all duration-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Schedule Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Schedule Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-purple-200">
                        <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                        {new Date(selectedInterview.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-purple-200">
                        <Clock className="w-5 h-5 mr-3 text-purple-400" />
                        {new Date(selectedInterview.scheduledDate).toLocaleTimeString()} ({selectedInterview.duration} minutes)
                      </div>
                      {selectedInterview.location && (
                        <div className="flex items-center text-purple-200">
                          <MapPin className="w-5 h-5 mr-3 text-purple-400" />
                          {selectedInterview.location}
                        </div>
                      )}
                      {selectedInterview.meetingUrl && (
                        <div className="flex items-center text-purple-200">
                          <Link className="w-5 h-5 mr-3 text-purple-400" />
                          <a href={selectedInterview.meetingUrl} className="text-blue-400 hover:text-blue-300 transition-colors duration-300" target="_blank" rel="noopener noreferrer">
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interviewers */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Interviewers</h3>
                    <div className="space-y-3">
                      {selectedInterview.interviewers.map((interviewer, idx) => (
                        <div key={idx} className="flex items-center space-x-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{interviewer.name}</p>
                            <p className="text-purple-300 text-sm">{interviewer.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Notes */}
                  {selectedInterview.notes && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-purple-200">{selectedInterview.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Feedback */}
                  {selectedInterview.feedback && selectedInterview.feedback.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Feedback</h3>
                      <div className="space-y-4">
                        {selectedInterview.feedback.map((feedback, idx) => (
                          <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-white font-medium">{feedback.interviewerName}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-purple-200 text-sm mb-3">{feedback.feedback}</p>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              feedback.recommendation === 'hire' ? 'bg-green-500/20 text-green-300' :
                              feedback.recommendation === 'reject' ? 'bg-red-500/20 text-red-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {feedback.recommendation}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Interview
                </button>
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Feedback
                </button>
                <button className="py-3 px-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-2xl hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterviewCard({ interview, index, onSelect }: { interview: Interview; index: number; onSelect: (interview: Interview) => void }) {
  const IconComponent = (() => {
    switch (interview.type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in-person': return MapPin;
      case 'technical': return Calendar;
      case 'panel': return Users;
      default: return Calendar;
    }
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'rescheduled': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 translate-y-0 opacity-100`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onClick={() => onSelect(interview)}
    >
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>

      {/* Gradient Border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg group-hover:text-purple-200 transition-colors duration-300">
                {interview.candidateName}
              </h3>
              <p className="text-purple-300 text-sm">{interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview</p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(interview.status)}`}>
            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
          </div>
        </div>

        {/* Schedule */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-purple-200 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(interview.scheduledDate).toLocaleDateString()}
          </div>
          <div className="flex items-center text-purple-200 text-sm">
            <Clock className="w-4 h-4 mr-2" />
            {new Date(interview.scheduledDate).toLocaleTimeString()} ({interview.duration} min)
          </div>
        </div>

        {/* Interviewers */}
        <div className="mb-4">
          <p className="text-purple-300 text-sm mb-2">Interviewers:</p>
          <div className="flex flex-wrap gap-2">
            {interview.interviewers.slice(0, 2).map((interviewer, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30"
              >
                {interviewer.name}
              </span>
            ))}
            {interview.interviewers.length > 2 && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30">
                +{interview.interviewers.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Meeting Info */}
        <div className="flex items-center justify-between">
          {interview.meetingUrl ? (
            <span className="text-blue-400 text-sm flex items-center">
              <Link className="w-4 h-4 mr-1" />
              Virtual Meeting
            </span>
          ) : interview.location ? (
            <span className="text-emerald-400 text-sm flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {interview.location}
            </span>
          ) : (
            <span className="text-purple-300 text-sm">Location TBD</span>
          )}

          {interview.feedback && interview.feedback.length > 0 && (
            <span className="text-yellow-400 text-sm flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Feedback Available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
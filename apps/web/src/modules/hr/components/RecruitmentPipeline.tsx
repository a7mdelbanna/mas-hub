import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MessageSquare,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { hrService } from '../../../services/hr.service';
import { Candidate } from '../../../types/hr.types';

export default function RecruitmentPipeline() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCandidates();
    setMounted(true);
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await hrService.getCandidates();
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'screening': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'interview': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'offer': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'hired': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const pipelineStages = [
    { id: 'applied', name: 'Applied', count: candidates.filter(c => c.status === 'applied').length },
    { id: 'screening', name: 'Screening', count: candidates.filter(c => c.status === 'screening').length },
    { id: 'interview', name: 'Interview', count: candidates.filter(c => c.status === 'interview').length },
    { id: 'offer', name: 'Offer', count: candidates.filter(c => c.status === 'offer').length },
    { id: 'hired', name: 'Hired', count: candidates.filter(c => c.status === 'hired').length }
  ];

  const filteredCandidates = candidates.filter(candidate => {
    const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
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
                  Recruitment Pipeline
                </h1>
                <p className="text-purple-200 text-lg">
                  Track candidates through your hiring process
                </p>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Candidate
              </button>
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {pipelineStages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="relative overflow-hidden rounded-3xl p-6 cursor-pointer group"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl group-hover:from-purple-500/30 group-hover:to-pink-500/30 transition-all duration-500"></div>

                  <div className="relative z-10 text-center">
                    <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stage.count}
                    </div>
                    <div className="text-purple-200 font-medium">{stage.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className={`mb-8 transform transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search candidates..."
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
                  {pipelineStages.map(stage => (
                    <option key={stage.id} value={stage.id} className="bg-slate-800">
                      {stage.name}
                    </option>
                  ))}
                </select>

                {/* Results Count */}
                <div className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl">
                  <Users className="w-5 h-5 text-purple-300 mr-2" />
                  <span className="text-white font-medium">{filteredCandidates.length} candidates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate, index) => (
              <div
                key={candidate.id}
                className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transform transition-all duration-700 hover:scale-105 hover:-translate-y-2 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onClick={() => setSelectedCandidate(candidate)}
              >
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl group-hover:bg-white/15 transition-all duration-500"></div>

                {/* Gradient Border */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>

                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                        {candidate.firstName[0]}{candidate.lastName[0]}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-lg group-hover:text-purple-200 transition-colors duration-300">
                          {candidate.firstName} {candidate.lastName}
                        </h3>
                        <p className="text-purple-300 text-sm">{candidate.position}</p>
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(candidate.status)}`}>
                      {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                    </div>
                  </div>

                  {/* Experience & Education */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-purple-200 text-sm">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {candidate.experience} years experience
                    </div>
                    {candidate.education.length > 0 && (
                      <div className="flex items-center text-purple-200 text-sm">
                        <GraduationCap className="w-4 h-4 mr-2" />
                        {candidate.education[0].degree} in {candidate.education[0].field}
                      </div>
                    )}
                  </div>

                  {/* Contact */}
                  <div className="space-y-2 mb-4">
                    <p className="text-purple-200 text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {candidate.email}
                    </p>
                    {candidate.phone && (
                      <p className="text-purple-200 text-sm flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {candidate.phone}
                      </p>
                    )}
                  </div>

                  {/* Source & Stage */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-purple-300">Source: {candidate.source}</span>
                    <span className="text-emerald-300 font-medium">
                      {candidate.expectedSalary && `$${candidate.expectedSalary.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Skills Preview */}
                  {candidate.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-xs rounded-lg border border-emerald-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 3 && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-lg border border-purple-500/30">
                            +{candidate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interviews */}
                  {candidate.interviews.length > 0 && (
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-300 text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {candidate.interviews.length} interview{candidate.interviews.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center space-x-1">
                          {candidate.interviews.map((interview, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full ${
                                interview.status === 'completed' ? 'bg-green-400' :
                                interview.status === 'scheduled' ? 'bg-blue-400' :
                                'bg-gray-400'
                              }`}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                    {selectedCandidate.firstName[0]}{selectedCandidate.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {selectedCandidate.firstName} {selectedCandidate.lastName}
                    </h2>
                    <p className="text-purple-200">{selectedCandidate.position}</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(selectedCandidate.status)}`}>
                      {selectedCandidate.status.charAt(0).toUpperCase() + selectedCandidate.status.slice(1)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 rounded-xl bg-white/10 text-purple-300 hover:bg-white/20 hover:text-white transition-all duration-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-purple-200">
                        <Mail className="w-5 h-5 mr-3 text-purple-400" />
                        {selectedCandidate.email}
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center text-purple-200">
                          <Phone className="w-5 h-5 mr-3 text-purple-400" />
                          {selectedCandidate.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Application Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Application Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-purple-300">Source:</span>
                        <span className="text-white">{selectedCandidate.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-300">Experience:</span>
                        <span className="text-white">{selectedCandidate.experience} years</span>
                      </div>
                      {selectedCandidate.expectedSalary && (
                        <div className="flex justify-between">
                          <span className="text-purple-300">Expected Salary:</span>
                          <span className="text-emerald-300 font-semibold">${selectedCandidate.expectedSalary.toLocaleString()}</span>
                        </div>
                      )}
                      {selectedCandidate.availableFrom && (
                        <div className="flex justify-between">
                          <span className="text-purple-300">Available From:</span>
                          <span className="text-white">{new Date(selectedCandidate.availableFrom).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {selectedCandidate.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-xl border border-emerald-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Education */}
                  {selectedCandidate.education.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Education</h3>
                      <div className="space-y-4">
                        {selectedCandidate.education.map((edu, idx) => (
                          <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <h4 className="text-white font-medium">{edu.degree} in {edu.field}</h4>
                            <p className="text-purple-200 text-sm">{edu.institution}</p>
                            <p className="text-purple-300 text-sm">
                              {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                            </p>
                            {edu.gpa && <p className="text-emerald-300 text-sm">GPA: {edu.gpa}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interviews */}
                  {selectedCandidate.interviews.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Interview History</h3>
                      <div className="space-y-4">
                        {selectedCandidate.interviews.map((interview, idx) => (
                          <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-white font-medium">{interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview</h4>
                              <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                interview.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                                interview.status === 'scheduled' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {interview.status}
                              </span>
                            </div>
                            <p className="text-purple-200 text-sm mb-2">
                              {new Date(interview.scheduledDate).toLocaleDateString()} at {new Date(interview.scheduledDate).toLocaleTimeString()}
                            </p>
                            <p className="text-purple-300 text-sm">
                              Interviewers: {interview.interviewers.map(i => i.name).join(', ')}
                            </p>
                            {interview.feedback && interview.feedback.length > 0 && (
                              <div className="mt-3">
                                <h5 className="text-white text-sm font-medium mb-2">Feedback:</h5>
                                {interview.feedback.map((fb, fbIdx) => (
                                  <div key={fbIdx} className="bg-white/5 rounded-lg p-3 mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-purple-200 text-sm">{fb.interviewerName}</span>
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`w-3 h-3 ${i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                    <p className="text-purple-300 text-sm">{fb.feedback}</p>
                                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                                      fb.recommendation === 'hire' ? 'bg-green-500/20 text-green-300' :
                                      fb.recommendation === 'reject' ? 'bg-red-500/20 text-red-300' :
                                      'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                      {fb.recommendation}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Move to Next Stage
                </button>
                <button className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Interview
                </button>
                <button className="py-3 px-4 bg-white/10 border border-white/20 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
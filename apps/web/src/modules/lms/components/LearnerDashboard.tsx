import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Assignment, LearnerProgressSummary, AssignmentStatus } from '../types';
import { useAssignments } from '../hooks/useAssignments';
import { useProgress } from '../hooks/useProgress';
import { useCourses } from '../hooks/useCourses';

interface LearnerDashboardProps {
  learnerId: string;
  learnerType: 'user' | 'candidate' | 'client';
  learnerName: string;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  learnerId,
  learnerType,
  learnerName
}) => {
  const {
    getUserAssignments,
    getCandidateAssignments,
    getClientAssignments,
    getOverdueAssignments,
    loading: assignmentsLoading
  } = useAssignments();

  const {
    getLearnerProgress,
    getOverdueAssignments: getOverdueFromProgress,
    isAssignmentOverdue,
    getAssignmentStatusColor,
    getCompletionMessage,
    loading: progressLoading
  } = useProgress();

  const { getCourses } = useCourses();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progressSummary, setProgressSummary] = useState<LearnerProgressSummary | null>(null);
  const [overdueAssignments, setOverdueAssignments] = useState<Assignment[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    loadDashboardData();
  }, [learnerId, learnerType]);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadAssignments(),
        loadProgressSummary(),
        loadOverdueAssignments()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      let assignmentData: Assignment[];

      switch (learnerType) {
        case 'user':
          assignmentData = await getUserAssignments(learnerId);
          break;
        case 'candidate':
          assignmentData = await getCandidateAssignments(learnerId);
          break;
        case 'client':
          assignmentData = await getClientAssignments(learnerId);
          break;
        default:
          assignmentData = [];
      }

      setAssignments(assignmentData);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadProgressSummary = async () => {
    try {
      const summary = await getLearnerProgress(learnerType, learnerId);
      setProgressSummary(summary);
    } catch (error) {
      console.error('Error loading progress summary:', error);
    }
  };

  const loadOverdueAssignments = async () => {
    try {
      const overdue = await getOverdueFromProgress(learnerType, learnerId);
      setOverdueAssignments(overdue);
    } catch (error) {
      console.error('Error loading overdue assignments:', error);
    }
  };

  const getFilteredAssignments = () => {
    switch (activeTab) {
      case 'in-progress':
        return assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS);
      case 'completed':
        return assignments.filter(a => a.status === AssignmentStatus.COMPLETED);
      case 'overdue':
        return assignments.filter(a => isAssignmentOverdue(a));
      default:
        return assignments;
    }
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'in-progress':
        return assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length;
      case 'completed':
        return assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length;
      case 'overdue':
        return assignments.filter(a => isAssignmentOverdue(a)).length;
      default:
        return assignments.length;
    }
  };

  const loading = assignmentsLoading || progressLoading;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {learnerName}'s Learning Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Track your progress and continue your learning journey</p>
      </div>

      {/* Progress Summary Cards */}
      {progressSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{progressSummary.totalCourses}</p>
                <p className="text-gray-600">Total Courses</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{progressSummary.completedCourses}</p>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{progressSummary.inProgressCourses}</p>
                <p className="text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{progressSummary.averageScore}%</p>
                <p className="text-gray-600">Average Score</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Assignments Alert */}
      {overdueAssignments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-red-800 font-medium">
                You have {overdueAssignments.length} overdue assignment{overdueAssignments.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                Please complete your overdue assignments to stay on track with your learning goals.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Assignments Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Your Assignments</h2>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'overdue', label: 'Overdue' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({getTabCount(tab.key)})
              </button>
            ))}
          </nav>
        </div>

        {/* Assignment List */}
        <div className="p-6">
          {getFilteredAssignments().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assignments found
              </h3>
              <p className="text-gray-500">
                {activeTab === 'all'
                  ? 'You don\'t have any assignments yet'
                  : `No ${activeTab.replace('-', ' ')} assignments`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredAssignments().map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onStatusChange={loadDashboardData}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Assignment Card Component
interface AssignmentCardProps {
  assignment: Assignment;
  onStatusChange: () => void;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onStatusChange }) => {
  const { getAssignmentStatusColor, getCompletionMessage, isAssignmentOverdue } = useProgress();
  const { getCourseById } = useCourses();
  const [courseName, setCourseName] = useState<string>('');

  useEffect(() => {
    loadCourseDetails();
  }, [assignment.courseId]);

  const loadCourseDetails = async () => {
    try {
      const course = await getCourseById(assignment.courseId);
      setCourseName(course?.course.title || 'Unknown Course');
    } catch (error) {
      console.error('Error loading course details:', error);
      setCourseName('Unknown Course');
    }
  };

  const getProgressBarColor = () => {
    if (assignment.status === AssignmentStatus.COMPLETED) return 'bg-green-500';
    if (isAssignmentOverdue(assignment)) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{courseName}</h3>
          <p className={`text-sm mt-1 ${getAssignmentStatusColor(assignment)}`}>
            {getCompletionMessage(assignment)}
          </p>
        </div>

        <div className="text-right ml-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            assignment.status === AssignmentStatus.COMPLETED
              ? 'bg-green-100 text-green-800'
              : assignment.status === AssignmentStatus.IN_PROGRESS
              ? 'bg-blue-100 text-blue-800'
              : isAssignmentOverdue(assignment)
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {assignment.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{assignment.progressPct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${getProgressBarColor()}`}
            style={{ width: `${assignment.progressPct}%` }}
          />
        </div>
      </div>

      {/* Metadata */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex space-x-4">
          {assignment.score !== undefined && (
            <span>Score: {assignment.score}%</span>
          )}
          {assignment.startedAt && (
            <span>Started: {new Date(assignment.startedAt).toLocaleDateString()}</span>
          )}
          {assignment.completedAt && (
            <span>Completed: {new Date(assignment.completedAt).toLocaleDateString()}</span>
          )}
        </div>

        <Link
          to={`/lms/assignments/${assignment.id}`}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          {assignment.status === AssignmentStatus.NOT_STARTED ? 'Start Course' : 'Continue'}
        </Link>
      </div>
    </div>
  );
};
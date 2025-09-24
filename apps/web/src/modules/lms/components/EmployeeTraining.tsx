import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LearnerDashboard } from './LearnerDashboard';
import { CourseList } from './CourseList';
import { ProgressTracker } from './ProgressTracker';
import { useCourses } from '../hooks/useCourses';
import { useAssignments } from '../hooks/useAssignments';
import { Assignment, Course } from '../types';

interface EmployeeTrainingProps {
  employeeId: string;
  employeeName: string;
  departmentId?: string;
}

export const EmployeeTraining: React.FC<EmployeeTrainingProps> = ({
  employeeId,
  employeeName,
  departmentId
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'browse' | 'assigned'>('dashboard');
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const { getCoursesByAudience } = useCourses();
  const { getUserAssignments } = useAssignments();

  useEffect(() => {
    loadTrainingData();
  }, [employeeId]);

  const loadTrainingData = async () => {
    try {
      // Load employee-specific courses
      const courses = await getCoursesByAudience('employee');
      setAvailableCourses(courses);

      // Load recent assignments
      const assignments = await getUserAssignments(employeeId);
      setRecentAssignments(assignments.slice(0, 5)); // Show 5 most recent
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <LearnerDashboard
            learnerId={employeeId}
            learnerType="user"
            learnerName={employeeName}
          />
        );

      case 'browse':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Browse Employee Training</h2>
            <CourseList
              audience="employee"
              allowCreate={false}
            />
          </div>
        );

      case 'assigned':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Assigned Training</h2>
            {recentAssignments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned training</h3>
                <p className="text-gray-500">Check back later for new training assignments.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recentAssignments.map(assignment => (
                  <div key={assignment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <ProgressTracker
                      assignmentId={assignment.id!}
                      compact={true}
                      showNavigation={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employee Training</h1>
        <p className="text-gray-600 mt-2">
          Develop your skills with company training programs and professional development courses
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'browse', label: 'Browse Courses', icon: '🔍' },
            { key: 'assigned', label: 'My Assignments', icon: '📋' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Quick Stats */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Professional Development</p>
                <p className="text-xs text-blue-500">Enhance your career skills</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Compliance Training</p>
                <p className="text-xs text-green-500">Stay up-to-date with requirements</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Team Training</p>
                <p className="text-xs text-purple-500">Department-specific courses</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
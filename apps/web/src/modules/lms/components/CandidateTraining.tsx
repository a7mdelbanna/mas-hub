import React, { useState, useEffect } from 'react';
import { LearnerDashboard } from './LearnerDashboard';
import { ProgressTracker } from './ProgressTracker';
import { useCourses } from '../hooks/useCourses';
import { useAssignments } from '../hooks/useAssignments';
import { Assignment, CandidateStage } from '../types';

interface CandidateTrainingProps {
  candidateId: string;
  candidateName: string;
  stage: CandidateStage;
  position: string;
}

export const CandidateTraining: React.FC<CandidateTrainingProps> = ({
  candidateId,
  candidateName,
  stage,
  position
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [trainingCompleted, setTrainingCompleted] = useState(false);

  const { getCoursesByAudience } = useCourses();
  const { getCandidateAssignments } = useAssignments();

  useEffect(() => {
    loadCandidateTraining();
  }, [candidateId]);

  const loadCandidateTraining = async () => {
    try {
      const candidateAssignments = await getCandidateAssignments(candidateId);
      setAssignments(candidateAssignments);

      // Find current active assignment
      const active = candidateAssignments.find(a => a.status === 'in_progress') ||
                     candidateAssignments.find(a => a.status === 'not_started');
      setCurrentAssignment(active || null);

      // Check if all training is completed
      const allCompleted = candidateAssignments.length > 0 &&
                          candidateAssignments.every(a => a.status === 'completed');
      setTrainingCompleted(allCompleted);
    } catch (error) {
      console.error('Error loading candidate training:', error);
    }
  };

  const getStageIcon = (stage: CandidateStage) => {
    switch (stage) {
      case 'training':
        return '📚';
      case 'interview':
        return '💼';
      case 'offer':
        return '🎉';
      case 'hired':
        return '✅';
      default:
        return '👤';
    }
  };

  const getStageMessage = (stage: CandidateStage) => {
    switch (stage) {
      case 'training':
        return 'Complete your pre-hire training to proceed to the next stage.';
      case 'interview':
        return 'Training completed! Prepare for your upcoming interview.';
      case 'offer':
        return 'Congratulations! You\'ve received an offer.';
      case 'hired':
        return 'Welcome to the team! Your training history will be transferred to your employee account.';
      default:
        return 'Welcome to the candidate training portal.';
    }
  };

  if (stage === 'hired') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-green-800 mb-4">
            Welcome to MAS, {candidateName}!
          </h1>
          <p className="text-green-700 mb-6">
            Your candidate training has been completed and your progress has been transferred to your employee account.
          </p>
          <div className="bg-white border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">
              You can now access the Employee Training Portal with your new employee credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-4">{getStageIcon(stage)}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pre-hire Training - {candidateName}
            </h1>
            <p className="text-gray-600">Position: {position}</p>
          </div>
        </div>

        {/* Stage Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-800">Application Stage</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              stage === 'training' ? 'bg-blue-100 text-blue-800' :
              stage === 'interview' ? 'bg-yellow-100 text-yellow-800' :
              stage === 'offer' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {stage.replace('_', ' ')}
            </span>
          </div>
          <p className="text-blue-700 text-sm">{getStageMessage(stage)}</p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-600 mb-2">
              <span>Applied</span>
              <span>Training</span>
              <span>Interview</span>
              <span>Offer</span>
              <span>Hired</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    stage === 'applied' ? 20 :
                    stage === 'training' ? 40 :
                    stage === 'interview' ? 60 :
                    stage === 'offer' ? 80 :
                    stage === 'hired' ? 100 : 0
                  }%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Training Content */}
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Assigned Yet</h3>
          <p className="text-gray-500 mb-6">
            Your pre-hire training materials will be assigned shortly. Check back soon!
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              If you have any questions, please contact our HR team.
            </p>
          </div>
        </div>
      ) : trainingCompleted ? (
        <div className="text-center py-12">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Training Completed Successfully!
            </h2>
            <p className="text-green-700 mb-6">
              You've completed all required pre-hire training. Our HR team has been notified.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
                <p className="text-sm text-green-600">
                  You'll be contacted for the next steps in the hiring process.
                </p>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Need Help?</h3>
                <p className="text-sm text-green-600">
                  Contact HR if you have any questions about your application.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Current Training Status */}
          {currentAssignment && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Current Training Progress</h2>
              <ProgressTracker
                assignmentId={currentAssignment.id!}
                showNavigation={true}
              />
            </div>
          )}

          {/* All Assignments */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Training Requirements</h2>
            </div>
            <div className="p-6">
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No training assignments yet. Please check back later.
                </p>
              ) : (
                <LearnerDashboard
                  learnerId={candidateId}
                  learnerType="candidate"
                  learnerName={candidateName}
                />
              )}
            </div>
          </div>

          {/* Training Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Training Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Complete All Modules</h4>
                  <p className="text-blue-600 text-sm">
                    Ensure you finish all required lessons and pass any quizzes.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Manage Your Time</h4>
                  <p className="text-blue-600 text-sm">
                    Complete training before your scheduled interview date.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Take Notes</h4>
                  <p className="text-blue-600 text-sm">
                    The content may be relevant for your upcoming interview.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800">Need Help?</h4>
                  <p className="text-blue-600 text-sm">
                    Contact our HR team if you encounter any technical issues.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
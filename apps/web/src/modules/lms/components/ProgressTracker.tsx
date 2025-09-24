import React, { useState, useEffect } from 'react';
import { AssignmentProgressDetails } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useNavigate } from 'react-router-dom';

interface ProgressTrackerProps {
  assignmentId: string;
  compact?: boolean;
  showNavigation?: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  assignmentId,
  compact = false,
  showNavigation = true
}) => {
  const navigate = useNavigate();
  const { getAssignmentProgress, updateLessonProgress, loading } = useProgress();
  const [progressData, setProgressData] = useState<AssignmentProgressDetails | null>(null);
  const [updatingLesson, setUpdatingLesson] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [assignmentId]);

  const loadProgressData = async () => {
    try {
      const data = await getAssignmentProgress(assignmentId);
      setProgressData(data);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const handleLessonComplete = async (lessonId: string, completed: boolean) => {
    try {
      setUpdatingLesson(lessonId);
      await updateLessonProgress(assignmentId, lessonId, completed);
      await loadProgressData(); // Refresh data
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    } finally {
      setUpdatingLesson(null);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (showNavigation) {
      navigate(`/lms/assignments/${assignmentId}/lessons/${lessonId}`);
    }
  };

  const handleQuizClick = (quizId: string) => {
    if (showNavigation) {
      navigate(`/lms/assignments/${assignmentId}/quizzes/${quizId}`);
    }
  };

  if (loading || !progressData) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const { assignment, course, lessonProgress, quizProgress } = progressData;

  if (compact) {
    return <CompactProgressView data={progressData} />;
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Overall Progress</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            assignment.status === 'completed'
              ? 'bg-green-100 text-green-800'
              : assignment.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {assignment.status.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Course Completion</span>
            <span>{assignment.progressPct}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                assignment.progressPct === 100 ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${assignment.progressPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Score</p>
            <p className="font-semibold">
              {assignment.score ? `${assignment.score}%` : 'No score yet'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Started</p>
            <p className="font-semibold">
              {assignment.startedAt
                ? new Date(assignment.startedAt).toLocaleDateString()
                : 'Not started'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              {assignment.dueDate ? 'Due Date' : 'Last Activity'}
            </p>
            <p className="font-semibold">
              {assignment.dueDate
                ? new Date(assignment.dueDate).toLocaleDateString()
                : assignment.lastActivity
                ? new Date(assignment.lastActivity).toLocaleDateString()
                : 'Never'}
            </p>
          </div>
        </div>
      </div>

      {/* Lesson Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Lessons</h3>
        <div className="space-y-3">
          {lessonProgress.map((lessonProg, index) => (
            <LessonProgressItem
              key={lessonProg.lesson.id}
              lessonProgress={lessonProg}
              index={index}
              onClick={() => handleLessonClick(lessonProg.lesson.id)}
              onToggleComplete={(completed) =>
                handleLessonComplete(lessonProg.lesson.id, completed)
              }
              isUpdating={updatingLesson === lessonProg.lesson.id}
              clickable={showNavigation}
            />
          ))}
        </div>
      </div>

      {/* Quiz Progress */}
      {quizProgress.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quizzes</h3>
          <div className="space-y-3">
            {quizProgress.map((quizProg) => (
              <QuizProgressItem
                key={quizProg.quiz.id}
                quizProgress={quizProg}
                onClick={() => handleQuizClick(quizProg.quiz.id)}
                passingScore={course.passingScore || 70}
                clickable={showNavigation}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Progress View
interface CompactProgressViewProps {
  data: AssignmentProgressDetails;
}

const CompactProgressView: React.FC<CompactProgressViewProps> = ({ data }) => {
  const { assignment, lessonProgress, quizProgress } = data;

  const completedLessons = lessonProgress.filter(lp => lp.completed).length;
  const totalLessons = lessonProgress.length;
  const completedQuizzes = quizProgress.filter(qp => qp.bestScore !== null).length;
  const totalQuizzes = quizProgress.length;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-medium">Progress Summary</h4>
        <span className="text-lg font-bold">{assignment.progressPct}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${assignment.progressPct}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{completedLessons}/{totalLessons} lessons</span>
        {totalQuizzes > 0 && <span>{completedQuizzes}/{totalQuizzes} quizzes</span>}
        {assignment.score && <span>Score: {assignment.score}%</span>}
      </div>
    </div>
  );
};

// Lesson Progress Item
interface LessonProgressItemProps {
  lessonProgress: any;
  index: number;
  onClick: () => void;
  onToggleComplete: (completed: boolean) => void;
  isUpdating: boolean;
  clickable: boolean;
}

const LessonProgressItem: React.FC<LessonProgressItemProps> = ({
  lessonProgress,
  index,
  onClick,
  onToggleComplete,
  isUpdating,
  clickable
}) => {
  const { lesson, completed, completedAt } = lessonProgress;

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'article': return '📖';
      case 'interactive': return '💻';
      default: return '📚';
    }
  };

  return (
    <div
      className={`flex items-center p-3 rounded-lg border ${
        completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      } ${clickable ? 'hover:bg-gray-100 cursor-pointer' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center mr-3">
        <span className="text-xl mr-2">{getLessonIcon(lesson.type)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(!completed);
          }}
          disabled={isUpdating}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            completed
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUpdating ? 'opacity-50' : ''}`}
        >
          {isUpdating ? (
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
          ) : completed ? (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : null}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">{lesson.title}</h4>
          <div className="flex items-center text-sm text-gray-500 ml-4">
            <span className="capitalize">{lesson.type}</span>
            {lesson.duration && (
              <>
                <span className="mx-1">•</span>
                <span>{lesson.duration} min</span>
              </>
            )}
            {lesson.required && (
              <>
                <span className="mx-1">•</span>
                <span className="text-red-600">Required</span>
              </>
            )}
          </div>
        </div>

        {completed && completedAt && (
          <p className="text-sm text-green-600 mt-1">
            Completed on {new Date(completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {clickable && (
        <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
};

// Quiz Progress Item
interface QuizProgressItemProps {
  quizProgress: any;
  onClick: () => void;
  passingScore: number;
  clickable: boolean;
}

const QuizProgressItem: React.FC<QuizProgressItemProps> = ({
  quizProgress,
  onClick,
  passingScore,
  clickable
}) => {
  const { quiz, attemptCount, bestScore, attempts } = quizProgress;

  const isPassed = bestScore !== null && bestScore >= passingScore;
  const canRetake = !quiz.attempts || attemptCount < quiz.attempts;

  return (
    <div
      className={`flex items-center p-3 rounded-lg border ${
        isPassed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      } ${clickable ? 'hover:bg-gray-100 cursor-pointer' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <div className="flex items-center mr-3">
        <span className="text-xl mr-2">📝</span>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isPassed ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}>
          {isPassed && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">{quiz.title}</h4>
          <div className="text-sm text-gray-500">
            {bestScore !== null ? `${bestScore}%` : 'Not attempted'}
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-500 mt-1">
          <span>Attempts: {attemptCount}</span>
          {quiz.attempts && (
            <>
              <span className="mx-1">/</span>
              <span>{quiz.attempts}</span>
            </>
          )}
          <span className="mx-2">•</span>
          <span>Pass: {passingScore}%</span>
          {!canRetake && (
            <>
              <span className="mx-2">•</span>
              <span className="text-orange-600">Max attempts reached</span>
            </>
          )}
        </div>

        {isPassed ? (
          <p className="text-sm text-green-600 mt-1">Passed</p>
        ) : bestScore !== null ? (
          <p className="text-sm text-red-600 mt-1">Not passed</p>
        ) : (
          <p className="text-sm text-blue-600 mt-1">Ready to attempt</p>
        )}
      </div>

      {clickable && (
        <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </div>
  );
};
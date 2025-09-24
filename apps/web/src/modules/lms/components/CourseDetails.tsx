import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CourseWithContent, CourseStats } from '../types';
import { useCourses } from '../hooks/useCourses';

interface CourseDetailsProps {
  courseId?: string;
  showStats?: boolean;
  allowEdit?: boolean;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({
  courseId: propCourseId,
  showStats = false,
  allowEdit = false
}) => {
  const { id: paramCourseId } = useParams();
  const courseId = propCourseId || paramCourseId!;

  const { getCourseById, getCourseStats, loading } = useCourses();
  const [courseData, setCourseData] = useState<CourseWithContent | null>(null);
  const [stats, setStats] = useState<CourseStats | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse();
      if (showStats) {
        loadStats();
      }
    }
  }, [courseId, showStats]);

  const loadCourse = async () => {
    try {
      const data = await getCourseById(courseId, true);
      setCourseData(data);
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getCourseStats(courseId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading course stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Course not found</h3>
        <p className="text-gray-500">The course you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const { course, lessons, quizzes } = courseData;

  const getAudienceBadgeColor = (audience: string) => {
    switch (audience) {
      case 'employee':
        return 'bg-blue-100 text-blue-800';
      case 'candidate':
        return 'bg-green-100 text-green-800';
      case 'client':
        return 'bg-purple-100 text-purple-800';
      case 'mixed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'Duration not set';
    if (duration < 1) return `${Math.round(duration * 60)} minutes`;
    return `${duration} hour${duration !== 1 ? 's' : ''}`;
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'article':
        return '📖';
      case 'interactive':
        return '💻';
      default:
        return '📚';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h1 className="text-3xl font-bold mr-4">{course.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAudienceBadgeColor(course.audience)}`}>
                {course.audience}
              </span>
              {!course.active && (
                <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  Draft
                </span>
              )}
            </div>

            <p className="text-gray-600 text-lg mb-4">{course.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {formatDuration(course.duration)}
              </span>

              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
              </span>

              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''}
              </span>

              {course.passingScore && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {course.passingScore}% to pass
                </span>
              )}
            </div>

            {/* Tags */}
            {course.tags && course.tags.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail */}
          {course.thumbnail && (
            <div className="ml-6">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        {allowEdit && (
          <div className="flex space-x-3 border-t border-gray-200 pt-4">
            <Link
              to={`/lms/courses/${course.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Edit Course
            </Link>
            <Link
              to={`/lms/assignments/create?courseId=${course.id}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Assign to Users
            </Link>
          </div>
        )}
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Total Assignments</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalAssignments}</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completionRate}%</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Average Score</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.averageScore}%</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">In Progress</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.inProgressAssignments}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lessons */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Course Content</h2>

          {lessons.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No lessons have been added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl mr-3">{getLessonIcon(lesson.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{lesson.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <span className="capitalize">{lesson.type}</span>
                      {lesson.duration && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{lesson.duration} min</span>
                        </>
                      )}
                      {lesson.required && (
                        <>
                          <span className="mx-2">•</span>
                          <span className="text-red-600">Required</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Assessments</h2>

          {quizzes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No quizzes have been added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">{quiz.title}</h3>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      {quiz.questions?.length || 0} questions
                    </span>

                    {quiz.timeLimit && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {quiz.timeLimit} min limit
                      </span>
                    )}

                    {quiz.attempts && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        {quiz.attempts} attempts
                      </span>
                    )}
                  </div>

                  {quiz.description && (
                    <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import { useState, useCallback } from 'react';
import {
  Assignment,
  AssignmentProgressDetails,
  LearnerProgressSummary
} from '../types';
import { baseApi } from '../../../lib/api/baseApi';

export const useProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateLessonProgress = useCallback(async (
    assignmentId: string,
    lessonId: string,
    completed: boolean
  ): Promise<Assignment> => {
    return handleApiCall(async () => {
      const response = await baseApi.put(
        `/lms/assignments/${assignmentId}/lessons/${lessonId}/progress`,
        { completed }
      );
      return response.data.data;
    });
  }, [handleApiCall]);

  const getLearnerProgress = useCallback(async (
    type: 'user' | 'candidate' | 'client',
    id: string
  ): Promise<LearnerProgressSummary> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/progress/${type}/${id}`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const getAssignmentProgress = useCallback(async (
    assignmentId: string
  ): Promise<AssignmentProgressDetails> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/assignments/${assignmentId}/progress`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const getCourseProgressStats = useCallback(async (courseId: string) => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/courses/${courseId}/progress/stats`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const getOverdueAssignments = useCallback(async (
    type: 'user' | 'candidate' | 'client',
    id: string
  ): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/assignments/overdue/${type}/${id}`);
      return response.data.data;
    });
  }, [handleApiCall]);

  // Utility functions for progress calculation
  const calculateCourseProgress = useCallback((
    lessonProgress: any[],
    totalLessons: number,
    requiredLessonsOnly: boolean = true
  ): number => {
    if (totalLessons === 0) return 0;

    const relevantLessons = requiredLessonsOnly
      ? lessonProgress.filter(lp => lp.lesson.required)
      : lessonProgress;

    const completedCount = relevantLessons.filter(lp => lp.completed).length;
    const totalCount = requiredLessonsOnly
      ? lessonProgress.filter(lp => lp.lesson.required).length
      : totalLessons;

    return totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  }, []);

  const calculateTimeSpent = useCallback((
    lessonProgress: any[]
  ): number => {
    return lessonProgress.reduce((total, lp) => {
      if (lp.completed && lp.lesson.duration) {
        return total + lp.lesson.duration;
      }
      return total;
    }, 0);
  }, []);

  const getNextLesson = useCallback((
    lessonProgress: any[]
  ): any | null => {
    // Sort by order and find the first incomplete required lesson
    const sortedLessons = [...lessonProgress].sort((a, b) => a.lesson.order - b.lesson.order);
    return sortedLessons.find(lp => lp.lesson.required && !lp.completed)?.lesson || null;
  }, []);

  const isAssignmentOverdue = useCallback((assignment: Assignment): boolean => {
    if (!assignment.dueDate) return false;
    return new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed';
  }, []);

  const getDaysUntilDue = useCallback((dueDate: Date): number => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const getAssignmentStatusColor = useCallback((assignment: Assignment): string => {
    if (isAssignmentOverdue(assignment)) return 'text-red-600';

    switch (assignment.status) {
      case 'completed':
        return 'text-green-600';
      case 'in_progress':
        return 'text-blue-600';
      case 'not_started':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }, [isAssignmentOverdue]);

  const getProgressBadgeColor = useCallback((progressPct: number): string => {
    if (progressPct >= 100) return 'bg-green-100 text-green-800';
    if (progressPct >= 75) return 'bg-blue-100 text-blue-800';
    if (progressPct >= 25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-600';
  }, []);

  const formatProgress = useCallback((progressPct: number): string => {
    return `${Math.round(progressPct)}%`;
  }, []);

  const formatTimeSpent = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }, []);

  const getCompletionMessage = useCallback((assignment: Assignment): string => {
    if (assignment.status === 'completed') {
      const score = assignment.score;
      if (score !== undefined) {
        return `Completed with ${score}% score`;
      }
      return 'Completed successfully';
    }

    if (assignment.status === 'in_progress') {
      return `${assignment.progressPct}% complete`;
    }

    if (isAssignmentOverdue(assignment)) {
      return 'Overdue';
    }

    if (assignment.dueDate) {
      const daysUntilDue = getDaysUntilDue(assignment.dueDate);
      if (daysUntilDue === 0) return 'Due today';
      if (daysUntilDue === 1) return 'Due tomorrow';
      if (daysUntilDue > 0) return `Due in ${daysUntilDue} days`;
      return `${Math.abs(daysUntilDue)} days overdue`;
    }

    return 'Not started';
  }, [isAssignmentOverdue, getDaysUntilDue]);

  return {
    loading,
    error,
    updateLessonProgress,
    getLearnerProgress,
    getAssignmentProgress,
    getCourseProgressStats,
    getOverdueAssignments,
    // Utility functions
    calculateCourseProgress,
    calculateTimeSpent,
    getNextLesson,
    isAssignmentOverdue,
    getDaysUntilDue,
    getAssignmentStatusColor,
    getProgressBadgeColor,
    formatProgress,
    formatTimeSpent,
    getCompletionMessage,
    setError
  };
};
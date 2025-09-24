import { useState, useCallback } from 'react';
import { Quiz, QuizSubmissionData, QuizSubmissionResult } from '../types';
import { baseApi } from '../../../lib/api/baseApi';

export const useQuiz = () => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
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

  const getQuizById = useCallback(async (id: string, includeAnswers = false): Promise<Quiz> => {
    return handleApiCall(async () => {
      const queryParams = includeAnswers ? '?includeAnswers=true' : '';
      const response = await baseApi.get(`/lms/quizzes/${id}${queryParams}`);
      const quizData = response.data.data;
      setQuiz(quizData);
      return quizData;
    });
  }, [handleApiCall]);

  const getQuizzesByCourse = useCallback(async (courseId: string): Promise<Quiz[]> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/courses/${courseId}/quizzes`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const getQuizzesByLesson = useCallback(async (lessonId: string): Promise<Quiz[]> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/lessons/${lessonId}/quizzes`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const createQuiz = useCallback(async (quizData: Partial<Quiz>): Promise<Quiz> => {
    return handleApiCall(async () => {
      const response = await baseApi.post('/lms/quizzes', quizData);
      return response.data.data;
    });
  }, [handleApiCall]);

  const updateQuiz = useCallback(async (id: string, quizData: Partial<Quiz>): Promise<Quiz> => {
    return handleApiCall(async () => {
      const response = await baseApi.put(`/lms/quizzes/${id}`, quizData);
      const updatedQuiz = response.data.data;
      if (quiz?.id === id) {
        setQuiz(updatedQuiz);
      }
      return updatedQuiz;
    });
  }, [handleApiCall, quiz]);

  const deleteQuiz = useCallback(async (id: string): Promise<void> => {
    return handleApiCall(async () => {
      await baseApi.delete(`/lms/quizzes/${id}`);
      if (quiz?.id === id) {
        setQuiz(null);
      }
    });
  }, [handleApiCall, quiz]);

  const submitQuizAttempt = useCallback(async (submission: QuizSubmissionData): Promise<QuizSubmissionResult> => {
    return handleApiCall(async () => {
      const response = await baseApi.post(`/lms/quizzes/${submission.quizId}/submit`, {
        assignmentId: submission.assignmentId,
        answers: submission.answers
      });
      return response.data.data;
    });
  }, [handleApiCall]);

  return {
    quiz,
    loading,
    error,
    getQuizById,
    getQuizzesByCourse,
    getQuizzesByLesson,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAttempt,
    setQuiz,
    setError
  };
};
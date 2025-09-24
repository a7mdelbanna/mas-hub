import { useState, useCallback } from 'react';
import { Course, CourseAudience, CourseWithContent, CourseStats, CourseSearchParams } from '../types';
import { baseApi } from '../../../lib/api/baseApi';

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
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

  const getCourses = useCallback(async (audience?: CourseAudience) => {
    return handleApiCall(async () => {
      const endpoint = audience ? `/lms/courses/audience/${audience}` : '/lms/courses';
      const response = await baseApi.get(endpoint);
      setCourses(response.data.data);
      return response.data.data;
    });
  }, [handleApiCall]);

  const searchCourses = useCallback(async (params: CourseSearchParams) => {
    return handleApiCall(async () => {
      const queryParams = new URLSearchParams();

      if (params.searchTerm) queryParams.append('search', params.searchTerm);
      if (params.audience) queryParams.append('audience', params.audience);
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.tags && params.tags.length > 0) {
        queryParams.append('tags', params.tags.join(','));
      }

      const response = await baseApi.get(`/lms/courses?${queryParams.toString()}`);
      setCourses(response.data.data);
      return response.data.data;
    });
  }, [handleApiCall]);

  const getCourseById = useCallback(async (id: string, includeContent = false): Promise<CourseWithContent | null> => {
    return handleApiCall(async () => {
      const queryParams = includeContent ? '?includeContent=true' : '';
      const response = await baseApi.get(`/lms/courses/${id}${queryParams}`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const createCourse = useCallback(async (courseData: Partial<Course>): Promise<Course> => {
    return handleApiCall(async () => {
      const response = await baseApi.post('/lms/courses', courseData);
      const newCourse = response.data.data;
      setCourses(prev => [...prev, newCourse]);
      return newCourse;
    });
  }, [handleApiCall]);

  const updateCourse = useCallback(async (id: string, courseData: Partial<Course>): Promise<Course> => {
    return handleApiCall(async () => {
      const response = await baseApi.put(`/lms/courses/${id}`, courseData);
      const updatedCourse = response.data.data;
      setCourses(prev => prev.map(course => course.id === id ? updatedCourse : course));
      return updatedCourse;
    });
  }, [handleApiCall]);

  const deleteCourse = useCallback(async (id: string): Promise<void> => {
    return handleApiCall(async () => {
      await baseApi.delete(`/lms/courses/${id}`);
      setCourses(prev => prev.filter(course => course.id !== id));
    });
  }, [handleApiCall]);

  const getCourseStats = useCallback(async (id: string): Promise<CourseStats> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/courses/${id}/stats`);
      return response.data.data;
    });
  }, [handleApiCall]);

  return {
    courses,
    loading,
    error,
    getCourses,
    searchCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseStats,
    setCourses,
    setError
  };
};
import { useState, useCallback } from 'react';
import { Assignment, AssignmentStatus, AssignmentWithDetails, AssignmentFilters } from '../types';
import { baseApi } from '../../../lib/api/baseApi';

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
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

  const createAssignment = useCallback(async (assignmentData: Partial<Assignment>): Promise<Assignment> => {
    return handleApiCall(async () => {
      const response = await baseApi.post('/lms/assignments', assignmentData);
      const newAssignment = response.data.data;
      setAssignments(prev => [...prev, newAssignment]);
      return newAssignment;
    });
  }, [handleApiCall]);

  const bulkAssignCourse = useCallback(async (
    courseId: string,
    assignmentTargets: {
      userId?: string;
      candidateId?: string;
      accountId?: string;
      dueDate?: Date;
    }[]
  ): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const response = await baseApi.post('/lms/assignments/bulk', {
        courseId,
        assignments: assignmentTargets
      });
      const newAssignments = response.data.data;
      setAssignments(prev => [...prev, ...newAssignments]);
      return newAssignments;
    });
  }, [handleApiCall]);

  const getUserAssignments = useCallback(async (
    userId: string,
    status?: AssignmentStatus
  ): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const queryParams = status ? `?status=${status}` : '';
      const response = await baseApi.get(`/lms/users/${userId}/assignments${queryParams}`);
      const userAssignments = response.data.data;
      setAssignments(userAssignments);
      return userAssignments;
    });
  }, [handleApiCall]);

  const getCandidateAssignments = useCallback(async (
    candidateId: string,
    status?: AssignmentStatus
  ): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const queryParams = status ? `?status=${status}` : '';
      const response = await baseApi.get(`/lms/candidates/${candidateId}/assignments${queryParams}`);
      const candidateAssignments = response.data.data;
      setAssignments(candidateAssignments);
      return candidateAssignments;
    });
  }, [handleApiCall]);

  const getClientAssignments = useCallback(async (
    accountId: string,
    status?: AssignmentStatus
  ): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const queryParams = status ? `?status=${status}` : '';
      const response = await baseApi.get(`/lms/clients/${accountId}/assignments${queryParams}`);
      const clientAssignments = response.data.data;
      setAssignments(clientAssignments);
      return clientAssignments;
    });
  }, [handleApiCall]);

  const getAssignmentById = useCallback(async (
    id: string,
    includeContent = false
  ): Promise<AssignmentWithDetails | null> => {
    return handleApiCall(async () => {
      const queryParams = includeContent ? '?includeContent=true' : '';
      const response = await baseApi.get(`/lms/assignments/${id}${queryParams}`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const updateAssignment = useCallback(async (
    id: string,
    assignmentData: Partial<Assignment>
  ): Promise<Assignment> => {
    return handleApiCall(async () => {
      const response = await baseApi.put(`/lms/assignments/${id}`, assignmentData);
      const updatedAssignment = response.data.data;
      setAssignments(prev => prev.map(assignment =>
        assignment.id === id ? updatedAssignment : assignment
      ));
      return updatedAssignment;
    });
  }, [handleApiCall]);

  const deleteAssignment = useCallback(async (id: string): Promise<void> => {
    return handleApiCall(async () => {
      await baseApi.delete(`/lms/assignments/${id}`);
      setAssignments(prev => prev.filter(assignment => assignment.id !== id));
    });
  }, [handleApiCall]);

  const getAssignmentsByCourse = useCallback(async (courseId: string): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const response = await baseApi.get(`/lms/courses/${courseId}/assignments`);
      return response.data.data;
    });
  }, [handleApiCall]);

  const getOverdueAssignments = useCallback(async (
    type: 'user' | 'candidate' | 'client' | 'all',
    id?: string
  ): Promise<Assignment[]> => {
    return handleApiCall(async () => {
      const endpoint = id
        ? `/lms/assignments/overdue/${type}/${id}`
        : `/lms/assignments/overdue/${type}/all`;
      const response = await baseApi.get(endpoint);
      return response.data.data;
    });
  }, [handleApiCall]);

  const filterAssignments = useCallback((
    allAssignments: Assignment[],
    filters: AssignmentFilters
  ): Assignment[] => {
    let filtered = [...allAssignments];

    if (filters.status) {
      filtered = filtered.filter(assignment => assignment.status === filters.status);
    }

    if (filters.courseId) {
      filtered = filtered.filter(assignment => assignment.courseId === filters.courseId);
    }

    if (filters.dueDate) {
      if (filters.dueDate.from) {
        filtered = filtered.filter(assignment =>
          assignment.dueDate && new Date(assignment.dueDate) >= filters.dueDate!.from!
        );
      }
      if (filters.dueDate.to) {
        filtered = filtered.filter(assignment =>
          assignment.dueDate && new Date(assignment.dueDate) <= filters.dueDate!.to!
        );
      }
    }

    if (filters.overdue) {
      const now = new Date();
      filtered = filtered.filter(assignment =>
        assignment.dueDate &&
        new Date(assignment.dueDate) < now &&
        assignment.status !== AssignmentStatus.COMPLETED
      );
    }

    return filtered;
  }, []);

  return {
    assignments,
    loading,
    error,
    createAssignment,
    bulkAssignCourse,
    getUserAssignments,
    getCandidateAssignments,
    getClientAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    getAssignmentsByCourse,
    getOverdueAssignments,
    filterAssignments,
    setAssignments,
    setError
  };
};
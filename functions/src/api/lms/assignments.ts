import { Request, Response } from 'express';
import { lmsService } from '../../services/LMSService';
import { AssignmentStatus } from '../../../../src/types/models';

/**
 * Create assignment (assign course to user/candidate/client)
 */
export const createAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const assignmentData = req.body;

    // Validate required fields
    if (!assignmentData.courseId) {
      return res.status(400).json({
        success: false,
        error: 'CourseId is required'
      });
    }

    // Must have at least one assignment target
    if (!assignmentData.userId && !assignmentData.candidateId && !assignmentData.accountId) {
      return res.status(400).json({
        success: false,
        error: 'Must assign to at least one user, candidate, or client account'
      });
    }

    const assignment = await lmsService.createAssignment({
      ...assignmentData,
      assignedBy: userId
    }, userId);

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create assignment'
    });
  }
};

/**
 * Bulk assign course to multiple users
 */
export const bulkAssignCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { courseId, assignments } = req.body;

    if (!courseId || !Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'CourseId and assignments array are required'
      });
    }

    const createdAssignments = await lmsService.bulkAssignCourse(courseId, assignments, userId);

    res.status(201).json({
      success: true,
      data: createdAssignments,
      message: `Successfully created ${createdAssignments.length} assignments`
    });
  } catch (error) {
    console.error('Error bulk assigning course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk assign course'
    });
  }
};

/**
 * Get user assignments
 */
export const getUserAssignments = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    // If requesting own assignments or user has permission to view others
    const requestingUserId = req.user?.uid;
    if (!requestingUserId || (userId !== requestingUserId && !req.user?.roles?.includes('admin'))) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these assignments'
      });
    }

    const assignments = await lmsService.getUserAssignments(
      userId,
      status as AssignmentStatus
    );

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
};

/**
 * Get candidate assignments
 */
export const getCandidateAssignments = async (req: Request, res: Response) => {
  try {
    const { candidateId } = req.params;
    const { status } = req.query;

    const assignments = await lmsService.getCandidateAssignments(
      candidateId,
      status as AssignmentStatus
    );

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching candidate assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
};

/**
 * Get client assignments
 */
export const getClientAssignments = async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const { status } = req.query;

    const assignments = await lmsService.getClientAssignments(
      accountId,
      status as AssignmentStatus
    );

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching client assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments'
    });
  }
};

/**
 * Get assignment by ID with details
 */
export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeContent } = req.query;

    const assignment = await lmsService.getAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check if user has access to this assignment
    const userId = req.user?.uid;
    const hasAccess = assignment.userId === userId ||
                     assignment.assignedBy === userId ||
                     req.user?.roles?.includes('admin');

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this assignment'
      });
    }

    if (includeContent === 'true') {
      const courseWithContent = await lmsService.getCourseWithContent(assignment.courseId);

      res.json({
        success: true,
        data: {
          assignment,
          ...courseWithContent
        }
      });
    } else {
      res.json({
        success: true,
        data: assignment
      });
    }
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment'
    });
  }
};

/**
 * Update assignment
 */
export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has permission to update this assignment
    const assignment = await lmsService.getAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const canUpdate = assignment.assignedBy === userId || req.user?.roles?.includes('admin');
    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this assignment'
      });
    }

    const updateData = req.body;
    const updatedAssignment = await lmsService.assignmentRepo.update(id, updateData, userId);

    res.json({
      success: true,
      data: updatedAssignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment'
    });
  }
};

/**
 * Delete assignment
 */
export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has permission to delete this assignment
    const assignment = await lmsService.getAssignmentById(id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    const canDelete = assignment.assignedBy === userId || req.user?.roles?.includes('admin');
    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this assignment'
      });
    }

    await lmsService.assignmentRepo.softDelete(id, userId);

    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete assignment'
    });
  }
};

/**
 * Get assignments by course (for instructors/admins)
 */
export const getAssignmentsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Only admins or course creators can view all assignments for a course
    if (!req.user?.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view course assignments'
      });
    }

    const assignments = await lmsService.assignmentRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }],
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });

    res.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course assignments'
    });
  }
};
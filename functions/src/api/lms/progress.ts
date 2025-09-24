import { Request, Response } from 'express';
import { lmsService } from '../../services/LMSService';

/**
 * Update lesson progress
 */
export const updateLessonProgress = async (req: Request, res: Response) => {
  try {
    const { assignmentId, lessonId } = req.params;
    const { completed } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (typeof completed !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Completed status must be a boolean'
      });
    }

    // Verify user owns this assignment
    const assignment = await lmsService.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    if (assignment.userId !== userId && assignment.candidateId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this assignment'
      });
    }

    const updatedAssignment = await lmsService.updateLessonProgress(
      assignmentId,
      lessonId,
      completed
    );

    res.json({
      success: true,
      data: updatedAssignment
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lesson progress'
    });
  }
};

/**
 * Get learner progress summary
 */
export const getLearnerProgress = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params; // type: 'user' | 'candidate' | 'client'
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check authorization
    const isOwn = (type === 'user' && id === userId);
    const hasAdminAccess = req.user?.roles?.includes('admin');

    if (!isOwn && !hasAdminAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this progress'
      });
    }

    let progressData;

    switch (type) {
      case 'user':
        progressData = await lmsService.getLearnerProgress(id);
        break;
      case 'candidate':
        progressData = await lmsService.getLearnerProgress(undefined, id);
        break;
      case 'client':
        progressData = await lmsService.getLearnerProgress(undefined, undefined, id);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid learner type. Must be user, candidate, or client'
        });
    }

    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    console.error('Error fetching learner progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learner progress'
    });
  }
};

/**
 * Get detailed assignment progress
 */
export const getAssignmentProgress = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const assignment = await lmsService.getAssignmentById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }

    // Check authorization
    const hasAccess = assignment.userId === userId ||
                     assignment.candidateId === userId ||
                     assignment.assignedBy === userId ||
                     req.user?.roles?.includes('admin');

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this assignment progress'
      });
    }

    // Get course content to calculate detailed progress
    const courseWithContent = await lmsService.getCourseWithContent(assignment.courseId);
    if (!courseWithContent?.course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    const { lessons, quizzes } = courseWithContent;

    // Calculate detailed progress
    const lessonProgress = lessons.map(lesson => {
      const progress = assignment.lessonProgress?.find(lp => lp.lessonId === lesson.id);
      return {
        lesson: {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          required: lesson.required,
          duration: lesson.duration,
          order: lesson.order
        },
        completed: progress?.completed || false,
        completedAt: progress?.completedAt
      };
    });

    const quizProgress = quizzes.map(quiz => {
      const attempts = assignment.quizAttempts?.filter(qa => qa.quizId === quiz.id) || [];
      const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : null;

      return {
        quiz: {
          id: quiz.id,
          title: quiz.title,
          timeLimit: quiz.timeLimit,
          attempts: quiz.attempts
        },
        attemptCount: attempts.length,
        bestScore,
        attempts: attempts.map(attempt => ({
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          submittedAt: attempt.submittedAt
        }))
      };
    });

    res.json({
      success: true,
      data: {
        assignment: {
          id: assignment.id,
          status: assignment.status,
          progressPct: assignment.progressPct,
          score: assignment.score,
          startedAt: assignment.startedAt,
          completedAt: assignment.completedAt,
          dueDate: assignment.dueDate,
          lastActivity: assignment.lastActivity
        },
        course: {
          id: courseWithContent.course.id,
          title: courseWithContent.course.title,
          passingScore: courseWithContent.course.passingScore
        },
        lessonProgress,
        quizProgress
      }
    });
  } catch (error) {
    console.error('Error fetching assignment progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignment progress'
    });
  }
};

/**
 * Get progress statistics for course (instructor/admin view)
 */
export const getCourseProgressStats = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    // Only admins or instructors can view course statistics
    if (!req.user?.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view course statistics'
      });
    }

    const stats = await lmsService.getCourseStats(courseId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching course progress stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course progress statistics'
    });
  }
};

/**
 * Get overdue assignments
 */
export const getOverdueAssignments = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params; // type: 'user' | 'candidate' | 'client' | 'all'
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    let assignments;

    switch (type) {
      case 'user':
        // Check if requesting own data or has admin access
        if (id !== userId && !req.user?.roles?.includes('admin')) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view this data'
          });
        }
        assignments = await lmsService.getUserAssignments(id);
        break;

      case 'candidate':
        if (!req.user?.roles?.includes('admin')) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view candidate data'
          });
        }
        assignments = await lmsService.getCandidateAssignments(id);
        break;

      case 'client':
        if (!req.user?.roles?.includes('admin')) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view client data'
          });
        }
        assignments = await lmsService.getClientAssignments(id);
        break;

      case 'all':
        if (!req.user?.roles?.includes('admin')) {
          return res.status(403).json({
            success: false,
            error: 'Not authorized to view all assignments'
          });
        }
        assignments = await lmsService.assignmentRepo.find({});
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid type. Must be user, candidate, client, or all'
        });
    }

    // Filter overdue assignments
    const now = new Date();
    const overdueAssignments = assignments.filter(assignment =>
      assignment.dueDate &&
      assignment.dueDate < now &&
      assignment.status !== 'completed'
    );

    res.json({
      success: true,
      data: overdueAssignments
    });
  } catch (error) {
    console.error('Error fetching overdue assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overdue assignments'
    });
  }
};
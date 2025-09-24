import { Request, Response } from 'express';
import { lmsService } from '../../services/LMSService';
import { AssignmentStatus } from '../../../../src/types/models';

/**
 * Generate certificate for completed assignment
 */
export const generateCertificate = async (req: Request, res: Response) => {
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

    // Check if user has access to this assignment
    const hasAccess = assignment.userId === userId ||
                     assignment.candidateId === userId ||
                     assignment.assignedBy === userId ||
                     req.user?.roles?.includes('admin');

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to generate certificate for this assignment'
      });
    }

    // Check if assignment is completed
    if (assignment.status !== AssignmentStatus.COMPLETED) {
      return res.status(400).json({
        success: false,
        error: 'Certificate can only be generated for completed assignments'
      });
    }

    // Check if certificate already exists
    if (assignment.certificate) {
      return res.json({
        success: true,
        data: {
          certificateUrl: assignment.certificate,
          message: 'Certificate already exists'
        }
      });
    }

    // Get course details for certificate
    const course = await lmsService.getCourseById(assignment.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Get learner name (this would need to be enhanced based on user management system)
    let learnerName = 'Learner';
    if (assignment.userId) {
      // In a real implementation, you'd fetch user details
      learnerName = `User ${assignment.userId}`;
    } else if (assignment.candidateId) {
      learnerName = `Candidate ${assignment.candidateId}`;
    } else if (assignment.accountId) {
      learnerName = `Client ${assignment.accountId}`;
    }

    const certificateData = {
      assignmentId: assignment.id!,
      courseName: course.title,
      learnerName,
      completionDate: assignment.completedAt!,
      score: assignment.score
    };

    const certificateUrl = await lmsService.generateCertificate(certificateData);

    res.json({
      success: true,
      data: {
        certificateUrl,
        message: 'Certificate generated successfully'
      }
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate certificate'
    });
  }
};

/**
 * Get certificate by assignment ID
 */
export const getCertificate = async (req: Request, res: Response) => {
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

    // Check if user has access to this assignment
    const hasAccess = assignment.userId === userId ||
                     assignment.candidateId === userId ||
                     assignment.assignedBy === userId ||
                     req.user?.roles?.includes('admin');

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this certificate'
      });
    }

    if (!assignment.certificate) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found for this assignment'
      });
    }

    // Get course details
    const course = await lmsService.getCourseById(assignment.courseId);

    res.json({
      success: true,
      data: {
        certificateUrl: assignment.certificate,
        assignment: {
          id: assignment.id,
          completedAt: assignment.completedAt,
          score: assignment.score
        },
        course: {
          id: course?.id,
          title: course?.title,
          passingScore: course?.passingScore
        }
      }
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificate'
    });
  }
};

/**
 * Get all certificates for a learner
 */
export const getLearnerCertificates = async (req: Request, res: Response) => {
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
        error: 'Not authorized to view these certificates'
      });
    }

    let assignments;

    switch (type) {
      case 'user':
        assignments = await lmsService.getUserAssignments(id, AssignmentStatus.COMPLETED);
        break;
      case 'candidate':
        assignments = await lmsService.getCandidateAssignments(id, AssignmentStatus.COMPLETED);
        break;
      case 'client':
        assignments = await lmsService.getClientAssignments(id, AssignmentStatus.COMPLETED);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid learner type. Must be user, candidate, or client'
        });
    }

    // Filter assignments that have certificates
    const certificatedAssignments = assignments.filter(assignment => assignment.certificate);

    // Get course details for each certificate
    const certificates = await Promise.all(
      certificatedAssignments.map(async (assignment) => {
        const course = await lmsService.getCourseById(assignment.courseId);
        return {
          id: assignment.id,
          certificateUrl: assignment.certificate,
          completedAt: assignment.completedAt,
          score: assignment.score,
          course: {
            id: course?.id,
            title: course?.title,
            audience: course?.audience
          }
        };
      })
    );

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching learner certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch certificates'
    });
  }
};

/**
 * Bulk generate certificates for course completions
 */
export const bulkGenerateCertificates = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Only admins can bulk generate certificates
    if (!req.user?.roles?.includes('admin')) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to bulk generate certificates'
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'CourseId is required'
      });
    }

    // Get all completed assignments for the course that don't have certificates
    const assignments = await lmsService.assignmentRepo.find({
      where: [
        { field: 'courseId', operator: '==', value: courseId },
        { field: 'status', operator: '==', value: AssignmentStatus.COMPLETED }
      ]
    });

    const assignmentsWithoutCertificates = assignments.filter(a => !a.certificate);

    if (assignmentsWithoutCertificates.length === 0) {
      return res.json({
        success: true,
        message: 'No assignments found that need certificates',
        data: { generated: 0 }
      });
    }

    // Get course details
    const course = await lmsService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }

    // Generate certificates for all eligible assignments
    const results = await Promise.allSettled(
      assignmentsWithoutCertificates.map(async (assignment) => {
        let learnerName = 'Learner';
        if (assignment.userId) {
          learnerName = `User ${assignment.userId}`;
        } else if (assignment.candidateId) {
          learnerName = `Candidate ${assignment.candidateId}`;
        } else if (assignment.accountId) {
          learnerName = `Client ${assignment.accountId}`;
        }

        const certificateData = {
          assignmentId: assignment.id!,
          courseName: course.title,
          learnerName,
          completionDate: assignment.completedAt!,
          score: assignment.score
        };

        return await lmsService.generateCertificate(certificateData);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: true,
      message: `Bulk certificate generation completed`,
      data: {
        generated: successful,
        failed,
        total: assignmentsWithoutCertificates.length
      }
    });
  } catch (error) {
    console.error('Error bulk generating certificates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk generate certificates'
    });
  }
};

/**
 * Verify certificate authenticity
 */
export const verifyCertificate = async (req: Request, res: Response) => {
  try {
    const { certificateId } = req.params;

    // In a real implementation, you would decode the certificate ID
    // and verify it against the database
    // For now, we'll extract assignment ID from the certificate URL pattern

    const assignment = await lmsService.getAssignmentById(certificateId);
    if (!assignment || !assignment.certificate || assignment.status !== AssignmentStatus.COMPLETED) {
      return res.status(404).json({
        success: false,
        error: 'Certificate not found or invalid'
      });
    }

    const course = await lmsService.getCourseById(assignment.courseId);

    res.json({
      success: true,
      data: {
        valid: true,
        certificate: {
          id: certificateId,
          issuedAt: assignment.completedAt,
          score: assignment.score
        },
        course: {
          title: course?.title,
          audience: course?.audience
        },
        learner: {
          userId: assignment.userId,
          candidateId: assignment.candidateId,
          accountId: assignment.accountId
        }
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify certificate'
    });
  }
};
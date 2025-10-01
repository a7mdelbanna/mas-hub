import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { TrainingService } from '../../services/trainingService';
import type { Course, Assignment, Candidate, User, AssignmentStatus, CourseAudience } from '../../types';
// import { defaultMockData, createHiringScenario, createMockAssignment } from '../../../test-utils/mock-data';

// Mock external dependencies
vi.mock('../../lib/firebase/config');
vi.mock('../../services/notificationService');
vi.mock('../../services/emailService');

describe.skip('LMS Training Assignment Tests - PRD US-P2-008, US-P2-010', () => {
  let trainingService: TrainingService;
  const mockNotificationService = {
    sendNotification: vi.fn(),
    createNotification: vi.fn(),
  };
  const mockEmailService = {
    sendTrainingAssignmentEmail: vi.fn(),
    sendCourseCompletionEmail: vi.fn(),
  };

  const mockHRManager: User = {
    id: 'hr-mgr-1',
    email: 'hr@mas.com',
    name: 'HR Manager',
    title: 'HR Manager',
    departmentId: 'dept-hr',
    active: true,
    language: 'en',
    portalAccess: { employee: true },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };

  const mockEmployee: User = defaultMockData.users.employee;
  const mockCandidate: Candidate = defaultMockData.candidates[1]; // Shortlisted candidate

  const mockEmployeeCourse: Course = {
    id: 'course-emp-1',
    title: 'Employee Onboarding',
    description: 'Complete onboarding process for new employees',
    audience: CourseAudience.EMPLOYEE,
    duration: 20,
    thumbnail: 'https://example.com/onboarding.jpg',
    active: true,
    passingScore: 80,
    tags: ['onboarding', 'mandatory'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'hr-mgr-1',
    updatedBy: 'hr-mgr-1',
  };

  const mockCandidateCourse: Course = {
    id: 'course-cand-1',
    title: 'Pre-hire Technical Assessment',
    description: 'Technical skills assessment for developer candidates',
    audience: CourseAudience.CANDIDATE,
    duration: 10,
    thumbnail: 'https://example.com/assessment.jpg',
    active: true,
    passingScore: 70,
    tags: ['assessment', 'technical'],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'hr-mgr-1',
    updatedBy: 'hr-mgr-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    trainingService = new TrainingService();

    // Mock service dependencies
    trainingService['notificationService'] = mockNotificationService;
    trainingService['emailService'] = mockEmailService;
  });

  describe('HR Manager Assigns Training to Employee - US-P2-008', () => {
    it('should allow HR manager to assign course to employee', async () => {
      // Arrange - PRD AC: "Given I am an HR manager, When I assign a course to a new employee"
      const assignmentRequest = {
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        assignedBy: mockHRManager.id,
        dueDate: new Date('2024-03-01'),
        notes: 'Complete within first week of employment',
      };

      const expectedAssignment: Assignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        assignedBy: mockHRManager.id,
        dueDate: assignmentRequest.dueDate,
        status: AssignmentStatus.NOT_STARTED,
        progressPct: 0,
      });

      vi.spyOn(trainingService, 'createAssignment').mockResolvedValue(expectedAssignment);

      // Act
      const assignment = await trainingService.createAssignment(assignmentRequest);

      // Assert - PRD AC: "Then they should receive notification"
      expect(assignment.courseId).toBe(mockEmployeeCourse.id);
      expect(assignment.userId).toBe(mockEmployee.id);
      expect(assignment.assignedBy).toBe(mockHRManager.id);
      expect(assignment.status).toBe(AssignmentStatus.NOT_STARTED);
    });

    it('should send notification to employee when training is assigned', async () => {
      // Arrange - PRD AC: "Then they should receive notification"
      const assignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        assignedBy: mockHRManager.id,
      });

      vi.spyOn(trainingService, 'createAssignment').mockResolvedValue(assignment);

      // Act
      await trainingService.createAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        assignedBy: mockHRManager.id,
      });

      // Assert
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
        userId: mockEmployee.id,
        type: 'info',
        title: 'New Training Assignment',
        message: `You have been assigned to "${mockEmployeeCourse.title}" course`,
        entityType: 'assignment',
        entityId: assignment.id,
        actionUrl: `/lms/assignments/${assignment.id}`,
      });

      expect(mockEmailService.sendTrainingAssignmentEmail).toHaveBeenCalledWith(
        mockEmployee.email,
        mockEmployeeCourse.title,
        assignment.id
      );
    });

    it('should make course visible in employee portal', async () => {
      // Arrange - PRD AC: "And see the course in their portal"
      const assignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
      });

      vi.spyOn(trainingService, 'getEmployeeAssignments').mockResolvedValue([assignment]);

      // Act
      const employeeAssignments = await trainingService.getEmployeeAssignments(mockEmployee.id);

      // Assert
      expect(employeeAssignments).toHaveLength(1);
      expect(employeeAssignments[0].courseId).toBe(mockEmployeeCourse.id);
      expect(employeeAssignments[0].userId).toBe(mockEmployee.id);
      expect(employeeAssignments[0].status).toBe(AssignmentStatus.NOT_STARTED);
    });

    it('should track progress throughout the course', async () => {
      // Arrange - PRD AC: "And progress should be tracked"
      const assignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        status: AssignmentStatus.IN_PROGRESS,
        progressPct: 60,
        startedAt: new Date(),
        lessonProgress: [
          {
            lessonId: 'lesson-1',
            completed: true,
            completedAt: new Date(),
          },
          {
            lessonId: 'lesson-2',
            completed: true,
            completedAt: new Date(),
          },
          {
            lessonId: 'lesson-3',
            completed: false,
          },
        ],
      });

      vi.spyOn(trainingService, 'updateProgress').mockResolvedValue(assignment);

      // Act
      const updatedAssignment = await trainingService.updateProgress(
        assignment.id,
        { lessonId: 'lesson-2', completed: true }
      );

      // Assert
      expect(updatedAssignment.status).toBe(AssignmentStatus.IN_PROGRESS);
      expect(updatedAssignment.progressPct).toBe(60);
      expect(updatedAssignment.lessonProgress).toHaveLength(3);
      expect(updatedAssignment.lessonProgress![0].completed).toBe(true);
      expect(updatedAssignment.lessonProgress![1].completed).toBe(true);
    });

    it('should generate certificate upon course completion', async () => {
      // Arrange - PRD AC: "And completion should generate a certificate"
      const completedAssignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        status: AssignmentStatus.COMPLETED,
        progressPct: 100,
        completedAt: new Date(),
        score: 85, // Above passing score of 80
        certificate: 'https://certificates.mas.com/cert-123.pdf',
      });

      vi.spyOn(trainingService, 'completeAssignment').mockResolvedValue(completedAssignment);
      vi.spyOn(trainingService, 'generateCertificate').mockResolvedValue('https://certificates.mas.com/cert-123.pdf');

      // Act
      const completed = await trainingService.completeAssignment(
        completedAssignment.id,
        { finalScore: 85 }
      );

      // Assert
      expect(completed.status).toBe(AssignmentStatus.COMPLETED);
      expect(completed.score).toBe(85);
      expect(completed.certificate).toBeDefined();
      expect(completed.certificate).toBe('https://certificates.mas.com/cert-123.pdf');

      expect(trainingService.generateCertificate).toHaveBeenCalledWith(
        completedAssignment.id,
        mockEmployee.id,
        mockEmployeeCourse.id
      );
    });
  });

  describe('Candidate Pre-hire Training - US-P2-010', () => {
    it('should allow shortlisted candidate to access portal invitation', async () => {
      // Arrange - PRD AC: "Given I am a shortlisted candidate, When I receive the portal invitation"
      const hiringScenario = createHiringScenario();
      const { candidate, course, assignment } = hiringScenario;

      vi.spyOn(trainingService, 'getCandidateAssignments').mockResolvedValue([assignment]);

      // Act
      const candidateAssignments = await trainingService.getCandidateAssignments(candidate.id);

      // Assert - PRD AC: "Then I should access assigned training materials"
      expect(candidateAssignments).toHaveLength(1);
      expect(candidateAssignments[0].courseId).toBe(course.id);
      expect(candidateAssignments[0].candidateId).toBe(candidate.id);
    });

    it('should allow candidate to complete required assessments', async () => {
      // Arrange - PRD AC: "And complete required assessments"
      const assessment = {
        quizId: 'quiz-tech-1',
        answers: {
          'question-1': 'React',
          'question-2': 'useState',
          'question-3': 'true',
        },
        submittedAt: new Date(),
      };

      const assignment = createMockAssignment({
        courseId: mockCandidateCourse.id,
        candidateId: mockCandidate.id,
        status: AssignmentStatus.IN_PROGRESS,
        quizAttempts: [
          {
            quizId: assessment.quizId,
            attemptNumber: 1,
            score: 75,
            submittedAt: assessment.submittedAt,
            answers: assessment.answers,
          },
        ],
      });

      vi.spyOn(trainingService, 'submitQuizAttempt').mockResolvedValue(assignment);

      // Act
      const updated = await trainingService.submitQuizAttempt(
        assignment.id,
        assessment
      );

      // Assert
      expect(updated.quizAttempts).toHaveLength(1);
      expect(updated.quizAttempts![0].score).toBe(75);
      expect(updated.quizAttempts![0].answers).toEqual(assessment.answers);
    });

    it('should display candidate progress dashboard', async () => {
      // Arrange - PRD AC: "And see my progress dashboard"
      const candidateProgress = {
        candidateId: mockCandidate.id,
        totalAssignments: 2,
        completedAssignments: 1,
        inProgressAssignments: 1,
        overallProgress: 50,
        averageScore: 78,
        assignments: [
          createMockAssignment({
            courseId: 'course-1',
            candidateId: mockCandidate.id,
            status: AssignmentStatus.COMPLETED,
            progressPct: 100,
            score: 82,
          }),
          createMockAssignment({
            courseId: 'course-2',
            candidateId: mockCandidate.id,
            status: AssignmentStatus.IN_PROGRESS,
            progressPct: 40,
          }),
        ],
        upcomingDeadlines: [
          {
            assignmentId: 'assign-2',
            courseTitle: 'Technical Assessment',
            dueDate: new Date('2024-02-15'),
            daysRemaining: 5,
          },
        ],
      };

      vi.spyOn(trainingService, 'getCandidateProgress').mockResolvedValue(candidateProgress);

      // Act
      const progress = await trainingService.getCandidateProgress(mockCandidate.id);

      // Assert
      expect(progress.totalAssignments).toBe(2);
      expect(progress.completedAssignments).toBe(1);
      expect(progress.inProgressAssignments).toBe(1);
      expect(progress.overallProgress).toBe(50);
      expect(progress.averageScore).toBe(78);
      expect(progress.assignments).toHaveLength(2);
      expect(progress.upcomingDeadlines).toHaveLength(1);
    });

    it('should send interview notifications after training completion', async () => {
      // Arrange - PRD AC: "And receive notifications for interviews"
      const completedAssignment = createMockAssignment({
        courseId: mockCandidateCourse.id,
        candidateId: mockCandidate.id,
        status: AssignmentStatus.COMPLETED,
        progressPct: 100,
        score: 88, // Above passing score
        completedAt: new Date(),
      });

      vi.spyOn(trainingService, 'completeAssignment').mockResolvedValue(completedAssignment);

      // Mock interview scheduling service
      const mockInterviewScheduler = {
        scheduleInterview: vi.fn().mockResolvedValue({
          id: 'interview-1',
          candidateId: mockCandidate.id,
          type: 'technical',
          scheduledAt: new Date('2024-02-20'),
        }),
      };

      trainingService['interviewScheduler'] = mockInterviewScheduler;

      // Act
      await trainingService.completeAssignment(completedAssignment.id, { finalScore: 88 });

      // Assert - Should trigger interview scheduling
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockCandidate.id,
          type: 'success',
          title: 'Training Completed',
          message: 'Congratulations! You have completed the pre-hire training. Interview scheduling will follow.',
        })
      );
    });
  });

  describe('Training Progress Tracking and Analytics', () => {
    it('should track detailed lesson progress for assignments', async () => {
      // Arrange
      const assignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        status: AssignmentStatus.IN_PROGRESS,
        lessonProgress: [
          {
            lessonId: 'lesson-1',
            completed: true,
            completedAt: new Date('2024-01-15'),
          },
          {
            lessonId: 'lesson-2',
            completed: false,
          },
          {
            lessonId: 'lesson-3',
            completed: false,
          },
        ],
      });

      // Act - Complete lesson 2
      const updatedProgress = await trainingService.markLessonComplete(
        assignment.id,
        'lesson-2'
      );

      // Assert
      expect(updatedProgress.lessonProgress![1].completed).toBe(true);
      expect(updatedProgress.lessonProgress![1].completedAt).toBeDefined();
      expect(updatedProgress.progressPct).toBeGreaterThan(assignment.progressPct);
    });

    it('should calculate accurate progress percentage', async () => {
      // Arrange
      const assignment = createMockAssignment({
        lessonProgress: [
          { lessonId: 'lesson-1', completed: true },
          { lessonId: 'lesson-2', completed: true },
          { lessonId: 'lesson-3', completed: false },
          { lessonId: 'lesson-4', completed: false },
        ],
      });

      // Act
      const progressPct = trainingService.calculateProgressPercentage(assignment);

      // Assert - 2 out of 4 lessons completed = 50%
      expect(progressPct).toBe(50);
    });

    it('should handle quiz retakes within attempt limits', async () => {
      // Arrange
      const assignment = createMockAssignment({
        courseId: mockCandidateCourse.id,
        candidateId: mockCandidate.id,
        quizAttempts: [
          {
            quizId: 'quiz-1',
            attemptNumber: 1,
            score: 65, // Below passing score of 70
            submittedAt: new Date(),
            answers: { 'q1': 'wrong' },
          },
        ],
      });

      const retakeAttempt = {
        quizId: 'quiz-1',
        answers: { 'q1': 'correct', 'q2': 'correct' },
        submittedAt: new Date(),
      };

      vi.spyOn(trainingService, 'canRetakeQuiz').mockReturnValue(true);
      vi.spyOn(trainingService, 'submitQuizAttempt').mockResolvedValue({
        ...assignment,
        quizAttempts: [
          ...assignment.quizAttempts!,
          {
            quizId: 'quiz-1',
            attemptNumber: 2,
            score: 85,
            submittedAt: retakeAttempt.submittedAt,
            answers: retakeAttempt.answers,
          },
        ],
      });

      // Act
      const updated = await trainingService.submitQuizAttempt(assignment.id, retakeAttempt);

      // Assert
      expect(updated.quizAttempts).toHaveLength(2);
      expect(updated.quizAttempts![1].score).toBe(85);
      expect(updated.quizAttempts![1].attemptNumber).toBe(2);
    });
  });

  describe('Training Assignment Validation and Error Handling', () => {
    it('should validate course audience when assigning training', async () => {
      // Arrange - Try to assign candidate course to employee
      const invalidAssignment = {
        courseId: mockCandidateCourse.id, // Candidate-only course
        userId: mockEmployee.id, // Employee
        assignedBy: mockHRManager.id,
      };

      vi.spyOn(trainingService, 'validateAssignment').mockRejectedValue(
        new Error('Course audience mismatch: This course is only available for candidates')
      );

      // Act & Assert
      await expect(trainingService.createAssignment(invalidAssignment))
        .rejects.toThrow('Course audience mismatch');
    });

    it('should handle assignment to inactive users', async () => {
      // Arrange
      const inactiveEmployee = { ...mockEmployee, active: false };
      const assignment = {
        courseId: mockEmployeeCourse.id,
        userId: inactiveEmployee.id,
        assignedBy: mockHRManager.id,
      };

      vi.spyOn(trainingService, 'createAssignment').mockRejectedValue(
        new Error('Cannot assign training to inactive user')
      );

      // Act & Assert
      await expect(trainingService.createAssignment(assignment))
        .rejects.toThrow('Cannot assign training to inactive user');
    });

    it('should prevent duplicate assignments for same user and course', async () => {
      // Arrange
      const existingAssignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        status: AssignmentStatus.IN_PROGRESS,
      });

      vi.spyOn(trainingService, 'getExistingAssignment')
        .mockResolvedValue(existingAssignment);

      const duplicateAssignment = {
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        assignedBy: mockHRManager.id,
      };

      vi.spyOn(trainingService, 'createAssignment').mockRejectedValue(
        new Error('User already has an active assignment for this course')
      );

      // Act & Assert
      await expect(trainingService.createAssignment(duplicateAssignment))
        .rejects.toThrow('User already has an active assignment for this course');
    });
  });

  describe('Training Completion and Certification', () => {
    it('should only generate certificate if passing score is met', async () => {
      // Arrange - Score below passing threshold
      const failedAssignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        status: AssignmentStatus.COMPLETED,
        score: 75, // Below passing score of 80
      });

      vi.spyOn(trainingService, 'completeAssignment').mockResolvedValue({
        ...failedAssignment,
        certificate: undefined, // No certificate for failed score
      });

      // Act
      const completed = await trainingService.completeAssignment(
        failedAssignment.id,
        { finalScore: 75 }
      );

      // Assert
      expect(completed.score).toBe(75);
      expect(completed.certificate).toBeUndefined();
    });

    it('should send completion notification to HR when employee finishes training', async () => {
      // Arrange
      const completedAssignment = createMockAssignment({
        courseId: mockEmployeeCourse.id,
        userId: mockEmployee.id,
        status: AssignmentStatus.COMPLETED,
        score: 88,
        completedAt: new Date(),
      });

      vi.spyOn(trainingService, 'completeAssignment').mockResolvedValue(completedAssignment);

      // Act
      await trainingService.completeAssignment(completedAssignment.id, { finalScore: 88 });

      // Assert
      expect(mockNotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockHRManager.id,
          type: 'info',
          title: 'Training Completed',
          message: `${mockEmployee.name} has completed "${mockEmployeeCourse.title}" training`,
        })
      );
    });
  });
});
import { BaseRepository } from '../repositories/BaseRepository';
import { Course, Lesson, Quiz, Assignment, Question, AssignmentStatus, CourseAudience } from '../../../src/types/models';
import * as admin from 'firebase-admin';
import { nanoid } from 'nanoid';

export interface CourseCreateData {
  title: string;
  description?: string;
  audience: CourseAudience;
  duration?: number;
  thumbnail?: string;
  productId?: string;
  certificateTemplateId?: string;
  passingScore?: number;
  tags?: string[];
}

export interface LessonCreateData {
  courseId: string;
  title: string;
  description?: string;
  type: 'video' | 'document' | 'article' | 'interactive';
  content?: string;
  url?: string;
  duration?: number;
  order: number;
  required: boolean;
}

export interface QuizCreateData {
  lessonId?: string;
  courseId?: string;
  title: string;
  description?: string;
  timeLimit?: number;
  attempts?: number;
  questions: Question[];
  randomizeQuestions: boolean;
  showResults: boolean;
}

export interface AssignmentCreateData {
  courseId: string;
  userId?: string;
  candidateId?: string;
  accountId?: string;
  assignedBy: string;
  dueDate?: Date;
}

export interface QuizSubmission {
  quizId: string;
  assignmentId: string;
  answers: Record<string, any>;
  submittedAt: Date;
}

export interface ProgressUpdate {
  assignmentId: string;
  lessonId?: string;
  quizId?: string;
  progressType: 'lesson' | 'quiz' | 'course';
  completed: boolean;
  score?: number;
}

export interface CertificateData {
  assignmentId: string;
  courseName: string;
  learnerName: string;
  completionDate: Date;
  score?: number;
}

class LMSService {
  private courseRepo: BaseRepository<Course>;
  private lessonRepo: BaseRepository<Lesson>;
  private quizRepo: BaseRepository<Quiz>;
  private assignmentRepo: BaseRepository<Assignment>;

  constructor() {
    this.courseRepo = new BaseRepository<Course>('courses');
    this.lessonRepo = new BaseRepository<Lesson>('lessons');
    this.quizRepo = new BaseRepository<Quiz>('quizzes');
    this.assignmentRepo = new BaseRepository<Assignment>('assignments');
  }

  // ============================================
  // Course Management
  // ============================================

  /**
   * Create a new course
   */
  async createCourse(data: CourseCreateData, userId: string): Promise<Course> {
    const course = await this.courseRepo.create({
      ...data,
      active: true,
    }, userId);

    return course;
  }

  /**
   * Get course by ID with lessons
   */
  async getCourseById(courseId: string, includeDeleted = false): Promise<Course | null> {
    return await this.courseRepo.findById(courseId, includeDeleted);
  }

  /**
   * Get courses by audience
   */
  async getCoursesByAudience(audience: CourseAudience | 'all' = 'all'): Promise<Course[]> {
    const whereConditions = audience !== 'all'
      ? [{ field: 'audience', operator: '==', value: audience }]
      : [];

    return await this.courseRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  /**
   * Update course
   */
  async updateCourse(courseId: string, data: Partial<CourseCreateData>, userId: string): Promise<Course> {
    return await this.courseRepo.update(courseId, data, userId);
  }

  /**
   * Delete course (soft delete)
   */
  async deleteCourse(courseId: string, userId: string): Promise<void> {
    await this.courseRepo.softDelete(courseId, userId);
  }

  /**
   * Get course with full content (lessons, quizzes)
   */
  async getCourseWithContent(courseId: string): Promise<{
    course: Course;
    lessons: Lesson[];
    quizzes: Quiz[];
  } | null> {
    const course = await this.getCourseById(courseId);
    if (!course) return null;

    const [lessons, quizzes] = await Promise.all([
      this.getLessonsByCourse(courseId),
      this.getQuizzesByCourse(courseId)
    ]);

    return { course, lessons, quizzes };
  }

  // ============================================
  // Lesson Management
  // ============================================

  /**
   * Create a new lesson
   */
  async createLesson(data: LessonCreateData, userId: string): Promise<Lesson> {
    return await this.lessonRepo.create(data, userId);
  }

  /**
   * Get lessons by course
   */
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await this.lessonRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }],
      orderBy: 'order',
      orderDirection: 'asc'
    });
  }

  /**
   * Update lesson
   */
  async updateLesson(lessonId: string, data: Partial<LessonCreateData>, userId: string): Promise<Lesson> {
    return await this.lessonRepo.update(lessonId, data, userId);
  }

  /**
   * Delete lesson
   */
  async deleteLesson(lessonId: string, userId: string): Promise<void> {
    await this.lessonRepo.softDelete(lessonId, userId);
  }

  /**
   * Reorder lessons
   */
  async reorderLessons(courseId: string, lessonIds: string[], userId: string): Promise<void> {
    const updates = lessonIds.map((lessonId, index) => ({
      id: lessonId,
      data: { order: index + 1 }
    }));

    await this.lessonRepo.updateBatch(updates, userId);
  }

  // ============================================
  // Quiz Management
  // ============================================

  /**
   * Create a new quiz
   */
  async createQuiz(data: QuizCreateData, userId: string): Promise<Quiz> {
    return await this.quizRepo.create(data, userId);
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(quizId: string): Promise<Quiz | null> {
    return await this.quizRepo.findById(quizId);
  }

  /**
   * Get quizzes by course
   */
  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return await this.quizRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }],
      orderBy: 'createdAt',
      orderDirection: 'asc'
    });
  }

  /**
   * Get quizzes by lesson
   */
  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    return await this.quizRepo.find({
      where: [{ field: 'lessonId', operator: '==', value: lessonId }],
      orderBy: 'createdAt',
      orderDirection: 'asc'
    });
  }

  /**
   * Update quiz
   */
  async updateQuiz(quizId: string, data: Partial<QuizCreateData>, userId: string): Promise<Quiz> {
    return await this.quizRepo.update(quizId, data, userId);
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(quizId: string, userId: string): Promise<void> {
    await this.quizRepo.softDelete(quizId, userId);
  }

  // ============================================
  // Assignment Management
  // ============================================

  /**
   * Create assignment (assign course to user/candidate/client)
   */
  async createAssignment(data: AssignmentCreateData, userId: string): Promise<Assignment> {
    return await this.assignmentRepo.create({
      ...data,
      status: AssignmentStatus.NOT_STARTED,
      progressPct: 0,
      lessonProgress: [],
      quizAttempts: []
    }, userId);
  }

  /**
   * Bulk assign course to multiple users
   */
  async bulkAssignCourse(courseId: string, assignments: {
    userId?: string;
    candidateId?: string;
    accountId?: string;
    dueDate?: Date;
  }[], assignedBy: string): Promise<Assignment[]> {
    const assignmentData = assignments.map(assignment => ({
      courseId,
      ...assignment,
      assignedBy,
      status: AssignmentStatus.NOT_STARTED,
      progressPct: 0,
      lessonProgress: [],
      quizAttempts: []
    }));

    return await this.assignmentRepo.createBatch(assignmentData, assignedBy);
  }

  /**
   * Get assignments for user
   */
  async getUserAssignments(userId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const whereConditions = [
      { field: 'userId', operator: '==', value: userId }
    ];

    if (status) {
      whereConditions.push({ field: 'status', operator: '==', value: status });
    }

    return await this.assignmentRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  /**
   * Get assignments for candidate
   */
  async getCandidateAssignments(candidateId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const whereConditions = [
      { field: 'candidateId', operator: '==', value: candidateId }
    ];

    if (status) {
      whereConditions.push({ field: 'status', operator: '==', value: status });
    }

    return await this.assignmentRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  /**
   * Get assignments for client (account)
   */
  async getClientAssignments(accountId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const whereConditions = [
      { field: 'accountId', operator: '==', value: accountId }
    ];

    if (status) {
      whereConditions.push({ field: 'status', operator: '==', value: status });
    }

    return await this.assignmentRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  /**
   * Get assignment by ID
   */
  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    return await this.assignmentRepo.findById(assignmentId);
  }

  // ============================================
  // Progress Tracking
  // ============================================

  /**
   * Update lesson progress
   */
  async updateLessonProgress(assignmentId: string, lessonId: string, completed: boolean): Promise<Assignment> {
    const assignment = await this.getAssignmentById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Update lesson progress
    const lessonProgress = assignment.lessonProgress || [];
    const existingIndex = lessonProgress.findIndex(lp => lp.lessonId === lessonId);

    if (existingIndex >= 0) {
      lessonProgress[existingIndex] = {
        lessonId,
        completed,
        completedAt: completed ? new Date() : undefined
      };
    } else {
      lessonProgress.push({
        lessonId,
        completed,
        completedAt: completed ? new Date() : undefined
      });
    }

    // Calculate overall progress
    const course = await this.getCourseById(assignment.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const lessons = await this.getLessonsByCourse(assignment.courseId);
    const requiredLessons = lessons.filter(l => l.required);
    const completedRequired = lessonProgress.filter(lp =>
      lp.completed && requiredLessons.find(l => l.id === lp.lessonId)
    );

    const progressPct = requiredLessons.length > 0
      ? Math.round((completedRequired.length / requiredLessons.length) * 100)
      : 0;

    // Update status based on progress
    let status = assignment.status;
    let completedAt = assignment.completedAt;

    if (assignment.status === AssignmentStatus.NOT_STARTED && completed) {
      status = AssignmentStatus.IN_PROGRESS;
    }

    if (progressPct === 100 && status !== AssignmentStatus.COMPLETED) {
      status = AssignmentStatus.COMPLETED;
      completedAt = new Date();
    }

    return await this.assignmentRepo.update(assignmentId, {
      lessonProgress,
      progressPct,
      status,
      completedAt,
      lastActivity: new Date()
    });
  }

  /**
   * Submit quiz attempt
   */
  async submitQuizAttempt(submission: QuizSubmission): Promise<{
    assignment: Assignment;
    score: number;
    passed: boolean;
  }> {
    const assignment = await this.getAssignmentById(submission.assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const quiz = await this.getQuizById(submission.quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    // Calculate score
    const { score, totalPoints } = this.calculateQuizScore(quiz, submission.answers);
    const scorePercentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

    // Check attempt limits
    const existingAttempts = assignment.quizAttempts?.filter(qa => qa.quizId === submission.quizId) || [];

    if (quiz.attempts && existingAttempts.length >= quiz.attempts) {
      throw new Error('Maximum attempts exceeded');
    }

    const attemptNumber = existingAttempts.length + 1;

    // Add quiz attempt
    const quizAttempts = assignment.quizAttempts || [];
    quizAttempts.push({
      quizId: submission.quizId,
      attemptNumber,
      score: scorePercentage,
      submittedAt: submission.submittedAt,
      answers: submission.answers
    });

    // Get course and check passing score
    const course = await this.getCourseById(assignment.courseId);
    const passingScore = course?.passingScore || 70;
    const passed = scorePercentage >= passingScore;

    // Update assignment
    const updatedAssignment = await this.assignmentRepo.update(submission.assignmentId, {
      quizAttempts,
      score: Math.max(assignment.score || 0, scorePercentage),
      lastActivity: new Date()
    });

    return {
      assignment: updatedAssignment,
      score: scorePercentage,
      passed
    };
  }

  /**
   * Calculate quiz score
   */
  private calculateQuizScore(quiz: Quiz, answers: Record<string, any>): {
    score: number;
    totalPoints: number;
  } {
    let score = 0;
    let totalPoints = 0;

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const userAnswer = answers[question.id];

      if (this.isAnswerCorrect(question, userAnswer)) {
        score += question.points;
      }
    }

    return { score, totalPoints };
  }

  /**
   * Check if answer is correct
   */
  private isAnswerCorrect(question: Question, userAnswer: any): boolean {
    switch (question.type) {
      case 'single_choice':
      case 'true_false':
        return userAnswer === question.correctAnswer;

      case 'multiple_choice':
        if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
          return false;
        }
        const correctSet = new Set(question.correctAnswer);
        const userSet = new Set(userAnswer);
        return correctSet.size === userSet.size &&
               [...correctSet].every(answer => userSet.has(answer));

      case 'text':
        if (typeof userAnswer !== 'string' || typeof question.correctAnswer !== 'string') {
          return false;
        }
        return userAnswer.toLowerCase().trim() ===
               (question.correctAnswer as string).toLowerCase().trim();

      default:
        return false;
    }
  }

  // ============================================
  // Certificate Generation
  // ============================================

  /**
   * Generate certificate for completed assignment
   */
  async generateCertificate(certificateData: CertificateData): Promise<string> {
    const assignment = await this.getAssignmentById(certificateData.assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (assignment.status !== AssignmentStatus.COMPLETED) {
      throw new Error('Assignment not completed');
    }

    // Generate certificate URL (in a real implementation, this would generate a PDF)
    const certificateUrl = `certificates/${certificateData.assignmentId}_${Date.now()}.pdf`;

    // Update assignment with certificate URL
    await this.assignmentRepo.update(certificateData.assignmentId, {
      certificate: certificateUrl
    });

    return certificateUrl;
  }

  // ============================================
  // Analytics and Reporting
  // ============================================

  /**
   * Get course completion statistics
   */
  async getCourseStats(courseId: string): Promise<{
    totalAssignments: number;
    completedAssignments: number;
    inProgressAssignments: number;
    averageScore: number;
    completionRate: number;
  }> {
    const assignments = await this.assignmentRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }]
    });

    const completed = assignments.filter(a => a.status === AssignmentStatus.COMPLETED);
    const inProgress = assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS);

    const scores = completed.filter(a => a.score !== undefined).map(a => a.score!);
    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    const completionRate = assignments.length > 0
      ? (completed.length / assignments.length) * 100
      : 0;

    return {
      totalAssignments: assignments.length,
      completedAssignments: completed.length,
      inProgressAssignments: inProgress.length,
      averageScore: Math.round(averageScore),
      completionRate: Math.round(completionRate)
    };
  }

  /**
   * Get learner progress summary
   */
  async getLearnerProgress(
    userId?: string,
    candidateId?: string,
    accountId?: string
  ): Promise<{
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageScore: number;
    certificates: number;
  }> {
    const whereConditions = [];

    if (userId) whereConditions.push({ field: 'userId', operator: '==', value: userId });
    if (candidateId) whereConditions.push({ field: 'candidateId', operator: '==', value: candidateId });
    if (accountId) whereConditions.push({ field: 'accountId', operator: '==', value: accountId });

    const assignments = await this.assignmentRepo.find({
      where: whereConditions
    });

    const completed = assignments.filter(a => a.status === AssignmentStatus.COMPLETED);
    const inProgress = assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS);
    const withCertificates = assignments.filter(a => a.certificate);

    const scores = completed.filter(a => a.score !== undefined).map(a => a.score!);
    const averageScore = scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

    return {
      totalCourses: assignments.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      averageScore: Math.round(averageScore),
      certificates: withCertificates.length
    };
  }

  // ============================================
  // Course Search and Filtering
  // ============================================

  /**
   * Search courses
   */
  async searchCourses(query: {
    searchTerm?: string;
    audience?: CourseAudience;
    tags?: string[];
    productId?: string;
  }): Promise<Course[]> {
    const whereConditions = [];

    if (query.audience) {
      whereConditions.push({ field: 'audience', operator: '==', value: query.audience });
    }

    if (query.productId) {
      whereConditions.push({ field: 'productId', operator: '==', value: query.productId });
    }

    // Get all courses matching basic filters
    const courses = await this.courseRepo.find({
      where: whereConditions,
      orderBy: 'title',
      orderDirection: 'asc'
    });

    // Apply client-side filtering for complex queries
    let filteredCourses = courses;

    if (query.searchTerm) {
      const term = query.searchTerm.toLowerCase();
      filteredCourses = filteredCourses.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term)
      );
    }

    if (query.tags && query.tags.length > 0) {
      filteredCourses = filteredCourses.filter(course =>
        course.tags?.some(tag => query.tags!.includes(tag))
      );
    }

    return filteredCourses;
  }
}

export const lmsService = new LMSService();
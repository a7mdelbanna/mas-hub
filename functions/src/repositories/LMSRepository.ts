import { BaseRepository, QueryOptions } from './BaseRepository';
import {
  Course,
  Lesson,
  Quiz,
  Assignment,
  CourseAudience,
  AssignmentStatus
} from '../../../src/types/models';

/**
 * Extended repository for LMS-specific operations
 */
export class LMSRepository extends BaseRepository<any> {
  private courseRepo: BaseRepository<Course>;
  private lessonRepo: BaseRepository<Lesson>;
  private quizRepo: BaseRepository<Quiz>;
  private assignmentRepo: BaseRepository<Assignment>;

  constructor() {
    super('lms'); // Base collection (not used directly)
    this.courseRepo = new BaseRepository<Course>('courses');
    this.lessonRepo = new BaseRepository<Lesson>('lessons');
    this.quizRepo = new BaseRepository<Quiz>('quizzes');
    this.assignmentRepo = new BaseRepository<Assignment>('assignments');
  }

  // ============================================
  // Course Repository Operations
  // ============================================

  async createCourse(courseData: Partial<Course>, userId: string): Promise<Course> {
    return await this.courseRepo.create(courseData, userId);
  }

  async getCourseById(courseId: string): Promise<Course | null> {
    return await this.courseRepo.findById(courseId);
  }

  async getCourses(options: QueryOptions = {}): Promise<Course[]> {
    return await this.courseRepo.find(options);
  }

  async updateCourse(courseId: string, data: Partial<Course>, userId: string): Promise<Course> {
    return await this.courseRepo.update(courseId, data, userId);
  }

  async deleteCourse(courseId: string, userId: string): Promise<void> {
    await this.courseRepo.softDelete(courseId, userId);
  }

  async getCoursesByAudience(audience: CourseAudience): Promise<Course[]> {
    return await this.courseRepo.find({
      where: [{ field: 'audience', operator: '==', value: audience }],
      orderBy: 'title',
      orderDirection: 'asc'
    });
  }

  async getActiveCourses(): Promise<Course[]> {
    return await this.courseRepo.find({
      where: [{ field: 'active', operator: '==', value: true }],
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  async getCoursesByProduct(productId: string): Promise<Course[]> {
    return await this.courseRepo.find({
      where: [{ field: 'productId', operator: '==', value: productId }],
      orderBy: 'title',
      orderDirection: 'asc'
    });
  }

  // ============================================
  // Lesson Repository Operations
  // ============================================

  async createLesson(lessonData: Partial<Lesson>, userId: string): Promise<Lesson> {
    return await this.lessonRepo.create(lessonData, userId);
  }

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    return await this.lessonRepo.findById(lessonId);
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await this.lessonRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }],
      orderBy: 'order',
      orderDirection: 'asc'
    });
  }

  async updateLesson(lessonId: string, data: Partial<Lesson>, userId: string): Promise<Lesson> {
    return await this.lessonRepo.update(lessonId, data, userId);
  }

  async deleteLesson(lessonId: string, userId: string): Promise<void> {
    await this.lessonRepo.softDelete(lessonId, userId);
  }

  async reorderLessons(updates: { id: string; order: number }[], userId: string): Promise<void> {
    const batchUpdates = updates.map(update => ({
      id: update.id,
      data: { order: update.order }
    }));

    await this.lessonRepo.updateBatch(batchUpdates, userId);
  }

  async getRequiredLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await this.lessonRepo.find({
      where: [
        { field: 'courseId', operator: '==', value: courseId },
        { field: 'required', operator: '==', value: true }
      ],
      orderBy: 'order',
      orderDirection: 'asc'
    });
  }

  // ============================================
  // Quiz Repository Operations
  // ============================================

  async createQuiz(quizData: Partial<Quiz>, userId: string): Promise<Quiz> {
    return await this.quizRepo.create(quizData, userId);
  }

  async getQuizById(quizId: string): Promise<Quiz | null> {
    return await this.quizRepo.findById(quizId);
  }

  async getQuizzesByCourse(courseId: string): Promise<Quiz[]> {
    return await this.quizRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }],
      orderBy: 'createdAt',
      orderDirection: 'asc'
    });
  }

  async getQuizzesByLesson(lessonId: string): Promise<Quiz[]> {
    return await this.quizRepo.find({
      where: [{ field: 'lessonId', operator: '==', value: lessonId }],
      orderBy: 'createdAt',
      orderDirection: 'asc'
    });
  }

  async updateQuiz(quizId: string, data: Partial<Quiz>, userId: string): Promise<Quiz> {
    return await this.quizRepo.update(quizId, data, userId);
  }

  async deleteQuiz(quizId: string, userId: string): Promise<void> {
    await this.quizRepo.softDelete(quizId, userId);
  }

  // ============================================
  // Assignment Repository Operations
  // ============================================

  async createAssignment(assignmentData: Partial<Assignment>, userId: string): Promise<Assignment> {
    return await this.assignmentRepo.create(assignmentData, userId);
  }

  async createAssignments(assignmentsData: Partial<Assignment>[], userId: string): Promise<Assignment[]> {
    return await this.assignmentRepo.createBatch(assignmentsData, userId);
  }

  async getAssignmentById(assignmentId: string): Promise<Assignment | null> {
    return await this.assignmentRepo.findById(assignmentId);
  }

  async getAssignments(options: QueryOptions = {}): Promise<Assignment[]> {
    return await this.assignmentRepo.find(options);
  }

  async updateAssignment(assignmentId: string, data: Partial<Assignment>, userId?: string): Promise<Assignment> {
    return await this.assignmentRepo.update(assignmentId, data, userId);
  }

  async deleteAssignment(assignmentId: string, userId: string): Promise<void> {
    await this.assignmentRepo.softDelete(assignmentId, userId);
  }

  async getUserAssignments(userId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const whereConditions = [{ field: 'userId', operator: '==', value: userId }];

    if (status) {
      whereConditions.push({ field: 'status', operator: '==', value: status });
    }

    return await this.assignmentRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  async getCandidateAssignments(candidateId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const whereConditions = [{ field: 'candidateId', operator: '==', value: candidateId }];

    if (status) {
      whereConditions.push({ field: 'status', operator: '==', value: status });
    }

    return await this.assignmentRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  async getClientAssignments(accountId: string, status?: AssignmentStatus): Promise<Assignment[]> {
    const whereConditions = [{ field: 'accountId', operator: '==', value: accountId }];

    if (status) {
      whereConditions.push({ field: 'status', operator: '==', value: status });
    }

    return await this.assignmentRepo.find({
      where: whereConditions,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  async getAssignmentsByCourse(courseId: string): Promise<Assignment[]> {
    return await this.assignmentRepo.find({
      where: [{ field: 'courseId', operator: '==', value: courseId }],
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  async getOverdueAssignments(): Promise<Assignment[]> {
    const now = new Date();
    return await this.assignmentRepo.find({
      where: [
        { field: 'dueDate', operator: '<', value: now },
        { field: 'status', operator: '!=', value: AssignmentStatus.COMPLETED }
      ],
      orderBy: 'dueDate',
      orderDirection: 'asc'
    });
  }

  async getAssignmentsDueIn(days: number): Promise<Assignment[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return await this.assignmentRepo.find({
      where: [
        { field: 'dueDate', operator: '>=', value: now },
        { field: 'dueDate', operator: '<=', value: futureDate },
        { field: 'status', operator: '!=', value: AssignmentStatus.COMPLETED }
      ],
      orderBy: 'dueDate',
      orderDirection: 'asc'
    });
  }

  // ============================================
  // Complex Queries & Analytics
  // ============================================

  /**
   * Get course with full content (lessons and quizzes)
   */
  async getCourseWithContent(courseId: string): Promise<{
    course: Course | null;
    lessons: Lesson[];
    quizzes: Quiz[];
  }> {
    const [course, lessons, quizzes] = await Promise.all([
      this.getCourseById(courseId),
      this.getLessonsByCourse(courseId),
      this.getQuizzesByCourse(courseId)
    ]);

    return { course, lessons, quizzes };
  }

  /**
   * Get assignment with course and lesson details
   */
  async getAssignmentWithDetails(assignmentId: string): Promise<{
    assignment: Assignment | null;
    course: Course | null;
    lessons: Lesson[];
    quizzes: Quiz[];
  }> {
    const assignment = await this.getAssignmentById(assignmentId);
    if (!assignment) {
      return { assignment: null, course: null, lessons: [], quizzes: [] };
    }

    const [course, lessons, quizzes] = await Promise.all([
      this.getCourseById(assignment.courseId),
      this.getLessonsByCourse(assignment.courseId),
      this.getQuizzesByCourse(assignment.courseId)
    ]);

    return { assignment, course, lessons, quizzes };
  }

  /**
   * Get learner's progress across all assignments
   */
  async getLearnerProgressSummary(
    userId?: string,
    candidateId?: string,
    accountId?: string
  ): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    overdue: number;
    averageProgress: number;
  }> {
    const whereConditions = [];

    if (userId) whereConditions.push({ field: 'userId', operator: '==', value: userId });
    if (candidateId) whereConditions.push({ field: 'candidateId', operator: '==', value: candidateId });
    if (accountId) whereConditions.push({ field: 'accountId', operator: '==', value: accountId });

    const assignments = await this.assignmentRepo.find({
      where: whereConditions
    });

    const now = new Date();
    const completed = assignments.filter(a => a.status === AssignmentStatus.COMPLETED);
    const inProgress = assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS);
    const notStarted = assignments.filter(a => a.status === AssignmentStatus.NOT_STARTED);
    const overdue = assignments.filter(a =>
      a.dueDate && a.dueDate < now && a.status !== AssignmentStatus.COMPLETED
    );

    const totalProgress = assignments.reduce((sum, a) => sum + (a.progressPct || 0), 0);
    const averageProgress = assignments.length > 0 ? Math.round(totalProgress / assignments.length) : 0;

    return {
      total: assignments.length,
      completed: completed.length,
      inProgress: inProgress.length,
      notStarted: notStarted.length,
      overdue: overdue.length,
      averageProgress
    };
  }

  /**
   * Get course completion statistics
   */
  async getCourseCompletionStats(courseId: string): Promise<{
    totalAssignments: number;
    completionRate: number;
    averageScore: number;
    averageTimeToComplete: number; // in days
    topPerformers: { userId?: string; candidateId?: string; accountId?: string; score: number }[];
  }> {
    const assignments = await this.getAssignmentsByCourse(courseId);
    const completed = assignments.filter(a => a.status === AssignmentStatus.COMPLETED);

    const completionRate = assignments.length > 0
      ? Math.round((completed.length / assignments.length) * 100)
      : 0;

    // Calculate average score
    const scores = completed.filter(a => a.score !== undefined).map(a => a.score!);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;

    // Calculate average time to complete
    const completionTimes = completed
      .filter(a => a.startedAt && a.completedAt)
      .map(a => {
        const start = new Date(a.startedAt!);
        const end = new Date(a.completedAt!);
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); // days
      });

    const averageTimeToComplete = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length)
      : 0;

    // Get top performers
    const topPerformers = completed
      .filter(a => a.score !== undefined)
      .sort((a, b) => (b.score! - a.score!))
      .slice(0, 5)
      .map(a => ({
        userId: a.userId,
        candidateId: a.candidateId,
        accountId: a.accountId,
        score: a.score!
      }));

    return {
      totalAssignments: assignments.length,
      completionRate,
      averageScore,
      averageTimeToComplete,
      topPerformers
    };
  }

  // ============================================
  // Subscription Methods for Real-time Updates
  // ============================================

  /**
   * Subscribe to assignment changes for a user
   */
  subscribeToUserAssignments(
    userId: string,
    callback: (assignments: Assignment[]) => void
  ): () => void {
    return this.assignmentRepo.subscribeToChanges(callback, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: 'createdAt',
      orderDirection: 'desc'
    });
  }

  /**
   * Subscribe to course changes
   */
  subscribeToCourses(
    callback: (courses: Course[]) => void,
    audience?: CourseAudience
  ): () => void {
    const whereConditions = audience
      ? [{ field: 'audience', operator: '==', value: audience }]
      : [];

    return this.courseRepo.subscribeToChanges(callback, {
      where: whereConditions,
      orderBy: 'title',
      orderDirection: 'asc'
    });
  }
}

export const lmsRepository = new LMSRepository();
import { Assignment, Lesson, Quiz, AssignmentStatus } from '../types';

export class ProgressCalculator {
  /**
   * Calculate overall course completion percentage
   */
  static calculateCourseProgress(
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean }>,
    requiredOnly: boolean = true
  ): number {
    const relevantLessons = requiredOnly
      ? lessons.filter(lesson => lesson.required)
      : lessons;

    if (relevantLessons.length === 0) return 0;

    const completedCount = relevantLessons.filter(lesson =>
      lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
    ).length;

    return Math.round((completedCount / relevantLessons.length) * 100);
  }

  /**
   * Calculate weighted progress based on lesson duration
   */
  static calculateWeightedProgress(
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean }>,
    requiredOnly: boolean = true
  ): number {
    const relevantLessons = requiredOnly
      ? lessons.filter(lesson => lesson.required)
      : lessons;

    if (relevantLessons.length === 0) return 0;

    const totalWeight = relevantLessons.reduce((sum, lesson) => sum + (lesson.duration || 1), 0);
    const completedWeight = relevantLessons
      .filter(lesson => lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed))
      .reduce((sum, lesson) => sum + (lesson.duration || 1), 0);

    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  }

  /**
   * Calculate time spent on course
   */
  static calculateTimeSpent(
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean }>
  ): number {
    return lessons
      .filter(lesson => lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed))
      .reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }

  /**
   * Calculate estimated time remaining
   */
  static calculateTimeRemaining(
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean }>,
    requiredOnly: boolean = true
  ): number {
    const relevantLessons = requiredOnly
      ? lessons.filter(lesson => lesson.required)
      : lessons;

    return relevantLessons
      .filter(lesson => !lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed))
      .reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }

  /**
   * Get next lesson to complete
   */
  static getNextLesson(
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean }>
  ): Lesson | null {
    // Sort by order and find first incomplete required lesson
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

    return sortedLessons.find(lesson =>
      lesson.required && !lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
    ) || null;
  }

  /**
   * Check if assignment should be marked as complete
   */
  static shouldMarkComplete(
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean }>,
    quizzes: Quiz[],
    quizAttempts: Array<{ quizId: string; score: number }>,
    passingScore: number = 70
  ): boolean {
    // All required lessons must be completed
    const requiredLessons = lessons.filter(lesson => lesson.required);
    const completedRequiredLessons = requiredLessons.filter(lesson =>
      lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
    );

    if (completedRequiredLessons.length !== requiredLessons.length) {
      return false;
    }

    // All quizzes must be passed
    if (quizzes.length > 0) {
      const passedQuizzes = quizzes.filter(quiz => {
        const bestAttempt = quizAttempts
          .filter(attempt => attempt.quizId === quiz.id)
          .reduce((best, current) =>
            current.score > (best?.score || 0) ? current : best, null as any);

        return bestAttempt && bestAttempt.score >= passingScore;
      });

      return passedQuizzes.length === quizzes.length;
    }

    return true;
  }

  /**
   * Calculate completion date based on progress and estimated pace
   */
  static estimateCompletionDate(
    assignment: Assignment,
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean; completedAt?: Date }>
  ): Date | null {
    if (assignment.status === AssignmentStatus.COMPLETED) {
      return assignment.completedAt || null;
    }

    const completedLessons = lessonProgress.filter(lp => lp.completed && lp.completedAt);
    if (completedLessons.length < 2) return null; // Need at least 2 data points

    // Calculate average time between lesson completions
    const completionDates = completedLessons
      .map(lp => new Date(lp.completedAt!))
      .sort((a, b) => a.getTime() - b.getTime());

    const intervals = completionDates.slice(1).map((date, index) =>
      date.getTime() - completionDates[index].getTime()
    );

    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Calculate remaining lessons
    const remainingLessons = lessons.filter(lesson =>
      lesson.required && !lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
    ).length;

    if (remainingLessons === 0) return new Date(); // Should be completed now

    const lastCompletionDate = completionDates[completionDates.length - 1];
    const estimatedCompletion = new Date(lastCompletionDate.getTime() + (avgInterval * remainingLessons));

    return estimatedCompletion;
  }

  /**
   * Calculate learning velocity (lessons per day)
   */
  static calculateLearningVelocity(
    lessonProgress: Array<{ lessonId: string; completed: boolean; completedAt?: Date }>
  ): number {
    const completedLessons = lessonProgress.filter(lp => lp.completed && lp.completedAt);

    if (completedLessons.length === 0) return 0;

    const completionDates = completedLessons
      .map(lp => new Date(lp.completedAt!))
      .sort((a, b) => a.getTime() - b.getTime());

    const firstCompletion = completionDates[0];
    const lastCompletion = completionDates[completionDates.length - 1];

    const daysDiff = Math.max(1, Math.ceil(
      (lastCompletion.getTime() - firstCompletion.getTime()) / (1000 * 60 * 60 * 24)
    ));

    return completedLessons.length / daysDiff;
  }

  /**
   * Get progress insights and recommendations
   */
  static getProgressInsights(
    assignment: Assignment,
    lessons: Lesson[],
    lessonProgress: Array<{ lessonId: string; completed: boolean; completedAt?: Date }>
  ): {
    status: 'on_track' | 'behind' | 'ahead' | 'at_risk';
    message: string;
    recommendation?: string;
  } {
    const velocity = this.calculateLearningVelocity(lessonProgress);
    const remainingTime = assignment.dueDate
      ? Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    const remainingLessons = lessons.filter(lesson =>
      lesson.required && !lessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
    ).length;

    if (assignment.status === AssignmentStatus.COMPLETED) {
      return {
        status: 'on_track',
        message: 'Course completed successfully!'
      };
    }

    if (!assignment.dueDate) {
      return {
        status: 'on_track',
        message: 'No due date set. Continue at your own pace.'
      };
    }

    if (remainingTime === null || remainingTime <= 0) {
      return {
        status: 'at_risk',
        message: 'Assignment is overdue',
        recommendation: 'Complete remaining lessons as soon as possible'
      };
    }

    if (remainingLessons === 0) {
      return {
        status: 'ahead',
        message: 'All lessons completed! Check for any pending quizzes.'
      };
    }

    if (velocity === 0) {
      if (remainingTime <= 3) {
        return {
          status: 'at_risk',
          message: 'Assignment due soon and no progress made',
          recommendation: 'Start immediately to avoid missing the deadline'
        };
      }
      return {
        status: 'behind',
        message: 'No progress made yet',
        recommendation: 'Start your first lesson to get on track'
      };
    }

    const requiredVelocity = remainingLessons / remainingTime;

    if (velocity >= requiredVelocity * 1.2) {
      return {
        status: 'ahead',
        message: 'You\'re ahead of schedule! Great progress.',
        recommendation: 'Keep up the excellent pace'
      };
    } else if (velocity >= requiredVelocity * 0.8) {
      return {
        status: 'on_track',
        message: 'You\'re on track to complete on time',
        recommendation: 'Maintain your current pace'
      };
    } else if (velocity >= requiredVelocity * 0.5) {
      return {
        status: 'behind',
        message: 'You\'re falling behind schedule',
        recommendation: `Aim to complete ${Math.ceil(requiredVelocity)} lessons per day`
      };
    } else {
      return {
        status: 'at_risk',
        message: 'You\'re significantly behind schedule',
        recommendation: 'Consider requesting an extension or dedicate more time daily'
      };
    }
  }
}
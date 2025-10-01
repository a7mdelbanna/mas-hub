export * from '../../../types';

// Additional frontend-specific types
export interface CourseWithContent {
  course: Course;
  lessons: Lesson[];
  quizzes: Quiz[];
}

export interface AssignmentWithDetails {
  assignment: Assignment;
  course: Course | null;
  lessons: Lesson[];
  quizzes: Quiz[];
}

export interface LessonProgress {
  lesson: {
    id: string;
    title: string;
    type: string;
    required: boolean;
    duration?: number;
    order: number;
  };
  completed: boolean;
  completedAt?: Date;
}

export interface QuizProgress {
  quiz: {
    id: string;
    title: string;
    timeLimit?: number;
    attempts?: number;
  };
  attemptCount: number;
  bestScore: number | null;
  attempts: {
    attemptNumber: number;
    score: number;
    submittedAt: Date;
  }[];
}

export interface AssignmentProgressDetails {
  assignment: {
    id: string;
    status: AssignmentStatus;
    progressPct: number;
    score?: number;
    startedAt?: Date;
    completedAt?: Date;
    dueDate?: Date;
    lastActivity?: Date;
  };
  course: {
    id: string;
    title: string;
    passingScore?: number;
  };
  lessonProgress: LessonProgress[];
  quizProgress: QuizProgress[];
}

export interface LearnerProgressSummary {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageScore: number;
  certificates: number;
}

export interface CourseStats {
  totalAssignments: number;
  completedAssignments: number;
  inProgressAssignments: number;
  averageScore: number;
  completionRate: number;
}

export interface CertificateInfo {
  id: string;
  certificateUrl: string;
  completedAt?: Date;
  score?: number;
  course: {
    id?: string;
    title?: string;
    audience?: CourseAudience;
  };
}

export interface QuizSubmissionData {
  quizId: string;
  assignmentId: string;
  answers: Record<string, any>;
}

export interface QuizSubmissionResult {
  score: number;
  passed: boolean;
  assignment: Assignment;
}

// UI State types
export interface CourseBuilderState {
  currentStep: 'basic' | 'lessons' | 'quizzes' | 'review';
  courseData: Partial<Course>;
  lessons: Partial<Lesson>[];
  quizzes: Partial<Quiz>[];
  isDirty: boolean;
}

export interface LessonViewerState {
  currentLesson: Lesson | null;
  nextLesson: Lesson | null;
  previousLesson: Lesson | null;
  completed: boolean;
  loading: boolean;
}

export interface QuizTakerState {
  quiz: Quiz | null;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  timeRemaining: number | null;
  submitted: boolean;
  result: QuizSubmissionResult | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Search and filter types
export interface CourseSearchParams {
  searchTerm?: string;
  audience?: CourseAudience;
  tags?: string[];
  productId?: string;
}

export interface AssignmentFilters {
  status?: AssignmentStatus;
  courseId?: string;
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  overdue?: boolean;
}

import {
  Course,
  Lesson,
  Quiz,
  Assignment,
  CourseAudience,
  AssignmentStatus,
  Question
} from '../../../types';
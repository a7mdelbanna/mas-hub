export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  price: number;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
    bio: string;
  };
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  enrollment: number;
  rating: number;
  totalRatings: number;
  lessons: Lesson[];
  assignments: Assignment[];
  quizzes: Quiz[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'document' | 'interactive';
  content: string;
  videoUrl?: string;
  documentUrl?: string;
  duration: number; // in minutes
  order: number;
  isPreview: boolean;
  resources: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'video' | 'link' | 'image';
  url: string;
  size?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: Date;
  maxScore: number;
  submissions: Submission[];
  attachments: Resource[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Submission {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  attachments: Resource[];
  score?: number;
  feedback?: string;
  status: 'draft' | 'submitted' | 'graded';
  submittedAt?: Date;
  gradedAt?: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  attempts: number;
  passingScore: number;
  questions: Question[];
  attempts_taken: QuizAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'essay' | 'fill-blank';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
  };
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in minutes
  status: 'in-progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[];
  isCorrect: boolean;
  points: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  course: Course;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  progress: number; // percentage
  completedLessons: string[];
  lastAccessedAt: Date;
  enrolledAt: Date;
  completedAt?: Date;
  certificateIssued: boolean;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  completionDate: Date;
  certificateUrl: string;
  verificationCode: string;
  issuedAt: Date;
}

export interface LMSStats {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  activeEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalRevenue: number;
  certificatesIssued: number;
}
import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

// Course routes
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  getCoursesByAudience
} from './courses';

// Lesson routes
import {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons
} from './lessons';

// Quiz routes
import {
  getQuizzesByCourse,
  getQuizzesByLesson,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt
} from './quizzes';

// Assignment routes
import {
  createAssignment,
  bulkAssignCourse,
  getUserAssignments,
  getCandidateAssignments,
  getClientAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  getAssignmentsByCourse
} from './assignments';

// Progress routes
import {
  updateLessonProgress,
  getLearnerProgress,
  getAssignmentProgress,
  getCourseProgressStats,
  getOverdueAssignments
} from './progress';

// Certificate routes
import {
  generateCertificate,
  getCertificate,
  getLearnerCertificates,
  bulkGenerateCertificates,
  verifyCertificate
} from './certificates';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ============================================
// Course Routes
// ============================================
router.get('/courses', getCourses);
router.get('/courses/audience/:audience', getCoursesByAudience);
router.get('/courses/:id', getCourseById);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);
router.get('/courses/:id/stats', getCourseStats);

// ============================================
// Lesson Routes
// ============================================
router.get('/courses/:courseId/lessons', getLessonsByCourse);
router.get('/lessons/:id', getLessonById);
router.post('/lessons', createLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);
router.put('/courses/:courseId/lessons/reorder', reorderLessons);

// ============================================
// Quiz Routes
// ============================================
router.get('/courses/:courseId/quizzes', getQuizzesByCourse);
router.get('/lessons/:lessonId/quizzes', getQuizzesByLesson);
router.get('/quizzes/:id', getQuizById);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);
router.post('/quizzes/:id/submit', submitQuizAttempt);

// ============================================
// Assignment Routes
// ============================================
router.post('/assignments', createAssignment);
router.post('/assignments/bulk', bulkAssignCourse);
router.get('/users/:userId/assignments', getUserAssignments);
router.get('/candidates/:candidateId/assignments', getCandidateAssignments);
router.get('/clients/:accountId/assignments', getClientAssignments);
router.get('/assignments/:id', getAssignmentById);
router.put('/assignments/:id', updateAssignment);
router.delete('/assignments/:id', deleteAssignment);
router.get('/courses/:courseId/assignments', getAssignmentsByCourse);

// ============================================
// Progress Routes
// ============================================
router.put('/assignments/:assignmentId/lessons/:lessonId/progress', updateLessonProgress);
router.get('/progress/:type/:id', getLearnerProgress); // type: user|candidate|client
router.get('/assignments/:assignmentId/progress', getAssignmentProgress);
router.get('/courses/:courseId/progress/stats', getCourseProgressStats);
router.get('/assignments/overdue/:type/:id', getOverdueAssignments);

// ============================================
// Certificate Routes
// ============================================
router.post('/assignments/:assignmentId/certificate', generateCertificate);
router.get('/assignments/:assignmentId/certificate', getCertificate);
router.get('/certificates/:type/:id', getLearnerCertificates); // type: user|candidate|client
router.post('/certificates/bulk', bulkGenerateCertificates);
router.get('/certificates/verify/:certificateId', verifyCertificate);

export default router;
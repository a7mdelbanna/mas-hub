import { Request, Response } from 'express';
import { lmsService } from '../../services/LMSService';

/**
 * Get quizzes by course
 */
export const getQuizzesByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const quizzes = await lmsService.getQuizzesByCourse(courseId);

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes'
    });
  }
};

/**
 * Get quizzes by lesson
 */
export const getQuizzesByLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    const quizzes = await lmsService.getQuizzesByLesson(lessonId);

    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    console.error('Error fetching quizzes by lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quizzes'
    });
  }
};

/**
 * Get quiz by ID
 */
export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeAnswers } = req.query;

    const quiz = await lmsService.getQuizById(id);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Remove correct answers if not requested (for quiz taking)
    if (includeAnswers !== 'true') {
      const sanitizedQuiz = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          ...q,
          correctAnswer: undefined,
          explanation: undefined
        }))
      };

      res.json({
        success: true,
        data: sanitizedQuiz
      });
    } else {
      res.json({
        success: true,
        data: quiz
      });
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz'
    });
  }
};

/**
 * Create new quiz
 */
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const quizData = req.body;

    // Validate required fields
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      return res.status(400).json({
        success: false,
        error: 'Title and questions array are required'
      });
    }

    if (quizData.questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one question is required'
      });
    }

    // Validate questions
    for (const question of quizData.questions) {
      if (!question.text || !question.type || question.points === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Each question must have text, type, and points'
        });
      }

      if (['single_choice', 'multiple_choice'].includes(question.type) && !question.options) {
        return res.status(400).json({
          success: false,
          error: 'Choice questions must have options'
        });
      }
    }

    const quiz = await lmsService.createQuiz(quizData, userId);

    res.status(201).json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create quiz'
    });
  }
};

/**
 * Update quiz
 */
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const updateData = req.body;
    const quiz = await lmsService.updateQuiz(id, updateData, userId);

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Error updating quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quiz'
    });
  }
};

/**
 * Delete quiz
 */
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await lmsService.deleteQuiz(id, userId);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quiz'
    });
  }
};

/**
 * Submit quiz attempt
 */
export const submitQuizAttempt = async (req: Request, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const { assignmentId, answers } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!assignmentId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'AssignmentId and answers are required'
      });
    }

    const submission = {
      quizId,
      assignmentId,
      answers,
      submittedAt: new Date()
    };

    const result = await lmsService.submitQuizAttempt(submission);

    res.json({
      success: true,
      data: {
        score: result.score,
        passed: result.passed,
        assignment: result.assignment
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);

    if (error instanceof Error) {
      if (error.message.includes('Maximum attempts exceeded')) {
        return res.status(409).json({
          success: false,
          error: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to submit quiz'
    });
  }
};
import { Request, Response } from 'express';
import { lmsService } from '../../services/LMSService';

/**
 * Get lessons by course
 */
export const getLessonsByCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const lessons = await lmsService.getLessonsByCourse(courseId);

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lessons'
    });
  }
};

/**
 * Get lesson by ID
 */
export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const lesson = await lmsService.lessonRepo.findById(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: 'Lesson not found'
      });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lesson'
    });
  }
};

/**
 * Create new lesson
 */
export const createLesson = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const lessonData = req.body;

    // Validate required fields
    if (!lessonData.courseId || !lessonData.title || !lessonData.type) {
      return res.status(400).json({
        success: false,
        error: 'CourseId, title, and type are required'
      });
    }

    // Validate content based on type
    if (lessonData.type === 'article' && !lessonData.content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required for article lessons'
      });
    }

    if ((lessonData.type === 'video' || lessonData.type === 'document') && !lessonData.url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required for video and document lessons'
      });
    }

    const lesson = await lmsService.createLesson(lessonData, userId);

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create lesson'
    });
  }
};

/**
 * Update lesson
 */
export const updateLesson = async (req: Request, res: Response) => {
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
    const lesson = await lmsService.updateLesson(id, updateData, userId);

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update lesson'
    });
  }
};

/**
 * Delete lesson
 */
export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await lmsService.deleteLesson(id, userId);

    res.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete lesson'
    });
  }
};

/**
 * Reorder lessons
 */
export const reorderLessons = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!Array.isArray(lessonIds)) {
      return res.status(400).json({
        success: false,
        error: 'LessonIds must be an array'
      });
    }

    await lmsService.reorderLessons(courseId, lessonIds, userId);

    res.json({
      success: true,
      message: 'Lessons reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering lessons:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reorder lessons'
    });
  }
};
import { Request, Response } from 'express';
import { lmsService } from '../../services/LMSService';
import { CourseAudience } from '../../../../src/types/models';

/**
 * Get all courses with optional filtering
 */
export const getCourses = async (req: Request, res: Response) => {
  try {
    const { audience, search, tags, productId } = req.query;

    const courses = await lmsService.searchCourses({
      searchTerm: search as string,
      audience: audience as CourseAudience,
      tags: tags ? (tags as string).split(',') : undefined,
      productId: productId as string
    });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
};

/**
 * Get course by ID with content
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { includeContent } = req.query;

    if (includeContent === 'true') {
      const courseWithContent = await lmsService.getCourseWithContent(id);
      if (!courseWithContent) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: courseWithContent
      });
    } else {
      const course = await lmsService.getCourseById(id);
      if (!course) {
        return res.status(404).json({
          success: false,
          error: 'Course not found'
        });
      }

      res.json({
        success: true,
        data: course
      });
    }
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course'
    });
  }
};

/**
 * Create new course
 */
export const createCourse = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const courseData = req.body;

    // Validate required fields
    if (!courseData.title || !courseData.audience) {
      return res.status(400).json({
        success: false,
        error: 'Title and audience are required'
      });
    }

    const course = await lmsService.createCourse(courseData, userId);

    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create course'
    });
  }
};

/**
 * Update course
 */
export const updateCourse = async (req: Request, res: Response) => {
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
    const course = await lmsService.updateCourse(id, updateData, userId);

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update course'
    });
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    await lmsService.deleteCourse(id, userId);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete course'
    });
  }
};

/**
 * Get course statistics
 */
export const getCourseStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stats = await lmsService.getCourseStats(id);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch course statistics'
    });
  }
};

/**
 * Get courses by audience type
 */
export const getCoursesByAudience = async (req: Request, res: Response) => {
  try {
    const { audience } = req.params;

    if (!Object.values(CourseAudience).includes(audience as CourseAudience)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid audience type'
      });
    }

    const courses = await lmsService.getCoursesByAudience(audience as CourseAudience);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses by audience:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch courses'
    });
  }
};
import { Course, Enrollment, Assignment, Quiz, Certificate, LMSStats } from '../types/lms.types';

class LMSService {
  // Courses
  async getCourses(): Promise<Course[]> {
    return [
      {
        id: '1',
        title: 'POS System Administration',
        description: 'Complete guide to managing and configuring POS systems',
        category: 'Technical Training',
        level: 'intermediate',
        duration: 8,
        price: 299,
        instructor: {
          id: '1',
          name: 'John Smith',
          avatar: '',
          bio: 'Senior POS Systems Engineer with 10+ years experience'
        },
        thumbnail: '',
        status: 'published',
        enrollment: 45,
        rating: 4.7,
        totalRatings: 23,
        lessons: [
          {
            id: '1',
            title: 'Introduction to POS Systems',
            description: 'Overview of modern POS technology',
            type: 'video',
            content: 'Comprehensive introduction to POS systems...',
            videoUrl: 'https://example.com/video1',
            duration: 45,
            order: 1,
            isPreview: true,
            resources: [],
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15')
          }
        ],
        assignments: [],
        quizzes: [],
        tags: ['pos', 'technical', 'administration'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-03-15')
      },
      {
        id: '2',
        title: 'Customer Service Excellence',
        description: 'Master the art of exceptional customer service',
        category: 'Soft Skills',
        level: 'beginner',
        duration: 6,
        price: 199,
        instructor: {
          id: '2',
          name: 'Sarah Johnson',
          avatar: '',
          bio: 'Customer Experience Specialist and Trainer'
        },
        thumbnail: '',
        status: 'published',
        enrollment: 78,
        rating: 4.9,
        totalRatings: 41,
        lessons: [],
        assignments: [],
        quizzes: [],
        tags: ['customer-service', 'communication', 'soft-skills'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-03-10')
      }
    ];
  }

  // Enrollments
  async getEnrollments(): Promise<Enrollment[]> {
    return [
      {
        id: '1',
        courseId: '1',
        course: {
          id: '1',
          title: 'POS System Administration',
          description: 'Complete guide to managing and configuring POS systems',
          category: 'Technical Training',
          level: 'intermediate',
          duration: 8,
          price: 299,
          instructor: {
            id: '1',
            name: 'John Smith',
            avatar: '',
            bio: ''
          },
          thumbnail: '',
          status: 'published',
          enrollment: 45,
          rating: 4.7,
          totalRatings: 23,
          lessons: [],
          assignments: [],
          quizzes: [],
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        studentId: '1',
        student: {
          id: '1',
          name: 'Alice Brown',
          email: 'alice.brown@company.com',
          avatar: ''
        },
        progress: 65,
        completedLessons: ['1', '2', '3'],
        lastAccessedAt: new Date('2024-03-20'),
        enrolledAt: new Date('2024-02-15'),
        certificateIssued: false
      }
    ];
  }

  // Assignments
  async getAssignments(): Promise<Assignment[]> {
    return [
      {
        id: '1',
        title: 'POS Configuration Exercise',
        description: 'Configure a POS system for a retail store',
        instructions: 'Follow the provided scenario and configure the POS system accordingly...',
        dueDate: new Date('2024-04-01'),
        maxScore: 100,
        submissions: [
          {
            id: '1',
            studentId: '1',
            student: {
              id: '1',
              name: 'Alice Brown',
              avatar: ''
            },
            content: 'I have completed the POS configuration as requested...',
            attachments: [],
            score: 85,
            feedback: 'Great work! Minor improvements needed in checkout flow.',
            status: 'graded',
            submittedAt: new Date('2024-03-25'),
            gradedAt: new Date('2024-03-26')
          }
        ],
        attachments: [],
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date('2024-03-26')
      }
    ];
  }

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    return [
      {
        id: '1',
        title: 'POS Systems Fundamentals Quiz',
        description: 'Test your knowledge of POS system basics',
        timeLimit: 30,
        attempts: 3,
        passingScore: 70,
        questions: [
          {
            id: '1',
            type: 'multiple-choice',
            question: 'What does POS stand for?',
            options: ['Point of Sale', 'Point of Service', 'Purchase Order System', 'Payment Order Service'],
            correctAnswer: 'Point of Sale',
            explanation: 'POS stands for Point of Sale, referring to the location where a transaction occurs.',
            points: 10
          }
        ],
        attempts_taken: [],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-03-05')
      }
    ];
  }

  // Certificates
  async getCertificates(): Promise<Certificate[]> {
    return [
      {
        id: '1',
        courseId: '2',
        courseName: 'Customer Service Excellence',
        studentId: '2',
        studentName: 'Bob Wilson',
        completionDate: new Date('2024-03-15'),
        certificateUrl: 'https://example.com/certificates/cert-001.pdf',
        verificationCode: 'CSE-2024-001',
        issuedAt: new Date('2024-03-16')
      }
    ];
  }

  // LMS Statistics
  async getLMSStats(): Promise<LMSStats> {
    return {
      totalCourses: 12,
      publishedCourses: 8,
      totalStudents: 156,
      activeEnrollments: 89,
      completionRate: 73.5,
      averageRating: 4.6,
      totalRevenue: 15400,
      certificatesIssued: 45
    };
  }

  // Create operations
  async createCourse(course: Omit<Course, 'id' | 'enrollment' | 'rating' | 'totalRatings' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    return {
      ...course,
      id: Date.now().toString(),
      enrollment: 0,
      rating: 0,
      totalRatings: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async enrollStudent(courseId: string, studentId: string): Promise<Enrollment> {
    return {
      id: Date.now().toString(),
      courseId,
      course: {} as Course, // Would be populated from actual course data
      studentId,
      student: {} as any, // Would be populated from actual student data
      progress: 0,
      completedLessons: [],
      lastAccessedAt: new Date(),
      enrolledAt: new Date(),
      certificateIssued: false
    };
  }
}

export const lmsService = new LMSService();
import { Course, Lesson, Quiz, Question, Assignment, CourseAudience, AssignmentStatus } from '../src/types/models';

export const courses: Partial<Course>[] = [
  // Employee Training Courses
  {
    id: 'course-new-employee-orientation',
    title: 'New Employee Orientation',
    description: 'Comprehensive orientation program for all new employees covering company policies, procedures, and culture.',
    audience: CourseAudience.EMPLOYEE,
    duration: 8, // hours
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/orientation.jpg',
    active: true,
    passingScore: 80,
    tags: ['orientation', 'onboarding', 'company-culture']
  },
  {
    id: 'course-pos-system-basics',
    title: 'POS System Fundamentals',
    description: 'Learn the basics of our POS system including navigation, transactions, and basic troubleshooting.',
    audience: CourseAudience.EMPLOYEE,
    duration: 4,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/pos-basics.jpg',
    active: true,
    passingScore: 85,
    tags: ['pos', 'technical', 'basics']
  },
  {
    id: 'course-customer-service-excellence',
    title: 'Customer Service Excellence',
    description: 'Advanced customer service techniques and best practices for client interactions.',
    audience: CourseAudience.EMPLOYEE,
    duration: 6,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/customer-service.jpg',
    active: true,
    passingScore: 75,
    tags: ['customer-service', 'communication', 'soft-skills']
  },
  {
    id: 'course-project-management',
    title: 'Project Management Essentials',
    description: 'Essential project management skills for team leads and managers.',
    audience: CourseAudience.EMPLOYEE,
    duration: 12,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/project-management.jpg',
    active: true,
    passingScore: 80,
    tags: ['management', 'leadership', 'planning']
  },

  // Candidate Training Courses
  {
    id: 'course-pre-hire-technical-assessment',
    title: 'Technical Skills Assessment',
    description: 'Comprehensive technical assessment for developer candidates covering programming fundamentals and problem-solving.',
    audience: CourseAudience.CANDIDATE,
    duration: 3,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/technical-assessment.jpg',
    active: true,
    passingScore: 70,
    tags: ['assessment', 'technical', 'programming']
  },
  {
    id: 'course-company-overview',
    title: 'MAS Business Solutions Overview',
    description: 'Introduction to MAS company history, services, culture, and career opportunities.',
    audience: CourseAudience.CANDIDATE,
    duration: 2,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/company-overview.jpg',
    active: true,
    passingScore: 60,
    tags: ['company', 'overview', 'culture']
  },
  {
    id: 'course-sales-skills-assessment',
    title: 'Sales Skills Evaluation',
    description: 'Assessment of sales techniques, communication skills, and industry knowledge for sales candidates.',
    audience: CourseAudience.CANDIDATE,
    duration: 2,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/sales-assessment.jpg',
    active: true,
    passingScore: 75,
    tags: ['sales', 'assessment', 'communication']
  },

  // Client Training Courses
  {
    id: 'course-restaurant-pos-training',
    title: 'Restaurant POS System Training',
    description: 'Complete training program for restaurant staff on using the POS system effectively.',
    audience: CourseAudience.CLIENT,
    duration: 6,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/restaurant-pos.jpg',
    active: true,
    productId: 'product-restaurant-pos',
    passingScore: 80,
    tags: ['restaurant', 'pos', 'operations']
  },
  {
    id: 'course-retail-pos-training',
    title: 'Retail POS System Training',
    description: 'Training for retail staff on inventory management, sales processing, and reporting features.',
    audience: CourseAudience.CLIENT,
    duration: 4,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/retail-pos.jpg',
    active: true,
    productId: 'product-retail-pos',
    passingScore: 85,
    tags: ['retail', 'inventory', 'sales']
  },
  {
    id: 'course-pharmacy-pos-training',
    title: 'Pharmacy POS System Training',
    description: 'Specialized training for pharmacy operations including prescription management and insurance processing.',
    audience: CourseAudience.CLIENT,
    duration: 8,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/pharmacy-pos.jpg',
    active: true,
    productId: 'product-pharmacy-pos',
    passingScore: 90,
    tags: ['pharmacy', 'healthcare', 'prescriptions']
  },
  {
    id: 'course-mobile-app-user-guide',
    title: 'Mobile Application User Guide',
    description: 'Comprehensive guide for end users on how to effectively use mobile applications.',
    audience: CourseAudience.CLIENT,
    duration: 3,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/mobile-app.jpg',
    active: true,
    passingScore: 70,
    tags: ['mobile-app', 'user-guide', 'training']
  },

  // Mixed Audience Courses
  {
    id: 'course-data-security-awareness',
    title: 'Data Security & Privacy Awareness',
    description: 'Essential data security practices and privacy compliance for all system users.',
    audience: CourseAudience.MIXED,
    duration: 2,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/data-security.jpg',
    active: true,
    passingScore: 85,
    tags: ['security', 'privacy', 'compliance']
  },
  {
    id: 'course-system-troubleshooting',
    title: 'Basic System Troubleshooting',
    description: 'Common troubleshooting steps and problem resolution techniques for system users.',
    audience: CourseAudience.MIXED,
    duration: 3,
    thumbnail: 'https://storage.googleapis.com/mashub-assets/courses/troubleshooting.jpg',
    active: true,
    passingScore: 75,
    tags: ['troubleshooting', 'technical-support', 'problem-solving']
  }
];

// Sample Lessons for some courses
export const lessons: Partial<Lesson>[] = [
  // New Employee Orientation Lessons
  {
    id: 'lesson-orientation-welcome',
    courseId: 'course-new-employee-orientation',
    title: 'Welcome to MAS Business Solutions',
    description: 'Introduction to the company and your role',
    type: 'video',
    url: 'https://storage.googleapis.com/mashub-assets/videos/welcome.mp4',
    duration: 30,
    order: 1,
    required: true
  },
  {
    id: 'lesson-orientation-policies',
    courseId: 'course-new-employee-orientation',
    title: 'Company Policies and Procedures',
    description: 'Essential policies every employee must know',
    type: 'document',
    url: 'https://storage.googleapis.com/mashub-assets/docs/employee-handbook.pdf',
    duration: 45,
    order: 2,
    required: true
  },
  {
    id: 'lesson-orientation-culture',
    courseId: 'course-new-employee-orientation',
    title: 'Company Culture and Values',
    description: 'Understanding our culture and core values',
    type: 'article',
    content: 'At MAS Business Solutions, we believe in innovation, excellence, and customer-first approach...',
    duration: 20,
    order: 3,
    required: true
  },

  // POS System Basics Lessons
  {
    id: 'lesson-pos-navigation',
    courseId: 'course-pos-system-basics',
    title: 'System Navigation',
    description: 'Learn how to navigate through the POS system interface',
    type: 'interactive',
    url: 'https://training.mas.business/pos-navigation-sim',
    duration: 25,
    order: 1,
    required: true
  },
  {
    id: 'lesson-pos-transactions',
    courseId: 'course-pos-system-basics',
    title: 'Processing Transactions',
    description: 'Step-by-step guide to processing sales transactions',
    type: 'video',
    url: 'https://storage.googleapis.com/mashub-assets/videos/pos-transactions.mp4',
    duration: 35,
    order: 2,
    required: true
  },
  {
    id: 'lesson-pos-reports',
    courseId: 'course-pos-system-basics',
    title: 'Generating Reports',
    description: 'How to generate and interpret system reports',
    type: 'video',
    url: 'https://storage.googleapis.com/mashub-assets/videos/pos-reports.mp4',
    duration: 20,
    order: 3,
    required: false
  },

  // Restaurant POS Training Lessons
  {
    id: 'lesson-restaurant-setup',
    courseId: 'course-restaurant-pos-training',
    title: 'Restaurant Setup and Configuration',
    description: 'Setting up your restaurant in the POS system',
    type: 'video',
    url: 'https://storage.googleapis.com/mashub-assets/videos/restaurant-setup.mp4',
    duration: 40,
    order: 1,
    required: true
  },
  {
    id: 'lesson-menu-management',
    courseId: 'course-restaurant-pos-training',
    title: 'Menu Management',
    description: 'Adding and managing menu items, categories, and pricing',
    type: 'interactive',
    url: 'https://training.mas.business/menu-management-sim',
    duration: 50,
    order: 2,
    required: true
  },
  {
    id: 'lesson-order-processing',
    courseId: 'course-restaurant-pos-training',
    title: 'Order Processing and Kitchen Display',
    description: 'Taking orders and managing kitchen workflow',
    type: 'video',
    url: 'https://storage.googleapis.com/mashub-assets/videos/order-processing.mp4',
    duration: 30,
    order: 3,
    required: true
  },

  // Technical Assessment Lessons
  {
    id: 'lesson-tech-programming-fundamentals',
    courseId: 'course-pre-hire-technical-assessment',
    title: 'Programming Fundamentals Review',
    description: 'Review of basic programming concepts',
    type: 'article',
    content: 'This lesson covers fundamental programming concepts including variables, functions, loops...',
    duration: 45,
    order: 1,
    required: true
  },
  {
    id: 'lesson-tech-problem-solving',
    courseId: 'course-pre-hire-technical-assessment',
    title: 'Problem Solving Techniques',
    description: 'Approaches to solving technical problems',
    type: 'document',
    url: 'https://storage.googleapis.com/mashub-assets/docs/problem-solving-guide.pdf',
    duration: 30,
    order: 2,
    required: true
  }
];

// Sample Quizzes
export const quizzes: Partial<Quiz>[] = [
  {
    id: 'quiz-orientation-final',
    courseId: 'course-new-employee-orientation',
    title: 'New Employee Orientation Final Assessment',
    description: 'Final assessment to confirm understanding of company policies and procedures',
    timeLimit: 30, // minutes
    attempts: 3,
    randomizeQuestions: true,
    showResults: true,
    questions: [
      {
        id: 'q1',
        text: 'What are the core values of MAS Business Solutions?',
        type: 'multiple_choice',
        options: [
          'Innovation, Excellence, Customer-First',
          'Profit, Growth, Expansion',
          'Speed, Efficiency, Cost-Cutting',
          'Technology, Sales, Marketing'
        ],
        correctAnswer: 'Innovation, Excellence, Customer-First',
        points: 10,
        explanation: 'Our core values guide every decision we make and define how we serve our clients.'
      },
      {
        id: 'q2',
        text: 'How many days of annual leave are new employees entitled to?',
        type: 'single_choice',
        options: ['15 days', '20 days', '25 days', '30 days'],
        correctAnswer: '25 days',
        points: 5,
        explanation: 'All full-time employees receive 25 days of annual leave plus national holidays.'
      },
      {
        id: 'q3',
        text: 'Is it acceptable to share client data with external parties without authorization?',
        type: 'true_false',
        correctAnswer: false,
        points: 15,
        explanation: 'Client data must never be shared externally without proper authorization and legal compliance.'
      }
    ]
  },
  {
    id: 'quiz-pos-basics-final',
    courseId: 'course-pos-system-basics',
    title: 'POS System Basics Assessment',
    description: 'Test your knowledge of basic POS system operations',
    timeLimit: 20,
    attempts: 2,
    randomizeQuestions: false,
    showResults: true,
    questions: [
      {
        id: 'q1',
        text: 'Which key combination opens the cash drawer manually?',
        type: 'single_choice',
        options: ['Ctrl+D', 'Alt+C', 'Shift+Cash', 'F4'],
        correctAnswer: 'Ctrl+D',
        points: 10,
        explanation: 'Ctrl+D is the standard shortcut to open the cash drawer in emergency situations.'
      },
      {
        id: 'q2',
        text: 'What should you do if a payment is declined?',
        type: 'multiple_choice',
        options: [
          'Try the payment again',
          'Ask for alternative payment method',
          'Check if the amount is correct',
          'All of the above'
        ],
        correctAnswer: 'All of the above',
        points: 15,
        explanation: 'When a payment is declined, try these steps before calling for support.'
      }
    ]
  },
  {
    id: 'quiz-restaurant-pos-module1',
    courseId: 'course-restaurant-pos-training',
    title: 'Restaurant Setup Knowledge Check',
    description: 'Quick assessment of restaurant setup concepts',
    timeLimit: 15,
    attempts: 5,
    randomizeQuestions: true,
    showResults: true,
    questions: [
      {
        id: 'q1',
        text: 'Where do you configure table layouts in the system?',
        type: 'single_choice',
        options: ['Settings > Tables', 'Restaurant > Floor Plan', 'Setup > Dining Areas', 'Admin > Configuration'],
        correctAnswer: 'Restaurant > Floor Plan',
        points: 10,
        explanation: 'Table layouts are configured in the Restaurant > Floor Plan section.'
      },
      {
        id: 'q2',
        text: 'Which of these are required fields when adding a menu item?',
        type: 'multiple_choice',
        options: ['Name', 'Price', 'Category', 'Description'],
        correctAnswer: ['Name', 'Price', 'Category'],
        points: 15,
        explanation: 'Name, Price, and Category are mandatory fields. Description is optional but recommended.'
      }
    ]
  }
];

// Sample Assignments (Training assignments for different users)
export const assignments: Partial<Assignment>[] = [
  // Employee Assignments
  {
    id: 'assignment-new-dev-orientation',
    courseId: 'course-new-employee-orientation',
    userId: 'user-frontend-developer',
    assignedBy: 'user-manager-hr',
    dueDate: new Date('2024-04-01'),
    status: AssignmentStatus.IN_PROGRESS,
    startedAt: new Date('2024-03-20'),
    progressPct: 60,
    lastActivity: new Date('2024-03-25'),
    lessonProgress: [
      {
        lessonId: 'lesson-orientation-welcome',
        completed: true,
        completedAt: new Date('2024-03-20')
      },
      {
        lessonId: 'lesson-orientation-policies',
        completed: true,
        completedAt: new Date('2024-03-22')
      },
      {
        lessonId: 'lesson-orientation-culture',
        completed: false
      }
    ]
  },
  {
    id: 'assignment-pos-training-analyst',
    courseId: 'course-pos-system-basics',
    userId: 'user-pos-analyst',
    assignedBy: 'user-manager-pos',
    dueDate: new Date('2024-03-15'),
    status: AssignmentStatus.COMPLETED,
    startedAt: new Date('2024-03-01'),
    completedAt: new Date('2024-03-12'),
    progressPct: 100,
    score: 92,
    certificate: 'https://storage.googleapis.com/mashub-assets/certificates/pos-basic-cert-001.pdf',
    lastActivity: new Date('2024-03-12'),
    lessonProgress: [
      {
        lessonId: 'lesson-pos-navigation',
        completed: true,
        completedAt: new Date('2024-03-05')
      },
      {
        lessonId: 'lesson-pos-transactions',
        completed: true,
        completedAt: new Date('2024-03-08')
      },
      {
        lessonId: 'lesson-pos-reports',
        completed: true,
        completedAt: new Date('2024-03-10')
      }
    ],
    quizAttempts: [
      {
        quizId: 'quiz-pos-basics-final',
        attemptNumber: 1,
        score: 92,
        submittedAt: new Date('2024-03-12'),
        answers: {
          'q1': 'Ctrl+D',
          'q2': 'All of the above'
        }
      }
    ]
  },
  {
    id: 'assignment-customer-service-support',
    courseId: 'course-customer-service-excellence',
    userId: 'user-support-lead',
    assignedBy: 'user-manager-support',
    dueDate: new Date('2024-04-30'),
    status: AssignmentStatus.NOT_STARTED,
    progressPct: 0
  },

  // Candidate Assignments
  {
    id: 'assignment-tech-assessment-candidate1',
    courseId: 'course-pre-hire-technical-assessment',
    candidateId: 'candidate-senior-developer',
    assignedBy: 'user-hr-recruiter',
    dueDate: new Date('2024-03-30'),
    status: AssignmentStatus.COMPLETED,
    startedAt: new Date('2024-03-15'),
    completedAt: new Date('2024-03-28'),
    progressPct: 100,
    score: 88,
    lastActivity: new Date('2024-03-28'),
    lessonProgress: [
      {
        lessonId: 'lesson-tech-programming-fundamentals',
        completed: true,
        completedAt: new Date('2024-03-20')
      },
      {
        lessonId: 'lesson-tech-problem-solving',
        completed: true,
        completedAt: new Date('2024-03-25')
      }
    ]
  },
  {
    id: 'assignment-company-overview-candidate2',
    courseId: 'course-company-overview',
    candidateId: 'candidate-marketing-specialist',
    assignedBy: 'user-hr-recruiter',
    dueDate: new Date('2024-04-05'),
    status: AssignmentStatus.IN_PROGRESS,
    startedAt: new Date('2024-03-25'),
    progressPct: 45,
    lastActivity: new Date('2024-03-26')
  },

  // Client Assignments
  {
    id: 'assignment-restaurant-training-golden-spoon',
    courseId: 'course-restaurant-pos-training',
    accountId: 'account-golden-spoon',
    assignedBy: 'user-pos-analyst',
    dueDate: new Date('2024-04-15'),
    status: AssignmentStatus.IN_PROGRESS,
    startedAt: new Date('2024-03-01'),
    progressPct: 75,
    lastActivity: new Date('2024-03-26'),
    lessonProgress: [
      {
        lessonId: 'lesson-restaurant-setup',
        completed: true,
        completedAt: new Date('2024-03-05')
      },
      {
        lessonId: 'lesson-menu-management',
        completed: true,
        completedAt: new Date('2024-03-15')
      },
      {
        lessonId: 'lesson-order-processing',
        completed: false
      }
    ],
    quizAttempts: [
      {
        quizId: 'quiz-restaurant-pos-module1',
        attemptNumber: 1,
        score: 85,
        submittedAt: new Date('2024-03-16'),
        answers: {
          'q1': 'Restaurant > Floor Plan',
          'q2': ['Name', 'Price', 'Category']
        }
      }
    ]
  },
  {
    id: 'assignment-retail-training-techstore',
    courseId: 'course-retail-pos-training',
    accountId: 'account-tech-store',
    assignedBy: 'user-pos-analyst',
    dueDate: new Date('2024-05-01'),
    status: AssignmentStatus.NOT_STARTED,
    progressPct: 0
  },
  {
    id: 'assignment-pharmacy-training-healthfirst',
    courseId: 'course-pharmacy-pos-training',
    accountId: 'account-health-first',
    assignedBy: 'user-pos-analyst',
    dueDate: new Date('2024-04-30'),
    status: AssignmentStatus.IN_PROGRESS,
    startedAt: new Date('2024-03-20'),
    progressPct: 35,
    lastActivity: new Date('2024-03-25')
  },

  // Mixed Assignments (Security Training for all)
  {
    id: 'assignment-security-all-employees-1',
    courseId: 'course-data-security-awareness',
    userId: 'user-senior-developer',
    assignedBy: 'user-ceo',
    dueDate: new Date('2024-04-15'),
    status: AssignmentStatus.COMPLETED,
    startedAt: new Date('2024-03-01'),
    completedAt: new Date('2024-03-08'),
    progressPct: 100,
    score: 95,
    certificate: 'https://storage.googleapis.com/mashub-assets/certificates/security-cert-001.pdf',
    lastActivity: new Date('2024-03-08')
  },
  {
    id: 'assignment-security-client-golden-spoon',
    courseId: 'course-data-security-awareness',
    accountId: 'account-golden-spoon',
    assignedBy: 'user-pos-analyst',
    dueDate: new Date('2024-04-20'),
    status: AssignmentStatus.IN_PROGRESS,
    startedAt: new Date('2024-03-22'),
    progressPct: 25,
    lastActivity: new Date('2024-03-24')
  }
];
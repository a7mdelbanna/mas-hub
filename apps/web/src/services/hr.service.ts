import {
  Employee,
  Candidate,
  Interview,
  LeaveRequest,
  PerformanceReview,
  OnboardingTask,
  Attendance,
  Department,
  HRStats
} from '../types/hr.types';

class HRService {
  // Employees
  async getEmployees(): Promise<Employee[]> {
    return [
      {
        id: '1',
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        position: 'Senior Software Engineer',
        department: 'Engineering',
        manager: { id: '2', name: 'Sarah Johnson' },
        status: 'active',
        startDate: new Date('2022-03-15'),
        salary: 95000,
        salaryType: 'salary',
        address: '123 Main St, San Francisco, CA 94105',
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1-555-0124',
          relationship: 'Spouse'
        },
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        certifications: [
          {
            id: '1',
            name: 'AWS Solutions Architect',
            issuer: 'Amazon',
            issuedDate: new Date('2023-06-15'),
            expiryDate: new Date('2026-06-15'),
            credentialId: 'AWS-12345'
          }
        ],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        createdAt: new Date('2022-03-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        employeeId: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1-555-0125',
        position: 'Engineering Manager',
        department: 'Engineering',
        status: 'active',
        startDate: new Date('2021-01-10'),
        salary: 120000,
        salaryType: 'salary',
        skills: ['Leadership', 'Project Management', 'React', 'Python'],
        certifications: [],
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        createdAt: new Date('2021-01-10'),
        updatedAt: new Date()
      },
      {
        id: '3',
        employeeId: 'EMP003',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@company.com',
        position: 'Product Designer',
        department: 'Design',
        status: 'active',
        startDate: new Date('2022-08-01'),
        salary: 85000,
        salaryType: 'salary',
        skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'User Research'],
        certifications: [],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        createdAt: new Date('2022-08-01'),
        updatedAt: new Date()
      }
    ];
  }

  async getEmployee(id: string): Promise<Employee | null> {
    const employees = await this.getEmployees();
    return employees.find(emp => emp.id === id) || null;
  }

  // Candidates
  async getCandidates(): Promise<Candidate[]> {
    return [
      {
        id: '1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@email.com',
        phone: '+1-555-0200',
        position: 'Frontend Developer',
        department: 'Engineering',
        status: 'interview',
        stage: 'Technical Interview',
        source: 'LinkedIn',
        expectedSalary: 75000,
        availableFrom: new Date('2024-11-01'),
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        experience: 3,
        education: [
          {
            id: '1',
            institution: 'UC Berkeley',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: new Date('2018-09-01'),
            endDate: new Date('2022-05-15'),
            gpa: 3.7
          }
        ],
        interviews: [
          {
            id: '1',
            candidateId: '1',
            candidateName: 'Alice Smith',
            type: 'phone',
            status: 'completed',
            scheduledDate: new Date('2024-09-20T10:00:00'),
            duration: 30,
            interviewers: [{ id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com' }],
            feedback: [
              {
                interviewerId: '2',
                interviewerName: 'Sarah Johnson',
                rating: 4,
                feedback: 'Strong technical background, good communication skills',
                recommendation: 'hire',
                submittedAt: new Date('2024-09-20T15:00:00')
              }
            ],
            createdAt: new Date('2024-09-18'),
            updatedAt: new Date('2024-09-20')
          }
        ],
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date()
      },
      {
        id: '2',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        position: 'UX Designer',
        department: 'Design',
        status: 'screening',
        stage: 'Initial Screening',
        source: 'Company Website',
        expectedSalary: 70000,
        skills: ['Figma', 'User Research', 'Prototyping'],
        experience: 2,
        education: [],
        interviews: [],
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date()
      }
    ];
  }

  // Interviews
  async getInterviews(): Promise<Interview[]> {
    return [
      {
        id: '1',
        candidateId: '1',
        candidateName: 'Alice Smith',
        type: 'technical',
        status: 'scheduled',
        scheduledDate: new Date('2024-09-28T14:00:00'),
        duration: 90,
        interviewers: [
          { id: '1', name: 'John Doe', email: 'john.doe@company.com' },
          { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com' }
        ],
        meetingUrl: 'https://zoom.us/j/123456789',
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date()
      },
      {
        id: '2',
        candidateId: '2',
        candidateName: 'David Wilson',
        type: 'phone',
        status: 'scheduled',
        scheduledDate: new Date('2024-09-30T10:00:00'),
        duration: 30,
        interviewers: [{ id: '3', name: 'Michael Chen', email: 'michael.chen@company.com' }],
        createdAt: new Date('2024-09-25'),
        updatedAt: new Date()
      }
    ];
  }

  // Leave Requests
  async getLeaveRequests(): Promise<LeaveRequest[]> {
    return [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'John Doe',
        type: 'vacation',
        status: 'pending',
        startDate: new Date('2024-10-15'),
        endDate: new Date('2024-10-19'),
        days: 5,
        reason: 'Family vacation to Hawaii',
        createdAt: new Date('2024-09-20'),
        updatedAt: new Date()
      },
      {
        id: '2',
        employeeId: '3',
        employeeName: 'Michael Chen',
        type: 'sick',
        status: 'approved',
        startDate: new Date('2024-09-25'),
        endDate: new Date('2024-09-26'),
        days: 2,
        reason: 'Medical appointment',
        approver: { id: '2', name: 'Sarah Johnson' },
        approvedAt: new Date('2024-09-24'),
        createdAt: new Date('2024-09-23'),
        updatedAt: new Date('2024-09-24')
      }
    ];
  }

  // Performance Reviews
  async getPerformanceReviews(): Promise<PerformanceReview[]> {
    return [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'John Doe',
        reviewPeriod: {
          start: new Date('2024-01-01'),
          end: new Date('2024-06-30')
        },
        type: 'quarterly',
        status: 'completed',
        reviewer: { id: '2', name: 'Sarah Johnson' },
        overallRating: 4,
        goals: [
          {
            id: '1',
            goal: 'Complete React migration project',
            achievement: 'Successfully migrated 15 components with improved performance',
            rating: 5
          },
          {
            id: '2',
            goal: 'Mentor junior developers',
            achievement: 'Mentored 2 junior developers, both showed significant improvement',
            rating: 4
          }
        ],
        competencies: [
          { id: '1', name: 'Technical Skills', description: 'Programming and technical expertise', rating: 5 },
          { id: '2', name: 'Communication', description: 'Verbal and written communication', rating: 4 },
          { id: '3', name: 'Teamwork', description: 'Collaboration and team spirit', rating: 4 }
        ],
        feedback: 'John has been an exceptional performer this quarter. His technical skills continue to improve and his mentoring abilities are outstanding.',
        development: 'Focus on leadership skills for potential team lead role next year.',
        nextReviewDate: new Date('2024-12-31'),
        createdAt: new Date('2024-07-01'),
        updatedAt: new Date('2024-07-15')
      }
    ];
  }

  // Onboarding Tasks
  async getOnboardingTasks(): Promise<OnboardingTask[]> {
    return [
      {
        id: '1',
        employeeId: '4',
        employeeName: 'New Employee',
        title: 'Complete I-9 Form',
        description: 'Fill out employment eligibility verification form',
        category: 'paperwork',
        status: 'pending',
        assignee: { id: 'hr1', name: 'HR Department' },
        dueDate: new Date('2024-10-01'),
        order: 1,
        createdAt: new Date('2024-09-26'),
        updatedAt: new Date()
      },
      {
        id: '2',
        employeeId: '4',
        employeeName: 'New Employee',
        title: 'Setup Laptop and Accounts',
        description: 'Configure laptop, email, and system access',
        category: 'equipment',
        status: 'pending',
        assignee: { id: 'it1', name: 'IT Department' },
        dueDate: new Date('2024-10-01'),
        order: 2,
        createdAt: new Date('2024-09-26'),
        updatedAt: new Date()
      }
    ];
  }

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    const today = new Date();
    return [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'John Doe',
        date: today,
        checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
        checkOut: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 17, 30),
        breakTime: 60,
        totalHours: 7.5,
        status: 'present',
        location: 'Office',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Sarah Johnson',
        date: today,
        checkIn: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30),
        status: 'present',
        location: 'Remote',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return [
      {
        id: '1',
        name: 'Engineering',
        description: 'Software development and technical operations',
        manager: { id: '2', name: 'Sarah Johnson' },
        employeeCount: 15,
        budget: 2500000,
        location: 'Floor 3',
        isActive: true,
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Design',
        description: 'Product design and user experience',
        manager: { id: '3', name: 'Michael Chen' },
        employeeCount: 5,
        budget: 750000,
        location: 'Floor 2',
        isActive: true,
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Sales',
        description: 'Sales and business development',
        manager: { id: '5', name: 'Lisa Martinez' },
        employeeCount: 8,
        budget: 1200000,
        location: 'Floor 1',
        isActive: true,
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date()
      }
    ];
  }

  // HR Statistics
  async getHRStats(): Promise<HRStats> {
    return {
      totalEmployees: 28,
      activeEmployees: 26,
      newHires: 3,
      departures: 1,
      openPositions: 5,
      pendingLeaveRequests: 4,
      upcomingReviews: 7,
      upcomingInterviews: 3,
      averageTenure: 2.5,
      turnoverRate: 8.5,
      employeesByDepartment: [
        { department: 'Engineering', count: 15 },
        { department: 'Sales', count: 8 },
        { department: 'Design', count: 5 }
      ],
      leavesByType: [
        { type: 'Vacation', count: 12 },
        { type: 'Sick', count: 5 },
        { type: 'Personal', count: 3 }
      ]
    };
  }

  // CRUD operations
  async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newEmployee;
  }

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const employee = await this.getEmployee(id);
    if (!employee) throw new Error('Employee not found');

    return {
      ...employee,
      ...updates,
      updatedAt: new Date()
    };
  }

  async deleteEmployee(id: string): Promise<void> {
    // Mock implementation
    console.log(`Employee ${id} deleted`);
  }

  async approveLeaveRequest(id: string, approverId: string): Promise<LeaveRequest> {
    const requests = await this.getLeaveRequests();
    const request = requests.find(r => r.id === id);
    if (!request) throw new Error('Leave request not found');

    return {
      ...request,
      status: 'approved',
      approver: { id: approverId, name: 'Manager' },
      approvedAt: new Date(),
      updatedAt: new Date()
    };
  }

  async scheduleInterview(interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interview> {
    const newInterview: Interview = {
      ...interview,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return newInterview;
  }
}

export const hrService = new HRService();
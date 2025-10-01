export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  manager?: {
    id: string;
    name: string;
  };
  status: 'active' | 'inactive' | 'terminated' | 'on-leave';
  startDate: Date;
  endDate?: Date;
  salary: number;
  salaryType: 'hourly' | 'salary' | 'contract';
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  skills: string[];
  certifications: Certification[];
  avatar?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  stage: string;
  source: string;
  resumeUrl?: string;
  coverLetterUrl?: string;
  expectedSalary?: number;
  availableFrom?: Date;
  skills: string[];
  experience: number; // years
  education: Education[];
  interviews: Interview[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  type: 'phone' | 'video' | 'in-person' | 'technical' | 'panel';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  scheduledDate: Date;
  duration: number; // minutes
  interviewers: {
    id: string;
    name: string;
    email: string;
  }[];
  location?: string;
  meetingUrl?: string;
  feedback?: InterviewFeedback[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewFeedback {
  interviewerId: string;
  interviewerName: string;
  rating: number; // 1-5
  feedback: string;
  recommendation: 'hire' | 'reject' | 'neutral';
  submittedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'unpaid';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  startDate: Date;
  endDate: Date;
  days: number;
  reason?: string;
  approver?: {
    id: string;
    name: string;
  };
  approvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: {
    start: Date;
    end: Date;
  };
  type: 'annual' | 'quarterly' | 'probation' | 'project';
  status: 'draft' | 'in-progress' | 'completed' | 'approved';
  reviewer: {
    id: string;
    name: string;
  };
  overallRating: number; // 1-5
  goals: ReviewGoal[];
  competencies: ReviewCompetency[];
  feedback: string;
  development: string;
  nextReviewDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewGoal {
  id: string;
  goal: string;
  achievement: string;
  rating: number; // 1-5
}

export interface ReviewCompetency {
  id: string;
  name: string;
  description: string;
  rating: number; // 1-5
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  description: string;
  category: 'paperwork' | 'training' | 'equipment' | 'access' | 'introduction';
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  assignee?: {
    id: string;
    name: string;
  };
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  breakTime?: number; // minutes
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'remote';
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager: {
    id: string;
    name: string;
  };
  employeeCount: number;
  budget?: number;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  gpa?: number;
  honors?: string;
}

export interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  departures: number;
  openPositions: number;
  pendingLeaveRequests: number;
  upcomingReviews: number;
  upcomingInterviews: number;
  averageTenure: number;
  turnoverRate: number;
  employeesByDepartment: {
    department: string;
    count: number;
  }[];
  leavesByType: {
    type: string;
    count: number;
  }[];
}
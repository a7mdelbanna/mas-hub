import { Candidate, Interview, OnboardingTemplate, OnboardingTask, CandidateStage } from '../src/types/models';

export const candidates: Partial<Candidate>[] = [
  // Applied Candidates (Recent Applications)
  {
    id: 'candidate-junior-developer-1',
    name: 'Youssef Ahmed',
    email: 'youssef.ahmed@email.com',
    phoneNumber: '+20-10-1111-2222',
    stage: CandidateStage.APPLIED,
    position: 'Junior Frontend Developer',
    department: 'Technology & Development',
    source: 'LinkedIn',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/youssef-ahmed-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/youssef-ahmed-dev',
    githubUrl: 'https://github.com/youssefdev',
    expectedSalary: 8000,
    noticePeriod: 30,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
    experience: 1,
    notes: 'Fresh graduate with good React portfolio projects',
    customFields: {
      university: 'Cairo University',
      graduationYear: 2023,
      gpa: 3.7
    }
  },
  {
    id: 'candidate-marketing-specialist-1',
    name: 'Nour Hassan',
    email: 'nour.hassan@email.com',
    phoneNumber: '+20-10-2222-3333',
    stage: CandidateStage.APPLIED,
    position: 'Digital Marketing Specialist',
    department: 'Marketing & Sales',
    source: 'Company Website',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/nour-hassan-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/nour-hassan-marketing',
    expectedSalary: 9500,
    noticePeriod: 45,
    skills: ['Digital Marketing', 'SEO', 'Google Ads', 'Social Media', 'Analytics'],
    experience: 2,
    notes: 'Strong background in digital marketing with Google certifications',
    customFields: {
      certifications: ['Google Ads', 'Google Analytics', 'HubSpot'],
      portfolioUrl: 'https://nourmarketing.portfolio.com'
    }
  },
  {
    id: 'candidate-support-engineer-1',
    name: 'Ahmed Mahmoud',
    email: 'ahmed.mahmoud@email.com',
    phoneNumber: '+20-10-3333-4444',
    stage: CandidateStage.APPLIED,
    position: 'Technical Support Engineer',
    department: 'IT Support & Services',
    source: 'Employee Referral',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/ahmed-mahmoud-cv.pdf',
    expectedSalary: 7500,
    noticePeriod: 14,
    skills: ['Windows Server', 'Linux', 'Network Troubleshooting', 'Hardware', 'Customer Service'],
    experience: 3,
    referredBy: 'user-support-tech',
    notes: 'Referred by current employee, has good technical support experience',
    customFields: {
      currentCompany: 'TechSupport Solutions',
      reasonForLeaving: 'Career Growth'
    }
  },

  // Shortlisted Candidates
  {
    id: 'candidate-senior-developer',
    name: 'Layla Abdel-Rahman',
    email: 'layla.abdel.rahman@email.com',
    phoneNumber: '+20-10-4444-5555',
    stage: CandidateStage.SHORTLIST,
    position: 'Senior Full-Stack Developer',
    department: 'Technology & Development',
    source: 'Tech Recruiter',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/layla-abdel-rahman-cv.pdf',
    portfolioUrl: 'https://layladev.portfolio.com',
    linkedinUrl: 'https://linkedin.com/in/layla-abdel-rahman',
    githubUrl: 'https://github.com/layladev',
    expectedSalary: 18000,
    noticePeriod: 60,
    skills: ['React', 'Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Microservices'],
    experience: 5,
    notes: 'Excellent technical background with microservices experience. Perfect fit for our architecture.',
    customFields: {
      currentCompany: 'Fintech Startup',
      currentSalary: 16000,
      awsCertifications: ['Solutions Architect', 'Developer Associate']
    }
  },
  {
    id: 'candidate-pos-specialist',
    name: 'Omar El-Shazly',
    email: 'omar.elshazly@email.com',
    phoneNumber: '+20-10-5555-6666',
    stage: CandidateStage.SHORTLIST,
    position: 'POS Systems Specialist',
    department: 'POS Systems',
    source: 'Industry Contact',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/omar-elshazly-cv.pdf',
    expectedSalary: 12000,
    noticePeriod: 30,
    skills: ['POS Systems', 'Retail Operations', 'SQL', 'System Integration', 'Training'],
    experience: 4,
    notes: 'Specialized POS experience with multiple retail chains. Strong training capabilities.',
    customFields: {
      posSystemsExperience: ['Square', 'Toast', 'Clover', 'Custom Systems'],
      industryExperience: ['Retail', 'Restaurant', 'Healthcare']
    }
  },

  // Invited for Assessment/Training
  {
    id: 'candidate-mobile-developer-invited',
    name: 'Mariam Farouk',
    email: 'mariam.farouk@email.com',
    phoneNumber: '+20-10-6666-7777',
    stage: CandidateStage.INVITED,
    position: 'Mobile App Developer',
    department: 'Technology & Development',
    source: 'GitHub',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/mariam-farouk-cv.pdf',
    portfolioUrl: 'https://mariamapps.com',
    githubUrl: 'https://github.com/mariamapps',
    expectedSalary: 15000,
    noticePeriod: 45,
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'RESTful APIs'],
    experience: 3,
    notes: 'Strong mobile development portfolio. Invited for technical assessment.',
    customFields: {
      mobileAppsPublished: 8,
      appStoreRating: 4.6,
      preferredTech: 'React Native'
    }
  },
  {
    id: 'candidate-hr-coordinator',
    name: 'Heba Mostafa',
    email: 'heba.mostafa@email.com',
    phoneNumber: '+20-10-7777-8888',
    stage: CandidateStage.INVITED,
    position: 'HR Coordinator',
    department: 'Human Resources',
    source: 'Job Board',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/heba-mostafa-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/heba-mostafa-hr',
    expectedSalary: 8500,
    noticePeriod: 30,
    skills: ['Recruitment', 'Employee Relations', 'HRIS', 'Training Coordination', 'Performance Management'],
    experience: 2,
    notes: 'Good HR generalist background. Invited for competency assessment.',
    customFields: {
      hrCertifications: ['SHRM-CP', 'PHR'],
      languageSkills: ['Arabic (Native)', 'English (Fluent)', 'French (Basic)']
    }
  },

  // In Training Phase
  {
    id: 'candidate-sales-rep-training',
    name: 'Karim El-Wakil',
    email: 'karim.elwakil@email.com',
    phoneNumber: '+20-10-8888-9999',
    stage: CandidateStage.TRAINING,
    position: 'Sales Representative',
    department: 'Marketing & Sales',
    source: 'University Career Fair',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/karim-elwakil-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/karim-elwakil',
    expectedSalary: 10000,
    noticePeriod: 14,
    skills: ['Sales', 'Communication', 'Presentation', 'CRM', 'Negotiation'],
    experience: 1,
    portalInviteId: 'invite-candidate-001',
    notes: 'Enthusiastic candidate with natural sales ability. Currently completing pre-hire training.',
    customFields: {
      university: 'American University in Cairo',
      major: 'Business Administration',
      salesTrainingProgress: 75
    }
  },
  {
    id: 'candidate-accountant-training',
    name: 'Sara Zaki',
    email: 'sara.zaki@email.com',
    phoneNumber: '+20-10-9999-0000',
    stage: CandidateStage.TRAINING,
    position: 'Junior Accountant',
    department: 'Finance & Accounting',
    source: 'Professional Network',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/sara-zaki-cv.pdf',
    expectedSalary: 7000,
    noticePeriod: 30,
    skills: ['Accounting', 'Excel', 'QuickBooks', 'Financial Reporting', 'Tax Preparation'],
    experience: 1,
    portalInviteId: 'invite-candidate-002',
    notes: 'CPA candidate with strong accounting fundamentals. Completing company systems training.',
    customFields: {
      certifications: ['CPA Candidate', 'Excel Expert'],
      accountingSoftware: ['QuickBooks', 'SAP', 'Excel']
    }
  },

  // Interview Scheduled
  {
    id: 'candidate-project-manager-interview',
    name: 'Mohamed Hosny',
    email: 'mohamed.hosny@email.com',
    phoneNumber: '+20-10-0000-1111',
    stage: CandidateStage.INTERVIEW,
    position: 'Project Manager',
    department: 'Technology & Development',
    source: 'LinkedIn',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/mohamed-hosny-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/mohamed-hosny-pm',
    expectedSalary: 16000,
    noticePeriod: 60,
    skills: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Risk Management', 'Team Leadership'],
    experience: 6,
    notes: 'Experienced PM with tech project background. Final interview scheduled.',
    customFields: {
      pmCertifications: ['PMP', 'Scrum Master', 'Agile Coach'],
      projectsManaged: 25,
      teamSizeManaged: 12
    }
  },
  {
    id: 'candidate-designer-interview',
    name: 'Yasmin Nader',
    email: 'yasmin.nader@email.com',
    phoneNumber: '+20-10-1111-0000',
    stage: CandidateStage.INTERVIEW,
    position: 'UI/UX Designer',
    department: 'Technology & Development',
    source: 'Behance',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/yasmin-nader-cv.pdf',
    portfolioUrl: 'https://yasmindesigns.behance.net',
    expectedSalary: 12000,
    noticePeriod: 30,
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Testing'],
    experience: 3,
    notes: 'Impressive design portfolio with mobile app experience. Technical interview pending.',
    customFields: {
      designTools: ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator'],
      specialization: 'Mobile App Design'
    }
  },

  // Offer Extended
  {
    id: 'candidate-devops-offer',
    name: 'Ali Rashid',
    email: 'ali.rashid@email.com',
    phoneNumber: '+20-10-2222-1111',
    stage: CandidateStage.OFFER,
    position: 'DevOps Engineer',
    department: 'Technology & Development',
    source: 'Tech Conference',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/ali-rashid-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/ali-rashid-devops',
    githubUrl: 'https://github.com/alidevops',
    expectedSalary: 20000,
    noticePeriod: 90,
    skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Monitoring', 'Linux'],
    experience: 4,
    notes: 'Excellent DevOps engineer. Offer extended pending salary negotiation.',
    customFields: {
      currentSalary: 18000,
      offerAmount: 19500,
      startDatePreference: '2024-05-01',
      awsCertifications: ['Solutions Architect Professional', 'DevOps Professional']
    }
  },
  {
    id: 'candidate-finance-manager-offer',
    name: 'Dina Salama',
    email: 'dina.salama@email.com',
    phoneNumber: '+20-10-3333-2222',
    stage: CandidateStage.OFFER,
    position: 'Senior Finance Manager',
    department: 'Finance & Accounting',
    source: 'Executive Search',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/dina-salama-cv.pdf',
    linkedinUrl: 'https://linkedin.com/in/dina-salama-finance',
    expectedSalary: 25000,
    noticePeriod: 90,
    skills: ['Financial Planning', 'Budget Management', 'ERP Systems', 'Team Leadership', 'Compliance'],
    experience: 8,
    notes: 'Senior finance professional with ERP implementation experience. Offer accepted.',
    customFields: {
      currentPosition: 'Finance Director',
      managementExperience: 5,
      erpSystems: ['SAP', 'Oracle', 'NetSuite'],
      cpaStatus: 'Active'
    }
  },

  // Recently Hired
  {
    id: 'candidate-data-analyst-hired',
    name: 'Mahmoud Gamal',
    email: 'mahmoud.gamal@email.com',
    phoneNumber: '+20-10-4444-3333',
    stage: CandidateStage.HIRED,
    position: 'Data Analyst',
    department: 'Technology & Development',
    source: 'University Partnership',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/mahmoud-gamal-cv.pdf',
    expectedSalary: 9000,
    noticePeriod: 0,
    skills: ['SQL', 'Python', 'Data Visualization', 'Statistics', 'Machine Learning', 'Excel'],
    experience: 1,
    notes: 'Fresh graduate hired for data analyst role. Starting next month.',
    customFields: {
      university: 'Cairo University',
      degree: 'Computer Science',
      startDate: '2024-04-01',
      onboardingStatus: 'Pending'
    }
  },

  // Rejected Candidates
  {
    id: 'candidate-rejected-experience',
    name: 'Tamer Ibrahim',
    email: 'tamer.ibrahim@email.com',
    phoneNumber: '+20-10-5555-4444',
    stage: CandidateStage.REJECTED,
    position: 'Senior Backend Developer',
    department: 'Technology & Development',
    source: 'Job Board',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/tamer-ibrahim-cv.pdf',
    expectedSalary: 22000,
    skills: ['Java', 'Spring Boot', 'MySQL', 'Microservices'],
    experience: 2,
    notes: 'Technical skills good but not enough experience for senior role. Recommended to apply for mid-level position in 1-2 years.',
    customFields: {
      rejectionReason: 'Insufficient experience for senior level',
      feedback: 'Strong technical foundation, encourage to reapply for mid-level role',
      interviewScore: 6.5
    }
  },
  {
    id: 'candidate-rejected-culture-fit',
    name: 'Rania Magdy',
    email: 'rania.magdy@email.com',
    phoneNumber: '+20-10-6666-5555',
    stage: CandidateStage.REJECTED,
    position: 'Customer Success Manager',
    department: 'Marketing & Sales',
    source: 'LinkedIn',
    cvUrl: 'https://storage.googleapis.com/mashub-assets/cvs/rania-magdy-cv.pdf',
    expectedSalary: 14000,
    skills: ['Customer Relations', 'Account Management', 'CRM', 'Communication'],
    experience: 4,
    notes: 'Good experience but communication style did not align with our customer-first culture.',
    customFields: {
      rejectionReason: 'Culture fit concerns',
      interviewFeedback: 'Technical competent but communication approach too aggressive'
    }
  }
];

// Interview records for candidates
export const interviews: Partial<Interview>[] = [
  // Completed interviews
  {
    id: 'interview-layla-technical',
    candidateId: 'candidate-senior-developer',
    type: 'technical',
    scheduledAt: new Date('2024-03-15T10:00:00Z'),
    duration: 90,
    interviewers: ['user-manager-tech', 'user-senior-developer'],
    location: 'Conference Room A',
    status: 'completed',
    result: 'pass',
    feedback: 'Excellent technical knowledge. Strong problem-solving skills. Great communication. Recommended for offer.',
    rating: 5,
    notes: 'Candidate demonstrated deep understanding of microservices architecture and provided excellent solutions to coding challenges.'
  },
  {
    id: 'interview-omar-pos-specialist',
    candidateId: 'candidate-pos-specialist',
    type: 'technical',
    scheduledAt: new Date('2024-03-18T14:00:00Z'),
    duration: 60,
    interviewers: ['user-manager-pos', 'user-pos-analyst'],
    location: 'POS Demo Room',
    status: 'completed',
    result: 'pass',
    feedback: 'Solid POS experience across multiple platforms. Good understanding of retail operations. Advance to next round.',
    rating: 4,
    notes: 'Hands-on demonstration with our POS system showed quick learning ability and system intuition.'
  },
  {
    id: 'interview-mohamed-pm-final',
    candidateId: 'candidate-project-manager-interview',
    type: 'final',
    scheduledAt: new Date('2024-03-20T09:00:00Z'),
    duration: 60,
    interviewers: ['user-ceo', 'user-manager-tech'],
    location: 'Executive Conference Room',
    status: 'completed',
    result: 'pass',
    feedback: 'Strong leadership qualities. Good cultural fit. Ready for offer discussion.',
    rating: 4,
    notes: 'Impressed with project portfolio and leadership approach. Salary expectations align with budget.'
  },
  {
    id: 'interview-ali-devops-technical',
    candidateId: 'candidate-devops-offer',
    type: 'technical',
    scheduledAt: new Date('2024-03-12T11:00:00Z'),
    duration: 120,
    interviewers: ['user-manager-tech', 'user-senior-developer'],
    location: 'Technical Lab',
    status: 'completed',
    result: 'pass',
    feedback: 'Outstanding DevOps knowledge. AWS expertise exactly what we need. Highly recommended.',
    rating: 5,
    notes: 'Live demonstration of CI/CD pipeline setup was impressive. Infrastructure as Code knowledge excellent.'
  },

  // Scheduled upcoming interviews
  {
    id: 'interview-yasmin-designer-portfolio',
    candidateId: 'candidate-designer-interview',
    type: 'technical',
    scheduledAt: new Date('2024-03-28T15:00:00Z'),
    duration: 90,
    interviewers: ['user-frontend-developer', 'user-manager-tech'],
    location: 'Design Studio',
    status: 'scheduled',
    notes: 'Portfolio review and design challenge. Focus on mobile app design process.'
  },
  {
    id: 'interview-mariam-mobile-assessment',
    candidateId: 'candidate-mobile-developer-invited',
    type: 'technical',
    scheduledAt: new Date('2024-03-30T10:00:00Z'),
    duration: 120,
    interviewers: ['user-mobile-developer', 'user-senior-developer'],
    location: 'Technical Lab',
    meetingUrl: 'https://meet.mas.business/mobile-dev-interview',
    status: 'scheduled',
    notes: 'Technical assessment including live coding and architecture discussion.'
  },
  {
    id: 'interview-heba-hr-competency',
    candidateId: 'candidate-hr-coordinator',
    type: 'hr',
    scheduledAt: new Date('2024-04-02T13:00:00Z'),
    duration: 75,
    interviewers: ['user-manager-hr', 'user-hr-recruiter'],
    location: 'HR Office',
    status: 'scheduled',
    notes: 'HR competency assessment and culture fit evaluation.'
  },

  // Cancelled/No-show interviews
  {
    id: 'interview-cancelled-example',
    candidateId: 'candidate-rejected-culture-fit',
    type: 'hr',
    scheduledAt: new Date('2024-03-10T16:00:00Z'),
    duration: 60,
    interviewers: ['user-manager-marketing'],
    location: 'Conference Room B',
    status: 'completed',
    result: 'fail',
    feedback: 'Communication style not aligned with our customer service approach. Aggressive tone during role-play scenarios.',
    rating: 2,
    notes: 'Technical competency adequate but interpersonal skills concern for customer-facing role.'
  }
];

// Onboarding templates for different roles
export const onboardingTemplates: Partial<OnboardingTemplate>[] = [
  {
    id: 'template-developer-onboarding',
    name: 'Developer Onboarding',
    department: 'Technology & Development',
    tasks: [
      {
        title: 'IT Equipment Setup',
        description: 'Receive and setup laptop, development environment, and necessary software',
        category: 'equipment',
        assigneeRole: 'IT Support',
        daysFromStart: 0,
        required: true
      },
      {
        title: 'Company Orientation Training',
        description: 'Complete new employee orientation course',
        category: 'training',
        daysFromStart: 1,
        required: true
      },
      {
        title: 'Development Environment Setup',
        description: 'Setup development tools, IDE, and access to code repositories',
        category: 'access',
        assigneeRole: 'Tech Lead',
        daysFromStart: 1,
        required: true
      },
      {
        title: 'Meet the Team',
        description: 'Introduction meetings with team members and stakeholders',
        category: 'meeting',
        daysFromStart: 2,
        required: true
      },
      {
        title: 'Project Assignment',
        description: 'Assignment to first project and task briefing',
        category: 'documentation',
        assigneeRole: 'Project Manager',
        daysFromStart: 3,
        required: true
      },
      {
        title: '30-Day Check-in',
        description: 'Performance and adjustment check-in with manager',
        category: 'meeting',
        assigneeRole: 'Manager',
        daysFromStart: 30,
        required: true
      }
    ],
    active: true
  },
  {
    id: 'template-sales-onboarding',
    name: 'Sales Representative Onboarding',
    department: 'Marketing & Sales',
    tasks: [
      {
        title: 'Sales Training Program',
        description: 'Complete comprehensive sales training course',
        category: 'training',
        daysFromStart: 0,
        required: true
      },
      {
        title: 'CRM System Training',
        description: 'Training on CRM system and sales processes',
        category: 'training',
        assigneeRole: 'Sales Manager',
        daysFromStart: 2,
        required: true
      },
      {
        title: 'Product Knowledge Training',
        description: 'Deep dive into all products and services offered',
        category: 'training',
        daysFromStart: 3,
        required: true
      },
      {
        title: 'Shadow Senior Sales Rep',
        description: 'Shadow experienced sales representative for client meetings',
        category: 'training',
        assigneeRole: 'Senior Sales Rep',
        daysFromStart: 7,
        required: true
      },
      {
        title: 'First Client Assignment',
        description: 'Assignment of first set of prospects/accounts',
        category: 'documentation',
        assigneeRole: 'Sales Manager',
        daysFromStart: 14,
        required: true
      }
    ],
    active: true
  },
  {
    id: 'template-support-onboarding',
    name: 'Support Engineer Onboarding',
    department: 'IT Support & Services',
    tasks: [
      {
        title: 'Technical Systems Overview',
        description: 'Overview of all supported systems and technologies',
        category: 'training',
        assigneeRole: 'Support Lead',
        daysFromStart: 0,
        required: true
      },
      {
        title: 'Ticketing System Training',
        description: 'Training on support ticketing system and processes',
        category: 'training',
        daysFromStart: 1,
        required: true
      },
      {
        title: 'Customer Service Training',
        description: 'Customer service excellence training program',
        category: 'training',
        daysFromStart: 2,
        required: true
      },
      {
        title: 'Shadow Support Calls',
        description: 'Observe senior engineer handling support calls',
        category: 'training',
        assigneeRole: 'Senior Support Engineer',
        daysFromStart: 5,
        required: true
      },
      {
        title: 'First Solo Ticket Assignment',
        description: 'Assignment of first independent support tickets',
        category: 'documentation',
        assigneeRole: 'Support Manager',
        daysFromStart: 10,
        required: true
      }
    ],
    active: true
  }
];

// Sample onboarding tasks for recently hired employee
export const onboardingTasks: Partial<OnboardingTask>[] = [
  // Tasks for newly hired data analyst
  {
    id: 'task-mahmoud-equipment',
    userId: 'candidate-data-analyst-hired', // Will become regular user ID after hire
    templateId: 'template-developer-onboarding',
    title: 'IT Equipment Setup',
    description: 'Receive and setup laptop, development environment, and necessary software',
    category: 'equipment',
    assigneeId: 'user-support-tech',
    dueDate: new Date('2024-04-01'),
    status: 'pending'
  },
  {
    id: 'task-mahmoud-orientation',
    userId: 'candidate-data-analyst-hired',
    templateId: 'template-developer-onboarding',
    title: 'Company Orientation Training',
    description: 'Complete new employee orientation course',
    category: 'training',
    dueDate: new Date('2024-04-02'),
    status: 'pending'
  },
  {
    id: 'task-mahmoud-dev-environment',
    userId: 'candidate-data-analyst-hired',
    templateId: 'template-developer-onboarding',
    title: 'Development Environment Setup',
    description: 'Setup data analysis tools, Python environment, and database access',
    category: 'access',
    assigneeId: 'user-senior-developer',
    dueDate: new Date('2024-04-02'),
    status: 'pending',
    notes: 'Focus on Python, Jupyter, and database access setup'
  },
  {
    id: 'task-mahmoud-team-meeting',
    userId: 'candidate-data-analyst-hired',
    templateId: 'template-developer-onboarding',
    title: 'Meet the Team',
    description: 'Introduction meetings with development team and stakeholders',
    category: 'meeting',
    dueDate: new Date('2024-04-03'),
    status: 'pending'
  }
];
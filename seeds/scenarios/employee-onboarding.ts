/**
 * Demo Scenario: Employee Onboarding Journey
 *
 * This scenario demonstrates the complete journey from candidate
 * to fully onboarded employee using the Data Analyst hire as an example.
 */

export const employeeOnboardingScenario = {
  name: 'Complete Employee Onboarding - Data Analyst',
  description: 'End-to-end journey from candidate screening to productive team member',
  duration: '6 weeks (2 weeks recruitment + 4 weeks onboarding)',

  // Key personas involved
  personas: {
    candidate: {
      id: 'candidate-data-analyst-hired',
      name: 'Mahmoud Gamal',
      background: 'Fresh graduate, Computer Science, Cairo University'
    },
    hrRecruiter: {
      id: 'user-hr-recruiter',
      name: 'Eman Adel',
      role: 'HR Recruiter'
    },
    hiringManager: {
      id: 'user-manager-tech',
      name: 'Omar Hassan',
      role: 'Technology Director'
    },
    buddy: {
      id: 'user-senior-developer',
      name: 'Hossam Abdel-Rahman',
      role: 'Senior Developer (assigned as buddy)'
    }
  },

  // Complete journey phases
  phases: [
    {
      name: 'Candidate Screening',
      duration: '1 week',
      description: 'Initial application review and screening',
      activities: [
        {
          day: 1,
          actor: 'HR Recruiter',
          action: 'Reviews application from university job fair',
          data: {
            applicationSource: 'University Career Fair - Cairo University',
            initialImpression: 'Strong academic background, relevant projects',
            nextStep: 'Phone screening scheduled'
          }
        },
        {
          day: 2,
          actor: 'HR Recruiter',
          action: 'Conducts phone screening',
          data: {
            duration: '30 minutes',
            assessedAreas: [
              'Communication skills',
              'Career motivation',
              'Cultural fit indicators',
              'Salary expectations'
            ],
            outcome: 'Passed - proceed to technical assessment'
          }
        },
        {
          day: 4,
          actor: 'System',
          action: 'Sends candidate portal invitation',
          data: {
            portalAccess: 'Pre-hire training and assessment platform',
            assignedCourses: [
              'Technical Skills Assessment',
              'Company Overview'
            ],
            deadline: '7 days to complete'
          }
        }
      ]
    },

    {
      name: 'Technical Assessment',
      duration: '1 week',
      description: 'Skills evaluation and final interview',
      activities: [
        {
          day: 7,
          actor: 'Candidate',
          action: 'Completes online technical assessment',
          data: {
            assessmentAreas: [
              'SQL queries and database design',
              'Python programming basics',
              'Data visualization concepts',
              'Statistical analysis fundamentals'
            ],
            score: '88%',
            timeSpent: '2.5 hours'
          }
        },
        {
          day: 9,
          actor: 'Hiring Manager',
          action: 'Conducts final interview',
          data: {
            interviewType: 'Technical + Cultural Fit',
            duration: '90 minutes',
            areas_covered: [
              'Portfolio review',
              'Problem-solving approach',
              'Team collaboration preferences',
              'Career goals alignment'
            ],
            decision: 'Hire - good technical foundation and cultural fit'
          }
        },
        {
          day: 10,
          actor: 'HR Recruiter',
          action: 'Extends job offer',
          data: {
            position: 'Data Analyst',
            salary: '$9,000/month',
            benefits: 'Standard package + training allowance',
            startDate: '2024-04-01',
            acceptanceDeadline: '2024-03-25'
          }
        }
      ]
    },

    {
      name: 'Pre-boarding Preparation',
      duration: '1 week',
      description: 'Preparation between offer acceptance and start date',
      activities: [
        {
          day: 12,
          actor: 'Candidate',
          action: 'Accepts job offer',
          data: {
            acceptanceMethod: 'Digital signature via email',
            documentsSubmitted: [
              'Signed employment contract',
              'Academic transcripts',
              'Government ID copy',
              'Bank account details'
            ]
          }
        },
        {
          day: 15,
          actor: 'HR Recruiter',
          action: 'Initiates pre-boarding checklist',
          data: {
            tasksCreated: [
              'IT equipment procurement',
              'Workspace assignment',
              'System access requests',
              'Buddy assignment',
              'First-day schedule preparation'
            ],
            systemUpdates: [
              'Employee record created',
              'Payroll setup initiated',
              'Benefits enrollment prepared'
            ]
          }
        },
        {
          day: 18,
          actor: 'IT Support',
          action: 'Prepares equipment and accounts',
          data: {
            hardware: [
              'Laptop: Dell Precision 5560',
              'Monitor: 27" 4K display',
              'Accessories: Keyboard, mouse, headset'
            ],
            accounts: [
              'Active Directory account',
              'Email account setup',
              'Development environment access',
              'Database access (read-only initially)'
            ]
          }
        }
      ]
    },

    {
      name: 'Week 1: Orientation & Setup',
      duration: '1 week',
      description: 'First week focused on orientation and basic setup',
      activities: [
        {
          day: 1,
          actor: 'HR Recruiter',
          action: 'Conducts new employee orientation',
          data: {
            agenda: [
              'Welcome and introductions',
              'Company history and values',
              'Organizational structure',
              'Policies and procedures',
              'Benefits overview',
              'Office tour and introductions'
            ],
            duration: '4 hours',
            materials: [
              'Employee handbook',
              'Organizational chart',
              'Policy documents',
              'Benefits enrollment forms'
            ]
          }
        },
        {
          day: 1,
          actor: 'IT Support',
          action: 'Equipment setup and system access',
          data: {
            setupTasks: [
              'Laptop configuration and software installation',
              'Network access and VPN setup',
              'Email and communication tools setup',
              'Development environment installation'
            ],
            completionTime: '2 hours',
            trainingProvided: 'Basic system usage and security protocols'
          }
        },
        {
          day: 2,
          actor: 'Hiring Manager',
          action: 'Department introduction and role overview',
          data: {
            topics: [
              'Team structure and roles',
              'Current projects overview',
              'Data analysis workflows',
              'Tools and technologies used',
              'Performance expectations',
              'Learning and development opportunities'
            ],
            teamIntroductions: 'Individual meetings with each team member'
          }
        },
        {
          day: 3,
          actor: 'Buddy (Senior Developer)',
          action: 'Begins buddy system mentoring',
          data: {
            buddyProgram: {
              duration: '3 months',
              meetingFrequency: 'Daily for first week, then weekly',
              responsibilities: [
                'Answer questions and provide guidance',
                'Help with technical setup',
                'Introduce to team processes',
                'Provide social integration support'
              ]
            },
            firstSession: 'Code repository walkthrough and project structure explanation'
          }
        },
        {
          day: 4,
          actor: 'Employee',
          action: 'Completes mandatory training courses',
          data: {
            coursesAssigned: [
              'New Employee Orientation (8 hours)',
              'Data Security & Privacy Awareness (2 hours)',
              'Company POS System Basics (4 hours)'
            ],
            completionStatus: [
              'Orientation: 100%',
              'Security: 95%',
              'POS Basics: In Progress'
            ]
          }
        },
        {
          day: 5,
          actor: 'Employee',
          action: 'Shadow team members and observe workflows',
          data: {
            shadowingActivities: [
              'Daily standup meeting participation',
              'Data analysis session observation',
              'Client report review process',
              'Database query optimization session'
            ],
            observations: 'Documented questions and learning points for follow-up'
          }
        }
      ]
    },

    {
      name: 'Week 2: Skills Development',
      duration: '1 week',
      description: 'Focus on technical skills and tool mastery',
      activities: [
        {
          day: 8,
          actor: 'Senior Developer',
          action: 'Provides technical training on data tools',
          data: {
            trainingTopics: [
              'Company data warehouse structure',
              'SQL best practices and query optimization',
              'Python data analysis libraries (pandas, numpy)',
              'Visualization tools (Tableau, PowerBI)',
              'Version control with Git'
            ],
            practicalExercises: 'Hands-on exercises with sample datasets'
          }
        },
        {
          day: 9,
          actor: 'Employee',
          action: 'Begins first practice project',
          data: {
            projectDescription: 'Analyze customer transaction patterns from sample data',
            objectives: [
              'Practice SQL query writing',
              'Create basic visualizations',
              'Document findings in report format'
            ],
            supervision: 'Daily check-ins with buddy',
            deadline: 'End of week 3'
          }
        },
        {
          day: 10,
          actor: 'Project Manager',
          action: 'Introduces project management processes',
          data: {
            processOverview: [
              'Task management system (Jira)',
              'Time tracking procedures',
              'Project documentation standards',
              'Client communication protocols',
              'Quality assurance processes'
            ],
            practiceAssignment: 'Track time on practice project tasks'
          }
        },
        {
          day: 11,
          actor: 'Employee',
          action: 'Attends first client meeting (observer)',
          data: {
            meetingType: 'Monthly review with Golden Spoon Restaurant',
            role: 'Silent observer',
            learningObjectives: [
              'Client interaction dynamics',
              'Report presentation techniques',
              'Question handling approaches',
              'Professional communication standards'
            ],
            postMeetingDebrief: 'Discussion with hiring manager about observations'
          }
        },
        {
          day: 12,
          actor: 'HR Recruiter',
          action: 'Conducts first week feedback session',
          data: {
            feedbackAreas: [
              'Onboarding experience quality',
              'Training effectiveness',
              'Team integration progress',
              'Support adequacy',
              'Areas for improvement'
            ],
            employeeFeedback: 'Very positive, appreciates structured approach and team support',
            actionItems: 'Additional Python training resources provided'
          }
        }
      ]
    },

    {
      name: 'Week 3: First Assignment',
      duration: '1 week',
      description: 'Taking on first real project tasks with support',
      activities: [
        {
          day: 15,
          actor: 'Hiring Manager',
          action: 'Assigns first real project task',
          data: {
            project: 'TechStore Mobile App Analytics',
            task: 'Analyze user behavior patterns from app usage data',
            scope: [
              'Data extraction from app analytics',
              'User journey analysis',
              'Conversion funnel evaluation',
              'Report generation with insights'
            ],
            support: 'Buddy available for questions, daily check-ins scheduled'
          }
        },
        {
          day: 16,
          actor: 'Employee',
          action: 'Begins independent work with guidance',
          data: {
            workPattern: [
              '60% independent work',
              '20% collaboration/guidance',
              '20% learning and documentation'
            ],
            progressTracking: 'Daily task updates in project management system',
            challenges: 'Some difficulty with complex SQL joins - received additional training'
          }
        },
        {
          day: 17,
          actor: 'Buddy',
          action: 'Provides code review and feedback',
          data: {
            reviewAreas: [
              'Code quality and best practices',
              'Analytical approach soundness',
              'Documentation completeness',
              'Performance considerations'
            ],
            feedback: 'Good analytical thinking, needs improvement in code optimization',
            actionItems: 'Additional resources on query performance tuning'
          }
        },
        {
          day: 19,
          actor: 'Employee',
          action: 'Presents findings to immediate team',
          data: {
            presentationType: 'Informal team presentation',
            duration: '30 minutes',
            content: [
              'Analysis methodology',
              'Key findings and insights',
              'Visualizations created',
              'Recommendations'
            ],
            teamFeedback: 'Good insights, presentation skills need development',
            developmentPlan: 'Presentation skills training scheduled'
          }
        }
      ]
    },

    {
      name: 'Week 4: Integration & Assessment',
      duration: '1 week',
      description: 'Full team integration and 30-day assessment',
      activities: [
        {
          day: 22,
          actor: 'Employee',
          action: 'Takes on regular team responsibilities',
          data: {
            responsibilities: [
              'Daily standup participation as full member',
              'Independent task management',
              'Client deliverable contribution',
              'Peer collaboration on complex problems'
            ],
            autonomyLevel: '75% independent work',
            teamIntegration: 'Fully integrated team member'
          }
        },
        {
          day: 24,
          actor: 'Client',
          action: 'Reviews employee contribution (indirectly)',
          data: {
            deliverable: 'Monthly analytics report for TechStore',
            clientFeedback: 'Appreciated new insights on user behavior patterns',
            qualityAssessment: 'Met client expectations',
            impact: 'Report insights influenced app feature prioritization'
          }
        },
        {
          day: 26,
          actor: 'Hiring Manager',
          action: 'Conducts 30-day performance review',
          data: {
            performanceAreas: [
              'Technical skills development: Exceeding expectations',
              'Team collaboration: Meeting expectations',
              'Communication: Meeting expectations',
              'Initiative and learning: Exceeding expectations',
              'Quality of work: Meeting expectations'
            ],
            overallRating: '4.2/5 - Strong start with clear development trajectory',
            goals_next_30_days: [
              'Lead a small analysis project independently',
              'Complete advanced SQL training',
              'Improve presentation skills',
              'Take on client interaction responsibilities'
            ]
          }
        },
        {
          day: 26,
          actor: 'Employee',
          action: 'Provides onboarding feedback',
          data: {
            satisfactionRating: '4.8/5',
            positiveAspects: [
              'Structured onboarding program',
              'Excellent buddy system',
              'Supportive team culture',
              'Clear expectations and goals',
              'Good balance of guidance and independence'
            ],
            improvementSuggestions: [
              'Earlier access to client data for practice',
              'More advanced technical training resources',
              'Additional presentation skills training'
            ]
          }
        }
      ]
    }
  ],

  // Onboarding success metrics
  successMetrics: {
    timeToProductivity: {
      target: '30 days',
      actual: '26 days',
      measurement: 'First independent client deliverable'
    },

    employeeEngagement: {
      onboardingSatisfaction: '4.8/5',
      teamIntegration: '4.7/5',
      supportQuality: '5/5',
      expectationsAlignment: '4.5/5'
    },

    managerSatisfaction: {
      hiringDecision: '4.9/5',
      onboardingEffectiveness: '4.6/5',
      employeeReadiness: '4.3/5',
      culturalFit: '4.8/5'
    },

    businessImpact: {
      clientValue: 'First deliverable met client expectations',
      teamContribution: 'Positive addition to team dynamics',
      knowledgeGain: 'Brought fresh analytical perspectives',
      processingImprovement: 'Suggested efficiency improvements'
    }
  },

  // Tools and systems used
  systemsAndTools: {
    hrSystems: [
      'Candidate Portal (pre-hire training)',
      'Employee Portal (onboarding tasks)',
      'LMS (training completion)',
      'Performance Management System'
    ],

    technicalSystems: [
      'Development Environment Setup',
      'Database Access Management',
      'Code Repository Access',
      'Analytics Tools Training'
    ],

    communicationTools: [
      'Email and Calendar',
      'Team Messaging (Slack)',
      'Video Conferencing',
      'Project Management System'
    ]
  },

  // Support network utilized
  supportNetwork: {
    directSupport: [
      'HR Recruiter (administrative support)',
      'Hiring Manager (role clarity and expectations)',
      'Assigned Buddy (day-to-day guidance)',
      'IT Support (technical setup)'
    ],

    peerSupport: [
      'Team members (knowledge sharing)',
      'Other new hires (shared experience)',
      'Cross-functional collaborators'
    ],

    resourcesProvided: [
      'Online learning platform access',
      'Technical documentation library',
      'Industry best practices guides',
      'Company knowledge base'
    ]
  },

  // Key success factors
  successFactors: [
    {
      factor: 'Structured Program',
      impact: 'Provided clear roadmap and expectations',
      evidence: 'High satisfaction scores and faster time to productivity'
    },
    {
      factor: 'Buddy System',
      impact: 'Reduced learning curve and improved integration',
      evidence: 'Employee feedback highlighted buddy support as most valuable'
    },
    {
      factor: 'Progressive Responsibility',
      impact: 'Built confidence through manageable challenges',
      evidence: 'Smooth transition to independent work'
    },
    {
      factor: 'Regular Check-ins',
      impact: 'Early identification and resolution of challenges',
      evidence: 'No major issues or delays in onboarding process'
    },
    {
      factor: 'Technology Readiness',
      impact: 'Enabled immediate productivity',
      evidence: 'No delays due to technical setup issues'
    }
  ],

  // Continuous improvement insights
  improvementOpportunities: [
    {
      area: 'Technical Preparation',
      observation: 'Earlier access to production data for practice could accelerate learning',
      recommendation: 'Create sanitized production data copy for training'
    },
    {
      area: 'Skill Development',
      observation: 'Need for more advanced technical training resources',
      recommendation: 'Expand learning library with advanced courses'
    },
    {
      area: 'Soft Skills',
      observation: 'Presentation skills need earlier development',
      recommendation: 'Include presentation training in week 2'
    },
    {
      area: 'Peer Learning',
      observation: 'Value of connecting with other new hires',
      recommendation: 'Create new hire cohort program'
    }
  ]
};
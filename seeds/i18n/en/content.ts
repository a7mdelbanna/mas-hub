// English (EN) localized content for seed data

export const announcements = [
  {
    id: 'announcement-welcome-2024',
    title: 'Welcome to MAS Business OS',
    content: 'We are excited to announce the launch of our new integrated business operating system. This platform will streamline all our operations and improve collaboration across departments. Please complete your profile setup and explore the new features.',
    type: 'success' as const,
    targetAudience: ['employees']
  },
  {
    id: 'announcement-system-maintenance',
    title: 'Scheduled System Maintenance',
    content: 'Please be informed that we will be performing scheduled system maintenance on Saturday, March 30th from 2:00 AM to 6:00 AM. The system will be temporarily unavailable during this time. We apologize for any inconvenience.',
    type: 'warning' as const,
    targetAudience: ['all']
  },
  {
    id: 'announcement-training-program',
    title: 'New Employee Training Program Available',
    content: 'We have launched a comprehensive online training program for all new employees. The program covers company policies, system usage, and role-specific skills. Please check your assigned courses in the Learning Management System.',
    type: 'info' as const,
    targetAudience: ['employees']
  },
  {
    id: 'announcement-client-portal-features',
    title: 'New Client Portal Features',
    content: 'We have added new features to the client portal including real-time project tracking, invoice management, and direct communication with your project team. Log in to explore these enhancements.',
    type: 'success' as const,
    targetAudience: ['clients']
  },
  {
    id: 'announcement-security-update',
    title: 'Important Security Update',
    content: 'As part of our commitment to data security, we have implemented additional security measures. Please update your passwords and enable two-factor authentication for enhanced account protection.',
    type: 'warning' as const,
    targetAudience: ['all']
  }
];

export const courseContent = [
  {
    courseId: 'course-new-employee-orientation',
    title: 'New Employee Orientation',
    description: 'Comprehensive orientation program for all new employees covering company policies, procedures, and culture.',
    lessons: [
      {
        title: 'Welcome to MAS Business Solutions',
        content: 'Welcome to MAS Business Solutions! We are thrilled to have you join our team. Our company was founded with the vision of providing innovative business solutions that help our clients succeed in today\'s competitive market. As a new team member, you are now part of a company that values innovation, excellence, and putting customers first.'
      },
      {
        title: 'Company Culture and Values',
        content: 'At MAS Business Solutions, we believe in fostering a culture of collaboration, innovation, and continuous learning. Our core values guide everything we do: Innovation - We constantly seek new and better ways to serve our clients. Excellence - We strive for the highest quality in all our work. Customer-First - Our clients\' success is our success.'
      }
    ]
  },
  {
    courseId: 'course-customer-service-excellence',
    title: 'Customer Service Excellence',
    description: 'Advanced customer service techniques and best practices for client interactions.',
    lessons: [
      {
        title: 'Understanding Customer Needs',
        content: 'Effective customer service begins with truly understanding what your customers need. This involves active listening, asking the right questions, and empathizing with their situation. Remember that every customer interaction is an opportunity to build trust and strengthen relationships.'
      },
      {
        title: 'Communication Best Practices',
        content: 'Clear, professional communication is essential for excellent customer service. Always be polite, patient, and helpful. Use positive language, avoid technical jargon when speaking with non-technical clients, and always follow up to ensure customer satisfaction.'
      }
    ]
  },
  {
    courseId: 'course-restaurant-pos-training',
    title: 'Restaurant POS System Training',
    description: 'Complete training program for restaurant staff on using the POS system effectively.',
    lessons: [
      {
        title: 'Getting Started with Your POS System',
        content: 'Your POS system is the heart of your restaurant operations. This comprehensive guide will help you master all aspects of the system, from taking orders to managing inventory. Let\'s start with the basics of navigation and daily operations.'
      },
      {
        title: 'Processing Orders and Payments',
        content: 'Learn how to efficiently process customer orders, handle different payment methods, and manage special requests. This lesson covers the complete order lifecycle from initial entry to final payment confirmation.'
      }
    ]
  }
];

export const ticketContent = [
  {
    category: 'Hardware Issue',
    commonResponses: [
      'Thank you for reporting this hardware issue. I will dispatch a technician to your location immediately.',
      'I understand how frustrating hardware problems can be for your business operations. Let me help resolve this quickly.',
      'Our field engineer is on the way to your location. Please ensure the equipment is accessible for repair.'
    ]
  },
  {
    category: 'Software Issue',
    commonResponses: [
      'I\'ve received your software issue report. Let me connect remotely to diagnose the problem.',
      'This appears to be a software configuration issue. I\'ll walk you through the resolution steps.',
      'I\'ve identified the software bug you\'re experiencing. A patch will be deployed within the next hour.'
    ]
  },
  {
    category: 'Training Request',
    commonResponses: [
      'Thank you for your training request. I\'ll schedule a session with our training team at your convenience.',
      'We\'d be happy to provide additional training for your staff. Let me check our trainer availability.',
      'I\'ve prepared a customized training plan based on your specific needs and will send it for your review.'
    ]
  }
];

export const projectTemplates = [
  {
    templateId: 'template-pos-standard',
    name: 'Standard POS Implementation',
    phases: [
      {
        name: 'Discovery & Analysis',
        description: 'Comprehensive analysis of business requirements and technical infrastructure'
      },
      {
        name: 'System Configuration',
        description: 'Hardware setup, software configuration, and system customization'
      },
      {
        name: 'Data Migration',
        description: 'Secure migration of existing business data to the new system'
      },
      {
        name: 'User Training',
        description: 'Comprehensive training program for all system users'
      },
      {
        name: 'Go-Live & Support',
        description: 'System deployment and initial support during transition'
      }
    ]
  }
];

export const emailTemplates = [
  {
    type: 'invoice_sent',
    subject: 'Invoice #{invoiceNumber} from MAS Business Solutions',
    body: 'Dear {clientName},\n\nWe have generated invoice #{invoiceNumber} for your recent project work. The invoice total is {amount} and is due on {dueDate}.\n\nYou can view and pay this invoice through your client portal at {portalUrl}.\n\nThank you for your business!\n\nBest regards,\nMAS Business Solutions Finance Team'
  },
  {
    type: 'payment_received',
    subject: 'Payment Confirmation - Invoice #{invoiceNumber}',
    body: 'Dear {clientName},\n\nWe have successfully received your payment of {amount} for invoice #{invoiceNumber}.\n\nThank you for your prompt payment. Your receipt is attached to this email.\n\nBest regards,\nMAS Business Solutions Finance Team'
  },
  {
    type: 'project_milestone',
    subject: 'Project Milestone Completed - {projectName}',
    body: 'Dear {clientName},\n\nWe are pleased to inform you that we have completed the "{milestoneName}" milestone for your project "{projectName}".\n\nYou can view the progress and deliverables in your client portal. The next milestone is scheduled for {nextMilestoneDate}.\n\nBest regards,\n{projectManagerName}\nProject Manager, MAS Business Solutions'
  }
];
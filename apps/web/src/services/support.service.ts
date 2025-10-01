import { Ticket, SiteVisit, KnowledgeBaseArticle, SupportStats } from '../types/support.types';

class SupportService {
  // Tickets
  async getTickets(): Promise<Ticket[]> {
    return [
      {
        id: '1',
        number: 'TK-2024-001',
        title: 'POS System Connection Issues',
        description: 'Unable to connect to payment processor',
        status: 'open',
        priority: 'high',
        category: 'technical',
        assignedTo: '1',
        assignedUser: {
          id: '1',
          name: 'Mike Johnson',
          avatar: ''
        },
        customer: {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@retailmax.com',
          company: 'RetailMax'
        },
        sla: {
          level: 'premium',
          responseTime: 2,
          resolutionTime: 8,
          isBreached: false,
          timeRemaining: 6
        },
        tags: ['pos', 'payment', 'critical'],
        attachments: [],
        comments: [
          {
            id: '1',
            content: 'Customer reports intermittent connection failures during peak hours',
            author: {
              id: '1',
              name: 'Mike Johnson',
              type: 'agent'
            },
            isInternal: false,
            attachments: [],
            createdAt: new Date('2024-03-20T10:30:00')
          }
        ],
        createdAt: new Date('2024-03-20T09:15:00'),
        updatedAt: new Date('2024-03-20T10:30:00')
      },
      {
        id: '2',
        number: 'TK-2024-002',
        title: 'Mobile App Login Problems',
        description: 'Users unable to authenticate on mobile app',
        status: 'in-progress',
        priority: 'medium',
        category: 'technical',
        assignedTo: '2',
        assignedUser: {
          id: '2',
          name: 'Sarah Wilson',
          avatar: ''
        },
        customer: {
          id: '2',
          name: 'Lisa Chen',
          email: 'lisa.chen@techcorp.com',
          company: 'TechCorp Solutions'
        },
        sla: {
          level: 'standard',
          responseTime: 4,
          resolutionTime: 24,
          isBreached: false,
          timeRemaining: 18
        },
        tags: ['mobile', 'authentication'],
        attachments: [],
        comments: [],
        firstResponseTime: 2,
        createdAt: new Date('2024-03-20T14:00:00'),
        updatedAt: new Date('2024-03-20T16:30:00')
      }
    ];
  }

  // Site Visits
  async getSiteVisits(): Promise<SiteVisit[]> {
    return [
      {
        id: '1',
        ticketId: '1',
        customerId: '1',
        customer: {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@retailmax.com',
          company: 'RetailMax',
          address: '123 Retail Street, Commerce City, CC 12345'
        },
        technician: {
          id: '1',
          name: 'Alex Johnson',
          skills: ['POS Systems', 'Network Troubleshooting', 'Hardware Repair'],
          avatar: ''
        },
        scheduledDate: new Date('2024-03-25T14:00:00'),
        estimatedDuration: 3,
        status: 'scheduled',
        serviceType: 'repair',
        description: 'On-site POS system troubleshooting and repair',
        materials: [
          {
            id: '1',
            name: 'Network Cable',
            quantity: 2,
            unitCost: 15,
            totalCost: 30
          },
          {
            id: '2',
            name: 'Ethernet Switch',
            quantity: 1,
            unitCost: 85,
            totalCost: 85
          }
        ],
        totalCost: 115,
        createdAt: new Date('2024-03-20T11:00:00'),
        updatedAt: new Date('2024-03-20T11:00:00')
      },
      {
        id: '2',
        customerId: '2',
        customer: {
          id: '2',
          name: 'Maria Rodriguez',
          email: 'maria.r@foodservice.com',
          company: 'FoodService Plus',
          address: '456 Service Ave, Business Park, BP 67890'
        },
        technician: {
          id: '2',
          name: 'David Chen',
          skills: ['Software Installation', 'Training', 'System Configuration'],
          avatar: ''
        },
        scheduledDate: new Date('2024-03-28T10:00:00'),
        estimatedDuration: 4,
        status: 'scheduled',
        serviceType: 'installation',
        description: 'New POS system installation and staff training',
        materials: [],
        totalCost: 0,
        createdAt: new Date('2024-03-18T15:30:00'),
        updatedAt: new Date('2024-03-18T15:30:00')
      }
    ];
  }

  // Knowledge Base
  async getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]> {
    return [
      {
        id: '1',
        title: 'How to Reset POS System Password',
        content: 'Step-by-step guide to reset POS system passwords...',
        summary: 'Quick guide for password reset procedures',
        category: 'POS Systems',
        tags: ['pos', 'password', 'reset', 'troubleshooting'],
        status: 'published',
        author: {
          id: '1',
          name: 'Mike Johnson'
        },
        views: 245,
        helpful: 38,
        notHelpful: 3,
        lastUpdated: new Date('2024-03-15T10:00:00'),
        createdAt: new Date('2024-02-10T14:30:00')
      },
      {
        id: '2',
        title: 'Mobile App Connectivity Issues',
        content: 'Common solutions for mobile app connection problems...',
        summary: 'Troubleshooting guide for mobile app connectivity',
        category: 'Mobile App',
        tags: ['mobile', 'connectivity', 'troubleshooting'],
        status: 'published',
        author: {
          id: '2',
          name: 'Sarah Wilson'
        },
        views: 156,
        helpful: 22,
        notHelpful: 1,
        lastUpdated: new Date('2024-03-10T16:20:00'),
        createdAt: new Date('2024-01-25T11:15:00')
      }
    ];
  }

  // Support Statistics
  async getSupportStats(): Promise<SupportStats> {
    return {
      totalTickets: 125,
      openTickets: 18,
      resolvedTickets: 98,
      averageResolutionTime: 4.2,
      averageResponseTime: 1.8,
      customerSatisfaction: 94.5,
      slaCompliance: 96.2,
      scheduledVisits: 8,
      completedVisits: 15,
      knowledgeBaseArticles: 45
    };
  }

  // Create operations
  async createTicket(ticket: Omit<Ticket, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const ticketNumber = `TK-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
    return {
      ...ticket,
      id: Date.now().toString(),
      number: ticketNumber,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createSiteVisit(visit: Omit<SiteVisit, 'id' | 'createdAt' | 'updatedAt'>): Promise<SiteVisit> {
    return {
      ...visit,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createKBArticle(article: Omit<KnowledgeBaseArticle, 'id' | 'views' | 'helpful' | 'notHelpful' | 'createdAt'>): Promise<KnowledgeBaseArticle> {
    return {
      ...article,
      id: Date.now().toString(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
      createdAt: new Date()
    };
  }
}

export const supportService = new SupportService();
import { Contact, Lead, Deal, Activity, Campaign, Pipeline, CRMStats } from '../types/crm.types';

class CRMService {
  // Contacts
  async getContacts(): Promise<Contact[]> {
    return [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@techcorp.com',
        phone: '+1 (555) 123-4567',
        company: 'TechCorp Solutions',
        position: 'CTO',
        type: 'customer',
        status: 'active',
        source: 'website',
        tags: ['enterprise', 'tech'],
        notes: 'Interested in enterprise solutions',
        lastContactDate: new Date('2024-03-20'),
        assignedTo: '1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@startup.io',
        phone: '+1 (555) 987-6543',
        company: 'Startup Inc',
        position: 'CEO',
        type: 'lead',
        status: 'prospect',
        source: 'referral',
        tags: ['startup', 'saas'],
        notes: 'Looking for scalable solutions',
        assignedTo: '2',
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-03-15')
      }
    ];
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return [
      {
        id: '1',
        contactId: '2',
        contact: {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.j@startup.io',
          company: 'Startup Inc',
          type: 'lead',
          status: 'prospect',
          source: 'referral',
          tags: ['startup'],
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        score: 85,
        stage: 'qualified',
        value: 25000,
        probability: 70,
        source: 'website',
        assignedTo: '1',
        assignedUser: {
          id: '1',
          name: 'Alex Wilson',
          avatar: ''
        },
        activities: [],
        nextFollowUp: new Date('2024-03-25'),
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-03-15')
      }
    ];
  }

  // Deals
  async getDeals(): Promise<Deal[]> {
    return [
      {
        id: '1',
        name: 'TechCorp Enterprise Solution',
        contactId: '1',
        contact: {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@techcorp.com',
          company: 'TechCorp Solutions',
          type: 'customer',
          status: 'active',
          source: 'website',
          tags: ['enterprise'],
          notes: '',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        value: 75000,
        stage: 'negotiation',
        probability: 80,
        expectedCloseDate: new Date('2024-04-15'),
        assignedTo: '1',
        assignedUser: {
          id: '1',
          name: 'Alex Wilson',
          avatar: ''
        },
        products: [
          {
            id: '1',
            name: 'Enterprise License',
            quantity: 1,
            unitPrice: 50000,
            totalPrice: 50000,
            description: 'Annual enterprise license'
          },
          {
            id: '2',
            name: 'Implementation Services',
            quantity: 1,
            unitPrice: 25000,
            totalPrice: 25000,
            description: 'Professional implementation and setup'
          }
        ],
        activities: [],
        documents: [],
        notes: 'Customer is very interested, waiting for final approval',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-03-18')
      }
    ];
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return [
      {
        id: '1',
        type: 'call',
        subject: 'Follow-up call with TechCorp',
        description: 'Discuss implementation timeline and requirements',
        status: 'scheduled',
        priority: 'high',
        dueDate: new Date('2024-03-25'),
        assignedTo: '1',
        assignedUser: {
          id: '1',
          name: 'Alex Wilson',
          avatar: ''
        },
        contactId: '1',
        dealId: '1',
        duration: 30,
        createdAt: new Date('2024-03-20'),
        updatedAt: new Date('2024-03-20')
      },
      {
        id: '2',
        type: 'email',
        subject: 'Proposal sent to Startup Inc',
        description: 'Sent detailed proposal for scalable solution',
        status: 'completed',
        priority: 'medium',
        completedDate: new Date('2024-03-18'),
        assignedTo: '2',
        assignedUser: {
          id: '2',
          name: 'Maria Garcia',
          avatar: ''
        },
        contactId: '2',
        leadId: '1',
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-18')
      }
    ];
  }

  // Campaigns
  async getCampaigns(): Promise<Campaign[]> {
    return [
      {
        id: '1',
        name: 'Q1 2024 Lead Generation',
        type: 'email',
        status: 'active',
        budget: 10000,
        spent: 3500,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        targetAudience: 'Enterprise CTOs and IT Directors',
        description: 'Email campaign targeting enterprise decision makers',
        goals: [
          {
            id: '1',
            type: 'leads',
            target: 100,
            current: 65,
            unit: 'qualified leads'
          },
          {
            id: '2',
            type: 'sales',
            target: 250000,
            current: 150000,
            unit: 'revenue'
          }
        ],
        metrics: {
          impressions: 50000,
          clicks: 2500,
          conversions: 125,
          leads: 65,
          sales: 3,
          revenue: 150000,
          cost: 3500,
          roi: 42.9
        },
        createdBy: '1',
        createdAt: new Date('2023-12-15'),
        updatedAt: new Date('2024-03-20')
      }
    ];
  }

  // Pipeline
  async getPipelines(): Promise<Pipeline[]> {
    return [
      {
        id: '1',
        name: 'Sales Pipeline',
        type: 'sales',
        isDefault: true,
        stages: [
          {
            id: '1',
            name: 'Prospecting',
            probability: 10,
            order: 1,
            color: '#EF4444'
          },
          {
            id: '2',
            name: 'Qualification',
            probability: 25,
            order: 2,
            color: '#F97316'
          },
          {
            id: '3',
            name: 'Proposal',
            probability: 50,
            order: 3,
            color: '#EAB308'
          },
          {
            id: '4',
            name: 'Negotiation',
            probability: 75,
            order: 4,
            color: '#3B82F6'
          },
          {
            id: '5',
            name: 'Closed Won',
            probability: 100,
            order: 5,
            color: '#10B981'
          }
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      }
    ];
  }

  // CRM Statistics
  async getCRMStats(): Promise<CRMStats> {
    return {
      totalContacts: 156,
      totalLeads: 42,
      totalDeals: 18,
      totalRevenue: 450000,
      conversionRate: 65.5,
      averageDealSize: 25000,
      salesCycleLength: 45,
      activeCampaigns: 3,
      monthlyGrowth: 12.5,
      pipelineValue: 320000
    };
  }

  // Create operations
  async createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    return {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    return {
      ...lead,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    return {
      ...deal,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async createActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Activity> {
    return {
      ...activity,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

export const crmService = new CRMService();
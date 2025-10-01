export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  type: 'lead' | 'customer' | 'partner' | 'vendor';
  status: 'active' | 'inactive' | 'prospect';
  source: 'website' | 'referral' | 'cold-call' | 'social-media' | 'email' | 'event';
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  tags: string[];
  notes: string;
  lastContactDate?: Date;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  contactId: string;
  contact: Contact;
  score: number;
  stage: 'new' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  source: string;
  campaign?: string;
  assignedTo: string;
  assignedUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  activities: Activity[];
  nextFollowUp?: Date;
  closedDate?: Date;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  name: string;
  contactId: string;
  contact: Contact;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  assignedTo: string;
  assignedUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  products: DealProduct[];
  activities: Activity[];
  documents: Document[];
  notes: string;
  lostReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'demo';
  subject: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  completedDate?: Date;
  assignedTo: string;
  assignedUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  contactId?: string;
  leadId?: string;
  dealId?: string;
  duration?: number; // in minutes
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'paid-ads' | 'content' | 'event' | 'direct-mail';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget: number;
  spent: number;
  startDate: Date;
  endDate: Date;
  targetAudience: string;
  description: string;
  goals: CampaignGoal[];
  metrics: CampaignMetrics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignGoal {
  id: string;
  type: 'leads' | 'sales' | 'engagement' | 'awareness';
  target: number;
  current: number;
  unit: string;
}

export interface CampaignMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  leads: number;
  sales: number;
  revenue: number;
  cost: number;
  roi: number;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  type: 'sales' | 'lead' | 'custom';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  order: number;
  color: string;
  requirements?: string[];
}

export interface CRMStats {
  totalContacts: number;
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealSize: number;
  salesCycleLength: number;
  activeCampaigns: number;
  monthlyGrowth: number;
  pipelineValue: number;
}
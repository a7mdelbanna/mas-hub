export interface Ticket {
  id: string;
  number: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed' | 'on-hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'feature-request' | 'bug-report';
  assignedTo?: string;
  assignedUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  sla: SLA;
  tags: string[];
  attachments: Attachment[];
  comments: TicketComment[];
  resolutionTime?: number; // in hours
  firstResponseTime?: number; // in hours
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export interface SLA {
  level: 'standard' | 'premium' | 'enterprise';
  responseTime: number; // in hours
  resolutionTime: number; // in hours
  isBreached: boolean;
  timeRemaining: number; // in hours
}

export interface TicketComment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    type: 'customer' | 'agent';
    avatar?: string;
  };
  isInternal: boolean;
  attachments: Attachment[];
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface SiteVisit {
  id: string;
  ticketId?: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string;
    address: string;
  };
  technician: {
    id: string;
    name: string;
    skills: string[];
    avatar?: string;
  };
  scheduledDate: Date;
  estimatedDuration: number; // in hours
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  serviceType: 'installation' | 'maintenance' | 'repair' | 'consultation';
  description: string;
  workPerformed?: string;
  notes?: string;
  materials: Material[];
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
  };
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: Date;
  createdAt: Date;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  averageResponseTime: number;
  customerSatisfaction: number;
  slaCompliance: number;
  scheduledVisits: number;
  completedVisits: number;
  knowledgeBaseArticles: number;
}
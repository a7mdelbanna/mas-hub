export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  allocation: number;
  department?: string;
  email?: string;
}

export interface ProjectPhase {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  startDate: Date;
  endDate: Date;
  progress: number;
  budget: number;
  spent: number;
  tasks?: Task[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: TeamMember;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  dependencies?: string[];
  subtasks?: Task[];
  comments?: Comment[];
  attachments?: Attachment[];
}

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: Date;
  status: 'pending' | 'achieved' | 'missed';
  payment?: {
    amount: number;
    status: 'pending' | 'invoiced' | 'paid';
    invoiceId?: string;
  };
  deliverables?: string[];
  completedAt?: Date;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: TeamMember;
  uploadedAt: Date;
  category?: string;
  version?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  author: TeamMember;
  createdAt: Date;
  updatedAt?: Date;
  replies?: Comment[];
  mentions?: string[];
  attachments?: Attachment[];
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  date: Date;
  description?: string;
  billable: boolean;
  rate?: number;
  approved?: boolean;
  invoiced?: boolean;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  averageProgress: number;
  upcomingDeadlines: number;
  overdueProjects: number;
}

export interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
  };
  type: 'web' | 'mobile' | 'pos' | 'hybrid';
  status: 'planning' | 'active' | 'on-hold' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  dueDate: Date;
  budget: number;
  spent: number;
  progress: number;
  manager: {
    id: string;
    name: string;
    avatar?: string;
  };
  team: TeamMember[];
  description: string;
  tags?: string[];
  phases?: ProjectPhase[];
  tasks?: Task[];
  milestones?: Milestone[];
  documents?: Document[];
  createdAt?: Date;
  updatedAt?: Date;
}
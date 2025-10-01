export interface Workflow {
  id: string;
  name: string;
  description?: string;
  category: 'email' | 'data' | 'integration' | 'notification' | 'approval' | 'custom';
  status: 'active' | 'inactive' | 'draft' | 'error';
  version: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  conditions: WorkflowCondition[];
  schedule?: WorkflowSchedule;
  executionCount: number;
  lastExecuted?: Date;
  nextExecution?: Date;
  executionHistory: WorkflowExecution[];
  tags: string[];
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowTrigger {
  id: string;
  type: 'manual' | 'scheduled' | 'webhook' | 'event' | 'data-change' | 'email';
  config: TriggerConfig;
  isActive: boolean;
}

export interface TriggerConfig {
  // Scheduled trigger
  schedule?: {
    type: 'interval' | 'cron' | 'date';
    interval?: number; // minutes
    cronExpression?: string;
    timezone?: string;
    startDate?: Date;
    endDate?: Date;
  };

  // Event trigger
  event?: {
    source: string;
    eventType: string;
    filters?: Record<string, any>;
  };

  // Data change trigger
  dataChange?: {
    table: string;
    operation: 'insert' | 'update' | 'delete' | 'any';
    conditions?: Record<string, any>;
  };

  // Webhook trigger
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    authentication?: {
      type: 'none' | 'basic' | 'bearer' | 'api-key';
      credentials?: Record<string, string>;
    };
  };
}

export interface WorkflowAction {
  id: string;
  type: 'email' | 'webhook' | 'database' | 'notification' | 'approval' | 'delay' | 'condition' | 'custom';
  name: string;
  config: ActionConfig;
  order: number;
  isEnabled: boolean;
  retryPolicy?: {
    maxRetries: number;
    retryDelay: number; // seconds
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
  };
}

export interface ActionConfig {
  // Email action
  email?: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    bodyType: 'text' | 'html';
    attachments?: string[];
    template?: string;
    variables?: Record<string, any>;
  };

  // Webhook action
  webhook?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string;
    bodyType: 'json' | 'xml' | 'form' | 'text';
    authentication?: {
      type: 'none' | 'basic' | 'bearer' | 'api-key';
      credentials?: Record<string, string>;
    };
  };

  // Database action
  database?: {
    operation: 'insert' | 'update' | 'delete' | 'select';
    table: string;
    data?: Record<string, any>;
    conditions?: Record<string, any>;
    query?: string;
  };

  // Notification action
  notification?: {
    type: 'push' | 'sms' | 'slack' | 'teams' | 'discord';
    recipients: string[];
    message: string;
    title?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    channels?: string[];
  };

  // Delay action
  delay?: {
    duration: number; // seconds
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
  };

  // Custom action
  custom?: {
    script: string;
    language: 'javascript' | 'python' | 'shell';
    environment?: Record<string, string>;
    timeout?: number; // seconds
  };
}

export interface WorkflowCondition {
  id: string;
  type: 'if' | 'unless' | 'switch';
  expression: string;
  actions: WorkflowAction[];
  elseActions?: WorkflowAction[];
  order: number;
}

export interface WorkflowSchedule {
  id: string;
  type: 'once' | 'recurring';
  startDate: Date;
  endDate?: Date;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number;
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday
    dayOfMonth?: number;
    monthOfYear?: number;
    customCron?: string;
  };
  timezone: string;
  isActive: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  triggeredBy: {
    type: 'manual' | 'scheduled' | 'webhook' | 'event';
    user?: string;
    source?: string;
  };
  input?: Record<string, any>;
  output?: Record<string, any>;
  steps: ExecutionStep[];
  error?: {
    message: string;
    stack?: string;
    step?: string;
  };
  logs: ExecutionLog[];
  metrics: {
    memoryUsage?: number;
    cpuTime?: number;
    networkCalls?: number;
  };
}

export interface ExecutionStep {
  id: string;
  actionId: string;
  actionName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number; // milliseconds
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  retryCount?: number;
}

export interface ExecutionLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  stepId?: string;
  data?: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  tags: string[];
  popularity: number;
  template: Omit<Workflow, 'id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'executionCount' | 'executionHistory'>;
  variables: TemplateVariable[];
  requirements: string[];
  documentation?: string;
  examples?: TemplateExample[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    length?: number;
  };
}

export interface TemplateExample {
  id: string;
  name: string;
  description: string;
  variables: Record<string, any>;
  expectedOutput?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'rest-api' | 'graphql' | 'database' | 'file-system' | 'email' | 'cloud-service' | 'messaging';
  provider: string;
  description?: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  version: string;
  config: IntegrationConfig;
  capabilities: string[];
  rateLimits?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
    concurrentConnections?: number;
  };
  authentication: {
    type: 'none' | 'basic' | 'oauth1' | 'oauth2' | 'api-key' | 'jwt' | 'custom';
    credentials?: Record<string, string>;
    tokenExpiry?: Date;
  };
  healthCheck?: {
    url?: string;
    method?: string;
    expectedStatus?: number;
    lastCheck?: Date;
    isHealthy?: boolean;
  };
  usage: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number; // milliseconds
    lastUsed?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IntegrationConfig {
  // REST API
  api?: {
    baseUrl: string;
    version?: string;
    timeout?: number; // seconds
    retries?: number;
    headers?: Record<string, string>;
  };

  // Database
  database?: {
    type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite' | 'oracle' | 'mssql';
    host: string;
    port: number;
    database: string;
    schema?: string;
    ssl?: boolean;
    connectionLimit?: number;
  };

  // Email
  email?: {
    provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses' | 'outlook' | 'gmail';
    host?: string;
    port?: number;
    encryption?: 'none' | 'ssl' | 'tls';
    from?: string;
    replyTo?: string;
  };

  // File System
  fileSystem?: {
    type: 'local' | 's3' | 'ftp' | 'sftp' | 'azure-blob' | 'google-cloud';
    path?: string;
    bucket?: string;
    region?: string;
    accessMode: 'read' | 'write' | 'read-write';
  };
}

export interface AutomationStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number; // milliseconds
  totalIntegrations: number;
  connectedIntegrations: number;
  popularTemplates: {
    templateId: string;
    name: string;
    usageCount: number;
  }[];
  executionsByCategory: {
    category: string;
    count: number;
  }[];
  executionsByStatus: {
    status: string;
    count: number;
  }[];
  recentExecutions: WorkflowExecution[];
  upcomingScheduled: {
    workflowId: string;
    workflowName: string;
    nextExecution: Date;
  }[];
  errorRates: {
    period: string;
    rate: number;
  }[];
}
import {
  Workflow,
  WorkflowExecution,
  WorkflowTemplate,
  Integration,
  AutomationStats
} from '../types/automations.types';

class AutomationsService {
  async getWorkflows(): Promise<Workflow[]> {
    return [
      {
        id: '1',
        name: 'New Employee Onboarding',
        description: 'Automated workflow for new employee setup',
        category: 'email',
        status: 'active',
        version: '1.0.0',
        trigger: {
          id: 'trigger1',
          type: 'event',
          config: {
            event: {
              source: 'hr',
              eventType: 'employee.created',
              filters: {}
            }
          },
          isActive: true
        },
        actions: [
          {
            id: 'action1',
            type: 'email',
            name: 'Send Welcome Email',
            config: {
              email: {
                to: ['{{employee.email}}'],
                subject: 'Welcome to the Team!',
                body: 'Welcome to our company, {{employee.name}}!',
                bodyType: 'html'
              }
            },
            order: 1,
            isEnabled: true
          }
        ],
        conditions: [],
        executionCount: 45,
        lastExecuted: new Date('2024-09-25'),
        nextExecution: undefined,
        executionHistory: [],
        tags: ['hr', 'onboarding', 'email'],
        createdBy: {
          id: '1',
          name: 'Admin User'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-01')
      },
      {
        id: '2',
        name: 'Invoice Reminder',
        description: 'Send payment reminders for overdue invoices',
        category: 'notification',
        status: 'active',
        version: '1.2.0',
        trigger: {
          id: 'trigger2',
          type: 'scheduled',
          config: {
            schedule: {
              type: 'interval',
              interval: 1440, // daily
              timezone: 'UTC'
            }
          },
          isActive: true
        },
        actions: [
          {
            id: 'action2',
            type: 'email',
            name: 'Send Reminder',
            config: {
              email: {
                to: ['{{client.email}}'],
                subject: 'Payment Reminder - Invoice {{invoice.number}}',
                body: 'Dear {{client.name}}, your invoice is overdue.',
                bodyType: 'html'
              }
            },
            order: 1,
            isEnabled: true
          }
        ],
        conditions: [],
        executionCount: 128,
        lastExecuted: new Date('2024-09-26'),
        nextExecution: new Date('2024-09-27'),
        executionHistory: [],
        tags: ['finance', 'invoices', 'reminders'],
        createdBy: {
          id: '1',
          name: 'Admin User'
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-08-15')
      }
    ];
  }

  async getWorkflowExecutions(): Promise<WorkflowExecution[]> {
    return [
      {
        id: 'exec1',
        workflowId: '1',
        workflowName: 'New Employee Onboarding',
        status: 'completed',
        startTime: new Date('2024-09-26T10:00:00'),
        endTime: new Date('2024-09-26T10:02:30'),
        duration: 150000,
        triggeredBy: {
          type: 'event',
          source: 'hr'
        },
        input: { employee: { name: 'John Doe', email: 'john@company.com' } },
        output: { emailSent: true },
        steps: [
          {
            id: 'step1',
            actionId: 'action1',
            actionName: 'Send Welcome Email',
            status: 'completed',
            startTime: new Date('2024-09-26T10:00:00'),
            endTime: new Date('2024-09-26T10:02:30'),
            duration: 150000
          }
        ],
        logs: [
          {
            id: 'log1',
            timestamp: new Date('2024-09-26T10:00:00'),
            level: 'info',
            message: 'Workflow execution started'
          }
        ],
        metrics: {
          memoryUsage: 512,
          cpuTime: 100,
          networkCalls: 1
        }
      }
    ];
  }

  async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    return [
      {
        id: 'template1',
        name: 'Employee Onboarding',
        description: 'Complete new employee setup workflow',
        category: 'HR',
        icon: 'Users',
        tags: ['hr', 'onboarding', 'automation'],
        popularity: 85,
        template: {
          name: 'New Employee Onboarding',
          description: 'Automated workflow for new employee setup',
          category: 'email',
          status: 'draft',
          version: '1.0.0',
          trigger: {
            id: 'trigger1',
            type: 'event',
            config: {},
            isActive: true
          },
          actions: [],
          conditions: [],
          executionCount: 0,
          executionHistory: [],
          tags: ['hr', 'onboarding']
        },
        variables: [
          {
            id: 'var1',
            name: 'employee_email',
            type: 'string',
            description: 'Employee email address',
            required: true
          }
        ],
        requirements: ['Email integration', 'HR system access'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-06-01')
      }
    ];
  }

  async getIntegrations(): Promise<Integration[]> {
    return [
      {
        id: 'int1',
        name: 'Gmail',
        type: 'email',
        provider: 'Google',
        description: 'Gmail email service integration',
        icon: 'Mail',
        status: 'connected',
        version: '2.0.0',
        config: {
          email: {
            provider: 'gmail',
            from: 'noreply@company.com'
          }
        },
        capabilities: ['send_email', 'read_email', 'attachments'],
        authentication: {
          type: 'oauth2',
          tokenExpiry: new Date('2024-12-31')
        },
        usage: {
          totalRequests: 1250,
          successfulRequests: 1200,
          failedRequests: 50,
          averageResponseTime: 850,
          lastUsed: new Date('2024-09-26')
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-01')
      }
    ];
  }

  async getAutomationStats(): Promise<AutomationStats> {
    return {
      totalWorkflows: 25,
      activeWorkflows: 18,
      totalExecutions: 1547,
      successfulExecutions: 1485,
      failedExecutions: 62,
      averageExecutionTime: 2300,
      totalIntegrations: 8,
      connectedIntegrations: 6,
      popularTemplates: [
        { templateId: 'template1', name: 'Employee Onboarding', usageCount: 45 },
        { templateId: 'template2', name: 'Invoice Processing', usageCount: 38 }
      ],
      executionsByCategory: [
        { category: 'Email', count: 654 },
        { category: 'Data', count: 423 },
        { category: 'Notification', count: 245 }
      ],
      executionsByStatus: [
        { status: 'Completed', count: 1485 },
        { status: 'Failed', count: 62 }
      ],
      recentExecutions: [],
      upcomingScheduled: [
        { workflowId: '2', workflowName: 'Invoice Reminder', nextExecution: new Date('2024-09-27') }
      ],
      errorRates: [
        { period: 'Last 24h', rate: 2.1 },
        { period: 'Last 7 days', rate: 3.8 }
      ]
    };
  }

  async createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workflow> {
    return {
      ...workflow,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async executeWorkflow(workflowId: string, input?: Record<string, any>): Promise<WorkflowExecution> {
    return {
      id: Math.random().toString(36).substr(2, 9),
      workflowId,
      workflowName: 'Workflow Name',
      status: 'running',
      startTime: new Date(),
      triggeredBy: { type: 'manual', user: 'current-user' },
      input,
      steps: [],
      logs: [],
      metrics: {}
    };
  }
}

export const automationsService = new AutomationsService();
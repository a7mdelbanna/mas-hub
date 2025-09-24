import * as admin from 'firebase-admin';

/**
 * Automation Rules Engine
 * Handles business process automations and workflow triggers
 */

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: 'event' | 'schedule' | 'webhook' | 'condition';
  trigger: TriggerConfig;
  conditions?: RuleCondition[];
  actions: RuleAction[];
  active: boolean;
  priority: number;
  lastTriggeredAt?: admin.firestore.Timestamp;
  triggerCount: number;
}

export interface TriggerConfig {
  event?: string; // e.g., 'invoice.overdue', 'deal.won', 'ticket.created'
  schedule?: string; // Cron expression
  webhookUrl?: string;
  field?: string; // For condition-based triggers
  threshold?: any;
}

export interface RuleCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RuleAction {
  type: 'create_task' | 'send_email' | 'update_field' | 'trigger_workflow' |
        'create_notification' | 'block_access' | 'escalate' | 'webhook';
  config: Record<string, any>;
  delay?: number; // Delay in minutes before executing action
}

export class AutomationRulesEngine {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  /**
   * Process invoice overdue automation
   */
  async processInvoiceOverdue(invoiceId: string): Promise<void> {
    const invoiceDoc = await this.db.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) return;

    const invoice = invoiceDoc.data()!;
    const daysPastDue = this.calculateDaysPastDue(invoice.dueDate);

    // Progressive actions based on days overdue
    if (daysPastDue === 1) {
      // Day 1: Send friendly reminder
      await this.sendInvoiceReminder(invoice, 'friendly');
    } else if (daysPastDue === 7) {
      // Day 7: Send urgent reminder + notify account manager
      await this.sendInvoiceReminder(invoice, 'urgent');
      await this.notifyAccountManager(invoice);
    } else if (daysPastDue === 15) {
      // Day 15: Block client portal access
      await this.blockClientPortalAccess(invoice.accountId);
      await this.sendInvoiceReminder(invoice, 'final');
      await this.escalateToFinance(invoice);
    } else if (daysPastDue === 30) {
      // Day 30: Escalate to collections
      await this.escalateToCollections(invoice);
    }

    // Update invoice status
    if (daysPastDue > 0 && invoice.status !== 'overdue') {
      await this.db.collection('invoices').doc(invoiceId).update({
        status: 'overdue',
        daysPastDue,
        lastReminderSent: admin.firestore.Timestamp.now()
      });
    }
  }

  /**
   * Process budget threshold automation
   */
  async processBudgetThreshold(projectId: string): Promise<void> {
    const projectDoc = await this.db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) return;

    const project = projectDoc.data()!;
    const budgetUsagePercent = (project.actualBudget / project.estimateBudget) * 100;

    if (budgetUsagePercent >= 80 && budgetUsagePercent < 90) {
      // 80% threshold: Notify project manager
      await this.createNotification(
        project.managerId,
        'warning',
        'Budget Alert',
        `Project ${project.name} has used ${budgetUsagePercent.toFixed(1)}% of budget`,
        'project',
        projectId
      );
    } else if (budgetUsagePercent >= 90 && budgetUsagePercent < 100) {
      // 90% threshold: Notify project manager + department head
      await this.createNotification(
        project.managerId,
        'warning',
        'Critical Budget Alert',
        `Project ${project.name} has used ${budgetUsagePercent.toFixed(1)}% of budget`,
        'project',
        projectId
      );
      await this.notifyDepartmentHead(project.managerId, 'budget_critical', project);
    } else if (budgetUsagePercent >= 100) {
      // 100% threshold: Block new expenses + escalate
      await this.blockProjectExpenses(projectId);
      await this.createReviewTask(
        project.managerId,
        `Budget review required for project ${project.name}`,
        projectId
      );
      await this.escalateToCLevel('budget_exceeded', project);
    }
  }

  /**
   * Process deal won automation
   */
  async processDealWon(opportunityId: string): Promise<void> {
    const oppDoc = await this.db.collection('opportunities').doc(opportunityId).get();
    if (!oppDoc.exists) return;

    const opportunity = oppDoc.data()!;

    // Auto-create project from won deal
    const projectData = {
      name: opportunity.name,
      accountId: opportunity.accountId,
      projectTypeId: opportunity.projectTypeId || 'default',
      managerId: opportunity.ownerId,
      description: `Project created from won opportunity: ${opportunity.name}`,
      status: 'planning',
      startDate: admin.firestore.Timestamp.now(),
      dueDate: this.calculateProjectDueDate(opportunity),
      estimateBudget: opportunity.amount,
      currency: opportunity.currency,
      completionPercentage: 0,
      members: [opportunity.ownerId],
      tags: ['from-opportunity'],
      customFields: {
        opportunityId,
        source: 'sales'
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      updatedBy: 'system'
    };

    const projectRef = await this.db.collection('projects').add(projectData);

    // Update opportunity with project reference
    await this.db.collection('opportunities').doc(opportunityId).update({
      projectId: projectRef.id,
      convertedToProject: true,
      convertedAt: admin.firestore.Timestamp.now()
    });

    // Create kickoff tasks
    await this.createKickoffTasks(projectRef.id, opportunity.ownerId);

    // Enable client portal
    await this.enableClientPortal(opportunity.accountId);

    // Send welcome email
    await this.sendClientWelcomeEmail(opportunity.accountId, projectRef.id);

    // Notify team
    await this.notifyTeamOfNewProject(projectRef.id, opportunity);
  }

  /**
   * Process quote approval automation
   */
  async processQuoteApproved(quoteId: string): Promise<void> {
    const quoteDoc = await this.db.collection('quotes').doc(quoteId).get();
    if (!quoteDoc.exists) return;

    const quote = quoteDoc.data()!;

    // Convert quote to contract
    const contractData = {
      accountId: quote.accountId,
      contractNumber: await this.generateContractNumber(),
      title: `Contract from Quote ${quote.quoteNumber}`,
      type: 'one-time',
      status: 'draft',
      startDate: admin.firestore.Timestamp.now(),
      endDate: this.calculateContractEndDate(quote),
      value: quote.total,
      currency: quote.currency,
      paymentTerms: 30,
      quoteId,
      lineItems: quote.lineItems,
      terms: quote.terms,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      updatedBy: 'system'
    };

    const contractRef = await this.db.collection('contracts').add(contractData);

    // Update quote
    await this.db.collection('quotes').doc(quoteId).update({
      contractId: contractRef.id,
      convertedToContract: true,
      convertedAt: admin.firestore.Timestamp.now()
    });

    // Create signature request task
    await this.createTask(
      quote.createdBy,
      'Get contract signed',
      `Please obtain client signature for contract ${contractData.contractNumber}`,
      'high',
      contractRef.id
    );

    // Notify sales team
    await this.createNotification(
      quote.createdBy,
      'success',
      'Quote Converted',
      `Quote ${quote.quoteNumber} has been converted to a contract`,
      'contract',
      contractRef.id
    );
  }

  /**
   * Process ticket creation automation
   */
  async processTicketCreated(ticketId: string): Promise<void> {
    const ticketDoc = await this.db.collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) return;

    const ticket = ticketDoc.data()!;

    // Start SLA timer
    const slaPolicyId = ticket.slaPolicyId || 'default';
    const slaPolicy = await this.getSLAPolicy(slaPolicyId);

    if (slaPolicy) {
      const targetTimes = this.calculateSLATargets(ticket.priority, slaPolicy);

      await this.db.collection('tickets').doc(ticketId).update({
        slaFirstResponseTarget: targetTimes.firstResponse,
        slaResolutionTarget: targetTimes.resolution,
        slaStartTime: admin.firestore.Timestamp.now()
      });

      // Schedule SLA breach checks
      await this.scheduleSLAChecks(ticketId, targetTimes);
    }

    // Auto-assign based on category
    if (!ticket.assigneeId) {
      const assigneeId = await this.findBestAssignee(ticket);
      if (assigneeId) {
        await this.db.collection('tickets').doc(ticketId).update({
          assigneeId,
          status: 'assigned',
          assignedAt: admin.firestore.Timestamp.now()
        });

        // Notify assignee
        await this.createNotification(
          assigneeId,
          'task',
          'New Ticket Assigned',
          `Ticket #${ticket.ticketNumber}: ${ticket.subject}`,
          'ticket',
          ticketId
        );
      }
    }

    // Send auto-acknowledgment
    await this.sendTicketAcknowledgment(ticket);
  }

  /**
   * Process candidate invitation automation
   */
  async processCandidateInvited(candidateId: string): Promise<void> {
    const candidateDoc = await this.db.collection('candidates').doc(candidateId).get();
    if (!candidateDoc.exists) return;

    const candidate = candidateDoc.data()!;

    // Generate portal invite
    const inviteToken = this.generateInviteToken();
    const inviteData = {
      email: candidate.email,
      portalType: 'candidate',
      candidateId,
      token: inviteToken,
      status: 'pending',
      expiresAt: this.calculateInviteExpiry(),
      customMessage: `Welcome to MAS recruitment process for ${candidate.position}`,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system'
    };

    const inviteRef = await this.db.collection('portalInvites').add(inviteData);

    // Update candidate
    await this.db.collection('candidates').doc(candidateId).update({
      portalInviteId: inviteRef.id,
      inviteSent: true,
      inviteSentAt: admin.firestore.Timestamp.now()
    });

    // Assign pre-hire training
    await this.assignCandidateTraining(candidateId, candidate.position);

    // Send invitation email
    await this.sendCandidateInviteEmail(candidate, inviteToken);

    // Create follow-up task for HR
    const hrUsers = await this.getUsersByRole('hr_user');
    if (hrUsers.length > 0) {
      await this.createTask(
        hrUsers[0],
        'Follow up with candidate',
        `Check if ${candidate.name} has accepted portal invitation`,
        'medium',
        candidateId,
        7 // Due in 7 days
      );
    }
  }

  /**
   * Process employee onboarding automation
   */
  async processEmployeeOnboarding(userId: string): Promise<void> {
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) return;

    const user = userDoc.data()!;

    // Get onboarding template
    const template = await this.getOnboardingTemplate(user.departmentId, user.title);

    if (template) {
      // Create onboarding tasks
      for (const task of template.tasks) {
        const dueDate = this.calculateTaskDueDate(user.startDate, task.daysFromStart);

        await this.db.collection('onboardingTasks').add({
          userId,
          templateId: template.id,
          title: task.title,
          description: task.description,
          category: task.category,
          assigneeId: await this.getTaskAssignee(task.assigneeRole, user.departmentId),
          dueDate,
          status: 'pending',
          required: task.required,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
    }

    // Assign mandatory training
    await this.assignEmployeeTraining(userId, user.departmentId, user.title);

    // Setup equipment request
    await this.createEquipmentRequest(userId, user.title);

    // Schedule first day meeting
    await this.scheduleFirstDayMeeting(userId, user.managerId);

    // Grant system access
    await this.grantSystemAccess(userId, user.role);
  }

  // Helper methods

  private calculateDaysPastDue(dueDate: admin.firestore.Timestamp): number {
    const now = Date.now();
    const due = dueDate.toMillis();
    const dayInMs = 24 * 60 * 60 * 1000;
    return Math.floor((now - due) / dayInMs);
  }

  private async sendInvoiceReminder(invoice: any, type: 'friendly' | 'urgent' | 'final'): Promise<void> {
    const templates = {
      friendly: 'invoice-reminder-friendly',
      urgent: 'invoice-reminder-urgent',
      final: 'invoice-reminder-final'
    };

    // Queue email
    await this.db.collection('emailQueue').add({
      to: invoice.accountEmail,
      template: templates[type],
      data: {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.total,
        dueDate: invoice.dueDate,
        daysPastDue: this.calculateDaysPastDue(invoice.dueDate),
        paymentUrl: `${process.env.CLIENT_PORTAL_URL}/invoices/${invoice.id}`
      },
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async blockClientPortalAccess(accountId: string): Promise<void> {
    await this.db.collection('accounts').doc(accountId).update({
      portalBlocked: true,
      portalBlockedReason: 'Overdue invoices',
      portalBlockedAt: admin.firestore.Timestamp.now()
    });

    // Revoke active sessions
    const users = await this.db.collection('users')
      .where('portalAccess.client', 'array-contains', accountId)
      .get();

    for (const userDoc of users.docs) {
      await this.db.collection('users').doc(userDoc.id).update({
        'portalAccess.blocked': true
      });
    }
  }

  private async createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    entityType?: string,
    entityId?: string
  ): Promise<void> {
    await this.db.collection('notifications').add({
      userId,
      type,
      title,
      message,
      entityType,
      entityId,
      actionUrl: entityType && entityId ? `/${entityType}s/${entityId}` : undefined,
      read: false,
      emailSent: false,
      pushSent: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
  }

  private async createTask(
    assigneeId: string,
    title: string,
    description: string,
    priority: string,
    entityId: string,
    dueDays: number = 3
  ): Promise<void> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    await this.db.collection('tasks').add({
      title,
      description,
      status: 'todo',
      priority: priority === 'high' ? 5 : priority === 'medium' ? 3 : 1,
      assigneeId,
      dueDate: admin.firestore.Timestamp.fromDate(dueDate),
      entityType: 'automation',
      entityId,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system'
    });
  }

  private async createKickoffTasks(projectId: string, managerId: string): Promise<void> {
    const kickoffTasks = [
      { title: 'Schedule kickoff meeting', priority: 5, dueDays: 2 },
      { title: 'Prepare project charter', priority: 4, dueDays: 3 },
      { title: 'Setup project workspace', priority: 4, dueDays: 1 },
      { title: 'Identify project team', priority: 5, dueDays: 2 },
      { title: 'Create communication plan', priority: 3, dueDays: 5 }
    ];

    for (const task of kickoffTasks) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + task.dueDays);

      await this.db.collection('tasks').add({
        projectId,
        title: task.title,
        status: 'todo',
        priority: task.priority,
        assigneeId: managerId,
        dueDate: admin.firestore.Timestamp.fromDate(dueDate),
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: 'system'
      });
    }
  }

  private async enableClientPortal(accountId: string): Promise<void> {
    await this.db.collection('accounts').doc(accountId).update({
      portalEnabled: true,
      portalEnabledAt: admin.firestore.Timestamp.now()
    });
  }

  private async generateContractNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const counterDoc = await this.db.collection('counters').doc('contracts').get();
    let counter = 1;

    if (counterDoc.exists) {
      counter = counterDoc.data()!.value + 1;
      await this.db.collection('counters').doc('contracts').update({ value: counter });
    } else {
      await this.db.collection('counters').doc('contracts').set({ value: counter });
    }

    return `CON-${year}${month}-${String(counter).padStart(4, '0')}`;
  }

  private calculateProjectDueDate(opportunity: any): admin.firestore.Timestamp {
    const dueDate = new Date();
    const estimatedDuration = opportunity.estimatedDuration || 90; // Default 90 days
    dueDate.setDate(dueDate.getDate() + estimatedDuration);
    return admin.firestore.Timestamp.fromDate(dueDate);
  }

  private calculateContractEndDate(quote: any): admin.firestore.Timestamp {
    const endDate = new Date();
    const duration = quote.contractDuration || 365; // Default 1 year
    endDate.setDate(endDate.getDate() + duration);
    return admin.firestore.Timestamp.fromDate(endDate);
  }

  private calculateInviteExpiry(): admin.firestore.Timestamp {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // 7 days expiry
    return admin.firestore.Timestamp.fromDate(expiryDate);
  }

  private calculateTaskDueDate(startDate: admin.firestore.Timestamp, daysFromStart: number): admin.firestore.Timestamp {
    const dueDate = startDate.toDate();
    dueDate.setDate(dueDate.getDate() + daysFromStart);
    return admin.firestore.Timestamp.fromDate(dueDate);
  }

  private generateInviteToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  private async getUsersByRole(role: string): Promise<string[]> {
    const users = await this.db.collection('users')
      .where('role', '==', role)
      .where('active', '==', true)
      .get();
    return users.docs.map(doc => doc.id);
  }

  private async getSLAPolicy(policyId: string): Promise<any> {
    const policyDoc = await this.db.collection('slaPolicy').doc(policyId).get();
    return policyDoc.exists ? policyDoc.data() : null;
  }

  private calculateSLATargets(priority: string, policy: any): any {
    const target = policy.targets.find((t: any) => t.priority === priority) || policy.targets[0];
    const now = Date.now();

    return {
      firstResponse: new Date(now + target.firstResponseTime * 60000),
      resolution: new Date(now + target.resolutionTime * 60000)
    };
  }

  private async scheduleSLAChecks(ticketId: string, targets: any): Promise<void> {
    // This would integrate with Cloud Scheduler or Cloud Tasks
    // For now, we'll store the check times for a scheduled function to process
    await this.db.collection('slaChecks').add({
      ticketId,
      firstResponseCheck: targets.firstResponse,
      resolutionCheck: targets.resolution,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async findBestAssignee(ticket: any): Promise<string | null> {
    // Find available support agent with least tickets
    const agents = await this.db.collection('users')
      .where('role', 'in', ['support_agent', 'support_manager'])
      .where('active', '==', true)
      .get();

    if (agents.empty) return null;

    let bestAgent = null;
    let minTickets = Infinity;

    for (const agentDoc of agents.docs) {
      const activeTickets = await this.db.collection('tickets')
        .where('assigneeId', '==', agentDoc.id)
        .where('status', 'in', ['assigned', 'in_progress'])
        .get();

      if (activeTickets.size < minTickets) {
        minTickets = activeTickets.size;
        bestAgent = agentDoc.id;
      }
    }

    return bestAgent;
  }

  private async sendTicketAcknowledgment(ticket: any): Promise<void> {
    // Queue acknowledgment email
    await this.db.collection('emailQueue').add({
      to: ticket.accountEmail,
      template: 'ticket-acknowledgment',
      data: {
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        priority: ticket.priority,
        trackingUrl: `${process.env.CLIENT_PORTAL_URL}/tickets/${ticket.id}`
      },
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  // Additional helper methods would go here...

  private async notifyAccountManager(invoice: any): Promise<void> {
    const account = await this.db.collection('accounts').doc(invoice.accountId).get();
    if (account.exists && account.data()!.assignedTo) {
      await this.createNotification(
        account.data()!.assignedTo,
        'warning',
        'Invoice Overdue',
        `Invoice ${invoice.invoiceNumber} for ${account.data()!.name} is overdue`,
        'invoice',
        invoice.id
      );
    }
  }

  private async escalateToFinance(invoice: any): Promise<void> {
    const financeUsers = await this.getUsersByRole('finance_manager');
    for (const userId of financeUsers) {
      await this.createNotification(
        userId,
        'error',
        'Overdue Invoice Escalation',
        `Invoice ${invoice.invoiceNumber} is 15+ days overdue. Client portal access blocked.`,
        'invoice',
        invoice.id
      );
    }
  }

  private async escalateToCollections(invoice: any): Promise<void> {
    // Create collections case
    await this.db.collection('collectionsCase').add({
      invoiceId: invoice.id,
      accountId: invoice.accountId,
      amount: invoice.balanceDue,
      daysPastDue: 30,
      status: 'new',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async notifyDepartmentHead(managerId: string, type: string, data: any): Promise<void> {
    const manager = await this.db.collection('users').doc(managerId).get();
    if (manager.exists && manager.data()!.departmentId) {
      const dept = await this.db.collection('departments').doc(manager.data()!.departmentId).get();
      if (dept.exists && dept.data()!.managerId) {
        await this.createNotification(
          dept.data()!.managerId,
          'warning',
          'Department Alert',
          `${type}: ${data.name}`,
          'project',
          data.id
        );
      }
    }
  }

  private async blockProjectExpenses(projectId: string): Promise<void> {
    await this.db.collection('projects').doc(projectId).update({
      expensesBlocked: true,
      expensesBlockedAt: admin.firestore.Timestamp.now(),
      expensesBlockedReason: 'Budget exceeded'
    });
  }

  private async createReviewTask(managerId: string, description: string, projectId: string): Promise<void> {
    await this.createTask(managerId, 'Budget Review Required', description, 'high', projectId, 1);
  }

  private async escalateToCLevel(type: string, data: any): Promise<void> {
    const cLevelUsers = await this.getUsersByRole('admin');
    for (const userId of cLevelUsers) {
      await this.createNotification(
        userId,
        'error',
        'Executive Escalation',
        `${type}: ${data.name}`,
        'project',
        data.id
      );
    }
  }

  private async sendClientWelcomeEmail(accountId: string, projectId: string): Promise<void> {
    const account = await this.db.collection('accounts').doc(accountId).get();
    if (account.exists) {
      await this.db.collection('emailQueue').add({
        to: account.data()!.email,
        template: 'client-welcome',
        data: {
          clientName: account.data()!.name,
          projectId,
          portalUrl: process.env.CLIENT_PORTAL_URL
        },
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now()
      });
    }
  }

  private async notifyTeamOfNewProject(projectId: string, opportunity: any): Promise<void> {
    // Notify relevant team members
    const projectManagers = await this.getUsersByRole('project_manager');
    for (const pmId of projectManagers) {
      await this.createNotification(
        pmId,
        'info',
        'New Project Created',
        `Project created from won deal: ${opportunity.name}`,
        'project',
        projectId
      );
    }
  }

  private async assignCandidateTraining(candidateId: string, position: string): Promise<void> {
    // Find relevant courses for position
    const courses = await this.db.collection('courses')
      .where('audience', 'in', ['candidate', 'mixed'])
      .where('tags', 'array-contains', position.toLowerCase())
      .get();

    for (const courseDoc of courses.docs) {
      await this.db.collection('assignments').add({
        courseId: courseDoc.id,
        candidateId,
        assignedBy: 'system',
        status: 'not_started',
        progressPct: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  }

  private async sendCandidateInviteEmail(candidate: any, token: string): Promise<void> {
    await this.db.collection('emailQueue').add({
      to: candidate.email,
      template: 'candidate-invite',
      data: {
        candidateName: candidate.name,
        position: candidate.position,
        inviteUrl: `${process.env.CANDIDATE_PORTAL_URL}/invite/${token}`
      },
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async getOnboardingTemplate(departmentId: string, position: string): Promise<any> {
    let template = await this.db.collection('onboardingTemplates')
      .where('department', '==', departmentId)
      .where('position', '==', position)
      .where('active', '==', true)
      .get();

    if (template.empty) {
      template = await this.db.collection('onboardingTemplates')
        .where('department', '==', departmentId)
        .where('active', '==', true)
        .get();
    }

    if (template.empty) {
      template = await this.db.collection('onboardingTemplates')
        .where('name', '==', 'default')
        .where('active', '==', true)
        .get();
    }

    return !template.empty ? { id: template.docs[0].id, ...template.docs[0].data() } : null;
  }

  private async getTaskAssignee(role: string | undefined, departmentId: string): Promise<string> {
    if (!role) return 'system';

    if (role === 'manager') {
      const dept = await this.db.collection('departments').doc(departmentId).get();
      return dept.exists ? dept.data()!.managerId : 'system';
    }

    const users = await this.getUsersByRole(role);
    return users.length > 0 ? users[0] : 'system';
  }

  private async assignEmployeeTraining(userId: string, departmentId: string, position: string): Promise<void> {
    const courses = await this.db.collection('courses')
      .where('audience', 'in', ['employee', 'mixed'])
      .where('required', '==', true)
      .get();

    for (const courseDoc of courses.docs) {
      await this.db.collection('assignments').add({
        courseId: courseDoc.id,
        userId,
        assignedBy: 'system',
        dueDate: this.calculateTrainingDueDate(30), // 30 days to complete
        status: 'not_started',
        progressPct: 0,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  }

  private calculateTrainingDueDate(days: number): admin.firestore.Timestamp {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return admin.firestore.Timestamp.fromDate(date);
  }

  private async createEquipmentRequest(userId: string, position: string): Promise<void> {
    // Standard equipment based on position
    const equipment = this.getStandardEquipment(position);

    await this.db.collection('equipmentRequests').add({
      userId,
      items: equipment,
      status: 'pending',
      priority: 'high',
      requiredBy: admin.firestore.Timestamp.now(),
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
  }

  private getStandardEquipment(position: string): any[] {
    const baseEquipment = [
      { item: 'Laptop', quantity: 1 },
      { item: 'Mouse', quantity: 1 },
      { item: 'Keyboard', quantity: 1 }
    ];

    // Add position-specific equipment
    if (position.toLowerCase().includes('developer')) {
      baseEquipment.push({ item: 'External Monitor', quantity: 2 });
    } else if (position.toLowerCase().includes('designer')) {
      baseEquipment.push({ item: 'Graphics Tablet', quantity: 1 });
    }

    return baseEquipment;
  }

  private async scheduleFirstDayMeeting(userId: string, managerId: string): Promise<void> {
    const user = await this.db.collection('users').doc(userId).get();
    if (!user.exists) return;

    const startDate = user.data()!.startDate.toDate();

    await this.db.collection('meetings').add({
      title: 'First Day Welcome Meeting',
      attendees: [userId, managerId],
      scheduledAt: admin.firestore.Timestamp.fromDate(startDate),
      duration: 60, // minutes
      type: 'onboarding',
      status: 'scheduled',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async grantSystemAccess(userId: string, role: string): Promise<void> {
    // This would integrate with your identity provider
    // For now, we'll update the user document
    await this.db.collection('users').doc(userId).update({
      systemAccess: true,
      accessGrantedAt: admin.firestore.Timestamp.now(),
      permissions: this.getRolePermissions(role)
    });
  }

  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      admin: ['all'],
      project_manager: ['projects.manage', 'tasks.manage', 'timesheets.approve'],
      developer: ['tasks.update', 'timesheets.create'],
      sales_rep: ['accounts.manage', 'opportunities.manage', 'quotes.create'],
      support_agent: ['tickets.manage', 'visits.create'],
      hr_user: ['candidates.manage', 'onboarding.manage'],
      finance_user: ['invoices.view', 'payments.view']
    };

    return permissions[role] || ['basic'];
  }
}

export default AutomationRulesEngine;
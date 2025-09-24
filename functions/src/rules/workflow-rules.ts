import * as admin from 'firebase-admin';

/**
 * Workflow Rules Engine
 * Manages complex business workflows like deal conversions and process automations
 */

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  steps: WorkflowStep[];
  active: boolean;
  variables?: Record<string, any>;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'condition' | 'parallel' | 'wait';
  config: StepConfig;
  nextSteps?: NextStep[];
  errorHandler?: ErrorHandler;
}

export interface StepConfig {
  action?: string;
  params?: Record<string, any>;
  condition?: ConditionConfig;
  parallel?: ParallelConfig;
  waitTime?: number; // in minutes
}

export interface ConditionConfig {
  field: string;
  operator: string;
  value: any;
  thenStep?: string;
  elseStep?: string;
}

export interface ParallelConfig {
  steps: string[];
  waitForAll: boolean;
}

export interface NextStep {
  stepId: string;
  condition?: ConditionConfig;
}

export interface ErrorHandler {
  action: 'retry' | 'skip' | 'fail' | 'notify';
  retryCount?: number;
  notifyUsers?: string[];
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  currentStep?: string;
  context: Record<string, any>;
  startedAt: admin.firestore.Timestamp;
  completedAt?: admin.firestore.Timestamp;
  error?: string;
}

export class WorkflowRulesEngine {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  /**
   * Convert won deal to project
   */
  async convertDealToProject(opportunityId: string): Promise<string> {
    const oppDoc = await this.db.collection('opportunities').doc(opportunityId).get();
    if (!oppDoc.exists) {
      throw new Error('Opportunity not found');
    }

    const opp = oppDoc.data()!;
    if (opp.stage !== 'won') {
      throw new Error('Only won deals can be converted to projects');
    }

    // Start workflow instance
    const instance = await this.createWorkflowInstance('deal_to_project', {
      opportunityId,
      opportunity: opp
    });

    try {
      // Step 1: Create project
      const projectId = await this.createProjectFromDeal(opp);

      // Step 2: Create project phases
      await this.createProjectPhases(projectId, opp);

      // Step 3: Create kickoff tasks
      await this.createKickoffTasks(projectId, opp);

      // Step 4: Setup project team
      await this.setupProjectTeam(projectId, opp);

      // Step 5: Enable client portal
      await this.enableClientPortalAccess(opp.accountId, projectId);

      // Step 6: Convert quote to contract if exists
      if (opp.quoteId) {
        await this.convertQuoteToContract(opp.quoteId);
      }

      // Step 7: Send notifications
      await this.sendProjectCreationNotifications(projectId, opp);

      // Step 8: Update opportunity
      await this.db.collection('opportunities').doc(opportunityId).update({
        projectId,
        convertedToProject: true,
        convertedAt: admin.firestore.Timestamp.now()
      });

      // Complete workflow
      await this.completeWorkflowInstance(instance.id, { projectId });

      return projectId;

    } catch (error) {
      await this.failWorkflowInstance(instance.id, (error as Error).message);
      throw error;
    }
  }

  /**
   * Convert approved quote to contract
   */
  async convertQuoteToContract(quoteId: string): Promise<string> {
    const quoteDoc = await this.db.collection('quotes').doc(quoteId).get();
    if (!quoteDoc.exists) {
      throw new Error('Quote not found');
    }

    const quote = quoteDoc.data()!;
    if (quote.status !== 'accepted') {
      throw new Error('Only accepted quotes can be converted to contracts');
    }

    // Start workflow instance
    const instance = await this.createWorkflowInstance('quote_to_contract', {
      quoteId,
      quote
    });

    try {
      // Step 1: Generate contract
      const contractData = {
        accountId: quote.accountId,
        contractNumber: await this.generateContractNumber(),
        title: `Contract from Quote ${quote.quoteNumber}`,
        type: this.determineContractType(quote),
        status: 'draft',
        startDate: admin.firestore.Timestamp.now(),
        endDate: this.calculateContractEndDate(quote),
        value: quote.total,
        currency: quote.currency,
        billingFrequency: quote.billingFrequency || 'one-time',
        paymentTerms: quote.paymentTerms || 30,
        quoteId,
        lineItems: quote.lineItems,
        terms: quote.terms,
        notes: quote.notes,
        autoRenew: false,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: quote.createdBy,
        updatedBy: 'system'
      };

      // Step 2: Create contract
      const contractRef = await this.db.collection('contracts').add(contractData);
      const contractId = contractRef.id;

      // Step 3: Create billing schedule
      await this.createBillingSchedule(contractId, contractData);

      // Step 4: Setup SLA if applicable
      if (quote.slaPolicyId) {
        await this.attachSLAToContract(contractId, quote.slaPolicyId);
      }

      // Step 5: Create signature request
      const signatureTaskId = await this.createSignatureTask(contractId, quote);

      // Step 6: Update quote
      await this.db.collection('quotes').doc(quoteId).update({
        contractId,
        convertedToContract: true,
        convertedAt: admin.firestore.Timestamp.now()
      });

      // Step 7: Send notifications
      await this.sendContractCreationNotifications(contractId, quote);

      // Complete workflow
      await this.completeWorkflowInstance(instance.id, { contractId, signatureTaskId });

      return contractId;

    } catch (error) {
      await this.failWorkflowInstance(instance.id, (error as Error).message);
      throw error;
    }
  }

  /**
   * Process invoice payment workflow
   */
  async processInvoicePayment(paymentId: string): Promise<void> {
    const paymentDoc = await this.db.collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      throw new Error('Payment not found');
    }

    const payment = paymentDoc.data()!;

    // Start workflow instance
    const instance = await this.createWorkflowInstance('invoice_payment', {
      paymentId,
      payment
    });

    try {
      // Step 1: Verify payment
      const verified = await this.verifyPayment(payment);
      if (!verified) {
        throw new Error('Payment verification failed');
      }

      // Step 2: Update invoice
      await this.updateInvoiceWithPayment(payment.invoiceId, payment);

      // Step 3: Create transaction records
      await this.createFinancialTransactions(payment);

      // Step 4: Check if invoice is fully paid
      const fullyPaid = await this.checkInvoiceFullyPaid(payment.invoiceId);

      if (fullyPaid) {
        // Step 5: Execute post-payment actions
        await this.executePostPaymentActions(payment.invoiceId);

        // Step 6: Check and unblock client portal if needed
        await this.checkAndUnblockPortal(payment.accountId);
      }

      // Step 7: Send receipts and notifications
      await this.sendPaymentReceipt(payment);

      // Complete workflow
      await this.completeWorkflowInstance(instance.id, { fullyPaid });

    } catch (error) {
      await this.failWorkflowInstance(instance.id, (error as Error).message);
      throw error;
    }
  }

  /**
   * Process candidate hiring workflow
   */
  async processCandidateHiring(candidateId: string): Promise<void> {
    const candidateDoc = await this.db.collection('candidates').doc(candidateId).get();
    if (!candidateDoc.exists) {
      throw new Error('Candidate not found');
    }

    const candidate = candidateDoc.data()!;

    // Start workflow instance
    const instance = await this.createWorkflowInstance('candidate_hiring', {
      candidateId,
      candidate
    });

    try {
      // Step 1: Create employee record
      const employeeData = {
        email: candidate.email,
        name: candidate.name,
        phoneNumber: candidate.phoneNumber,
        active: false, // Will be activated on start date
        departmentId: candidate.department,
        title: candidate.position,
        startDate: candidate.startDate || admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Default 2 weeks from now
        ),
        language: 'en',
        portalAccess: {
          employee: true
        },
        candidateId, // Link to candidate record
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: 'system'
      };

      const userRef = await this.db.collection('users').add(employeeData);
      const userId = userRef.id;

      // Step 2: Transfer training progress
      await this.transferCandidateTraining(candidateId, userId);

      // Step 3: Create onboarding checklist
      await this.createOnboardingChecklist(userId, candidate);

      // Step 4: Setup equipment request
      await this.createEquipmentRequest(userId, candidate.position);

      // Step 5: Grant initial system access
      await this.setupInitialAccess(userId, candidate);

      // Step 6: Schedule first day activities
      await this.scheduleFirstDayActivities(userId, candidate);

      // Step 7: Update candidate status
      await this.db.collection('candidates').doc(candidateId).update({
        stage: 'hired',
        hiredDate: admin.firestore.Timestamp.now(),
        employeeId: userId
      });

      // Step 8: Deactivate candidate portal
      await this.deactivateCandidatePortal(candidateId);

      // Step 9: Send welcome email
      await this.sendEmployeeWelcomeEmail(userId, candidate);

      // Complete workflow
      await this.completeWorkflowInstance(instance.id, { userId });

    } catch (error) {
      await this.failWorkflowInstance(instance.id, (error as Error).message);
      throw error;
    }
  }

  /**
   * Process project completion workflow
   */
  async processProjectCompletion(projectId: string): Promise<void> {
    const projectDoc = await this.db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) {
      throw new Error('Project not found');
    }

    const project = projectDoc.data()!;

    // Start workflow instance
    const instance = await this.createWorkflowInstance('project_completion', {
      projectId,
      project
    });

    try {
      // Step 1: Verify all tasks completed
      const allTasksComplete = await this.verifyAllTasksComplete(projectId);
      if (!allTasksComplete) {
        throw new Error('Not all tasks are completed');
      }

      // Step 2: Generate final invoice
      const finalInvoiceId = await this.generateFinalInvoice(projectId);

      // Step 3: Archive project documents
      await this.archiveProjectDocuments(projectId);

      // Step 4: Calculate project metrics
      const metrics = await this.calculateProjectMetrics(projectId);

      // Step 5: Generate completion report
      const reportId = await this.generateCompletionReport(projectId, metrics);

      // Step 6: Request client feedback
      await this.requestClientFeedback(projectId);

      // Step 7: Update project status
      await this.db.collection('projects').doc(projectId).update({
        status: 'completed',
        actualEndDate: admin.firestore.Timestamp.now(),
        completionPercentage: 100,
        finalInvoiceId,
        completionReportId: reportId,
        metrics
      });

      // Step 8: Release team members
      await this.releaseProjectTeam(projectId);

      // Step 9: Send completion notifications
      await this.sendProjectCompletionNotifications(projectId);

      // Complete workflow
      await this.completeWorkflowInstance(instance.id, {
        finalInvoiceId,
        reportId,
        metrics
      });

    } catch (error) {
      await this.failWorkflowInstance(instance.id, (error as Error).message);
      throw error;
    }
  }

  // Helper methods for deal to project conversion

  private async createProjectFromDeal(opp: any): Promise<string> {
    const projectData = {
      name: opp.name,
      code: await this.generateProjectCode(),
      accountId: opp.accountId,
      projectTypeId: opp.projectTypeId || 'default',
      managerId: opp.ownerId,
      description: `Project created from opportunity: ${opp.name}`,
      status: 'planning',
      startDate: admin.firestore.Timestamp.now(),
      dueDate: this.calculateProjectEndDate(opp),
      estimateBudget: opp.amount,
      actualBudget: 0,
      currency: opp.currency,
      completionPercentage: 0,
      members: [opp.ownerId],
      tags: ['from-opportunity', opp.source].filter(Boolean),
      opportunityId: opp.id,
      customFields: {
        source: 'sales',
        originalOpportunity: opp.id
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system',
      updatedBy: 'system'
    };

    const projectRef = await this.db.collection('projects').add(projectData);
    return projectRef.id;
  }

  private async createProjectPhases(projectId: string, opp: any): Promise<void> {
    // Get project type template
    const projectTypeId = opp.projectTypeId || 'default';
    const templateDoc = await this.db.collection('projectTemplates')
      .where('projectTypeId', '==', projectTypeId)
      .limit(1)
      .get();

    let phases = [];
    if (!templateDoc.empty) {
      phases = templateDoc.docs[0].data().phases;
    } else {
      // Default phases
      phases = [
        { name: 'Planning', duration: 7, weight: 20 },
        { name: 'Design', duration: 14, weight: 25 },
        { name: 'Development', duration: 30, weight: 35 },
        { name: 'Testing', duration: 7, weight: 15 },
        { name: 'Deployment', duration: 3, weight: 5 }
      ];
    }

    let currentDate = new Date();
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const startDate = new Date(currentDate);
      const dueDate = new Date(currentDate);
      dueDate.setDate(dueDate.getDate() + phase.duration);

      await this.db.collection('projects').doc(projectId)
        .collection('phases').add({
          projectId,
          name: phase.name,
          description: `${phase.name} phase`,
          startDate: admin.firestore.Timestamp.fromDate(startDate),
          dueDate: admin.firestore.Timestamp.fromDate(dueDate),
          weight: phase.weight,
          status: i === 0 ? 'in_progress' : 'planning',
          completionPercentage: 0,
          order: i + 1,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });

      currentDate = dueDate;
    }
  }

  private async createKickoffTasks(projectId: string, opp: any): Promise<void> {
    const tasks = [
      {
        title: 'Schedule project kickoff meeting',
        description: 'Organize and schedule the initial project kickoff meeting with all stakeholders',
        priority: 5,
        dueInDays: 2
      },
      {
        title: 'Prepare project charter',
        description: 'Create comprehensive project charter document',
        priority: 4,
        dueInDays: 3
      },
      {
        title: 'Setup project workspace',
        description: 'Configure project management tools and collaboration spaces',
        priority: 4,
        dueInDays: 1
      },
      {
        title: 'Identify and onboard project team',
        description: 'Confirm team members and ensure they have necessary access',
        priority: 5,
        dueInDays: 2
      },
      {
        title: 'Create communication plan',
        description: 'Define communication channels and reporting schedule',
        priority: 3,
        dueInDays: 5
      }
    ];

    for (const task of tasks) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + task.dueInDays);

      await this.db.collection('tasks').add({
        projectId,
        title: task.title,
        description: task.description,
        status: 'todo',
        priority: task.priority,
        assigneeId: opp.ownerId,
        dueDate: admin.firestore.Timestamp.fromDate(dueDate),
        tags: ['kickoff', 'automated'],
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        createdBy: 'system'
      });
    }
  }

  private async setupProjectTeam(projectId: string, opp: any): Promise<void> {
    // Add default team members based on project type
    const defaultMembers = [opp.ownerId]; // Start with opportunity owner

    // Add project manager if different from owner
    const projectDoc = await this.db.collection('projects').doc(projectId).get();
    if (projectDoc.exists) {
      const managerId = projectDoc.data()!.managerId;
      if (managerId && managerId !== opp.ownerId) {
        defaultMembers.push(managerId);
      }
    }

    // Add team members to project
    for (const memberId of defaultMembers) {
      await this.db.collection('projects').doc(projectId)
        .collection('members').doc(memberId).set({
          userId: memberId,
          role: memberId === opp.ownerId ? 'owner' : 'member',
          joinedAt: admin.firestore.Timestamp.now(),
          active: true
        });
    }
  }

  private async enableClientPortalAccess(accountId: string, projectId: string): Promise<void> {
    // Enable portal for account
    await this.db.collection('accounts').doc(accountId).update({
      portalEnabled: true,
      portalEnabledAt: admin.firestore.Timestamp.now(),
      activeProjects: admin.firestore.FieldValue.arrayUnion(projectId)
    });

    // Create portal access record
    await this.db.collection('portalAccess').add({
      accountId,
      projectId,
      type: 'client',
      grantedAt: admin.firestore.Timestamp.now(),
      grantedBy: 'system',
      active: true
    });
  }

  // Helper methods for quote to contract conversion

  private determineContractType(quote: any): string {
    if (quote.recurring) return 'recurring';
    if (quote.retainer) return 'retainer';
    return 'one-time';
  }

  private calculateContractEndDate(quote: any): admin.firestore.Timestamp {
    const months = quote.contractMonths || 12; // Default 12 months
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);
    return admin.firestore.Timestamp.fromDate(endDate);
  }

  private async createBillingSchedule(contractId: string, contract: any): Promise<void> {
    if (contract.type === 'one-time') {
      // Single billing event
      await this.db.collection('billingSchedule').add({
        contractId,
        dueDate: contract.startDate,
        amount: contract.value,
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now()
      });
    } else if (contract.type === 'recurring') {
      // Create recurring billing schedule
      const frequency = contract.billingFrequency || 'monthly';
      const periods = this.calculateBillingPeriods(contract.startDate, contract.endDate, frequency);

      for (const period of periods) {
        await this.db.collection('billingSchedule').add({
          contractId,
          dueDate: period.dueDate,
          amount: period.amount,
          status: 'pending',
          periodStart: period.start,
          periodEnd: period.end,
          createdAt: admin.firestore.Timestamp.now()
        });
      }
    }
  }

  private calculateBillingPeriods(startDate: any, endDate: any, frequency: string): any[] {
    const periods = [];
    const start = startDate.toDate();
    const end = endDate.toDate();
    let currentDate = new Date(start);

    while (currentDate < end) {
      const periodStart = new Date(currentDate);
      let periodEnd = new Date(currentDate);

      switch (frequency) {
        case 'monthly':
          periodEnd.setMonth(periodEnd.getMonth() + 1);
          break;
        case 'quarterly':
          periodEnd.setMonth(periodEnd.getMonth() + 3);
          break;
        case 'annually':
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
          break;
      }

      if (periodEnd > end) periodEnd = end;

      periods.push({
        start: admin.firestore.Timestamp.fromDate(periodStart),
        end: admin.firestore.Timestamp.fromDate(periodEnd),
        dueDate: admin.firestore.Timestamp.fromDate(periodStart),
        amount: 0 // Will be calculated based on contract value
      });

      currentDate = periodEnd;
    }

    // Calculate amount per period
    const amountPerPeriod = periods.length > 0 ? Math.floor(100 / periods.length) / 100 : 0;
    periods.forEach(p => p.amount = amountPerPeriod);

    return periods;
  }

  private async attachSLAToContract(contractId: string, slaPolicyId: string): Promise<void> {
    await this.db.collection('contracts').doc(contractId).update({
      slaPolicyId,
      slaAttachedAt: admin.firestore.Timestamp.now()
    });
  }

  private async createSignatureTask(contractId: string, quote: any): Promise<string> {
    const taskData = {
      title: 'Obtain contract signature',
      description: `Get client signature for contract from quote ${quote.quoteNumber}`,
      status: 'todo',
      priority: 5,
      assigneeId: quote.createdBy,
      dueDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      ),
      entityType: 'contract',
      entityId: contractId,
      tags: ['signature', 'contract', 'urgent'],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system'
    };

    const taskRef = await this.db.collection('tasks').add(taskData);
    return taskRef.id;
  }

  // Workflow management methods

  private async createWorkflowInstance(
    workflowType: string,
    context: Record<string, any>
  ): Promise<WorkflowInstance> {
    const instance: WorkflowInstance = {
      id: '',
      workflowId: workflowType,
      status: 'running',
      context,
      startedAt: admin.firestore.Timestamp.now()
    };

    const ref = await this.db.collection('workflowInstances').add(instance);
    instance.id = ref.id;
    return instance;
  }

  private async completeWorkflowInstance(
    instanceId: string,
    result: Record<string, any>
  ): Promise<void> {
    await this.db.collection('workflowInstances').doc(instanceId).update({
      status: 'completed',
      completedAt: admin.firestore.Timestamp.now(),
      result
    });
  }

  private async failWorkflowInstance(
    instanceId: string,
    error: string
  ): Promise<void> {
    await this.db.collection('workflowInstances').doc(instanceId).update({
      status: 'failed',
      completedAt: admin.firestore.Timestamp.now(),
      error
    });
  }

  // Utility methods

  private async generateProjectCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const counter = await this.getNextCounter('projects');
    return `PRJ-${year}${month}-${String(counter).padStart(4, '0')}`;
  }

  private async generateContractNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    const counter = await this.getNextCounter('contracts');
    return `CON-${year}${month}-${String(counter).padStart(4, '0')}`;
  }

  private async getNextCounter(collection: string): Promise<number> {
    const counterRef = this.db.collection('counters').doc(collection);
    const counterDoc = await counterRef.get();

    let counter = 1;
    if (counterDoc.exists) {
      counter = counterDoc.data()!.value + 1;
      await counterRef.update({ value: counter });
    } else {
      await counterRef.set({ value: counter });
    }

    return counter;
  }

  private calculateProjectEndDate(opp: any): admin.firestore.Timestamp {
    const duration = opp.estimatedDuration || 90; // Default 90 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    return admin.firestore.Timestamp.fromDate(endDate);
  }

  private async sendProjectCreationNotifications(projectId: string, opp: any): Promise<void> {
    // Notify project manager
    await this.createNotification(
      opp.ownerId,
      'success',
      'Project Created',
      `Project created from opportunity: ${opp.name}`,
      'project',
      projectId
    );

    // Notify account manager
    if (opp.accountManagerId && opp.accountManagerId !== opp.ownerId) {
      await this.createNotification(
        opp.accountManagerId,
        'info',
        'New Project',
        `A new project has been created for your account: ${opp.name}`,
        'project',
        projectId
      );
    }
  }

  private async sendContractCreationNotifications(contractId: string, quote: any): Promise<void> {
    await this.createNotification(
      quote.createdBy,
      'success',
      'Contract Created',
      `Contract created from quote ${quote.quoteNumber}`,
      'contract',
      contractId
    );
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

  // Additional helper methods for other workflows...

  private async verifyPayment(payment: any): Promise<boolean> {
    // Verify payment with gateway if applicable
    if (payment.method === 'stripe' || payment.method === 'paymob') {
      // Check gateway transaction status
      // This would integrate with actual payment gateway APIs
      return true; // Placeholder
    }
    return payment.status === 'completed';
  }

  private async updateInvoiceWithPayment(invoiceId: string, payment: any): Promise<void> {
    const invoiceDoc = await this.db.collection('invoices').doc(invoiceId).get();
    if (!invoiceDoc.exists) return;

    const invoice = invoiceDoc.data()!;
    const newPaidAmount = invoice.paidAmount + payment.amount;
    const newBalanceDue = invoice.total - newPaidAmount;

    const updates: any = {
      paidAmount: newPaidAmount,
      balanceDue: newBalanceDue,
      lastPaymentDate: payment.paidAt || admin.firestore.Timestamp.now()
    };

    if (newBalanceDue <= 0) {
      updates.status = 'paid';
      updates.paidAt = admin.firestore.Timestamp.now();
    } else if (newPaidAmount > 0) {
      updates.status = 'partially_paid';
    }

    await this.db.collection('invoices').doc(invoiceId).update(updates);
  }

  private async createFinancialTransactions(payment: any): Promise<void> {
    // Create income transaction
    await this.db.collection('transactions').add({
      transactionNumber: await this.generateTransactionNumber(),
      finAccountId: 'revenue', // Would be mapped to actual account
      type: 'income',
      category: 'payment',
      date: payment.paidAt || admin.firestore.Timestamp.now(),
      amount: payment.amount,
      currency: payment.currency,
      description: `Payment ${payment.paymentNumber}`,
      reference: payment.reference,
      reconciled: false,
      paymentId: payment.id,
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async generateTransactionNumber(): Promise<string> {
    const counter = await this.getNextCounter('transactions');
    return `TXN-${String(counter).padStart(8, '0')}`;
  }

  private async checkInvoiceFullyPaid(invoiceId: string): Promise<boolean> {
    const invoiceDoc = await this.db.collection('invoices').doc(invoiceId).get();
    return invoiceDoc.exists && invoiceDoc.data()!.status === 'paid';
  }

  private async executePostPaymentActions(invoiceId: string): Promise<void> {
    // Any additional actions after full payment
    // e.g., activate services, extend licenses, etc.
  }

  private async checkAndUnblockPortal(accountId: string): Promise<void> {
    // Check if there are any other overdue invoices
    const overdueInvoices = await this.db.collection('invoices')
      .where('accountId', '==', accountId)
      .where('status', '==', 'overdue')
      .get();

    if (overdueInvoices.empty) {
      // Unblock portal access
      await this.db.collection('accounts').doc(accountId).update({
        portalBlocked: false,
        portalBlockedReason: admin.firestore.FieldValue.delete(),
        portalBlockedAt: admin.firestore.FieldValue.delete()
      });
    }
  }

  private async sendPaymentReceipt(payment: any): Promise<void> {
    // Queue receipt email
    await this.db.collection('emailQueue').add({
      to: payment.accountEmail,
      template: 'payment-receipt',
      data: {
        paymentNumber: payment.paymentNumber,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt,
        method: payment.method
      },
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  // Additional helper methods would continue here...

  private async transferCandidateTraining(candidateId: string, userId: string): Promise<void> {
    const assignments = await this.db.collection('assignments')
      .where('candidateId', '==', candidateId)
      .get();

    for (const assignmentDoc of assignments.docs) {
      const assignment = assignmentDoc.data();
      await this.db.collection('assignments').doc(assignmentDoc.id).update({
        userId,
        candidateId: admin.firestore.FieldValue.delete()
      });
    }
  }

  private async createOnboardingChecklist(userId: string, candidate: any): Promise<void> {
    // Get onboarding template
    const template = await this.db.collection('onboardingTemplates')
      .where('department', '==', candidate.department)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (!template.empty) {
      const tasks = template.docs[0].data().tasks;
      for (const task of tasks) {
        await this.db.collection('onboardingTasks').add({
          userId,
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: this.calculateOnboardingTaskDueDate(task.daysFromStart),
          status: 'pending',
          required: task.required,
          createdAt: admin.firestore.Timestamp.now()
        });
      }
    }
  }

  private calculateOnboardingTaskDueDate(daysFromStart: number): admin.firestore.Timestamp {
    const date = new Date();
    date.setDate(date.getDate() + daysFromStart);
    return admin.firestore.Timestamp.fromDate(date);
  }

  private async createEquipmentRequest(userId: string, position: string): Promise<void> {
    const equipment = this.getStandardEquipment(position);

    await this.db.collection('equipmentRequests').add({
      userId,
      items: equipment,
      status: 'pending',
      priority: 'high',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private getStandardEquipment(position: string): any[] {
    const base = [
      { item: 'Laptop', quantity: 1 },
      { item: 'Mouse', quantity: 1 },
      { item: 'Keyboard', quantity: 1 }
    ];

    if (position.toLowerCase().includes('developer')) {
      base.push({ item: 'External Monitor', quantity: 2 });
    }

    return base;
  }

  private async setupInitialAccess(userId: string, candidate: any): Promise<void> {
    // Grant basic system access
    await this.db.collection('users').doc(userId).update({
      systemAccess: {
        email: true,
        portal: true,
        tools: []
      }
    });
  }

  private async scheduleFirstDayActivities(userId: string, candidate: any): Promise<void> {
    // Schedule orientation meeting
    await this.db.collection('meetings').add({
      title: 'New Employee Orientation',
      attendees: [userId],
      scheduledAt: candidate.startDate,
      duration: 120, // 2 hours
      type: 'orientation',
      status: 'scheduled',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async deactivateCandidatePortal(candidateId: string): Promise<void> {
    await this.db.collection('portalAccess')
      .where('candidateId', '==', candidateId)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          doc.ref.update({ active: false });
        });
      });
  }

  private async sendEmployeeWelcomeEmail(userId: string, candidate: any): Promise<void> {
    await this.db.collection('emailQueue').add({
      to: candidate.email,
      template: 'employee-welcome',
      data: {
        name: candidate.name,
        position: candidate.position,
        startDate: candidate.startDate
      },
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now()
    });
  }

  private async verifyAllTasksComplete(projectId: string): Promise<boolean> {
    const incompleteTasks = await this.db.collection('tasks')
      .where('projectId', '==', projectId)
      .where('status', '!=', 'completed')
      .get();

    return incompleteTasks.empty;
  }

  private async generateFinalInvoice(projectId: string): Promise<string> {
    // Implementation for final invoice generation
    return 'invoice-id'; // Placeholder
  }

  private async archiveProjectDocuments(projectId: string): Promise<void> {
    // Implementation for archiving project documents
  }

  private async calculateProjectMetrics(projectId: string): Promise<any> {
    // Calculate project performance metrics
    return {
      onTime: true,
      budgetVariance: 0,
      tasksCompleted: 100,
      clientSatisfaction: null
    };
  }

  private async generateCompletionReport(projectId: string, metrics: any): Promise<string> {
    // Generate project completion report
    return 'report-id'; // Placeholder
  }

  private async requestClientFeedback(projectId: string): Promise<void> {
    // Send feedback request to client
  }

  private async releaseProjectTeam(projectId: string): Promise<void> {
    // Update team member availability
  }

  private async sendProjectCompletionNotifications(projectId: string): Promise<void> {
    // Send notifications to stakeholders
  }
}

export default WorkflowRulesEngine;
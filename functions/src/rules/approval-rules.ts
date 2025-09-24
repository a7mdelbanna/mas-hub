import * as admin from 'firebase-admin';

/**
 * Approval Rules Engine
 * Manages approval workflows for discounts, budgets, expenses, and hiring
 */

export interface ApprovalRule {
  id: string;
  type: 'discount' | 'budget' | 'expense' | 'hiring' | 'contract' | 'quote';
  threshold?: number;
  conditions: ApprovalCondition[];
  approvers: ApproverConfig[];
  escalationTimeMinutes?: number;
  autoApprove?: boolean;
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface ApproverConfig {
  type: 'role' | 'user' | 'manager' | 'department_head';
  value?: string; // Role name or user ID
  level: number; // Approval level (1 = first approver)
}

export interface ApprovalRequest {
  id?: string;
  entityType: string;
  entityId: string;
  requesterId: string;
  amount?: number;
  description: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  approvals: ApprovalRecord[];
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
}

export interface ApprovalRecord {
  approverId: string;
  approverName: string;
  action: 'approved' | 'rejected';
  comments?: string;
  timestamp: admin.firestore.Timestamp;
  level: number;
}

export class ApprovalRulesEngine {
  private db: admin.firestore.Firestore;

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  /**
   * Process discount approval based on percentage and amount
   */
  async processDiscountApproval(
    quoteId: string,
    discountPercent: number,
    totalAmount: number,
    requesterId: string
  ): Promise<ApprovalRequest> {
    const discountAmount = (totalAmount * discountPercent) / 100;

    // Define approval thresholds
    let approvers: ApproverConfig[] = [];

    if (discountPercent <= 10) {
      // Auto-approve small discounts
      return this.createAutoApprovedRequest('quote', quoteId, requesterId, discountAmount);
    } else if (discountPercent <= 20) {
      // Sales manager approval required
      approvers = [{
        type: 'role',
        value: 'sales_manager',
        level: 1
      }];
    } else if (discountPercent <= 30) {
      // Sales manager + Finance manager approval
      approvers = [
        { type: 'role', value: 'sales_manager', level: 1 },
        { type: 'role', value: 'finance_manager', level: 2 }
      ];
    } else {
      // CEO approval required for > 30% discount
      approvers = [
        { type: 'role', value: 'sales_manager', level: 1 },
        { type: 'role', value: 'finance_manager', level: 2 },
        { type: 'role', value: 'admin', level: 3 }
      ];
    }

    return this.createApprovalRequest(
      'quote',
      quoteId,
      requesterId,
      discountAmount,
      `Discount approval: ${discountPercent}% on $${totalAmount}`,
      approvers,
      { discountPercent, totalAmount }
    );
  }

  /**
   * Process budget approval for projects
   */
  async processBudgetApproval(
    projectId: string,
    requestedBudget: number,
    currentBudget: number,
    requesterId: string,
    projectType: string
  ): Promise<ApprovalRequest> {
    const budgetIncrease = requestedBudget - currentBudget;
    const increasePercent = (budgetIncrease / currentBudget) * 100;

    let approvers: ApproverConfig[] = [];

    // Budget increase thresholds
    if (budgetIncrease <= 5000) {
      // Project manager can approve
      approvers = [{
        type: 'role',
        value: 'project_manager',
        level: 1
      }];
    } else if (budgetIncrease <= 20000) {
      // Department manager approval
      approvers = [{
        type: 'department_head',
        level: 1
      }];
    } else if (budgetIncrease <= 50000) {
      // Department manager + Finance manager
      approvers = [
        { type: 'department_head', level: 1 },
        { type: 'role', value: 'finance_manager', level: 2 }
      ];
    } else {
      // CEO approval for > $50,000
      approvers = [
        { type: 'department_head', level: 1 },
        { type: 'role', value: 'finance_manager', level: 2 },
        { type: 'role', value: 'admin', level: 3 }
      ];
    }

    // Alert if budget exceeds 80%
    if (increasePercent > 80) {
      await this.createBudgetAlert(projectId, requestedBudget, currentBudget);
    }

    return this.createApprovalRequest(
      'project',
      projectId,
      requesterId,
      budgetIncrease,
      `Budget increase: $${currentBudget} → $${requestedBudget} (${increasePercent.toFixed(1)}% increase)`,
      approvers,
      { requestedBudget, currentBudget, increasePercent, projectType }
    );
  }

  /**
   * Process hiring approval for candidates
   */
  async processHiringApproval(
    candidateId: string,
    position: string,
    department: string,
    expectedSalary: number,
    requesterId: string
  ): Promise<ApprovalRequest> {
    let approvers: ApproverConfig[] = [];

    // Salary-based approval chain
    if (expectedSalary <= 50000) {
      // Department manager can approve
      approvers = [
        { type: 'department_head', level: 1 },
        { type: 'role', value: 'hr_manager', level: 2 }
      ];
    } else if (expectedSalary <= 100000) {
      // Additional finance approval
      approvers = [
        { type: 'department_head', level: 1 },
        { type: 'role', value: 'hr_manager', level: 2 },
        { type: 'role', value: 'finance_manager', level: 3 }
      ];
    } else {
      // CEO approval for senior positions
      approvers = [
        { type: 'department_head', level: 1 },
        { type: 'role', value: 'hr_manager', level: 2 },
        { type: 'role', value: 'finance_manager', level: 3 },
        { type: 'role', value: 'admin', level: 4 }
      ];
    }

    return this.createApprovalRequest(
      'candidate',
      candidateId,
      requesterId,
      expectedSalary,
      `Hiring approval for ${position} in ${department} department`,
      approvers,
      { position, department, expectedSalary }
    );
  }

  /**
   * Process expense approval
   */
  async processExpenseApproval(
    expenseId: string,
    amount: number,
    category: string,
    requesterId: string,
    description: string
  ): Promise<ApprovalRequest> {
    let approvers: ApproverConfig[] = [];

    // Expense thresholds
    if (amount <= 500) {
      // Auto-approve small expenses
      return this.createAutoApprovedRequest('expense', expenseId, requesterId, amount);
    } else if (amount <= 2000) {
      // Direct manager approval
      approvers = [{
        type: 'manager',
        level: 1
      }];
    } else if (amount <= 10000) {
      // Department head approval
      approvers = [
        { type: 'manager', level: 1 },
        { type: 'department_head', level: 2 }
      ];
    } else {
      // Finance manager + Admin for large expenses
      approvers = [
        { type: 'manager', level: 1 },
        { type: 'department_head', level: 2 },
        { type: 'role', value: 'finance_manager', level: 3 },
        { type: 'role', value: 'admin', level: 4 }
      ];
    }

    return this.createApprovalRequest(
      'expense',
      expenseId,
      requesterId,
      amount,
      description,
      approvers,
      { category }
    );
  }

  /**
   * Check if user can approve at specific level
   */
  async canUserApprove(
    userId: string,
    approvalRequest: ApprovalRequest,
    level: number
  ): Promise<boolean> {
    const userDoc = await this.db.collection('users').doc(userId).get();
    if (!userDoc.exists) return false;

    const userData = userDoc.data()!;
    const requiredApprover = approvalRequest.metadata?.approvers?.find(
      (a: ApproverConfig) => a.level === level
    );

    if (!requiredApprover) return false;

    switch (requiredApprover.type) {
      case 'role':
        return userData.role === requiredApprover.value;

      case 'user':
        return userId === requiredApprover.value;

      case 'manager':
        const requesterDoc = await this.db.collection('users')
          .doc(approvalRequest.requesterId).get();
        return requesterDoc.exists && requesterDoc.data()?.managerId === userId;

      case 'department_head':
        const department = userData.department;
        const deptDoc = await this.db.collection('departments').doc(department).get();
        return deptDoc.exists && deptDoc.data()?.managerId === userId;

      default:
        return false;
    }
  }

  /**
   * Process approval action
   */
  async processApproval(
    approvalRequestId: string,
    approverId: string,
    action: 'approved' | 'rejected',
    comments?: string
  ): Promise<void> {
    const approvalRef = this.db.collection('approvalRequests').doc(approvalRequestId);
    const approvalDoc = await approvalRef.get();

    if (!approvalDoc.exists) {
      throw new Error('Approval request not found');
    }

    const approvalData = approvalDoc.data() as ApprovalRequest;

    // Determine approval level
    const currentLevel = approvalData.approvals.length + 1;

    // Verify approver can approve at this level
    const canApprove = await this.canUserApprove(approverId, approvalData, currentLevel);
    if (!canApprove) {
      throw new Error('User not authorized to approve at this level');
    }

    // Get approver details
    const approverDoc = await this.db.collection('users').doc(approverId).get();
    const approverName = approverDoc.data()?.name || 'Unknown';

    // Add approval record
    const approvalRecord: ApprovalRecord = {
      approverId,
      approverName,
      action,
      comments,
      timestamp: admin.firestore.Timestamp.now(),
      level: currentLevel
    };

    approvalData.approvals.push(approvalRecord);

    if (action === 'rejected') {
      // If rejected, update status and stop
      await approvalRef.update({
        approvals: approvalData.approvals,
        status: 'rejected',
        updatedAt: admin.firestore.Timestamp.now()
      });

      // Notify requester of rejection
      await this.notifyRejection(approvalData);
    } else {
      // Check if all levels approved
      const totalLevels = approvalData.metadata?.approvers?.length || 0;

      if (currentLevel >= totalLevels) {
        // All approvals complete
        await approvalRef.update({
          approvals: approvalData.approvals,
          status: 'approved',
          updatedAt: admin.firestore.Timestamp.now()
        });

        // Execute approved action
        await this.executeApprovedAction(approvalData);
      } else {
        // More approvals needed
        await approvalRef.update({
          approvals: approvalData.approvals,
          updatedAt: admin.firestore.Timestamp.now()
        });

        // Notify next approver
        await this.notifyNextApprover(approvalData, currentLevel + 1);
      }
    }
  }

  /**
   * Create approval request
   */
  private async createApprovalRequest(
    entityType: string,
    entityId: string,
    requesterId: string,
    amount: number | undefined,
    description: string,
    approvers: ApproverConfig[],
    metadata?: Record<string, any>
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      entityType,
      entityId,
      requesterId,
      amount,
      description,
      status: 'pending',
      approvals: [],
      metadata: { ...metadata, approvers },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await this.db.collection('approvalRequests').add(request);
    request.id = docRef.id;

    // Notify first approver
    await this.notifyNextApprover(request, 1);

    return request;
  }

  /**
   * Create auto-approved request
   */
  private async createAutoApprovedRequest(
    entityType: string,
    entityId: string,
    requesterId: string,
    amount?: number
  ): Promise<ApprovalRequest> {
    const request: ApprovalRequest = {
      entityType,
      entityId,
      requesterId,
      amount,
      description: 'Auto-approved (below threshold)',
      status: 'approved',
      approvals: [{
        approverId: 'system',
        approverName: 'System',
        action: 'approved',
        comments: 'Automatically approved - below threshold',
        timestamp: admin.firestore.Timestamp.now(),
        level: 1
      }],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    };

    const docRef = await this.db.collection('approvalRequests').add(request);
    request.id = docRef.id;

    // Execute approved action immediately
    await this.executeApprovedAction(request);

    return request;
  }

  /**
   * Create budget alert
   */
  private async createBudgetAlert(
    projectId: string,
    requestedBudget: number,
    currentBudget: number
  ): Promise<void> {
    // Get project details
    const projectDoc = await this.db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) return;

    const project = projectDoc.data()!;
    const managerId = project.managerId;

    // Create notification for project manager
    await this.db.collection('notifications').add({
      userId: managerId,
      type: 'warning',
      title: 'Budget Alert',
      message: `Project ${project.name} budget increase exceeds 80% threshold`,
      entityType: 'project',
      entityId: projectId,
      read: false,
      emailSent: false,
      pushSent: false,
      metadata: {
        currentBudget,
        requestedBudget,
        increasePercent: ((requestedBudget - currentBudget) / currentBudget * 100).toFixed(1)
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    // Also notify department head
    const userDoc = await this.db.collection('users').doc(managerId).get();
    if (userDoc.exists && userDoc.data()?.departmentId) {
      const deptDoc = await this.db.collection('departments').doc(userDoc.data()!.departmentId).get();
      if (deptDoc.exists && deptDoc.data()?.managerId) {
        await this.db.collection('notifications').add({
          userId: deptDoc.data()!.managerId,
          type: 'warning',
          title: 'Department Budget Alert',
          message: `Project ${project.name} in your department has a budget increase exceeding 80%`,
          entityType: 'project',
          entityId: projectId,
          read: false,
          emailSent: false,
          pushSent: false,
          metadata: {
            currentBudget,
            requestedBudget,
            projectManager: userDoc.data()!.name
          },
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        });
      }
    }
  }

  /**
   * Notify next approver in chain
   */
  private async notifyNextApprover(
    approvalRequest: ApprovalRequest,
    level: number
  ): Promise<void> {
    const approvers = approvalRequest.metadata?.approvers as ApproverConfig[];
    const nextApprover = approvers?.find(a => a.level === level);

    if (!nextApprover) return;

    // Find users to notify based on approver type
    let userIds: string[] = [];

    switch (nextApprover.type) {
      case 'role':
        const roleUsers = await this.db.collection('users')
          .where('role', '==', nextApprover.value)
          .get();
        userIds = roleUsers.docs.map(doc => doc.id);
        break;

      case 'user':
        userIds = [nextApprover.value!];
        break;

      case 'manager':
        const requesterDoc = await this.db.collection('users')
          .doc(approvalRequest.requesterId).get();
        if (requesterDoc.exists && requesterDoc.data()?.managerId) {
          userIds = [requesterDoc.data()!.managerId];
        }
        break;

      case 'department_head':
        const userDoc = await this.db.collection('users')
          .doc(approvalRequest.requesterId).get();
        if (userDoc.exists && userDoc.data()?.departmentId) {
          const deptDoc = await this.db.collection('departments')
            .doc(userDoc.data()!.departmentId).get();
          if (deptDoc.exists && deptDoc.data()?.managerId) {
            userIds = [deptDoc.data()!.managerId];
          }
        }
        break;
    }

    // Create notifications
    for (const userId of userIds) {
      await this.db.collection('notifications').add({
        userId,
        type: 'task',
        title: 'Approval Required',
        message: approvalRequest.description,
        entityType: 'approvalRequest',
        entityId: approvalRequest.id,
        actionUrl: `/approvals/${approvalRequest.id}`,
        read: false,
        emailSent: false,
        pushSent: false,
        metadata: {
          level,
          entityType: approvalRequest.entityType,
          entityId: approvalRequest.entityId,
          amount: approvalRequest.amount
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  }

  /**
   * Notify requester of rejection
   */
  private async notifyRejection(approvalRequest: ApprovalRequest): Promise<void> {
    const lastApproval = approvalRequest.approvals[approvalRequest.approvals.length - 1];

    await this.db.collection('notifications').add({
      userId: approvalRequest.requesterId,
      type: 'error',
      title: 'Approval Rejected',
      message: `Your ${approvalRequest.entityType} approval was rejected by ${lastApproval.approverName}`,
      entityType: approvalRequest.entityType,
      entityId: approvalRequest.entityId,
      read: false,
      emailSent: false,
      pushSent: false,
      metadata: {
        reason: lastApproval.comments,
        rejectedBy: lastApproval.approverId
      },
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
  }

  /**
   * Execute approved action based on entity type
   */
  private async executeApprovedAction(approvalRequest: ApprovalRequest): Promise<void> {
    switch (approvalRequest.entityType) {
      case 'quote':
        await this.db.collection('quotes').doc(approvalRequest.entityId).update({
          approvalStatus: 'approved',
          approvedAt: admin.firestore.Timestamp.now(),
          approvalRequestId: approvalRequest.id
        });
        break;

      case 'project':
        await this.db.collection('projects').doc(approvalRequest.entityId).update({
          estimateBudget: approvalRequest.metadata?.requestedBudget,
          budgetApproved: true,
          approvalRequestId: approvalRequest.id
        });
        break;

      case 'candidate':
        await this.db.collection('candidates').doc(approvalRequest.entityId).update({
          stage: 'offer',
          offerApproved: true,
          approvalRequestId: approvalRequest.id
        });
        break;

      case 'expense':
        await this.db.collection('expenses').doc(approvalRequest.entityId).update({
          status: 'approved',
          approvedAt: admin.firestore.Timestamp.now(),
          approvalRequestId: approvalRequest.id
        });
        break;
    }

    // Notify requester of approval
    await this.db.collection('notifications').add({
      userId: approvalRequest.requesterId,
      type: 'success',
      title: 'Approval Granted',
      message: `Your ${approvalRequest.entityType} has been approved`,
      entityType: approvalRequest.entityType,
      entityId: approvalRequest.entityId,
      read: false,
      emailSent: false,
      pushSent: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
  }
}

export default ApprovalRulesEngine;
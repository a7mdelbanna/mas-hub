import * as admin from 'firebase-admin';

/**
 * SLA Rules Engine
 * Manages Service Level Agreement enforcement for tickets and support operations
 */

export interface SLAPolicy {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  targets: SLATarget[];
  businessHours?: BusinessHours;
  escalationRules: EscalationRule[];
  pauseConditions?: PauseCondition[];
}

export interface SLATarget {
  priority: 'low' | 'medium' | 'high' | 'critical';
  firstResponseTime: number; // in minutes
  resolutionTime: number; // in minutes
  updateTime?: number; // in minutes - time between updates
  businessHoursOnly: boolean;
}

export interface BusinessHours {
  timezone: string;
  workDays: number[]; // 0 = Sunday, 6 = Saturday
  startHour: number; // 24-hour format
  endHour: number;
  holidays?: string[]; // ISO date strings
}

export interface EscalationRule {
  triggerType: 'breach' | 'warning' | 'approaching';
  threshold: number; // percentage of SLA time
  actions: EscalationAction[];
}

export interface EscalationAction {
  type: 'notify' | 'reassign' | 'escalate' | 'create_task';
  targets?: string[]; // User IDs or roles
  level?: number; // Escalation level
  message?: string;
}

export interface PauseCondition {
  reason: 'waiting_customer' | 'scheduled_maintenance' | 'after_hours' | 'holiday';
  autoPause: boolean;
  autoResume: boolean;
}

export interface SLATracker {
  ticketId: string;
  policyId: string;
  priority: string;
  startTime: admin.firestore.Timestamp;
  firstResponseTarget: admin.firestore.Timestamp;
  resolutionTarget: admin.firestore.Timestamp;
  firstResponseTime?: admin.firestore.Timestamp;
  resolutionTime?: admin.firestore.Timestamp;
  pausedAt?: admin.firestore.Timestamp;
  pausedDuration: number; // total paused time in minutes
  pauseReasons: string[];
  breached: boolean;
  breachType?: 'first_response' | 'resolution' | 'update';
  breachedAt?: admin.firestore.Timestamp;
  warningsSent: string[];
  escalationLevel: number;
}

export class SLARulesEngine {
  private db: admin.firestore.Firestore;
  private defaultBusinessHours: BusinessHours = {
    timezone: 'Africa/Cairo',
    workDays: [1, 2, 3, 4, 5], // Monday to Friday
    startHour: 9,
    endHour: 18,
    holidays: []
  };

  constructor(db: admin.firestore.Firestore) {
    this.db = db;
  }

  /**
   * Initialize SLA tracking for a new ticket
   */
  async initializeSLA(ticketId: string): Promise<SLATracker> {
    const ticketDoc = await this.db.collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) {
      throw new Error('Ticket not found');
    }

    const ticket = ticketDoc.data()!;

    // Get applicable SLA policy
    const policy = await this.getApplicablePolicy(ticket);
    if (!policy) {
      throw new Error('No applicable SLA policy found');
    }

    // Get target times based on priority
    const target = policy.targets.find(t => t.priority === ticket.priority) ||
                  policy.targets.find(t => t.priority === 'medium')!;

    const businessHours = policy.businessHours || this.defaultBusinessHours;
    const startTime = admin.firestore.Timestamp.now();

    // Calculate target times considering business hours
    const firstResponseTarget = this.calculateTargetTime(
      startTime,
      target.firstResponseTime,
      target.businessHoursOnly,
      businessHours
    );

    const resolutionTarget = this.calculateTargetTime(
      startTime,
      target.resolutionTime,
      target.businessHoursOnly,
      businessHours
    );

    const tracker: SLATracker = {
      ticketId,
      policyId: policy.id,
      priority: ticket.priority,
      startTime,
      firstResponseTarget,
      resolutionTarget,
      pausedDuration: 0,
      pauseReasons: [],
      breached: false,
      warningsSent: [],
      escalationLevel: 0
    };

    // Save tracker
    await this.db.collection('slaTrackers').doc(ticketId).set(tracker);

    // Schedule SLA checks
    await this.scheduleSLAChecks(tracker);

    return tracker;
  }

  /**
   * Check SLA status and trigger actions if needed
   */
  async checkSLAStatus(ticketId: string): Promise<void> {
    const trackerDoc = await this.db.collection('slaTrackers').doc(ticketId).get();
    if (!trackerDoc.exists) return;

    const tracker = trackerDoc.data() as SLATracker;
    const ticket = await this.db.collection('tickets').doc(ticketId).get();
    if (!ticket.exists) return;

    const ticketData = ticket.data()!;
    const now = admin.firestore.Timestamp.now();

    // Check if ticket is paused
    if (tracker.pausedAt) {
      return; // Skip checks for paused tickets
    }

    // Check first response SLA
    if (!tracker.firstResponseTime && !ticketData.firstResponseAt) {
      const timeToTarget = this.getMinutesRemaining(now, tracker.firstResponseTarget);
      const totalTime = this.getMinutesBetween(tracker.startTime, tracker.firstResponseTarget);
      const percentageUsed = ((totalTime - timeToTarget) / totalTime) * 100;

      if (timeToTarget <= 0 && !tracker.breached) {
        // SLA breached
        await this.handleSLABreach(tracker, 'first_response');
      } else if (percentageUsed >= 75 && !tracker.warningsSent.includes('first_response_75')) {
        // 75% warning
        await this.handleSLAWarning(tracker, 'first_response', 75);
      } else if (percentageUsed >= 50 && !tracker.warningsSent.includes('first_response_50')) {
        // 50% warning
        await this.handleSLAWarning(tracker, 'first_response', 50);
      }
    }

    // Check resolution SLA
    if (!tracker.resolutionTime && ticketData.status !== 'resolved' && ticketData.status !== 'closed') {
      const timeToTarget = this.getMinutesRemaining(now, tracker.resolutionTarget);
      const totalTime = this.getMinutesBetween(tracker.startTime, tracker.resolutionTarget);
      const percentageUsed = ((totalTime - timeToTarget) / totalTime) * 100;

      if (timeToTarget <= 0 && (!tracker.breached || tracker.breachType !== 'resolution')) {
        // SLA breached
        await this.handleSLABreach(tracker, 'resolution');
      } else if (percentageUsed >= 90 && !tracker.warningsSent.includes('resolution_90')) {
        // 90% warning for resolution
        await this.handleSLAWarning(tracker, 'resolution', 90);
      } else if (percentageUsed >= 75 && !tracker.warningsSent.includes('resolution_75')) {
        // 75% warning
        await this.handleSLAWarning(tracker, 'resolution', 75);
      }
    }
  }

  /**
   * Record first response to ticket
   */
  async recordFirstResponse(ticketId: string): Promise<void> {
    const trackerDoc = await this.db.collection('slaTrackers').doc(ticketId).get();
    if (!trackerDoc.exists) return;

    const tracker = trackerDoc.data() as SLATracker;
    if (tracker.firstResponseTime) return; // Already recorded

    const responseTime = admin.firestore.Timestamp.now();
    const actualMinutes = this.getActualMinutes(tracker.startTime, responseTime, tracker);

    await this.db.collection('slaTrackers').doc(ticketId).update({
      firstResponseTime: responseTime,
      firstResponseActualMinutes: actualMinutes
    });

    // Update ticket
    await this.db.collection('tickets').doc(ticketId).update({
      firstResponseAt: responseTime,
      firstResponseSLAMet: responseTime <= tracker.firstResponseTarget
    });

    // Notify if SLA was met
    if (responseTime <= tracker.firstResponseTarget) {
      await this.createSLANotification(
        tracker.ticketId,
        'success',
        'First Response SLA Met',
        `First response provided within SLA target time`
      );
    }
  }

  /**
   * Record ticket resolution
   */
  async recordResolution(ticketId: string): Promise<void> {
    const trackerDoc = await this.db.collection('slaTrackers').doc(ticketId).get();
    if (!trackerDoc.exists) return;

    const tracker = trackerDoc.data() as SLATracker;
    if (tracker.resolutionTime) return; // Already recorded

    const resolutionTime = admin.firestore.Timestamp.now();
    const actualMinutes = this.getActualMinutes(tracker.startTime, resolutionTime, tracker);

    await this.db.collection('slaTrackers').doc(ticketId).update({
      resolutionTime,
      resolutionActualMinutes: actualMinutes
    });

    // Update ticket
    await this.db.collection('tickets').doc(ticketId).update({
      resolvedAt: resolutionTime,
      resolutionSLAMet: resolutionTime <= tracker.resolutionTarget
    });

    // Notify if SLA was met
    if (resolutionTime <= tracker.resolutionTarget) {
      await this.createSLANotification(
        tracker.ticketId,
        'success',
        'Resolution SLA Met',
        `Ticket resolved within SLA target time`
      );
    }
  }

  /**
   * Pause SLA timer
   */
  async pauseSLA(ticketId: string, reason: string): Promise<void> {
    const trackerDoc = await this.db.collection('slaTrackers').doc(ticketId).get();
    if (!trackerDoc.exists) return;

    const tracker = trackerDoc.data() as SLATracker;
    if (tracker.pausedAt) return; // Already paused

    const pauseTime = admin.firestore.Timestamp.now();

    await this.db.collection('slaTrackers').doc(ticketId).update({
      pausedAt: pauseTime,
      pauseReasons: admin.firestore.FieldValue.arrayUnion(reason)
    });

    // Log pause event
    await this.db.collection('slaEvents').add({
      ticketId,
      type: 'paused',
      reason,
      timestamp: pauseTime,
      trackerSnapshot: tracker
    });
  }

  /**
   * Resume SLA timer
   */
  async resumeSLA(ticketId: string): Promise<void> {
    const trackerDoc = await this.db.collection('slaTrackers').doc(ticketId).get();
    if (!trackerDoc.exists) return;

    const tracker = trackerDoc.data() as SLATracker;
    if (!tracker.pausedAt) return; // Not paused

    const resumeTime = admin.firestore.Timestamp.now();
    const pauseDuration = this.getMinutesBetween(tracker.pausedAt, resumeTime);
    const newPausedDuration = tracker.pausedDuration + pauseDuration;

    // Adjust target times
    const adjustmentMs = pauseDuration * 60 * 1000;
    const newFirstResponseTarget = new admin.firestore.Timestamp(
      tracker.firstResponseTarget.seconds + Math.floor(adjustmentMs / 1000),
      tracker.firstResponseTarget.nanoseconds
    );
    const newResolutionTarget = new admin.firestore.Timestamp(
      tracker.resolutionTarget.seconds + Math.floor(adjustmentMs / 1000),
      tracker.resolutionTarget.nanoseconds
    );

    await this.db.collection('slaTrackers').doc(ticketId).update({
      pausedAt: admin.firestore.FieldValue.delete(),
      pausedDuration: newPausedDuration,
      firstResponseTarget: newFirstResponseTarget,
      resolutionTarget: newResolutionTarget
    });

    // Log resume event
    await this.db.collection('slaEvents').add({
      ticketId,
      type: 'resumed',
      timestamp: resumeTime,
      pauseDuration
    });

    // Reschedule SLA checks
    await this.scheduleSLAChecks({
      ...tracker,
      firstResponseTarget: newFirstResponseTarget,
      resolutionTarget: newResolutionTarget,
      pausedDuration: newPausedDuration
    });
  }

  /**
   * Handle SLA breach
   */
  private async handleSLABreach(tracker: SLATracker, breachType: 'first_response' | 'resolution'): Promise<void> {
    const breachTime = admin.firestore.Timestamp.now();

    // Update tracker
    await this.db.collection('slaTrackers').doc(tracker.ticketId).update({
      breached: true,
      breachType,
      breachedAt: breachTime
    });

    // Update ticket
    await this.db.collection('tickets').doc(tracker.ticketId).update({
      slaBreached: true,
      slaBreachType: breachType,
      slaBreachedAt: breachTime
    });

    // Get policy for escalation rules
    const policy = await this.db.collection('slaPolicies').doc(tracker.policyId).get();
    if (!policy.exists) return;

    const policyData = policy.data() as SLAPolicy;
    const escalationRules = policyData.escalationRules.filter(r => r.triggerType === 'breach');

    for (const rule of escalationRules) {
      await this.executeEscalationActions(tracker, rule.actions, breachType);
    }

    // Log breach event
    await this.db.collection('slaEvents').add({
      ticketId: tracker.ticketId,
      type: 'breach',
      breachType,
      timestamp: breachTime,
      escalationLevel: tracker.escalationLevel
    });

    // Create high-priority notification
    await this.createSLANotification(
      tracker.ticketId,
      'error',
      `SLA Breach: ${breachType.replace('_', ' ')}`,
      `Ticket ${tracker.ticketId} has breached ${breachType} SLA`,
      true // High priority
    );
  }

  /**
   * Handle SLA warning
   */
  private async handleSLAWarning(tracker: SLATracker, type: string, percentage: number): Promise<void> {
    const warningKey = `${type}_${percentage}`;

    // Update warnings sent
    await this.db.collection('slaTrackers').doc(tracker.ticketId).update({
      warningsSent: admin.firestore.FieldValue.arrayUnion(warningKey)
    });

    // Get policy for escalation rules
    const policy = await this.db.collection('slaPolicies').doc(tracker.policyId).get();
    if (!policy.exists) return;

    const policyData = policy.data() as SLAPolicy;
    const escalationRules = policyData.escalationRules.filter(
      r => r.triggerType === 'warning' && r.threshold === percentage
    );

    for (const rule of escalationRules) {
      await this.executeEscalationActions(tracker, rule.actions, type);
    }

    // Create warning notification
    await this.createSLANotification(
      tracker.ticketId,
      'warning',
      `SLA Warning: ${percentage}% of ${type.replace('_', ' ')} time used`,
      `Ticket ${tracker.ticketId} is approaching ${type} SLA limit`
    );
  }

  /**
   * Execute escalation actions
   */
  private async executeEscalationActions(
    tracker: SLATracker,
    actions: EscalationAction[],
    triggerType: string
  ): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'notify':
          await this.sendEscalationNotifications(tracker, action, triggerType);
          break;

        case 'reassign':
          await this.reassignTicket(tracker, action);
          break;

        case 'escalate':
          await this.escalateTicket(tracker, action);
          break;

        case 'create_task':
          await this.createEscalationTask(tracker, action, triggerType);
          break;
      }
    }

    // Update escalation level
    const newLevel = tracker.escalationLevel + 1;
    await this.db.collection('slaTrackers').doc(tracker.ticketId).update({
      escalationLevel: newLevel
    });
  }

  /**
   * Send escalation notifications
   */
  private async sendEscalationNotifications(
    tracker: SLATracker,
    action: EscalationAction,
    triggerType: string
  ): Promise<void> {
    const targets = await this.resolveEscalationTargets(action.targets || [], tracker);

    for (const userId of targets) {
      await this.db.collection('notifications').add({
        userId,
        type: 'warning',
        title: `SLA Escalation - Level ${tracker.escalationLevel + 1}`,
        message: action.message || `Ticket ${tracker.ticketId} requires immediate attention - ${triggerType}`,
        entityType: 'ticket',
        entityId: tracker.ticketId,
        actionUrl: `/tickets/${tracker.ticketId}`,
        priority: 'high',
        read: false,
        emailSent: false,
        pushSent: false,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  }

  /**
   * Reassign ticket to available agent
   */
  private async reassignTicket(tracker: SLATracker, action: EscalationAction): Promise<void> {
    // Find best available agent
    const availableAgents = await this.findAvailableAgents(tracker.priority);
    if (availableAgents.length === 0) return;

    const newAssignee = availableAgents[0]; // Pick first available

    await this.db.collection('tickets').doc(tracker.ticketId).update({
      assigneeId: newAssignee,
      reassignedAt: admin.firestore.Timestamp.now(),
      reassignReason: 'SLA escalation'
    });

    // Notify new assignee
    await this.createSLANotification(
      tracker.ticketId,
      'task',
      'Urgent Ticket Reassignment',
      `You have been assigned ticket ${tracker.ticketId} due to SLA escalation`,
      true,
      newAssignee
    );
  }

  /**
   * Escalate ticket to higher support tier
   */
  private async escalateTicket(tracker: SLATracker, action: EscalationAction): Promise<void> {
    const escalationLevel = action.level || tracker.escalationLevel + 1;

    await this.db.collection('tickets').doc(tracker.ticketId).update({
      escalationLevel,
      escalatedAt: admin.firestore.Timestamp.now()
    });

    // Find escalation manager
    const managers = await this.getEscalationManagers(escalationLevel);
    for (const managerId of managers) {
      await this.createSLANotification(
        tracker.ticketId,
        'error',
        'Ticket Escalation',
        `Ticket ${tracker.ticketId} has been escalated to level ${escalationLevel}`,
        true,
        managerId
      );
    }
  }

  /**
   * Create escalation task
   */
  private async createEscalationTask(
    tracker: SLATracker,
    action: EscalationAction,
    triggerType: string
  ): Promise<void> {
    const ticket = await this.db.collection('tickets').doc(tracker.ticketId).get();
    if (!ticket.exists) return;

    const ticketData = ticket.data()!;

    await this.db.collection('tasks').add({
      title: `SLA Escalation: Review ticket ${ticketData.ticketNumber}`,
      description: action.message || `Urgent review required - ${triggerType}`,
      status: 'todo',
      priority: 5, // Highest priority
      assigneeId: ticketData.assigneeId || 'unassigned',
      dueDate: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 60 * 60 * 1000)), // 1 hour
      entityType: 'ticket',
      entityId: tracker.ticketId,
      tags: ['sla-escalation', triggerType],
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: 'system'
    });
  }

  /**
   * Get applicable SLA policy for ticket
   */
  private async getApplicablePolicy(ticket: any): Promise<SLAPolicy | null> {
    // Check for contract-specific SLA
    if (ticket.contractId) {
      const contract = await this.db.collection('contracts').doc(ticket.contractId).get();
      if (contract.exists && contract.data()!.slaPolicyId) {
        const policy = await this.db.collection('slaPolicies').doc(contract.data()!.slaPolicyId).get();
        if (policy.exists && policy.data()!.active) {
          return { id: policy.id, ...policy.data() } as SLAPolicy;
        }
      }
    }

    // Check for account-specific SLA
    if (ticket.accountId) {
      const account = await this.db.collection('accounts').doc(ticket.accountId).get();
      if (account.exists && account.data()!.slaPolicyId) {
        const policy = await this.db.collection('slaPolicies').doc(account.data()!.slaPolicyId).get();
        if (policy.exists && policy.data()!.active) {
          return { id: policy.id, ...policy.data() } as SLAPolicy;
        }
      }
    }

    // Get default SLA policy
    const defaultPolicy = await this.db.collection('slaPolicies')
      .where('isDefault', '==', true)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (!defaultPolicy.empty) {
      return { id: defaultPolicy.docs[0].id, ...defaultPolicy.docs[0].data() } as SLAPolicy;
    }

    return null;
  }

  /**
   * Calculate target time considering business hours
   */
  private calculateTargetTime(
    startTime: admin.firestore.Timestamp,
    minutes: number,
    businessHoursOnly: boolean,
    businessHours: BusinessHours
  ): admin.firestore.Timestamp {
    if (!businessHoursOnly) {
      // Simple calculation for 24/7 support
      const targetMs = startTime.toMillis() + (minutes * 60 * 1000);
      return admin.firestore.Timestamp.fromMillis(targetMs);
    }

    // Complex calculation for business hours
    let currentTime = startTime.toDate();
    let remainingMinutes = minutes;

    while (remainingMinutes > 0) {
      if (this.isBusinessHour(currentTime, businessHours)) {
        // Count this minute
        remainingMinutes--;
        currentTime = new Date(currentTime.getTime() + 60000); // Add 1 minute
      } else {
        // Skip to next business hour
        currentTime = this.getNextBusinessHour(currentTime, businessHours);
      }
    }

    return admin.firestore.Timestamp.fromDate(currentTime);
  }

  /**
   * Check if given time is within business hours
   */
  private isBusinessHour(date: Date, businessHours: BusinessHours): boolean {
    // Check if it's a holiday
    const dateStr = date.toISOString().split('T')[0];
    if (businessHours.holidays?.includes(dateStr)) {
      return false;
    }

    // Check work day
    const dayOfWeek = date.getDay();
    if (!businessHours.workDays.includes(dayOfWeek)) {
      return false;
    }

    // Check work hours
    const hour = date.getHours();
    return hour >= businessHours.startHour && hour < businessHours.endHour;
  }

  /**
   * Get next business hour from given time
   */
  private getNextBusinessHour(date: Date, businessHours: BusinessHours): Date {
    let nextDate = new Date(date);

    while (!this.isBusinessHour(nextDate, businessHours)) {
      // If outside business hours today, move to start of next business day
      if (nextDate.getHours() >= businessHours.endHour) {
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(businessHours.startHour, 0, 0, 0);
      } else if (nextDate.getHours() < businessHours.startHour) {
        nextDate.setHours(businessHours.startHour, 0, 0, 0);
      } else {
        // Must be a non-work day or holiday
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(businessHours.startHour, 0, 0, 0);
      }

      // Safety check to avoid infinite loop
      if (nextDate.getTime() - date.getTime() > 30 * 24 * 60 * 60 * 1000) {
        throw new Error('Could not find next business hour within 30 days');
      }
    }

    return nextDate;
  }

  /**
   * Get minutes between two timestamps
   */
  private getMinutesBetween(start: admin.firestore.Timestamp, end: admin.firestore.Timestamp): number {
    return Math.floor((end.toMillis() - start.toMillis()) / 60000);
  }

  /**
   * Get minutes remaining to target
   */
  private getMinutesRemaining(now: admin.firestore.Timestamp, target: admin.firestore.Timestamp): number {
    return Math.floor((target.toMillis() - now.toMillis()) / 60000);
  }

  /**
   * Get actual minutes considering pauses
   */
  private getActualMinutes(
    start: admin.firestore.Timestamp,
    end: admin.firestore.Timestamp,
    tracker: SLATracker
  ): number {
    const totalMinutes = this.getMinutesBetween(start, end);
    return totalMinutes - tracker.pausedDuration;
  }

  /**
   * Schedule SLA checks
   */
  private async scheduleSLAChecks(tracker: SLATracker): Promise<void> {
    // This would integrate with Cloud Scheduler or Cloud Tasks
    // For now, we'll store the check times for a scheduled function to process

    const checkPoints = [
      { time: tracker.firstResponseTarget, type: 'first_response' },
      { time: tracker.resolutionTarget, type: 'resolution' }
    ];

    // Add warning check points (50%, 75%, 90%)
    const firstResponseTime = this.getMinutesBetween(tracker.startTime, tracker.firstResponseTarget);
    const resolutionTime = this.getMinutesBetween(tracker.startTime, tracker.resolutionTarget);

    checkPoints.push(
      {
        time: admin.firestore.Timestamp.fromMillis(
          tracker.startTime.toMillis() + (firstResponseTime * 0.5 * 60000)
        ),
        type: 'first_response_50'
      },
      {
        time: admin.firestore.Timestamp.fromMillis(
          tracker.startTime.toMillis() + (firstResponseTime * 0.75 * 60000)
        ),
        type: 'first_response_75'
      },
      {
        time: admin.firestore.Timestamp.fromMillis(
          tracker.startTime.toMillis() + (resolutionTime * 0.75 * 60000)
        ),
        type: 'resolution_75'
      },
      {
        time: admin.firestore.Timestamp.fromMillis(
          tracker.startTime.toMillis() + (resolutionTime * 0.9 * 60000)
        ),
        type: 'resolution_90'
      }
    );

    for (const checkPoint of checkPoints) {
      await this.db.collection('slaCheckQueue').add({
        ticketId: tracker.ticketId,
        checkTime: checkPoint.time,
        checkType: checkPoint.type,
        status: 'pending',
        createdAt: admin.firestore.Timestamp.now()
      });
    }
  }

  /**
   * Create SLA notification
   */
  private async createSLANotification(
    ticketId: string,
    type: string,
    title: string,
    message: string,
    highPriority: boolean = false,
    specificUserId?: string
  ): Promise<void> {
    const ticket = await this.db.collection('tickets').doc(ticketId).get();
    if (!ticket.exists) return;

    const ticketData = ticket.data()!;
    const recipients: string[] = [];

    if (specificUserId) {
      recipients.push(specificUserId);
    } else {
      // Notify assignee
      if (ticketData.assigneeId) {
        recipients.push(ticketData.assigneeId);
      }

      // Notify support managers for high priority
      if (highPriority) {
        const managers = await this.db.collection('users')
          .where('role', '==', 'support_manager')
          .get();
        managers.docs.forEach(doc => recipients.push(doc.id));
      }
    }

    for (const userId of recipients) {
      await this.db.collection('notifications').add({
        userId,
        type,
        title,
        message,
        entityType: 'ticket',
        entityId: ticketId,
        actionUrl: `/tickets/${ticketId}`,
        priority: highPriority ? 'high' : 'normal',
        read: false,
        emailSent: false,
        pushSent: false,
        metadata: {
          ticketNumber: ticketData.ticketNumber,
          priority: ticketData.priority
        },
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
  }

  /**
   * Resolve escalation targets (users or roles)
   */
  private async resolveEscalationTargets(targets: string[], tracker: SLATracker): Promise<string[]> {
    const userIds: string[] = [];

    for (const target of targets) {
      // Check if it's a user ID
      const userDoc = await this.db.collection('users').doc(target).get();
      if (userDoc.exists) {
        userIds.push(target);
      } else {
        // Assume it's a role
        const roleUsers = await this.db.collection('users')
          .where('role', '==', target)
          .where('active', '==', true)
          .get();
        roleUsers.docs.forEach(doc => userIds.push(doc.id));
      }
    }

    // Add ticket assignee's manager for escalation
    const ticket = await this.db.collection('tickets').doc(tracker.ticketId).get();
    if (ticket.exists && ticket.data()!.assigneeId) {
      const assignee = await this.db.collection('users').doc(ticket.data()!.assigneeId).get();
      if (assignee.exists && assignee.data()!.managerId) {
        userIds.push(assignee.data()!.managerId);
      }
    }

    return [...new Set(userIds)]; // Remove duplicates
  }

  /**
   * Find available agents for reassignment
   */
  private async findAvailableAgents(priority: string): Promise<string[]> {
    // Get all active support agents
    const agents = await this.db.collection('users')
      .where('role', 'in', ['support_agent', 'support_manager'])
      .where('active', '==', true)
      .get();

    const agentWorkloads: { userId: string; workload: number }[] = [];

    for (const agentDoc of agents.docs) {
      // Count active tickets for this agent
      const activeTickets = await this.db.collection('tickets')
        .where('assigneeId', '==', agentDoc.id)
        .where('status', 'in', ['assigned', 'in_progress'])
        .get();

      // Calculate weighted workload
      let workload = 0;
      for (const ticketDoc of activeTickets.docs) {
        const ticketPriority = ticketDoc.data().priority;
        workload += ticketPriority === 'critical' ? 4 :
                   ticketPriority === 'high' ? 3 :
                   ticketPriority === 'medium' ? 2 : 1;
      }

      agentWorkloads.push({ userId: agentDoc.id, workload });
    }

    // Sort by workload (lowest first)
    agentWorkloads.sort((a, b) => a.workload - b.workload);

    // Return agents with capacity (workload < 10)
    return agentWorkloads
      .filter(a => a.workload < 10)
      .map(a => a.userId);
  }

  /**
   * Get escalation managers for given level
   */
  private async getEscalationManagers(level: number): Promise<string[]> {
    const roles = [
      'support_agent',
      'support_manager',
      'department_manager',
      'admin'
    ];

    const targetRole = roles[Math.min(level, roles.length - 1)];

    const managers = await this.db.collection('users')
      .where('role', '==', targetRole)
      .where('active', '==', true)
      .get();

    return managers.docs.map(doc => doc.id);
  }

  /**
   * Generate SLA report
   */
  async generateSLAReport(startDate: Date, endDate: Date): Promise<any> {
    const start = admin.firestore.Timestamp.fromDate(startDate);
    const end = admin.firestore.Timestamp.fromDate(endDate);

    // Get all tickets in date range
    const tickets = await this.db.collection('tickets')
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    const report = {
      totalTickets: tickets.size,
      byPriority: {} as any,
      firstResponseMetrics: {
        met: 0,
        breached: 0,
        averageTime: 0,
        successRate: 0
      },
      resolutionMetrics: {
        met: 0,
        breached: 0,
        averageTime: 0,
        successRate: 0
      },
      escalations: 0,
      pausedTickets: 0
    };

    const priorities = ['low', 'medium', 'high', 'critical'];
    priorities.forEach(p => {
      report.byPriority[p] = {
        count: 0,
        firstResponseMet: 0,
        resolutionMet: 0
      };
    });

    let totalFirstResponseTime = 0;
    let totalResolutionTime = 0;

    for (const ticketDoc of tickets.docs) {
      const ticket = ticketDoc.data();
      const trackerDoc = await this.db.collection('slaTrackers').doc(ticketDoc.id).get();

      if (trackerDoc.exists) {
        const tracker = trackerDoc.data() as SLATracker;

        // Priority breakdown
        if (report.byPriority[ticket.priority]) {
          report.byPriority[ticket.priority].count++;
        }

        // First response metrics
        if (tracker.firstResponseTime) {
          const actualMinutes = this.getActualMinutes(
            tracker.startTime,
            tracker.firstResponseTime,
            tracker
          );
          totalFirstResponseTime += actualMinutes;

          if (tracker.firstResponseTime <= tracker.firstResponseTarget) {
            report.firstResponseMetrics.met++;
            if (report.byPriority[ticket.priority]) {
              report.byPriority[ticket.priority].firstResponseMet++;
            }
          } else {
            report.firstResponseMetrics.breached++;
          }
        }

        // Resolution metrics
        if (tracker.resolutionTime) {
          const actualMinutes = this.getActualMinutes(
            tracker.startTime,
            tracker.resolutionTime,
            tracker
          );
          totalResolutionTime += actualMinutes;

          if (tracker.resolutionTime <= tracker.resolutionTarget) {
            report.resolutionMetrics.met++;
            if (report.byPriority[ticket.priority]) {
              report.byPriority[ticket.priority].resolutionMet++;
            }
          } else {
            report.resolutionMetrics.breached++;
          }
        }

        // Count escalations
        if (tracker.escalationLevel > 0) {
          report.escalations++;
        }

        // Count paused tickets
        if (tracker.pausedDuration > 0) {
          report.pausedTickets++;
        }
      }
    }

    // Calculate averages and success rates
    const responsedTickets = report.firstResponseMetrics.met + report.firstResponseMetrics.breached;
    if (responsedTickets > 0) {
      report.firstResponseMetrics.averageTime = Math.round(totalFirstResponseTime / responsedTickets);
      report.firstResponseMetrics.successRate =
        Math.round((report.firstResponseMetrics.met / responsedTickets) * 100);
    }

    const resolvedTickets = report.resolutionMetrics.met + report.resolutionMetrics.breached;
    if (resolvedTickets > 0) {
      report.resolutionMetrics.averageTime = Math.round(totalResolutionTime / resolvedTickets);
      report.resolutionMetrics.successRate =
        Math.round((report.resolutionMetrics.met / resolvedTickets) * 100);
    }

    return report;
  }
}

export default SLARulesEngine;
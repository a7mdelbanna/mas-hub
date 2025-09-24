import * as admin from 'firebase-admin';
import { db, COLLECTIONS } from '../config/firebase';
import { BaseRepository } from '../repositories/BaseRepository';
import { nanoid } from 'nanoid';

export interface Project {
  id?: string;
  name: string;
  code?: string;
  accountId: string;
  projectTypeId: string;
  managerId: string;
  description?: string;
  status: 'draft' | 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  startDate: FirebaseFirestore.Timestamp;
  dueDate: FirebaseFirestore.Timestamp;
  actualStartDate?: FirebaseFirestore.Timestamp;
  actualEndDate?: FirebaseFirestore.Timestamp;
  estimateBudget: number;
  actualBudget?: number;
  currency: string;
  completionPercentage: number;
  members: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
  deletedAt?: FirebaseFirestore.Timestamp | null;
  createdBy?: string;
  updatedBy?: string;
}

export interface Phase {
  id?: string;
  projectId: string;
  name: string;
  description?: string;
  startDate: FirebaseFirestore.Timestamp;
  dueDate: FirebaseFirestore.Timestamp;
  actualStartDate?: FirebaseFirestore.Timestamp;
  actualEndDate?: FirebaseFirestore.Timestamp;
  weight: number;
  status: string;
  completionPercentage: number;
  order: number;
}

export interface Task {
  id?: string;
  projectId: string;
  phaseId?: string;
  parentTaskId?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'blocked' | 'completed';
  priority: number;
  assigneeId?: string;
  reviewerId?: string;
  startDate?: FirebaseFirestore.Timestamp;
  dueDate?: FirebaseFirestore.Timestamp;
  estimateHours?: number;
  spentHours?: number;
  remainingHours?: number;
  labels?: string[];
  attachments?: string[];
  blockedBy?: string[];
  customFields?: Record<string, any>;
}

export class ProjectService {
  private projectRepo: BaseRepository<Project>;
  private phaseRepo: BaseRepository<Phase>;
  private taskRepo: BaseRepository<Task>;

  constructor() {
    this.projectRepo = new BaseRepository<Project>(COLLECTIONS.PROJECTS);
    this.phaseRepo = new BaseRepository<Phase>(COLLECTIONS.PHASES);
    this.taskRepo = new BaseRepository<Task>(COLLECTIONS.TASKS);
  }

  /**
   * Create a new project with template
   */
  async createProject(data: Partial<Project>, userId: string): Promise<Project> {
    // Generate project code
    const projectCode = await this.projectRepo.generateDocumentNumber('PRJ');

    // Get project type and template
    const projectTypeDoc = await db
      .collection('projectTypes')
      .doc(data.projectTypeId!)
      .get();

    if (!projectTypeDoc.exists) {
      throw new Error('Invalid project type');
    }

    const projectType = projectTypeDoc.data()!;

    // Create project
    const project = await this.projectRepo.create(
      {
        ...data,
        code: projectCode,
        status: 'planning',
        completionPercentage: 0,
        members: data.members || [userId],
      },
      userId
    );

    // Create phases from template if available
    if (projectType.defaultTemplateId) {
      await this.createPhasesFromTemplate(project.id!, projectType.defaultTemplateId, userId);
    }

    // Create project folder in storage
    await this.createProjectFolder(project.id!);

    // Send notifications to team members
    await this.notifyTeamMembers(project, 'created', userId);

    // Create audit log
    await this.createAuditLog('project_created', project.id!, userId, { project });

    return project;
  }

  /**
   * Update project and recalculate completion
   */
  async updateProject(
    projectId: string,
    updates: Partial<Project>,
    userId: string
  ): Promise<Project> {
    const project = await this.projectRepo.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Check permissions
    if (!this.canModifyProject(project, userId)) {
      throw new Error('Insufficient permissions to modify project');
    }

    // Update project
    const updatedProject = await this.projectRepo.update(projectId, updates, userId);

    // Recalculate completion if status changed
    if (updates.status) {
      await this.recalculateProjectCompletion(projectId);
    }

    // Notify relevant stakeholders
    if (updates.status === 'completed') {
      await this.handleProjectCompletion(updatedProject, userId);
    }

    // Create audit log
    await this.createAuditLog('project_updated', projectId, userId, {
      before: project,
      after: updatedProject
    });

    return updatedProject;
  }

  /**
   * Create task in project
   */
  async createTask(
    projectId: string,
    taskData: Partial<Task>,
    userId: string
  ): Promise<Task> {
    const project = await this.projectRepo.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Create task
    const task = await this.taskRepo.create(
      {
        ...taskData,
        projectId,
        status: 'todo',
        spentHours: 0,
        remainingHours: taskData.estimateHours,
      },
      userId
    );

    // Update project budget if task has estimate
    if (taskData.estimateHours) {
      await this.updateProjectBudgetEstimate(projectId);
    }

    // Notify assignee
    if (task.assigneeId && task.assigneeId !== userId) {
      await this.notifyTaskAssignment(task, userId);
    }

    return task;
  }

  /**
   * Update task status and calculate progress
   */
  async updateTaskStatus(
    taskId: string,
    status: Task['status'],
    userId: string
  ): Promise<Task> {
    const task = await this.taskRepo.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    const previousStatus = task.status;

    // Update task
    const updatedTask = await this.taskRepo.update(
      taskId,
      { status },
      userId
    );

    // If task completed, update project completion
    if (status === 'completed' && previousStatus !== 'completed') {
      await this.recalculateProjectCompletion(task.projectId);

      // Update spent hours if not set
      if (!task.spentHours && task.estimateHours) {
        await this.taskRepo.update(
          taskId,
          {
            spentHours: task.estimateHours,
            remainingHours: 0
          },
          userId
        );
      }
    }

    // If task reopened, recalculate
    if (status !== 'completed' && previousStatus === 'completed') {
      await this.recalculateProjectCompletion(task.projectId);
    }

    return updatedTask;
  }

  /**
   * Log time against task
   */
  async logTime(
    taskId: string,
    hours: number,
    date: Date,
    description: string,
    billable: boolean,
    userId: string
  ): Promise<void> {
    const task = await this.taskRepo.findById(taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    // Create timesheet entry
    await db.collection(COLLECTIONS.TIMESHEETS).add({
      userId,
      projectId: task.projectId,
      taskId,
      date: admin.firestore.Timestamp.fromDate(date),
      hours,
      billable,
      description,
      status: 'draft',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: userId,
    });

    // Update task spent hours
    const newSpentHours = (task.spentHours || 0) + hours;
    const newRemainingHours = Math.max(0, (task.estimateHours || 0) - newSpentHours);

    await this.taskRepo.update(
      taskId,
      {
        spentHours: newSpentHours,
        remainingHours: newRemainingHours,
      },
      userId
    );

    // Update project actual budget
    await this.updateProjectActualBudget(task.projectId);
  }

  /**
   * Get project dashboard data
   */
  async getProjectDashboard(projectId: string): Promise<any> {
    const project = await this.projectRepo.findById(projectId);

    if (!project) {
      throw new Error('Project not found');
    }

    // Get phases
    const phases = await this.phaseRepo.find({
      where: [{ field: 'projectId', operator: '==', value: projectId }],
      orderBy: 'order',
    });

    // Get tasks
    const tasks = await this.taskRepo.find({
      where: [{ field: 'projectId', operator: '==', value: projectId }],
    });

    // Calculate statistics
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
      blockedTasks: tasks.filter(t => t.status === 'blocked').length,
      totalEstimateHours: tasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0),
      totalSpentHours: tasks.reduce((sum, t) => sum + (t.spentHours || 0), 0),
      budgetSpent: project.actualBudget || 0,
      budgetRemaining: project.estimateBudget - (project.actualBudget || 0),
    };

    // Get recent activities
    const activities = await this.getProjectActivities(projectId, 10);

    // Get team members details
    const teamMembers = await this.getTeamMembersDetails(project.members);

    return {
      project,
      phases,
      tasks,
      stats,
      activities,
      teamMembers,
    };
  }

  // Private helper methods

  private async createPhasesFromTemplate(
    projectId: string,
    templateId: string,
    userId: string
  ): Promise<void> {
    const templateDoc = await db
      .collection('projectTemplates')
      .doc(templateId)
      .get();

    if (!templateDoc.exists) {
      return;
    }

    const template = templateDoc.data()!;
    const projectDoc = await this.projectRepo.findById(projectId);

    if (!projectDoc) {
      return;
    }

    let currentDate = projectDoc.startDate.toDate();

    for (const [index, phaseTemplate] of template.phases.entries()) {
      const phaseEndDate = new Date(currentDate);
      phaseEndDate.setDate(phaseEndDate.getDate() + (phaseTemplate.duration || 30));

      const phase = await this.phaseRepo.create(
        {
          projectId,
          name: phaseTemplate.name,
          startDate: admin.firestore.Timestamp.fromDate(currentDate),
          dueDate: admin.firestore.Timestamp.fromDate(phaseEndDate),
          weight: phaseTemplate.weight || (100 / template.phases.length),
          status: 'planning',
          completionPercentage: 0,
          order: index,
        },
        userId
      );

      // Create default tasks for phase
      if (phaseTemplate.defaultTasks) {
        for (const taskTemplate of phaseTemplate.defaultTasks) {
          await this.taskRepo.create(
            {
              projectId,
              phaseId: phase.id,
              title: taskTemplate.title,
              description: taskTemplate.description,
              estimateHours: taskTemplate.estimateHours,
              status: 'todo',
              priority: 3,
            },
            userId
          );
        }
      }

      currentDate = phaseEndDate;
    }
  }

  private async recalculateProjectCompletion(projectId: string): Promise<void> {
    const tasks = await this.taskRepo.find({
      where: [{ field: 'projectId', operator: '==', value: projectId }],
    });

    if (tasks.length === 0) {
      return;
    }

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const completionPercentage = Math.round((completedTasks / tasks.length) * 100);

    await this.projectRepo.update(projectId, { completionPercentage }, 'system');
  }

  private async updateProjectBudgetEstimate(projectId: string): Promise<void> {
    const tasks = await this.taskRepo.find({
      where: [{ field: 'projectId', operator: '==', value: projectId }],
    });

    const totalEstimateHours = tasks.reduce((sum, t) => sum + (t.estimateHours || 0), 0);

    // Assuming average rate of $100/hour (should be configurable)
    const estimatedBudget = totalEstimateHours * 100;

    await this.projectRepo.update(projectId, { estimateBudget: estimatedBudget }, 'system');
  }

  private async updateProjectActualBudget(projectId: string): Promise<void> {
    // Get all approved timesheets for project
    const timesheets = await db
      .collection(COLLECTIONS.TIMESHEETS)
      .where('projectId', '==', projectId)
      .where('status', '==', 'approved')
      .get();

    let totalCost = 0;

    for (const doc of timesheets.docs) {
      const timesheet = doc.data();
      const rate = timesheet.rate || 100; // Default rate if not specified
      totalCost += timesheet.hours * rate;
    }

    await this.projectRepo.update(projectId, { actualBudget: totalCost }, 'system');
  }

  private async handleProjectCompletion(project: Project, userId: string): Promise<void> {
    // Update actual end date
    await this.projectRepo.update(
      project.id!,
      { actualEndDate: admin.firestore.Timestamp.now() },
      userId
    );

    // Generate final invoice if needed
    if (project.accountId) {
      await this.generateFinalInvoice(project);
    }

    // Send completion notifications
    await this.notifyTeamMembers(project, 'completed', userId);

    // Archive project documents
    await this.archiveProjectDocuments(project.id!);
  }

  private async generateFinalInvoice(project: Project): Promise<void> {
    // This would integrate with the FinanceService
    // Placeholder for now
    console.log(`Generating final invoice for project ${project.id}`);
  }

  private async createProjectFolder(projectId: string): Promise<void> {
    // Create folder structure in storage
    // This would integrate with storage service
    console.log(`Creating storage folder for project ${projectId}`);
  }

  private async archiveProjectDocuments(projectId: string): Promise<void> {
    // Archive project documents
    console.log(`Archiving documents for project ${projectId}`);
  }

  private async notifyTeamMembers(
    project: Project,
    action: string,
    userId: string
  ): Promise<void> {
    // Send notifications to team members
    const batch = db.batch();

    for (const memberId of project.members) {
      if (memberId !== userId) {
        const notificationRef = db.collection(COLLECTIONS.NOTIFICATIONS).doc();
        batch.set(notificationRef, {
          userId: memberId,
          type: 'info',
          title: `Project ${action}`,
          message: `Project "${project.name}" has been ${action}`,
          entityType: 'project',
          entityId: project.id,
          read: false,
          emailSent: false,
          pushSent: false,
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now(),
        });
      }
    }

    await batch.commit();
  }

  private async notifyTaskAssignment(task: Task, assignedBy: string): Promise<void> {
    if (!task.assigneeId) return;

    await db.collection(COLLECTIONS.NOTIFICATIONS).add({
      userId: task.assigneeId,
      type: 'task',
      title: 'New Task Assigned',
      message: `You have been assigned task: "${task.title}"`,
      entityType: 'task',
      entityId: task.id,
      actionUrl: `/projects/${task.projectId}/tasks/${task.id}`,
      read: false,
      emailSent: false,
      pushSent: false,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      createdBy: assignedBy,
    });
  }

  private async getProjectActivities(projectId: string, limit: number): Promise<any[]> {
    const activities = await db
      .collection(COLLECTIONS.AUDIT_LOGS)
      .where('entityType', '==', 'project')
      .where('entityId', '==', projectId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return activities.docs.map(doc => doc.data());
  }

  private async getTeamMembersDetails(memberIds: string[]): Promise<any[]> {
    if (memberIds.length === 0) return [];

    const members = await db
      .collection(COLLECTIONS.USERS)
      .where(admin.firestore.FieldPath.documentId(), 'in', memberIds.slice(0, 10))
      .get();

    return members.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  private canModifyProject(project: Project, userId: string): boolean {
    return (
      project.managerId === userId ||
      project.members.includes(userId) ||
      project.createdBy === userId
    );
  }

  private async createAuditLog(
    action: string,
    entityId: string,
    userId: string,
    data: any
  ): Promise<void> {
    await db.collection(COLLECTIONS.AUDIT_LOGS).add({
      timestamp: admin.firestore.Timestamp.now(),
      userId,
      action,
      entityType: 'project',
      entityId,
      metadata: data,
    });
  }
}
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { ProjectService } from '../../src/services/projectService';
import { Project, ProjectStatus, ProjectType } from '../../src/types/models';
import { FirebaseAdmin } from '../../src/lib/firebase-admin';

// Mock Firebase Admin
jest.mock('../../src/lib/firebase-admin');

describe('Project Service Tests - PRD US-P1-001 Project Manager Creates Project', () => {
  let projectService: ProjectService;
  let mockFirestore: any;
  let mockAuth: any;

  const mockProjectManager = {
    uid: 'pm-123',
    email: 'pm@mas.com',
    displayName: 'Project Manager',
    customClaims: {
      role: 'project_manager',
      permissions: ['projects:create', 'projects:read', 'projects:update'],
    },
  };

  const mockPOSProjectType: ProjectType = {
    id: 'type-pos',
    name: 'POS System',
    code: 'POS',
    defaultTemplateId: 'template-pos',
    defaultPricebookId: 'pricebook-pos',
    defaultDuration: 180,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };

  const mockProjectTemplate = {
    id: 'template-pos',
    name: 'POS System Template',
    projectTypeId: 'type-pos',
    phases: [
      {
        name: 'Requirements Analysis',
        duration: 30,
        weight: 20,
        defaultTasks: [
          {
            title: 'Gather business requirements',
            description: 'Meet with stakeholders to understand needs',
            estimateHours: 20,
          },
          {
            title: 'Create technical specifications',
            description: 'Document technical requirements',
            estimateHours: 16,
          },
        ],
      },
      {
        name: 'System Design',
        duration: 45,
        weight: 25,
        defaultTasks: [
          {
            title: 'Design system architecture',
            description: 'Create high-level system design',
            estimateHours: 24,
          },
          {
            title: 'Design database schema',
            description: 'Define data models and relationships',
            estimateHours: 16,
          },
        ],
      },
      {
        name: 'Development',
        duration: 90,
        weight: 40,
        defaultTasks: [
          {
            title: 'Implement core POS functionality',
            description: 'Build main POS features',
            estimateHours: 120,
          },
          {
            title: 'Implement payment processing',
            description: 'Integrate payment gateways',
            estimateHours: 40,
          },
        ],
      },
      {
        name: 'Testing & Deployment',
        duration: 15,
        weight: 15,
        defaultTasks: [
          {
            title: 'System testing',
            description: 'Comprehensive testing',
            estimateHours: 32,
          },
          {
            title: 'Deploy to production',
            description: 'Production deployment',
            estimateHours: 8,
          },
        ],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'admin',
    updatedBy: 'admin',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Firestore
    mockFirestore = {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: jest.fn().mockResolvedValue(undefined),
          get: jest.fn().mockResolvedValue({
            exists: true,
            id: 'test-id',
            data: jest.fn().mockReturnValue({}),
          }),
          update: jest.fn().mockResolvedValue(undefined),
          delete: jest.fn().mockResolvedValue(undefined),
        }),
        add: jest.fn().mockResolvedValue({ id: 'new-doc-id' }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: [],
          size: 0,
          empty: true,
        }),
      }),
      runTransaction: jest.fn(),
      batch: jest.fn().mockReturnValue({
        set: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn().mockResolvedValue(undefined),
      }),
    };

    // Mock Auth
    mockAuth = {
      verifyIdToken: jest.fn().mockResolvedValue(mockProjectManager),
      getUser: jest.fn().mockResolvedValue(mockProjectManager),
    };

    // Mock FirebaseAdmin
    (FirebaseAdmin.firestore as jest.Mock).mockReturnValue(mockFirestore);
    (FirebaseAdmin.auth as jest.Mock).mockReturnValue(mockAuth);

    projectService = new ProjectService();
  });

  describe('Project Creation - US-P1-001', () => {
    it('should create project when PM has valid permissions', async () => {
      // Arrange - PRD AC: "Given I am a project manager with project creation permissions"
      const projectData = {
        name: 'E-commerce POS System',
        accountId: 'client-123',
        projectTypeId: 'type-pos',
        managerId: mockProjectManager.uid,
        description: 'Complete POS system for retail client',
        estimateBudget: 75000,
        currency: 'USD' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-08-01'),
      };

      // Mock project type lookup
      mockFirestore.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        id: 'type-pos',
        data: () => mockPOSProjectType,
      });

      // Mock template lookup
      mockFirestore.collection().doc().get.mockResolvedValueOnce({
        exists: true,
        id: 'template-pos',
        data: () => mockProjectTemplate,
      });

      // Mock project creation
      const expectedProject: Partial<Project> = {
        id: 'proj-new-123',
        name: projectData.name,
        code: 'POS-2024-001', // Generated code
        accountId: projectData.accountId,
        projectTypeId: projectData.projectTypeId,
        managerId: projectData.managerId,
        status: ProjectStatus.DRAFT,
        completionPercentage: 0,
        members: [projectData.managerId],
      };

      mockFirestore.collection().add.mockResolvedValue({ id: 'proj-new-123' });

      // Act - PRD AC: "When I create a new project and select type 'POS System'"
      const project = await projectService.createProject(projectData, mockProjectManager.uid);

      // Assert - PRD AC: "Then the system should create the project with the POS template"
      expect(project.name).toBe(projectData.name);
      expect(project.projectTypeId).toBe('type-pos');
      expect(project.managerId).toBe(mockProjectManager.uid);
      expect(project.status).toBe(ProjectStatus.DRAFT);
      expect(mockFirestore.collection().add).toHaveBeenCalled();
    });

    it('should assign default phases based on template', async () => {
      // Arrange - PRD AC: "And assign default phases based on the template"
      const projectData = {
        name: 'Test POS Project',
        accountId: 'client-123',
        projectTypeId: 'type-pos',
        managerId: mockProjectManager.uid,
        estimateBudget: 50000,
        currency: 'USD' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-08-01'),
      };

      // Mock dependencies
      mockFirestore.collection().doc().get
        .mockResolvedValueOnce({
          exists: true,
          id: 'type-pos',
          data: () => mockPOSProjectType,
        })
        .mockResolvedValueOnce({
          exists: true,
          id: 'template-pos',
          data: () => mockProjectTemplate,
        });

      mockFirestore.collection().add.mockResolvedValue({ id: 'proj-123' });

      // Mock phase creation
      const createPhasesSpy = jest.spyOn(projectService, 'createDefaultPhases').mockResolvedValue([
        {
          id: 'phase-1',
          projectId: 'proj-123',
          name: 'Requirements Analysis',
          weight: 20,
          order: 1,
          status: ProjectStatus.PLANNING,
          completionPercentage: 0,
        },
        {
          id: 'phase-2',
          projectId: 'proj-123',
          name: 'System Design',
          weight: 25,
          order: 2,
          status: ProjectStatus.PLANNING,
          completionPercentage: 0,
        },
        {
          id: 'phase-3',
          projectId: 'proj-123',
          name: 'Development',
          weight: 40,
          order: 3,
          status: ProjectStatus.PLANNING,
          completionPercentage: 0,
        },
        {
          id: 'phase-4',
          projectId: 'proj-123',
          name: 'Testing & Deployment',
          weight: 15,
          order: 4,
          status: ProjectStatus.PLANNING,
          completionPercentage: 0,
        },
      ] as any);

      // Act
      const project = await projectService.createProject(projectData, mockProjectManager.uid);

      // Assert
      expect(createPhasesSpy).toHaveBeenCalledWith('proj-123', mockProjectTemplate.phases);
      expect(createPhasesSpy).toHaveReturnedWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Requirements Analysis', weight: 20 }),
          expect.objectContaining({ name: 'System Design', weight: 25 }),
          expect.objectContaining({ name: 'Development', weight: 40 }),
          expect.objectContaining({ name: 'Testing & Deployment', weight: 15 }),
        ])
      );
    });

    it('should set up project budget tracking', async () => {
      // Arrange - PRD AC: "And set up the project budget tracking"
      const projectData = {
        name: 'Budget Tracking Test',
        accountId: 'client-123',
        projectTypeId: 'type-pos',
        managerId: mockProjectManager.uid,
        estimateBudget: 100000,
        currency: 'USD' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-08-01'),
      };

      mockFirestore.collection().doc().get
        .mockResolvedValueOnce({ exists: true, data: () => mockPOSProjectType })
        .mockResolvedValueOnce({ exists: true, data: () => mockProjectTemplate });

      mockFirestore.collection().add.mockResolvedValue({ id: 'proj-budget-123' });

      // Mock budget setup
      const setupBudgetSpy = jest.spyOn(projectService, 'initializeBudgetTracking').mockResolvedValue({
        projectId: 'proj-budget-123',
        estimatedBudget: 100000,
        actualBudget: 0,
        remainingBudget: 100000,
        budgetUtilization: 0,
        budgetAlerts: {
          warningThreshold: 80,
          criticalThreshold: 90,
          alertsEnabled: true,
        },
      });

      // Act
      const project = await projectService.createProject(projectData, mockProjectManager.uid);

      // Assert
      expect(project.estimateBudget).toBe(100000);
      expect(project.actualBudget).toBe(0);
      expect(setupBudgetSpy).toHaveBeenCalledWith('proj-budget-123', 100000);
    });

    it('should create client portal space for the project', async () => {
      // Arrange - PRD AC: "And create a client portal space for the project"
      const projectData = {
        name: 'Client Portal Project',
        accountId: 'client-portal-123',
        projectTypeId: 'type-pos',
        managerId: mockProjectManager.uid,
        estimateBudget: 60000,
        currency: 'USD' as const,
        startDate: new Date('2024-02-01'),
        dueDate: new Date('2024-08-01'),
      };

      mockFirestore.collection().doc().get
        .mockResolvedValueOnce({ exists: true, data: () => mockPOSProjectType })
        .mockResolvedValueOnce({ exists: true, data: () => mockProjectTemplate });

      mockFirestore.collection().add.mockResolvedValue({ id: 'proj-portal-123' });

      // Mock client portal setup
      const createPortalSpy = jest.spyOn(projectService, 'createClientPortalAccess').mockResolvedValue({
        projectId: 'proj-portal-123',
        accountId: 'client-portal-123',
        portalUrl: '/portal/projects/proj-portal-123',
        accessPermissions: [
          'project:read',
          'milestones:read',
          'tasks:read:assigned',
          'documents:read',
        ],
        notifications: {
          milestoneUpdates: true,
          taskAssignments: true,
          budgetAlerts: false, // Client shouldn't see internal budget details
        },
      });

      // Act
      await projectService.createProject(projectData, mockProjectManager.uid);

      // Assert
      expect(createPortalSpy).toHaveBeenCalledWith('proj-portal-123', 'client-portal-123');
    });
  });

  describe('Project Code Generation', () => {
    it('should generate unique project codes based on type', async () => {
      // Arrange
      const projectType = 'POS';
      const year = new Date().getFullYear();

      // Mock existing projects query
      mockFirestore.collection().where().orderBy().limit().get.mockResolvedValue({
        docs: [
          {
            data: () => ({ code: `${projectType}-${year}-005` }),
          },
        ],
        size: 1,
        empty: false,
      });

      // Act
      const projectCode = await projectService.generateProjectCode(projectType);

      // Assert
      expect(projectCode).toBe(`${projectType}-${year}-006`); // Next sequential number
    });

    it('should start with 001 when no existing projects', async () => {
      // Arrange
      const projectType = 'MOB';
      const year = new Date().getFullYear();

      mockFirestore.collection().where().orderBy().limit().get.mockResolvedValue({
        docs: [],
        size: 0,
        empty: true,
      });

      // Act
      const projectCode = await projectService.generateProjectCode(projectType);

      // Assert
      expect(projectCode).toBe(`${projectType}-${year}-001`);
    });
  });

  describe('Permission Validation', () => {
    it('should reject project creation without proper permissions', async () => {
      // Arrange
      const unauthorizedUser = {
        uid: 'user-123',
        customClaims: {
          role: 'employee',
          permissions: ['tasks:read', 'timesheets:create'], // No project creation permission
        },
      };

      mockAuth.verifyIdToken.mockResolvedValue(unauthorizedUser);

      const projectData = {
        name: 'Unauthorized Project',
        accountId: 'client-123',
        projectTypeId: 'type-pos',
        managerId: 'user-123',
        estimateBudget: 50000,
        currency: 'USD' as const,
        startDate: new Date(),
        dueDate: new Date(),
      };

      // Act & Assert
      await expect(projectService.createProject(projectData, 'user-123'))
        .rejects.toThrow('Insufficient permissions to create projects');
    });

    it('should validate user can manage assigned project', async () => {
      // Arrange
      const projectId = 'proj-123';
      const managerId = 'pm-456';

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          id: projectId,
          managerId: managerId,
          members: [managerId, 'dev-1', 'dev-2'],
        }),
      });

      // Act
      const canManage = await projectService.canUserManageProject(managerId, projectId);

      // Assert
      expect(canManage).toBe(true);
    });

    it('should reject access for non-member users', async () => {
      // Arrange
      const projectId = 'proj-123';
      const unauthorizedUserId = 'user-999';

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          id: projectId,
          managerId: 'pm-456',
          members: ['pm-456', 'dev-1', 'dev-2'], // User not in members list
        }),
      });

      // Act
      const canAccess = await projectService.canUserAccessProject(unauthorizedUserId, projectId);

      // Assert
      expect(canAccess).toBe(false);
    });
  });

  describe('Project Template Application', () => {
    it('should create default tasks from template', async () => {
      // Arrange
      const projectId = 'proj-template-123';
      const templatePhases = mockProjectTemplate.phases;

      // Mock task creation
      const createTasksSpy = jest.spyOn(projectService, 'createTasksFromTemplate').mockResolvedValue([
        {
          id: 'task-1',
          projectId: projectId,
          phaseId: 'phase-1',
          title: 'Gather business requirements',
          estimateHours: 20,
          status: 'todo',
        },
        {
          id: 'task-2',
          projectId: projectId,
          phaseId: 'phase-1',
          title: 'Create technical specifications',
          estimateHours: 16,
          status: 'todo',
        },
      ] as any);

      // Act
      await projectService.createDefaultPhases(projectId, templatePhases);

      // Assert
      expect(createTasksSpy).toHaveBeenCalled();
      // Each phase should create its default tasks
      expect(createTasksSpy).toHaveBeenCalledTimes(templatePhases.length);
    });

    it('should handle missing or invalid templates gracefully', async () => {
      // Arrange
      const projectData = {
        name: 'Missing Template Project',
        accountId: 'client-123',
        projectTypeId: 'type-invalid',
        managerId: mockProjectManager.uid,
        estimateBudget: 50000,
        currency: 'USD' as const,
        startDate: new Date(),
        dueDate: new Date(),
      };

      // Mock missing project type
      mockFirestore.collection().doc().get.mockResolvedValueOnce({
        exists: false,
      });

      // Act & Assert
      await expect(projectService.createProject(projectData, mockProjectManager.uid))
        .rejects.toThrow('Invalid project type');
    });
  });

  describe('Project Status Management', () => {
    it('should update project completion percentage when phases complete', async () => {
      // Arrange
      const projectId = 'proj-completion-123';
      const phases = [
        { weight: 25, completionPercentage: 100 }, // Complete
        { weight: 25, completionPercentage: 100 }, // Complete
        { weight: 30, completionPercentage: 50 },  // Half complete
        { weight: 20, completionPercentage: 0 },   // Not started
      ];

      // Act
      const completionPercentage = projectService.calculateProjectCompletion(phases);

      // Assert
      // 25*100 + 25*100 + 30*50 + 20*0 = 2500 + 2500 + 1500 + 0 = 6500 / 100 = 65%
      expect(completionPercentage).toBe(65);
    });

    it('should automatically transition project status based on progress', async () => {
      // Arrange
      const projectId = 'proj-status-123';

      mockFirestore.collection().doc().get.mockResolvedValue({
        exists: true,
        data: () => ({
          id: projectId,
          status: ProjectStatus.PLANNING,
          completionPercentage: 1,
        }),
      });

      // Act
      await projectService.updateProjectStatus(projectId, { completionPercentage: 1 });

      // Assert - Project should transition from PLANNING to IN_PROGRESS when work begins
      expect(mockFirestore.collection().doc().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProjectStatus.IN_PROGRESS,
          actualStartDate: expect.any(Date),
        })
      );
    });
  });
});
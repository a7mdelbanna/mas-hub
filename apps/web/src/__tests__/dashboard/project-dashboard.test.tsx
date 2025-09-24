import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ProjectDashboard } from '../../modules/dashboard/components/ProjectDashboard';
import { Project, Phase, Task, ProjectStatus } from '../../types/models';

// Mock hooks and services
const mockUseAuth = vi.fn();
const mockUseQuery = vi.fn();

vi.mock('../../modules/auth/hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: mockUseQuery,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ projectId: 'proj-1' }),
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('Project Dashboard Tests - PRD US-P1-003 Client Views Project Status', () => {
  const mockProject: Project = {
    id: 'proj-1',
    name: 'E-commerce POS System',
    code: 'POS-2024-001',
    accountId: 'client-123',
    projectTypeId: 'pos-type',
    managerId: 'pm-1',
    description: 'Complete POS system for retail store',
    status: ProjectStatus.IN_PROGRESS,
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-06-30'),
    actualStartDate: new Date('2024-01-02'),
    estimateBudget: 50000,
    actualBudget: 30000,
    currency: 'USD' as any,
    completionPercentage: 65,
    members: ['pm-1', 'dev-1', 'dev-2'],
    tags: ['pos', 'retail', 'urgent'],
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-25'),
    createdBy: 'sales-1',
    updatedBy: 'pm-1',
  };

  const mockPhases: Phase[] = [
    {
      id: 'phase-1',
      projectId: 'proj-1',
      name: 'Requirements Analysis',
      description: 'Gather and analyze requirements',
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-31'),
      actualStartDate: new Date('2024-01-02'),
      actualEndDate: new Date('2024-01-28'),
      weight: 20,
      status: ProjectStatus.COMPLETED,
      completionPercentage: 100,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
    {
      id: 'phase-2',
      projectId: 'proj-1',
      name: 'System Design',
      description: 'Design system architecture',
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-02-29'),
      actualStartDate: new Date('2024-02-01'),
      weight: 25,
      status: ProjectStatus.COMPLETED,
      completionPercentage: 100,
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
    {
      id: 'phase-3',
      projectId: 'proj-1',
      name: 'Development',
      description: 'Code implementation',
      startDate: new Date('2024-03-01'),
      dueDate: new Date('2024-05-31'),
      actualStartDate: new Date('2024-03-01'),
      weight: 40,
      status: ProjectStatus.IN_PROGRESS,
      completionPercentage: 70,
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
    {
      id: 'phase-4',
      projectId: 'proj-1',
      name: 'Testing & Deployment',
      description: 'Testing and production deployment',
      startDate: new Date('2024-06-01'),
      dueDate: new Date('2024-06-30'),
      weight: 15,
      status: ProjectStatus.PLANNING,
      completionPercentage: 0,
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
  ];

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      projectId: 'proj-1',
      phaseId: 'phase-3',
      title: 'Implement payment gateway',
      description: 'Integrate Stripe payment processing',
      status: 'completed' as any,
      priority: 1,
      assigneeId: 'dev-1',
      dueDate: new Date('2024-03-15'),
      estimateHours: 20,
      spentHours: 18,
      remainingHours: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'dev-1',
    },
    {
      id: 'task-2',
      projectId: 'proj-1',
      phaseId: 'phase-3',
      title: 'Create product catalog',
      description: 'Build product management interface',
      status: 'in_progress' as any,
      priority: 1,
      assigneeId: 'dev-2',
      dueDate: new Date('2024-04-01'),
      estimateHours: 30,
      spentHours: 20,
      remainingHours: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'dev-2',
    },
    {
      id: 'task-3',
      projectId: 'proj-1',
      phaseId: 'phase-4',
      title: 'Client approval of final design',
      description: 'Get client sign-off on final UI/UX',
      status: 'todo' as any,
      priority: 2,
      assigneeId: 'client-123', // Task assigned to client
      dueDate: new Date('2024-06-10'),
      estimateHours: 4,
      spentHours: 0,
      remainingHours: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
  ];

  const mockMilestones = [
    {
      id: 'milestone-1',
      projectId: 'proj-1',
      name: 'Requirements Sign-off',
      dueDate: new Date('2024-01-31'),
      completedDate: new Date('2024-01-28'),
      status: 'completed',
    },
    {
      id: 'milestone-2',
      projectId: 'proj-1',
      name: 'System Design Approval',
      dueDate: new Date('2024-02-29'),
      completedDate: new Date('2024-02-28'),
      status: 'completed',
    },
    {
      id: 'milestone-3',
      projectId: 'proj-1',
      name: 'MVP Demo',
      dueDate: new Date('2024-05-15'),
      status: 'upcoming',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock client authentication
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: {
        uid: 'client-123',
        email: 'client@clientcompany.com',
        name: 'Client User',
        accountId: 'client-123',
      },
      isLoading: false,
      error: null,
    });

    // Mock API queries
    mockUseQuery.mockImplementation(({ queryKey }) => {
      switch (queryKey[0]) {
        case 'project':
          return {
            data: mockProject,
            isLoading: false,
            error: null,
          };
        case 'project-phases':
          return {
            data: mockPhases,
            isLoading: false,
            error: null,
          };
        case 'project-tasks':
          return {
            data: mockTasks,
            isLoading: false,
            error: null,
          };
        case 'project-milestones':
          return {
            data: mockMilestones,
            isLoading: false,
            error: null,
          };
        default:
          return {
            data: null,
            isLoading: false,
            error: null,
          };
      }
    });
  });

  describe('Project Status Display - US-P1-003', () => {
    it('should show project completion percentage when client accesses portal', async () => {
      // Arrange - PRD AC: "Then I should see the project completion percentage"
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Project Progress')).toBeInTheDocument();
        expect(screen.getByText('65%')).toBeInTheDocument();
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });

      // Verify progress bar visual
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveStyle('width: 65%');
    });

    it('should display completed and upcoming milestones', async () => {
      // Arrange - PRD AC: "And view completed and upcoming milestones"
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        // Completed milestones
        expect(screen.getByText('Completed Milestones')).toBeInTheDocument();
        expect(screen.getByText('Requirements Sign-off')).toBeInTheDocument();
        expect(screen.getByText('System Design Approval')).toBeInTheDocument();
        expect(screen.getByText('✅ Completed 2024-01-28')).toBeInTheDocument();
        expect(screen.getByText('✅ Completed 2024-02-28')).toBeInTheDocument();

        // Upcoming milestones
        expect(screen.getByText('Upcoming Milestones')).toBeInTheDocument();
        expect(screen.getByText('MVP Demo')).toBeInTheDocument();
        expect(screen.getByText('📅 Due 2024-05-15')).toBeInTheDocument();
      });
    });

    it('should show pending tasks assigned to client', async () => {
      // Arrange - PRD AC: "And see any pending tasks assigned to me"
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Your Pending Tasks')).toBeInTheDocument();
        expect(screen.getByText('Client approval of final design')).toBeInTheDocument();
        expect(screen.getByText('Get client sign-off on final UI/UX')).toBeInTheDocument();
        expect(screen.getByText('Due: 2024-06-10')).toBeInTheDocument();
      });

      // Should not show tasks assigned to other team members
      expect(screen.queryByText('Implement payment gateway')).not.toBeInTheDocument();
      expect(screen.queryByText('Create product catalog')).not.toBeInTheDocument();
    });
  });

  describe('Project Information Display', () => {
    it('should show project basic information', async () => {
      // Arrange
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('E-commerce POS System')).toBeInTheDocument();
        expect(screen.getByText('POS-2024-001')).toBeInTheDocument();
        expect(screen.getByText('Complete POS system for retail store')).toBeInTheDocument();
        expect(screen.getByText('Status: In Progress')).toBeInTheDocument();
      });
    });

    it('should display project timeline', async () => {
      // Arrange
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Project Timeline')).toBeInTheDocument();
        expect(screen.getByText('Start Date: 2024-01-01')).toBeInTheDocument();
        expect(screen.getByText('Due Date: 2024-06-30')).toBeInTheDocument();
        expect(screen.getByText('Actual Start: 2024-01-02')).toBeInTheDocument();
      });

      // Calculate and verify remaining days
      const today = new Date();
      const dueDate = new Date('2024-06-30');
      const remainingDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (remainingDays > 0) {
        expect(screen.getByText(`${remainingDays} days remaining`)).toBeInTheDocument();
      }
    });

    it('should show project phases with status', async () => {
      // Arrange
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Project Phases')).toBeInTheDocument();

        // Phase 1 - Completed
        expect(screen.getByText('Requirements Analysis')).toBeInTheDocument();
        expect(screen.getByText('✅ 100%')).toBeInTheDocument();

        // Phase 2 - Completed
        expect(screen.getByText('System Design')).toBeInTheDocument();
        expect(screen.getAllByText('✅ 100%')).toHaveLength(2);

        // Phase 3 - In Progress
        expect(screen.getByText('Development')).toBeInTheDocument();
        expect(screen.getByText('🔄 70%')).toBeInTheDocument();

        // Phase 4 - Planning
        expect(screen.getByText('Testing & Deployment')).toBeInTheDocument();
        expect(screen.getByText('📋 0%')).toBeInTheDocument();
      });
    });
  });

  describe('Budget and Financial Information', () => {
    it('should display budget information for client', async () => {
      // Arrange
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Budget Overview')).toBeInTheDocument();
        expect(screen.getByText('Estimated Budget: $50,000')).toBeInTheDocument();
        expect(screen.getByText('Spent to Date: $30,000')).toBeInTheDocument();

        // Calculate remaining budget
        const remaining = mockProject.estimateBudget - (mockProject.actualBudget || 0);
        expect(screen.getByText(`Remaining: $${remaining.toLocaleString()}`)).toBeInTheDocument();

        // Calculate budget utilization
        const utilization = Math.round(((mockProject.actualBudget || 0) / mockProject.estimateBudget) * 100);
        expect(screen.getByText(`${utilization}% utilized`)).toBeInTheDocument();
      });
    });

    it('should show budget warning if over threshold', async () => {
      // Arrange - Mock project with high budget utilization
      const highUtilizationProject = {
        ...mockProject,
        actualBudget: 45000, // 90% of estimated budget
      };

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'project') {
          return {
            data: highUtilizationProject,
            isLoading: false,
            error: null,
          };
        }
        return {
          data: null,
          isLoading: false,
          error: null,
        };
      });

      // Act
      render(<ProjectDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('⚠️ Budget Alert')).toBeInTheDocument();
        expect(screen.getByText('Project budget is at 90% utilization')).toBeInTheDocument();
      });
    });
  });

  describe('Client Portal Access Control', () => {
    it('should only show data for client\'s own project', async () => {
      // Arrange - Verify client can only see their project
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        // Verify project belongs to client
        expect(mockProject.accountId).toBe('client-123');

        // Project should be displayed
        expect(screen.getByText('E-commerce POS System')).toBeInTheDocument();
      });
    });

    it('should filter tasks to show only client-assigned tasks', async () => {
      // Arrange
      render(<ProjectDashboard />);

      // Act & Assert
      await waitFor(() => {
        // Client should only see tasks assigned to them
        const clientTasks = mockTasks.filter(task => task.assigneeId === 'client-123');
        expect(clientTasks).toHaveLength(1);

        expect(screen.getByText('Client approval of final design')).toBeInTheDocument();

        // Should not see developer tasks
        expect(screen.queryByText('Implement payment gateway')).not.toBeInTheDocument();
        expect(screen.queryByText('Create product catalog')).not.toBeInTheDocument();
      });
    });

    it('should handle unauthorized access gracefully', async () => {
      // Arrange - Mock unauthorized client
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: {
          uid: 'unauthorized-client',
          email: 'other@company.com',
          accountId: 'other-account',
        },
        isLoading: false,
        error: null,
      });

      mockUseQuery.mockImplementation(() => ({
        data: null,
        isLoading: false,
        error: new Error('Unauthorized access'),
      }));

      // Act
      render(<ProjectDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.getByText('You do not have permission to view this project')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Performance and Loading', () => {
    it('should show loading state while fetching project data', async () => {
      // Arrange
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      // Act
      render(<ProjectDashboard />);

      // Assert
      expect(screen.getByText('Loading project details...')).toBeInTheDocument();
    });

    it('should handle project not found error', async () => {
      // Arrange
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Project not found'),
      });

      // Act
      render(<ProjectDashboard />);

      // Assert
      expect(screen.getByText('Project Not Found')).toBeInTheDocument();
      expect(screen.getByText('The requested project could not be found')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates and Notifications', () => {
    it('should update completion percentage when phases progress', async () => {
      // Arrange - Initial render
      render(<ProjectDashboard />);

      await waitFor(() => {
        expect(screen.getByText('65%')).toBeInTheDocument();
      });

      // Act - Simulate phase progress update
      const updatedPhases = mockPhases.map(phase =>
        phase.id === 'phase-3'
          ? { ...phase, completionPercentage: 90 }
          : phase
      );

      // Calculate new project completion
      const newCompletion = updatedPhases.reduce((sum, phase) => {
        return sum + (phase.weight * phase.completionPercentage / 100);
      }, 0);

      const updatedProject = { ...mockProject, completionPercentage: newCompletion };

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'project') {
          return { data: updatedProject, isLoading: false, error: null };
        }
        if (queryKey[0] === 'project-phases') {
          return { data: updatedPhases, isLoading: false, error: null };
        }
        return { data: null, isLoading: false, error: null };
      });

      // Re-render to simulate update
      render(<ProjectDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(`${Math.round(newCompletion)}%`)).toBeInTheDocument();
      });
    });
  });
});
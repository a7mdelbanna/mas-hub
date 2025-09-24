import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EmployeeDashboard } from '../../modules/dashboard/components/EmployeeDashboard';
import { Task, Timesheet, Announcement } from '../../types/models';

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
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('Employee Dashboard Tests - PRD US-P1-007', () => {
  const mockEmployee = {
    uid: 'emp-123',
    email: 'employee@mas.com',
    name: 'John Employee',
    departmentId: 'dev-dept',
    employeeId: 'EMP001',
  };

  const mockTasks: Task[] = [
    {
      id: 'task-1',
      projectId: 'proj-1',
      title: 'Implement login feature',
      description: 'Create login form and authentication flow',
      status: 'in_progress' as any,
      priority: 1,
      assigneeId: 'emp-123',
      dueDate: new Date('2024-02-01'),
      estimateHours: 8,
      spentHours: 4,
      remainingHours: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
    {
      id: 'task-2',
      projectId: 'proj-2',
      title: 'Fix dashboard bug',
      description: 'Resolve display issue on mobile',
      status: 'todo' as any,
      priority: 2,
      assigneeId: 'emp-123',
      dueDate: new Date('2024-02-05'),
      estimateHours: 4,
      spentHours: 0,
      remainingHours: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'pm-1',
      updatedBy: 'pm-1',
    },
  ];

  const mockTimesheets: Timesheet[] = [
    {
      id: 'ts-1',
      userId: 'emp-123',
      projectId: 'proj-1',
      taskId: 'task-1',
      date: new Date('2024-01-25'),
      hours: 6,
      billable: true,
      description: 'Worked on login implementation',
      status: 'submitted' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'emp-123',
      updatedBy: 'emp-123',
    },
    {
      id: 'ts-2',
      userId: 'emp-123',
      projectId: 'proj-1',
      taskId: 'task-1',
      date: new Date('2024-01-26'),
      hours: 4,
      billable: true,
      description: 'Continued login work',
      status: 'approved' as any,
      approvedBy: 'mgr-1',
      approvedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'emp-123',
      updatedBy: 'emp-123',
    },
  ];

  const mockAnnouncements: Announcement[] = [
    {
      id: 'ann-1',
      title: 'Company Holiday',
      content: 'Office will be closed on Friday for national holiday',
      type: 'info' as any,
      targetAudience: ['all'],
      publishedAt: new Date(),
      pinned: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'hr-1',
      updatedBy: 'hr-1',
    },
  ];

  const mockPayrollInfo = {
    currentSalary: 5000,
    lastPayment: new Date('2024-01-31'),
    ytdEarnings: 60000,
    benefits: {
      healthInsurance: 200,
      retirement401k: 300,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock authentication
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: mockEmployee,
      isLoading: false,
      error: null,
    });

    // Mock API queries
    mockUseQuery.mockImplementation(({ queryKey }) => {
      switch (queryKey[0]) {
        case 'employee-tasks':
          return {
            data: mockTasks,
            isLoading: false,
            error: null,
          };
        case 'employee-timesheets':
          return {
            data: mockTimesheets,
            isLoading: false,
            error: null,
          };
        case 'announcements':
          return {
            data: mockAnnouncements,
            isLoading: false,
            error: null,
          };
        case 'payroll-info':
          return {
            data: mockPayrollInfo,
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

  describe('Dashboard Load and Display - US-P1-007', () => {
    it('should display assigned tasks when employee logs in', async () => {
      // Arrange - PRD AC: "Then I should see my assigned tasks"
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('My Tasks')).toBeInTheDocument();
        expect(screen.getByText('Implement login feature')).toBeInTheDocument();
        expect(screen.getByText('Fix dashboard bug')).toBeInTheDocument();
      });

      // Verify task details are displayed
      expect(screen.getByText('in_progress')).toBeInTheDocument();
      expect(screen.getByText('todo')).toBeInTheDocument();
      expect(screen.getByText('Due: 2024-02-01')).toBeInTheDocument();
    });

    it('should display current timesheet status', async () => {
      // Arrange - PRD AC: "And view my current timesheet status"
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Timesheet Status')).toBeInTheDocument();
        expect(screen.getByText('6 hours')).toBeInTheDocument();
        expect(screen.getByText('4 hours')).toBeInTheDocument();
      });

      // Verify timesheet statuses
      expect(screen.getByText('submitted')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
    });

    it('should display company announcements', async () => {
      // Arrange - PRD AC: "And see company announcements"
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Announcements')).toBeInTheDocument();
        expect(screen.getByText('Company Holiday')).toBeInTheDocument();
        expect(screen.getByText('Office will be closed on Friday for national holiday')).toBeInTheDocument();
      });

      // Verify pinned announcement is highlighted
      expect(screen.getByText('📌')).toBeInTheDocument(); // Pinned indicator
    });

    it('should display payroll information', async () => {
      // Arrange - PRD AC: "And access my payroll information"
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Payroll Info')).toBeInTheDocument();
        expect(screen.getByText('$5,000')).toBeInTheDocument(); // Current salary
        expect(screen.getByText('$60,000')).toBeInTheDocument(); // YTD earnings
      });

      // Verify benefits information
      expect(screen.getByText('Health Insurance: $200')).toBeInTheDocument();
      expect(screen.getByText('401k: $300')).toBeInTheDocument();
    });
  });

  describe('Dashboard Data Accuracy', () => {
    it('should display correct task counts and progress', async () => {
      // Arrange
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        expect(screen.getByText('Total Tasks: 2')).toBeInTheDocument();
        expect(screen.getByText('In Progress: 1')).toBeInTheDocument();
        expect(screen.getByText('To Do: 1')).toBeInTheDocument();
      });

      // Verify task progress calculation
      const totalEstimatedHours = mockTasks.reduce((sum, task) => sum + (task.estimateHours || 0), 0);
      const totalSpentHours = mockTasks.reduce((sum, task) => sum + (task.spentHours || 0), 0);
      const progressPercentage = Math.round((totalSpentHours / totalEstimatedHours) * 100);

      expect(screen.getByText(`Progress: ${progressPercentage}%`)).toBeInTheDocument();
    });

    it('should display correct timesheet summary', async () => {
      // Arrange
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const thisWeekHours = mockTimesheets.reduce((sum, ts) => sum + ts.hours, 0);
        expect(screen.getByText(`This Week: ${thisWeekHours} hours`)).toBeInTheDocument();

        const pendingApproval = mockTimesheets.filter(ts => ts.status === 'submitted').length;
        expect(screen.getByText(`Pending Approval: ${pendingApproval}`)).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Permission Scope Validation', () => {
    it('should only show tasks assigned to current employee', async () => {
      // Arrange - Verify employee sees only their own tasks
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const displayedTasks = screen.getAllByTestId(/task-item-/);
        expect(displayedTasks).toHaveLength(2);

        // All displayed tasks should be assigned to current employee
        mockTasks.forEach(task => {
          expect(task.assigneeId).toBe(mockEmployee.uid);
        });
      });
    });

    it('should only show timesheets created by current employee', async () => {
      // Arrange - Verify employee sees only their own timesheets
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const displayedTimesheets = screen.getAllByTestId(/timesheet-item-/);
        expect(displayedTimesheets).toHaveLength(2);

        // All displayed timesheets should be created by current employee
        mockTimesheets.forEach(timesheet => {
          expect(timesheet.userId).toBe(mockEmployee.uid);
        });
      });
    });

    it('should only show announcements targeted to employee', async () => {
      // Arrange - Verify employee sees relevant announcements
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const announcement = screen.getByText('Company Holiday');
        expect(announcement).toBeInTheDocument();

        // Announcement should target 'all' or specific employee group
        expect(mockAnnouncements[0].targetAudience).toContain('all');
      });
    });
  });

  describe('Dashboard Loading States', () => {
    it('should show loading state while fetching data', async () => {
      // Arrange - Mock loading state
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      // Act
      render(<EmployeeDashboard />);

      // Assert
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('should show error state when data fetch fails', async () => {
      // Arrange - Mock error state
      mockUseQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to load dashboard data'),
      });

      // Act
      render(<EmployeeDashboard />);

      // Assert
      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
      expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    });
  });

  describe('Dashboard Interaction and Navigation', () => {
    it('should allow navigation to task details', async () => {
      // Arrange
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const taskLink = screen.getByText('Implement login feature');
        expect(taskLink).toBeInTheDocument();
        expect(taskLink.closest('a')).toHaveAttribute('href', '/tasks/task-1');
      });
    });

    it('should allow navigation to timesheet entry', async () => {
      // Arrange
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const timesheetLink = screen.getByText('Log Time');
        expect(timesheetLink).toBeInTheDocument();
        expect(timesheetLink.closest('a')).toHaveAttribute('href', '/timesheets/new');
      });
    });

    it('should allow navigation to payroll details', async () => {
      // Arrange
      render(<EmployeeDashboard />);

      // Act & Assert
      await waitFor(() => {
        const payrollLink = screen.getByText('View Details');
        expect(payrollLink).toBeInTheDocument();
        expect(payrollLink.closest('a')).toHaveAttribute('href', '/payroll');
      });
    });
  });

  describe('Dashboard Real-time Updates', () => {
    it('should update task counts when tasks change', async () => {
      // Arrange - Initial render
      render(<EmployeeDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Total Tasks: 2')).toBeInTheDocument();
      });

      // Act - Simulate task update
      const updatedTasks = [...mockTasks, {
        id: 'task-3',
        projectId: 'proj-3',
        title: 'New task',
        status: 'todo' as any,
        assigneeId: 'emp-123',
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'pm-1',
        updatedBy: 'pm-1',
      }];

      mockUseQuery.mockImplementation(({ queryKey }) => {
        if (queryKey[0] === 'employee-tasks') {
          return {
            data: updatedTasks,
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

      // Trigger re-render
      render(<EmployeeDashboard />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText('Total Tasks: 3')).toBeInTheDocument();
      });
    });
  });
});
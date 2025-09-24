import { test, expect, Page } from '@playwright/test';

/**
 * E2E Authentication Tests for MAS Business OS
 * Tests cover PRD user stories US-P1-001 through US-P1-011 authentication requirements
 */

test.describe('Authentication Flows - PRD User Stories', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('/');
  });

  test.describe('Employee Portal Authentication - US-P1-007', () => {
    test('should allow employee to log into employee portal', async () => {
      // Arrange - PRD AC: "Given I am an employee"
      const employeeCredentials = {
        email: 'employee@mas.com',
        password: 'employeepassword123',
        role: 'employee',
      };

      // Act - PRD AC: "When I log into the employee portal"
      await page.fill('[data-testid="email-input"]', employeeCredentials.email);
      await page.fill('[data-testid="password-input"]', employeeCredentials.password);
      await page.click('[data-testid="login-button"]');

      // Wait for authentication and redirect
      await page.waitForURL('/dashboard/employee', { timeout: 10000 });

      // Assert - PRD AC: "Then I should see my assigned tasks"
      await expect(page).toHaveURL('/dashboard/employee');
      await expect(page.locator('[data-testid="employee-dashboard"]')).toBeVisible();
      await expect(page.locator('[data-testid="my-tasks-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="timesheet-status-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="announcements-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="payroll-info-section"]')).toBeVisible();
    });

    test('should display assigned tasks for employee', async () => {
      // Arrange & Act - Login as employee
      await loginAsEmployee(page);

      // Assert - PRD AC: "Then I should see my assigned tasks"
      await expect(page.locator('[data-testid="task-list"]')).toBeVisible();

      // Check for task elements
      const taskItems = page.locator('[data-testid^="task-item-"]');
      await expect(taskItems.first()).toBeVisible();

      // Verify task details are shown
      await expect(page.locator('[data-testid="task-title"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="task-status"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="task-due-date"]').first()).toBeVisible();
    });

    test('should show timesheet status for employee', async () => {
      // Arrange & Act - Login as employee
      await loginAsEmployee(page);

      // Assert - PRD AC: "And view my current timesheet status"
      await expect(page.locator('[data-testid="timesheet-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="hours-this-week"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-approval"]')).toBeVisible();

      // Check for timesheet entries
      const timesheetEntries = page.locator('[data-testid^="timesheet-entry-"]');
      if (await timesheetEntries.count() > 0) {
        await expect(timesheetEntries.first()).toBeVisible();
      }
    });

    test('should display company announcements for employee', async () => {
      // Arrange & Act - Login as employee
      await loginAsEmployee(page);

      // Assert - PRD AC: "And see company announcements"
      await expect(page.locator('[data-testid="announcements-widget"]')).toBeVisible();

      const announcements = page.locator('[data-testid^="announcement-"]');
      if (await announcements.count() > 0) {
        await expect(announcements.first()).toBeVisible();
        await expect(page.locator('[data-testid="announcement-title"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="announcement-content"]').first()).toBeVisible();
      }
    });

    test('should show payroll information for employee', async () => {
      // Arrange & Act - Login as employee
      await loginAsEmployee(page);

      // Assert - PRD AC: "And access my payroll information"
      await expect(page.locator('[data-testid="payroll-widget"]')).toBeVisible();
      await expect(page.locator('[data-testid="current-salary"]')).toBeVisible();
      await expect(page.locator('[data-testid="ytd-earnings"]')).toBeVisible();

      // Check for benefits information
      await expect(page.locator('[data-testid="benefits-info"]')).toBeVisible();
    });
  });

  test.describe('Project Manager Authentication - US-P1-001', () => {
    test('should authenticate project manager with project creation permissions', async () => {
      // Arrange - PRD AC: "Given I am a project manager with project creation permissions"
      const pmCredentials = {
        email: 'pm@mas.com',
        password: 'projectmanager123',
      };

      // Act
      await page.fill('[data-testid="email-input"]', pmCredentials.email);
      await page.fill('[data-testid="password-input"]', pmCredentials.password);
      await page.click('[data-testid="login-button"]');

      // Wait for authentication
      await page.waitForURL('/dashboard/manager', { timeout: 10000 });

      // Assert - Project manager should have access to project creation
      await expect(page).toHaveURL('/dashboard/manager');
      await expect(page.locator('[data-testid="create-project-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="projects-overview"]')).toBeVisible();

      // Verify project manager can navigate to project creation
      await page.click('[data-testid="create-project-button"]');
      await page.waitForURL('/projects/create');
      await expect(page.locator('[data-testid="project-creation-form"]')).toBeVisible();
    });
  });

  test.describe('Client Portal Authentication - US-P1-003', () => {
    test('should allow client to access project status in portal', async () => {
      // Arrange - PRD AC: "Given I am a client with an active project"
      const clientCredentials = {
        email: 'client@clientcompany.com',
        password: 'clientpassword123',
      };

      // Act - PRD AC: "When I access my client portal"
      await page.fill('[data-testid="email-input"]', clientCredentials.email);
      await page.fill('[data-testid="password-input"]', clientCredentials.password);
      await page.click('[data-testid="login-button"]');

      // Wait for client portal
      await page.waitForURL('/portal/client', { timeout: 10000 });

      // Assert - PRD AC: "Then I should see the project completion percentage"
      await expect(page).toHaveURL('/portal/client');
      await expect(page.locator('[data-testid="client-portal"]')).toBeVisible();
      await expect(page.locator('[data-testid="project-progress"]')).toBeVisible();
      await expect(page.locator('[data-testid="completion-percentage"]')).toBeVisible();

      // PRD AC: "And view completed and upcoming milestones"
      await expect(page.locator('[data-testid="milestones-section"]')).toBeVisible();
      await expect(page.locator('[data-testid="completed-milestones"]')).toBeVisible();
      await expect(page.locator('[data-testid="upcoming-milestones"]')).toBeVisible();

      // PRD AC: "And see any pending tasks assigned to me"
      await expect(page.locator('[data-testid="client-tasks"]')).toBeVisible();
    });

    test('should restrict client access to only their own data', async () => {
      // Arrange - Login as client
      await loginAsClient(page);

      // Act - Try to access another client's project URL directly
      await page.goto('/portal/projects/other-client-project');

      // Assert - Should be redirected or show access denied
      await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
      // Or should redirect back to client's own portal
      await page.waitForURL('/portal/client', { timeout: 5000 });
    });
  });

  test.describe('Finance User Authentication - US-P1-004', () => {
    test('should authenticate finance user for invoice creation', async () => {
      // Arrange - PRD AC: "Given I am a finance user"
      const financeCredentials = {
        email: 'finance@mas.com',
        password: 'financepassword123',
      };

      // Act
      await page.fill('[data-testid="email-input"]', financeCredentials.email);
      await page.fill('[data-testid="password-input"]', financeCredentials.password);
      await page.click('[data-testid="login-button"]');

      await page.waitForURL('/dashboard/finance', { timeout: 10000 });

      // Assert - Finance user should have access to invoice creation
      await expect(page).toHaveURL('/dashboard/finance');
      await expect(page.locator('[data-testid="create-invoice-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="invoices-overview"]')).toBeVisible();
      await expect(page.locator('[data-testid="payments-overview"]')).toBeVisible();

      // Verify can navigate to invoice creation
      await page.click('[data-testid="create-invoice-button"]');
      await page.waitForURL('/invoices/create');
      await expect(page.locator('[data-testid="invoice-creation-form"]')).toBeVisible();
    });
  });

  test.describe('Department Manager Authentication - US-P1-008', () => {
    test('should authenticate manager for timesheet approval', async () => {
      // Arrange - PRD AC: "Given I am a department manager"
      const managerCredentials = {
        email: 'manager@mas.com',
        password: 'managerpassword123',
      };

      // Act
      await page.fill('[data-testid="email-input"]', managerCredentials.email);
      await page.fill('[data-testid="password-input"]', managerCredentials.password);
      await page.click('[data-testid="login-button"]');

      await page.waitForURL('/dashboard/manager', { timeout: 10000 });

      // Assert - Manager should have access to timesheet approvals
      await expect(page.locator('[data-testid="timesheet-approvals"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-timesheets"]')).toBeVisible();

      // Check for timesheet approval functionality
      const pendingTimesheets = page.locator('[data-testid^="timesheet-pending-"]');
      if (await pendingTimesheets.count() > 0) {
        await expect(pendingTimesheets.first()).toBeVisible();
        await expect(page.locator('[data-testid="approve-button"]').first()).toBeVisible();
        await expect(page.locator('[data-testid="reject-button"]').first()).toBeVisible();
      }
    });
  });

  test.describe('Sales Representative Authentication - US-P1-009', () => {
    test('should authenticate sales rep for deal creation', async () => {
      // Arrange - PRD AC: "Given I am a sales representative"
      const salesCredentials = {
        email: 'sales@mas.com',
        password: 'salespassword123',
      };

      // Act
      await page.fill('[data-testid="email-input"]', salesCredentials.email);
      await page.fill('[data-testid="password-input"]', salesCredentials.password);
      await page.click('[data-testid="login-button"]');

      await page.waitForURL('/dashboard/sales', { timeout: 10000 });

      // Assert - Sales rep should have access to CRM and deal creation
      await expect(page.locator('[data-testid="create-opportunity-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="sales-pipeline"]')).toBeVisible();
      await expect(page.locator('[data-testid="my-opportunities"]')).toBeVisible();

      // Verify can navigate to deal creation
      await page.click('[data-testid="create-opportunity-button"]');
      await page.waitForURL('/opportunities/create');
      await expect(page.locator('[data-testid="opportunity-creation-form"]')).toBeVisible();
    });
  });

  test.describe('Administrator Authentication - US-P1-011', () => {
    test('should authenticate administrator for service catalog management', async () => {
      // Arrange - PRD AC: "Given I am an administrator"
      const adminCredentials = {
        email: 'admin@mas.com',
        password: 'adminpassword123',
      };

      // Act
      await page.fill('[data-testid="email-input"]', adminCredentials.email);
      await page.fill('[data-testid="password-input"]', adminCredentials.password);
      await page.click('[data-testid="login-button"]');

      await page.waitForURL('/dashboard/admin', { timeout: 10000 });

      // Assert - Admin should have access to service catalog management
      await expect(page.locator('[data-testid="services-management"]')).toBeVisible();
      await expect(page.locator('[data-testid="create-service-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="system-settings"]')).toBeVisible();

      // Verify can navigate to service creation
      await page.click('[data-testid="create-service-button"]');
      await page.waitForURL('/services/create');
      await expect(page.locator('[data-testid="service-creation-form"]')).toBeVisible();
    });
  });

  test.describe('Authentication Security and Error Handling', () => {
    test('should reject login with invalid credentials', async () => {
      // Arrange
      const invalidCredentials = {
        email: 'invalid@mas.com',
        password: 'wrongpassword',
      };

      // Act
      await page.fill('[data-testid="email-input"]', invalidCredentials.email);
      await page.fill('[data-testid="password-input"]', invalidCredentials.password);
      await page.click('[data-testid="login-button"]');

      // Assert - Should show error message and stay on login page
      await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials');
      await expect(page).toHaveURL('/'); // Should remain on login page
    });

    test('should handle session timeout after 30 minutes - NFR Security', async () => {
      // Arrange - Login as employee
      await loginAsEmployee(page);

      // Act - Simulate session timeout by manipulating local storage/cookies
      await page.evaluate(() => {
        // Simulate expired session
        localStorage.setItem('sessionExpiry', (Date.now() - 1).toString());
      });

      // Refresh page to trigger session check
      await page.reload();

      // Assert - Should redirect to login
      await page.waitForURL('/', { timeout: 5000 });
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });

    test('should enforce password complexity requirements - NFR Security', async () => {
      // Arrange - Navigate to registration/password reset page
      await page.goto('/register');

      // Act - Try to register with weak password
      await page.fill('[data-testid="email-input"]', 'newuser@mas.com');
      await page.fill('[data-testid="password-input"]', 'weak'); // Less than 12 characters
      await page.fill('[data-testid="confirm-password-input"]', 'weak');
      await page.click('[data-testid="register-button"]');

      // Assert - Should show password validation error
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 12 characters');
    });

    test('should implement proper logout functionality', async () => {
      // Arrange - Login as employee
      await loginAsEmployee(page);

      // Act - Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Assert - Should redirect to login and clear session
      await page.waitForURL('/', { timeout: 5000 });
      await expect(page.locator('[data-testid="login-form"]')).toBeVisible();

      // Verify session is cleared
      const isAuthenticated = await page.evaluate(() => {
        return !!localStorage.getItem('authToken');
      });
      expect(isAuthenticated).toBe(false);
    });
  });

  test.describe('Two-Factor Authentication - NFR Security Optional', () => {
    test('should handle 2FA setup when enabled', async () => {
      // Arrange - Login with 2FA enabled user
      const twoFACredentials = {
        email: '2fa-user@mas.com',
        password: 'securepassword123',
      };

      // Act
      await page.fill('[data-testid="email-input"]', twoFACredentials.email);
      await page.fill('[data-testid="password-input"]', twoFACredentials.password);
      await page.click('[data-testid="login-button"]');

      // Should be prompted for 2FA code
      await page.waitForSelector('[data-testid="2fa-code-input"]', { timeout: 5000 });

      // Assert - 2FA form should be visible
      await expect(page.locator('[data-testid="2fa-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="2fa-code-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="verify-2fa-button"]')).toBeVisible();

      // Complete 2FA with valid code
      await page.fill('[data-testid="2fa-code-input"]', '123456');
      await page.click('[data-testid="verify-2fa-button"]');

      // Should complete authentication
      await page.waitForURL('/dashboard/employee', { timeout: 10000 });
    });
  });
});

// Helper functions for common authentication actions
async function loginAsEmployee(page: Page) {
  await page.fill('[data-testid="email-input"]', 'employee@mas.com');
  await page.fill('[data-testid="password-input"]', 'employeepassword123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard/employee', { timeout: 10000 });
}

async function loginAsClient(page: Page) {
  await page.fill('[data-testid="email-input"]', 'client@clientcompany.com');
  await page.fill('[data-testid="password-input"]', 'clientpassword123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/portal/client', { timeout: 10000 });
}

async function loginAsProjectManager(page: Page) {
  await page.fill('[data-testid="email-input"]', 'pm@mas.com');
  await page.fill('[data-testid="password-input"]', 'projectmanager123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard/manager', { timeout: 10000 });
}

async function loginAsFinanceUser(page: Page) {
  await page.fill('[data-testid="email-input"]', 'finance@mas.com');
  await page.fill('[data-testid="password-input"]', 'financepassword123');
  await page.click('[data-testid="login-button"]');
  await page.waitForURL('/dashboard/finance', { timeout: 10000 });
}
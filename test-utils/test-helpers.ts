import { vi } from 'vitest';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Common test utilities and helpers for MAS Business OS testing
 */

// ==================== REACT TESTING UTILITIES ====================

/**
 * Custom render function with providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
  queryClient?: QueryClient;
}

const AllProviders = ({
  children,
  initialRoute = '/',
  queryClient,
}: {
  children: ReactNode;
  initialRoute?: string;
  queryClient?: QueryClient;
}) => {
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const client = queryClient || defaultQueryClient;

  // Mock router if initial route is provided
  if (initialRoute !== '/') {
    window.history.pushState({}, 'Test page', initialRoute);
  }

  return (
    <BrowserRouter>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export const renderWithProviders = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialRoute, queryClient, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllProviders initialRoute={initialRoute} queryClient={queryClient}>
      {children}
    </AllProviders>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// ==================== AUTHENTICATION HELPERS ====================

/**
 * Mock authenticated user context
 */
export const mockAuthenticatedUser = (userOverrides = {}) => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@mas.com',
    name: 'Test User',
    role: 'employee',
    permissions: ['read', 'write'],
    accountId: 'test-account',
    departmentId: 'test-dept',
    ...userOverrides,
  };

  return {
    isAuthenticated: true,
    user: mockUser,
    isLoading: false,
    error: null,
    login: vi.fn(),
    logout: vi.fn(),
  };
};

/**
 * Mock unauthenticated state
 */
export const mockUnauthenticatedUser = () => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
});

/**
 * Mock loading authentication state
 */
export const mockLoadingAuth = () => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
});

// ==================== API MOCKING HELPERS ====================

/**
 * Create a mock API response
 */
export const createMockApiResponse = <T>(data: T, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

/**
 * Create a mock API error
 */
export const createMockApiError = (message: string, status = 400) => {
  const error = new Error(message) as any;
  error.response = {
    data: { message },
    status,
    statusText: status === 400 ? 'Bad Request' : 'Internal Server Error',
  };
  return error;
};

/**
 * Mock successful query hook
 */
export const createMockQuery = <T>(data: T, options: Partial<{ isLoading: boolean; error: Error | null }> = {}) => ({
  data,
  isLoading: false,
  error: null,
  isError: false,
  isSuccess: true,
  refetch: vi.fn(),
  ...options,
});

/**
 * Mock loading query hook
 */
export const createLoadingQuery = () => ({
  data: undefined,
  isLoading: true,
  error: null,
  isError: false,
  isSuccess: false,
  refetch: vi.fn(),
});

/**
 * Mock error query hook
 */
export const createErrorQuery = (error: Error) => ({
  data: undefined,
  isLoading: false,
  error,
  isError: true,
  isSuccess: false,
  refetch: vi.fn(),
});

// ==================== DATE AND TIME HELPERS ====================

/**
 * Mock current date for consistent testing
 */
export const mockCurrentDate = (date: Date | string) => {
  const mockDate = new Date(date);
  vi.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
  vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
  return mockDate;
};

/**
 * Reset date mocks
 */
export const resetDateMocks = () => {
  vi.restoreAllMocks();
};

/**
 * Create relative date helpers
 */
export const createDateHelpers = (baseDate: Date = new Date()) => ({
  today: baseDate,
  yesterday: new Date(baseDate.getTime() - 24 * 60 * 60 * 1000),
  tomorrow: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000),
  nextWeek: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000),
  lastWeek: new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000),
  nextMonth: new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, baseDate.getDate()),
  lastMonth: new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, baseDate.getDate()),
});

// ==================== FORM TESTING HELPERS ====================

/**
 * Fill form field by label
 */
export const fillFormField = async (labelText: string, value: string) => {
  const field = screen.getByLabelText(labelText);
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

/**
 * Submit form
 */
export const submitForm = async (buttonText: string = 'Submit') => {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await userEvent.click(submitButton);
};

/**
 * Select dropdown option
 */
export const selectDropdownOption = async (selectLabel: string, optionText: string) => {
  const select = screen.getByLabelText(selectLabel);
  await userEvent.click(select);
  const option = screen.getByText(optionText);
  await userEvent.click(option);
};

/**
 * Check checkbox or radio button
 */
export const checkOption = async (labelText: string) => {
  const checkbox = screen.getByLabelText(labelText);
  await userEvent.click(checkbox);
};

// ==================== ASSERTION HELPERS ====================

/**
 * Wait for element to appear and assert
 */
export const waitForAndAssert = async (text: string, timeout = 1000) => {
  await waitFor(() => {
    expect(screen.getByText(text)).toBeInTheDocument();
  }, { timeout });
};

/**
 * Wait for element to disappear and assert
 */
export const waitForDisappear = async (text: string, timeout = 1000) => {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  }, { timeout });
};

/**
 * Assert loading state
 */
export const assertLoadingState = () => {
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
};

/**
 * Assert error state
 */
export const assertErrorState = (errorMessage: string) => {
  expect(screen.getByText(errorMessage)).toBeInTheDocument();
};

/**
 * Assert success state
 */
export const assertSuccessState = (successMessage: string) => {
  expect(screen.getByText(successMessage)).toBeInTheDocument();
};

// ==================== PERFORMANCE TESTING HELPERS ====================

/**
 * Measure render time
 */
export const measureRenderTime = async (renderFn: () => void) => {
  const startTime = performance.now();
  renderFn();
  await waitFor(() => {
    // Wait for component to be rendered
  });
  const endTime = performance.now();
  return endTime - startTime;
};

/**
 * Test component performance
 */
export const testPerformance = async (
  component: ReactElement,
  maxRenderTime: number = 100 // milliseconds
) => {
  const renderTime = await measureRenderTime(() => {
    renderWithProviders(component);
  });

  expect(renderTime).toBeLessThan(maxRenderTime);
  return renderTime;
};

// ==================== PERMISSION TESTING HELPERS ====================

/**
 * Test component with different permission levels
 */
export const testWithPermissions = (
  component: ReactElement,
  permissions: string[]
) => {
  const mockUser = mockAuthenticatedUser({ permissions });

  // Mock useAuth hook
  vi.mock('../src/modules/auth/hooks/useAuth', () => ({
    useAuth: () => mockUser,
  }));

  return renderWithProviders(component);
};

/**
 * Test unauthorized access
 */
export const testUnauthorizedAccess = (component: ReactElement) => {
  const mockUser = mockUnauthenticatedUser();

  vi.mock('../src/modules/auth/hooks/useAuth', () => ({
    useAuth: () => mockUser,
  }));

  return renderWithProviders(component);
};

// ==================== ACCESSIBILITY TESTING HELPERS ====================

/**
 * Check for accessibility violations
 */
export const checkA11y = async (container: HTMLElement) => {
  // This would integrate with axe-core in a real implementation
  // For now, we'll check basic accessibility features

  // Check for proper ARIA labels
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const hasAriaLabel = button.hasAttribute('aria-label') ||
                         button.textContent?.trim() !== '';
    expect(hasAriaLabel).toBe(true);
  });

  // Check for form labels
  const inputs = container.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    const hasLabel = input.hasAttribute('aria-label') ||
                     input.hasAttribute('aria-labelledby') ||
                     container.querySelector(`label[for="${input.id}"]`);
    expect(hasLabel).toBeTruthy();
  });
};

// ==================== INTERNATIONALIZATION TESTING HELPERS ====================

/**
 * Mock i18n for testing different languages
 */
export const mockI18n = (language: string = 'en', translations: Record<string, string> = {}) => {
  const mockT = vi.fn((key: string) => translations[key] || key);

  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: mockT,
      i18n: {
        language,
        changeLanguage: vi.fn(),
      },
    }),
    Trans: ({ children }: { children: React.ReactNode }) => children,
  }));

  return { t: mockT };
};

/**
 * Test RTL layout
 */
export const testRTLLayout = (component: ReactElement) => {
  // Set document direction
  document.dir = 'rtl';
  document.documentElement.lang = 'ar';

  const { container } = renderWithProviders(component);

  // Check that container respects RTL
  expect(container.firstChild).toHaveStyle('direction: rtl');

  // Cleanup
  document.dir = 'ltr';
  document.documentElement.lang = 'en';

  return container;
};

// ==================== ERROR BOUNDARY TESTING ====================

/**
 * Test component error boundaries
 */
export const TestErrorBoundary = ({ children, onError }: {
  children: ReactNode;
  onError?: (error: Error) => void;
}) => {
  try {
    return <>{children}</>;
  } catch (error) {
    if (onError) {
      onError(error as Error);
    }
    return <div data-testid="error-boundary">Something went wrong</div>;
  }
};

/**
 * Trigger error in component
 */
export const triggerComponentError = (errorMessage: string = 'Test error') => {
  const ErrorComponent = () => {
    throw new Error(errorMessage);
  };

  return renderWithProviders(
    <TestErrorBoundary>
      <ErrorComponent />
    </TestErrorBoundary>
  );
};

// ==================== CLEANUP UTILITIES ====================

/**
 * Clean up after tests
 */
export const cleanupTest = () => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  resetDateMocks();

  // Reset document properties
  document.dir = 'ltr';
  document.documentElement.lang = 'en';

  // Clear any timers
  vi.clearAllTimers();

  // Reset window history
  window.history.replaceState(null, '', '/');
};

// ==================== EXPORT ALL UTILITIES ====================

export default {
  // Rendering
  renderWithProviders,

  // Authentication
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  mockLoadingAuth,

  // API
  createMockApiResponse,
  createMockApiError,
  createMockQuery,
  createLoadingQuery,
  createErrorQuery,

  // Date/Time
  mockCurrentDate,
  resetDateMocks,
  createDateHelpers,

  // Forms
  fillFormField,
  submitForm,
  selectDropdownOption,
  checkOption,

  // Assertions
  waitForAndAssert,
  waitForDisappear,
  assertLoadingState,
  assertErrorState,
  assertSuccessState,

  // Performance
  measureRenderTime,
  testPerformance,

  // Permissions
  testWithPermissions,
  testUnauthorizedAccess,

  // Accessibility
  checkA11y,

  // i18n
  mockI18n,
  testRTLLayout,

  // Error handling
  TestErrorBoundary,
  triggerComponentError,

  // Cleanup
  cleanupTest,
};
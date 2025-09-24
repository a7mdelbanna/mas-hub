import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Firebase
beforeAll(() => {
  // Mock Firebase modules
  vi.mock('../lib/firebase/config', () => ({
    auth: {},
    db: {},
    storage: {},
    functions: {},
  }));

  // Mock i18next
  vi.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        changeLanguage: vi.fn(),
        language: 'en',
      },
    }),
    Trans: ({ children }: any) => children,
    I18nextProvider: ({ children }: any) => children,
  }));

  // Mock React Router
  vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
      ...actual,
      useNavigate: () => vi.fn(),
      useLocation: () => ({ pathname: '/' }),
      BrowserRouter: ({ children }: any) => children,
      Routes: ({ children }: any) => children,
      Route: ({ children }: any) => children,
    };
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

afterAll(() => {
  vi.clearAllMocks();
});
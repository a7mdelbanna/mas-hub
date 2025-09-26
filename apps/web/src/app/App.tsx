import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { I18nextProvider } from 'react-i18next';
import { store } from '../store';
import i18n from '../lib/i18n';
import { AuthProvider } from '../modules/auth/components/AuthProvider';
import { OrganizationProvider } from '../hooks/useOrganization';
import { ThemeProvider } from '../components/ui/ThemeProvider';
import { AppRoutes } from './AppRoutes';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Toaster } from '../components/ui/Toaster';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 404 || error?.status === 403) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <I18nextProvider i18n={i18n}>
            <ThemeProvider defaultTheme="system" storageKey="mas-theme">
              <BrowserRouter>
                <AuthProvider>
                  <OrganizationProvider>
                    <div className="min-h-screen bg-background">
                      <AppRoutes />
                      <Toaster />
                    </div>
                  </OrganizationProvider>
                </AuthProvider>
              </BrowserRouter>
            </ThemeProvider>
          </I18nextProvider>
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}
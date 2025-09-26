// Mock auth API for development
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Simulated database of registered emails
const registeredEmails = new Set([
  'admin@mas.com',
  'john@mas.com',
  'jane@mas.com',
  'test@test.com'
]);

interface CheckEmailRequest {
  email: string;
}

interface CheckEmailResponse {
  available: boolean;
  message?: string;
}

// Create a mock API that simulates the auth endpoints
export const mockAuthApi = createApi({
  reducerPath: 'mockAuthApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/mock-api',
    // Override fetch to handle mock endpoints
    fetchFn: async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;

      // Intercept check-email-availability endpoint
      if (url.includes('/auth/check-email-availability')) {
        const body = JSON.parse(init?.body as string || '{}');
        const email = body.email?.toLowerCase();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if email exists
        const isRegistered = registeredEmails.has(email);

        return new Response(JSON.stringify({
          success: true,
          data: {
            available: !isRegistered,
            message: isRegistered ? 'This email is already registered' : 'Email is available'
          }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // For other endpoints, use regular fetch
      return fetch(input, init);
    }
  }),
  endpoints: (builder) => ({
    checkEmailAvailability: builder.query<CheckEmailResponse, CheckEmailRequest>({
      query: (data) => ({
        url: '/auth/check-email-availability',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const { useLazyCheckEmailAvailabilityQuery } = mockAuthApi;
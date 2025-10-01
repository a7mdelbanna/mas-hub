import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  prepareHeaders: async (headers) => {
    // Mock auth token
    headers.set('authorization', 'Bearer mock-token-123');
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Mock - just redirect to login
    window.location.href = '/login';
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Project',
    'Task',
    'Invoice',
    'Payment',
    'Opportunity',
    'Account',
    'Ticket',
    'Course',
    'Candidate',
    'Asset',
    'Branding',
  ],
  endpoints: () => ({}),
});

// Base API hooks are generated per specific API slice
// Individual APIs will export their own hooks
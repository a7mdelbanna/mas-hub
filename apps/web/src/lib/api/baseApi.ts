import { createApi, fetchBaseQuery, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import { auth } from '../firebase/config';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  prepareHeaders: async (headers) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a fresh token
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken(true);
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } catch (error) {
        // Token refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
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

export const {
  useGetQuery,
  usePostMutation,
  usePutMutation,
  useDeleteMutation,
} = api;
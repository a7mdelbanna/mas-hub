import { api } from './baseApi';

export interface EmailAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface EmailAvailabilityRequest {
  email: string;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkEmailAvailability: builder.query<EmailAvailabilityResponse, string>({
      query: (email) => ({
        url: '/auth/check-email-availability',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: any) => response.data,
      transformErrorResponse: (response: any) => {
        if (response.data?.error) {
          return response.data.error;
        }
        return { code: 'UNKNOWN_ERROR', message: 'Failed to check email availability' };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useLazyCheckEmailAvailabilityQuery } = authApi;
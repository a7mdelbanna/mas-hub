import { api } from './baseApi';
import type { User } from '../../types';
import { mockBrandingService } from './mockBrandingService';

// Use mock service for development
const USE_MOCK_API = import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL;

export interface BrandingSettings {
  id: string;
  companyName: string;
  tagline: string;
  description: string;
  primaryLogo?: string; // URL to uploaded logo
  secondaryLogo?: string; // URL to uploaded logo
  favicon?: string; // URL to uploaded favicon
  brandColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  updatedAt: string;
  updatedBy: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
}

export interface CreateBrandingRequest {
  companyName: string;
  tagline: string;
  description: string;
  brandColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

export interface UpdateBrandingRequest extends Partial<CreateBrandingRequest> {
  id: string;
}

export const brandingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get branding settings
    getBrandingSettings: builder.query<BrandingSettings, void>({
      queryFn: async () => {
        if (USE_MOCK_API) {
          try {
            const data = await mockBrandingService.getBrandingSettings();
            return { data };
          } catch (error) {
            return { error: { status: 500, data: { message: 'Failed to fetch branding settings' } } };
          }
        }
        // Real API call would go here
        return { error: { status: 404, data: { message: 'API not implemented' } } };
      },
      providesTags: ['Branding'],
    }),

    // Update branding settings
    updateBrandingSettings: builder.mutation<BrandingSettings, UpdateBrandingRequest>({
      queryFn: async ({ id, ...data }) => {
        if (USE_MOCK_API) {
          try {
            const result = await mockBrandingService.updateBrandingSettings({ id, ...data });
            return { data: result };
          } catch (error) {
            return { error: { status: 500, data: { message: 'Failed to update branding settings' } } };
          }
        }
        // Real API call would go here
        return { error: { status: 404, data: { message: 'API not implemented' } } };
      },
      invalidatesTags: ['Branding'],
    }),

    // Create branding settings
    createBrandingSettings: builder.mutation<BrandingSettings, CreateBrandingRequest>({
      queryFn: async (data) => {
        if (USE_MOCK_API) {
          try {
            const result = await mockBrandingService.createBrandingSettings(data);
            return { data: result };
          } catch (error) {
            return { error: { status: 500, data: { message: 'Failed to create branding settings' } } };
          }
        }
        // Real API call would go here
        return { error: { status: 404, data: { message: 'API not implemented' } } };
      },
      invalidatesTags: ['Branding'],
    }),

    // Upload logo files
    uploadLogo: builder.mutation<UploadResponse, { file: File; type: 'primary' | 'secondary' | 'favicon' }>({
      queryFn: async ({ file, type }) => {
        if (USE_MOCK_API) {
          try {
            const result = await mockBrandingService.uploadLogo(file, type);
            return { data: result };
          } catch (error) {
            return { error: { status: 500, data: { message: 'Failed to upload logo' } } };
          }
        }
        // Real API call would go here
        return { error: { status: 404, data: { message: 'API not implemented' } } };
      },
      invalidatesTags: ['Branding'],
    }),

    // Delete logo
    deleteLogo: builder.mutation<void, { type: 'primary' | 'secondary' | 'favicon' }>({
      queryFn: async ({ type }) => {
        if (USE_MOCK_API) {
          try {
            await mockBrandingService.deleteLogo(type);
            return { data: undefined };
          } catch (error) {
            return { error: { status: 500, data: { message: 'Failed to delete logo' } } };
          }
        }
        // Real API call would go here
        return { error: { status: 404, data: { message: 'API not implemented' } } };
      },
      invalidatesTags: ['Branding'],
    }),
  }),
});

// Add Branding to the tag types in baseApi
declare module './baseApi' {
  interface ApiTagTypes {
    Branding: string;
  }
}

export const {
  useGetBrandingSettingsQuery,
  useUpdateBrandingSettingsMutation,
  useCreateBrandingSettingsMutation,
  useUploadLogoMutation,
  useDeleteLogoMutation,
} = brandingApi;
// Mock service for branding API - can be replaced with real API calls
import type { BrandingSettings, UploadResponse } from './brandingApi';

// Mock storage for development
let mockBrandingData: BrandingSettings | null = null;
let mockUploadedFiles: Record<string, string> = {};

export const mockBrandingService = {
  // Get branding settings
  async getBrandingSettings(): Promise<BrandingSettings | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return mockBrandingData || {
      id: 'default',
      companyName: 'MAS Technologies',
      tagline: 'Innovative Business Solutions',
      description: 'Leading provider of enterprise software solutions',
      primaryLogo: mockUploadedFiles.primary || null,
      secondaryLogo: mockUploadedFiles.secondary || null,
      favicon: mockUploadedFiles.favicon || null,
      brandColors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#ffffff',
        text: '#1f2937'
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    };
  },

  // Create branding settings
  async createBrandingSettings(data: any): Promise<BrandingSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));

    mockBrandingData = {
      id: 'branding-1',
      ...data,
      primaryLogo: mockUploadedFiles.primary || null,
      secondaryLogo: mockUploadedFiles.secondary || null,
      favicon: mockUploadedFiles.favicon || null,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current-user'
    };

    return mockBrandingData;
  },

  // Update branding settings
  async updateBrandingSettings(data: any): Promise<BrandingSettings> {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (mockBrandingData) {
      mockBrandingData = {
        ...mockBrandingData,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    } else {
      mockBrandingData = {
        id: data.id,
        ...data,
        primaryLogo: mockUploadedFiles.primary || null,
        secondaryLogo: mockUploadedFiles.secondary || null,
        favicon: mockUploadedFiles.favicon || null,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-user'
      };
    }

    return mockBrandingData;
  },

  // Upload logo
  async uploadLogo(file: File, type: 'primary' | 'secondary' | 'favicon'): Promise<UploadResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload time

    // Create a mock URL for the uploaded file
    const mockUrl = URL.createObjectURL(file);
    mockUploadedFiles[type] = mockUrl;

    // Update existing branding data with new logo URL
    if (mockBrandingData) {
      if (type === 'primary') mockBrandingData.primaryLogo = mockUrl;
      else if (type === 'secondary') mockBrandingData.secondaryLogo = mockUrl;
      else if (type === 'favicon') mockBrandingData.favicon = mockUrl;
    }

    return {
      url: mockUrl,
      fileName: file.name,
      fileSize: file.size,
    };
  },

  // Delete logo
  async deleteLogo(type: 'primary' | 'secondary' | 'favicon'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));

    if (mockUploadedFiles[type]) {
      URL.revokeObjectURL(mockUploadedFiles[type]);
      delete mockUploadedFiles[type];
    }

    // Update existing branding data
    if (mockBrandingData) {
      if (type === 'primary') mockBrandingData.primaryLogo = null;
      else if (type === 'secondary') mockBrandingData.secondaryLogo = null;
      else if (type === 'favicon') mockBrandingData.favicon = null;
    }
  },

  // Reset all data (for development/testing)
  reset(): void {
    Object.values(mockUploadedFiles).forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    mockUploadedFiles = {};
    mockBrandingData = null;
  }
};
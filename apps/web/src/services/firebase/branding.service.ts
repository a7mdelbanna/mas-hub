/**
 * Branding Service
 * Organization branding and theme management using Firestore
 */

import { BaseService, BaseDocument } from './base.service';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../lib/firebase/config';

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface BrandingSettings extends BaseDocument {
  organizationId: string;
  name: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  colors: BrandColors;
  typography: {
    fontFamily: string;
    headingFontFamily?: string;
    fontSize: {
      base: number;
      scale: number;
    };
  };
  layout: {
    borderRadius: number;
    spacing: number;
    maxWidth: number;
    sidebarWidth: number;
    headerHeight: number;
  };
  features: {
    animations: boolean;
    glassmorphism: boolean;
    gradients: boolean;
    shadows: boolean;
  };
  customCss?: string;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
}

class BrandingService extends BaseService<BrandingSettings> {
  private readonly ORGANIZATION_ID = 'default'; // Will be dynamic in multi-tenant setup

  constructor() {
    super('branding');
  }

  /**
   * Get organization branding settings
   */
  async getOrganizationBranding(organizationId?: string): Promise<BrandingSettings | null> {
    const orgId = organizationId || this.ORGANIZATION_ID;
    return this.getById(orgId);
  }

  /**
   * Create or update organization branding
   */
  async saveOrganizationBranding(
    branding: Partial<BrandingSettings>,
    organizationId?: string
  ): Promise<BrandingSettings> {
    const orgId = organizationId || this.ORGANIZATION_ID;

    const existing = await this.getById(orgId);

    if (existing) {
      await this.update(orgId, branding);
      const updated = await this.getById(orgId);
      return updated!;
    } else {
      return this.create({
        ...branding,
        organizationId: orgId,
        name: branding.name || 'MAS Business OS',
      });
    }
  }

  /**
   * Upload logo image
   */
  async uploadLogo(file: File, organizationId?: string): Promise<string> {
    const orgId = organizationId || this.ORGANIZATION_ID;

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `branding/${orgId}/logo_${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          organizationId: orgId,
          type: 'logo',
          uploadedAt: new Date().toISOString(),
        },
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Update branding settings with new logo URL
      await this.update(orgId, {
        logo: downloadUrl,
      } as Partial<BrandingSettings>);

      return downloadUrl;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload favicon
   */
  async uploadFavicon(file: File, organizationId?: string): Promise<string> {
    const orgId = organizationId || this.ORGANIZATION_ID;

    try {
      // Create storage reference
      const timestamp = Date.now();
      const fileName = `branding/${orgId}/favicon_${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          organizationId: orgId,
          type: 'favicon',
          uploadedAt: new Date().toISOString(),
        },
      });

      // Get download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Update branding settings with new favicon URL
      await this.update(orgId, {
        favicon: downloadUrl,
      } as Partial<BrandingSettings>);

      return downloadUrl;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete logo
   */
  async deleteLogo(logoUrl: string, organizationId?: string): Promise<void> {
    const orgId = organizationId || this.ORGANIZATION_ID;

    try {
      // Extract file path from URL
      const url = new URL(logoUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        const fileRef = ref(storage, filePath);
        await deleteObject(fileRef);
      }

      // Update branding to remove logo
      await this.update(orgId, {
        logo: null,
      } as any);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get default branding settings
   */
  getDefaultBranding(): BrandingSettings {
    return {
      id: this.ORGANIZATION_ID,
      organizationId: this.ORGANIZATION_ID,
      name: 'MAS Business OS',
      tagline: 'Comprehensive Business Operating System',
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#EC4899',
        background: '#0A0B0F',
        surface: '#1A1B23',
        text: '#FFFFFF',
        textSecondary: '#A0A0A0',
        border: '#2A2B35',
        error: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
        info: '#3B82F6',
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingFontFamily: 'Inter, system-ui, sans-serif',
        fontSize: {
          base: 16,
          scale: 1.25,
        },
      },
      layout: {
        borderRadius: 12,
        spacing: 4,
        maxWidth: 1440,
        sidebarWidth: 280,
        headerHeight: 64,
      },
      features: {
        animations: true,
        glassmorphism: true,
        gradients: true,
        shadows: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Apply theme to document
   */
  applyTheme(branding: BrandingSettings): void {
    const root = document.documentElement;

    // Apply color variables
    Object.entries(branding.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-family', branding.typography.fontFamily);
    root.style.setProperty('--heading-font-family', branding.typography.headingFontFamily || branding.typography.fontFamily);
    root.style.setProperty('--font-size-base', `${branding.typography.fontSize.base}px`);
    root.style.setProperty('--font-size-scale', branding.typography.fontSize.scale.toString());

    // Apply layout
    root.style.setProperty('--border-radius', `${branding.layout.borderRadius}px`);
    root.style.setProperty('--spacing', `${branding.layout.spacing}px`);
    root.style.setProperty('--max-width', `${branding.layout.maxWidth}px`);
    root.style.setProperty('--sidebar-width', `${branding.layout.sidebarWidth}px`);
    root.style.setProperty('--header-height', `${branding.layout.headerHeight}px`);

    // Apply features
    root.setAttribute('data-animations', branding.features.animations.toString());
    root.setAttribute('data-glassmorphism', branding.features.glassmorphism.toString());
    root.setAttribute('data-gradients', branding.features.gradients.toString());
    root.setAttribute('data-shadows', branding.features.shadows.toString());

    // Apply custom CSS if provided
    if (branding.customCss) {
      let styleElement = document.getElementById('custom-branding-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-branding-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = branding.customCss;
    }

    // Update favicon if provided
    if (branding.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = branding.favicon;
      document.head.appendChild(link);
    }

    // Update page title if provided
    if (branding.metadata?.title) {
      document.title = branding.metadata.title;
    }
  }

  /**
   * Generate CSS variables from branding
   */
  generateCssVariables(branding: BrandingSettings): string {
    const variables: string[] = [':root {'];

    // Colors
    Object.entries(branding.colors).forEach(([key, value]) => {
      variables.push(`  --color-${key}: ${value};`);
    });

    // Typography
    variables.push(`  --font-family: ${branding.typography.fontFamily};`);
    variables.push(`  --heading-font-family: ${branding.typography.headingFontFamily || branding.typography.fontFamily};`);
    variables.push(`  --font-size-base: ${branding.typography.fontSize.base}px;`);
    variables.push(`  --font-size-scale: ${branding.typography.fontSize.scale};`);

    // Layout
    variables.push(`  --border-radius: ${branding.layout.borderRadius}px;`);
    variables.push(`  --spacing: ${branding.layout.spacing}px;`);
    variables.push(`  --max-width: ${branding.layout.maxWidth}px;`);
    variables.push(`  --sidebar-width: ${branding.layout.sidebarWidth}px;`);
    variables.push(`  --header-height: ${branding.layout.headerHeight}px;`);

    variables.push('}');

    return variables.join('\n');
  }

  /**
   * Export branding as JSON
   */
  async exportBranding(organizationId?: string): Promise<string> {
    const orgId = organizationId || this.ORGANIZATION_ID;
    const branding = await this.getById(orgId);

    if (!branding) {
      throw new Error('No branding settings found');
    }

    return JSON.stringify(branding, null, 2);
  }

  /**
   * Import branding from JSON
   */
  async importBranding(jsonString: string, organizationId?: string): Promise<BrandingSettings> {
    const orgId = organizationId || this.ORGANIZATION_ID;

    try {
      const brandingData = JSON.parse(jsonString);

      // Validate structure
      if (!brandingData.colors || !brandingData.typography || !brandingData.layout) {
        throw new Error('Invalid branding data structure');
      }

      // Save imported branding
      return this.saveOrganizationBranding(brandingData, orgId);
    } catch (error: any) {
      throw new Error(`Failed to import branding: ${error.message}`);
    }
  }

  /**
   * Reset to default branding
   */
  async resetToDefault(organizationId?: string): Promise<BrandingSettings> {
    const orgId = organizationId || this.ORGANIZATION_ID;
    const defaultBranding = this.getDefaultBranding();

    return this.saveOrganizationBranding(defaultBranding, orgId);
  }
}

// Export singleton instance
export const brandingService = new BrandingService();
export default brandingService;
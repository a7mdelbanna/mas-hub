/**
 * Theme Configuration for MAS Business OS
 * Manages light/dark themes and brand customization
 */

import designTokens from './tokens.json';

export interface Theme {
  name: string;
  mode: 'light' | 'dark';
  colors: Record<string, string>;
  fonts: Record<string, string>;
}

export interface ThemeConfig {
  defaultTheme: 'light' | 'dark';
  themes: {
    light: Theme;
    dark: Theme;
  };
  brandColors: {
    primary: string;
    secondary: string;
  };
  customThemes?: Record<string, Theme>;
}

/**
 * Extract color values for a specific theme mode
 */
function extractThemeColors(mode: 'light' | 'dark'): Record<string, string> {
  const colors: Record<string, string> = {};

  // Brand colors
  colors['--color-brand-primary'] = designTokens.colors.semantic.brand.primary[mode];
  colors['--color-brand-secondary'] = designTokens.colors.semantic.brand.secondary[mode];

  // Background colors
  colors['--color-bg-primary'] = designTokens.colors.semantic.background.primary[mode];
  colors['--color-bg-secondary'] = designTokens.colors.semantic.background.secondary[mode];
  colors['--color-bg-tertiary'] = designTokens.colors.semantic.background.tertiary[mode];
  colors['--color-bg-elevated'] = designTokens.colors.semantic.background.elevated[mode];
  colors['--color-bg-overlay'] = designTokens.colors.semantic.background.overlay[mode];

  // Surface colors
  colors['--color-surface-primary'] = designTokens.colors.semantic.surface.primary[mode];
  colors['--color-surface-secondary'] = designTokens.colors.semantic.surface.secondary[mode];
  colors['--color-surface-tertiary'] = designTokens.colors.semantic.surface.tertiary[mode];

  // Text colors
  colors['--color-text-primary'] = designTokens.colors.semantic.text.primary[mode];
  colors['--color-text-secondary'] = designTokens.colors.semantic.text.secondary[mode];
  colors['--color-text-tertiary'] = designTokens.colors.semantic.text.tertiary[mode];
  colors['--color-text-disabled'] = designTokens.colors.semantic.text.disabled[mode];
  colors['--color-text-inverse'] = designTokens.colors.semantic.text.inverse[mode];
  colors['--color-text-link'] = designTokens.colors.semantic.text.link[mode];

  // Border colors
  colors['--color-border-default'] = designTokens.colors.semantic.border.default[mode];
  colors['--color-border-subtle'] = designTokens.colors.semantic.border.subtle[mode];
  colors['--color-border-strong'] = designTokens.colors.semantic.border.strong[mode];
  colors['--color-border-focus'] = designTokens.colors.semantic.border.focus[mode];

  // Status colors
  colors['--color-success-bg'] = designTokens.colors.semantic.status.success.background[mode];
  colors['--color-success-border'] = designTokens.colors.semantic.status.success.border[mode];
  colors['--color-success-text'] = designTokens.colors.semantic.status.success.text[mode];
  colors['--color-success-icon'] = designTokens.colors.semantic.status.success.icon[mode];

  colors['--color-warning-bg'] = designTokens.colors.semantic.status.warning.background[mode];
  colors['--color-warning-border'] = designTokens.colors.semantic.status.warning.border[mode];
  colors['--color-warning-text'] = designTokens.colors.semantic.status.warning.text[mode];
  colors['--color-warning-icon'] = designTokens.colors.semantic.status.warning.icon[mode];

  colors['--color-error-bg'] = designTokens.colors.semantic.status.error.background[mode];
  colors['--color-error-border'] = designTokens.colors.semantic.status.error.border[mode];
  colors['--color-error-text'] = designTokens.colors.semantic.status.error.text[mode];
  colors['--color-error-icon'] = designTokens.colors.semantic.status.error.icon[mode];

  colors['--color-info-bg'] = designTokens.colors.semantic.status.info.background[mode];
  colors['--color-info-border'] = designTokens.colors.semantic.status.info.border[mode];
  colors['--color-info-text'] = designTokens.colors.semantic.status.info.text[mode];
  colors['--color-info-icon'] = designTokens.colors.semantic.status.info.icon[mode];

  // Interactive colors
  colors['--color-hover'] = designTokens.colors.semantic.interactive.hover[mode];
  colors['--color-active'] = designTokens.colors.semantic.interactive.active[mode];
  colors['--color-selected'] = designTokens.colors.semantic.interactive.selected[mode];
  colors['--color-disabled'] = designTokens.colors.semantic.interactive.disabled[mode];

  return colors;
}

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  defaultTheme: 'light',
  themes: {
    light: {
      name: 'Light',
      mode: 'light',
      colors: extractThemeColors('light'),
      fonts: {
        '--font-family-sans': designTokens.typography.fontFamily.latin.sans,
        '--font-family-mono': designTokens.typography.fontFamily.latin.mono,
      },
    },
    dark: {
      name: 'Dark',
      mode: 'dark',
      colors: extractThemeColors('dark'),
      fonts: {
        '--font-family-sans': designTokens.typography.fontFamily.latin.sans,
        '--font-family-mono': designTokens.typography.fontFamily.latin.mono,
      },
    },
  },
  brandColors: {
    primary: '#2563eb', // Blue-600
    secondary: '#9333ea', // Purple-600
  },
};

/**
 * Theme manager class
 */
export class ThemeManager {
  private config: ThemeConfig;
  private currentTheme: 'light' | 'dark';
  private rootElement: HTMLElement;

  constructor(config: ThemeConfig = defaultThemeConfig) {
    this.config = config;
    this.currentTheme = this.loadThemePreference();
    this.rootElement = document.documentElement;
    this.applyTheme(this.currentTheme);
    this.setupSystemThemeListener();
  }

  /**
   * Load theme preference from localStorage
   */
  private loadThemePreference(): 'light' | 'dark' {
    const stored = localStorage.getItem('theme-preference');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return this.config.defaultTheme;
  }

  /**
   * Save theme preference to localStorage
   */
  private saveThemePreference(theme: 'light' | 'dark'): void {
    localStorage.setItem('theme-preference', theme);
  }

  /**
   * Apply theme to the root element
   */
  private applyTheme(theme: 'light' | 'dark'): void {
    const themeConfig = this.config.themes[theme];

    // Add/remove dark class for Tailwind
    if (theme === 'dark') {
      this.rootElement.classList.add('dark');
    } else {
      this.rootElement.classList.remove('dark');
    }

    // Apply CSS variables
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      this.rootElement.style.setProperty(key, value);
    });

    Object.entries(themeConfig.fonts).forEach(([key, value]) => {
      this.rootElement.style.setProperty(key, value);
    });

    // Add theme transition
    this.rootElement.style.setProperty('transition', 'background-color 250ms ease-in-out, color 250ms ease-in-out');

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme, config: themeConfig }
    }));
  }

  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener(): void {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (localStorage.getItem('theme-preference') === null) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Set theme
   */
  public setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.saveThemePreference(theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  public toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  /**
   * Get current theme
   */
  public getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Update brand colors
   */
  public updateBrandColors(primary: string, secondary: string): void {
    this.config.brandColors = { primary, secondary };

    // Update CSS variables for both themes
    this.rootElement.style.setProperty('--color-brand-primary', primary);
    this.rootElement.style.setProperty('--color-brand-secondary', secondary);

    // Generate and apply color variations
    const variations = this.generateColorVariations(primary);
    Object.entries(variations).forEach(([key, value]) => {
      this.rootElement.style.setProperty(`--color-brand-${key}`, value);
    });

    // Save to localStorage
    localStorage.setItem('brand-colors', JSON.stringify({ primary, secondary }));

    // Dispatch brand change event
    window.dispatchEvent(new CustomEvent('brandchange', {
      detail: { primary, secondary, variations }
    }));
  }

  /**
   * Generate color variations from a base color
   */
  private generateColorVariations(baseColor: string): Record<string, string> {
    // This would use a proper color manipulation library in production
    // For now, returning placeholder variations
    return {
      '50': this.lighten(baseColor, 0.95),
      '100': this.lighten(baseColor, 0.9),
      '200': this.lighten(baseColor, 0.8),
      '300': this.lighten(baseColor, 0.6),
      '400': this.lighten(baseColor, 0.3),
      '500': baseColor,
      '600': this.darken(baseColor, 0.1),
      '700': this.darken(baseColor, 0.3),
      '800': this.darken(baseColor, 0.5),
      '900': this.darken(baseColor, 0.7),
      '950': this.darken(baseColor, 0.85),
    };
  }

  /**
   * Lighten a color (simplified implementation)
   */
  private lighten(color: string, amount: number): string {
    // In production, use a proper color library
    return color; // Placeholder
  }

  /**
   * Darken a color (simplified implementation)
   */
  private darken(color: string, amount: number): string {
    // In production, use a proper color library
    return color; // Placeholder
  }

  /**
   * Load brand colors from localStorage
   */
  public loadBrandColors(): void {
    const stored = localStorage.getItem('brand-colors');
    if (stored) {
      try {
        const { primary, secondary } = JSON.parse(stored);
        this.updateBrandColors(primary, secondary);
      } catch (e) {
        console.error('Failed to load brand colors:', e);
      }
    }
  }

  /**
   * Reset to default brand colors
   */
  public resetBrandColors(): void {
    const { primary, secondary } = defaultThemeConfig.brandColors;
    this.updateBrandColors(primary, secondary);
    localStorage.removeItem('brand-colors');
  }

  /**
   * Check if current theme is dark
   */
  public isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  /**
   * Check if current theme is light
   */
  public isLight(): boolean {
    return this.currentTheme === 'light';
  }
}

// Export singleton instance
export const themeManager = new ThemeManager();

// Export React hook for theme management
export function useTheme() {
  const [theme, setThemeState] = React.useState<'light' | 'dark'>(themeManager.getTheme());
  const [brandColors, setBrandColors] = React.useState(themeManager.config.brandColors);

  React.useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setThemeState(e.detail.theme);
    };

    const handleBrandChange = (e: CustomEvent) => {
      setBrandColors({ primary: e.detail.primary, secondary: e.detail.secondary });
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);
    window.addEventListener('brandchange', handleBrandChange as EventListener);

    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
      window.removeEventListener('brandchange', handleBrandChange as EventListener);
    };
  }, []);

  return {
    theme,
    brandColors,
    setTheme: (theme: 'light' | 'dark') => themeManager.setTheme(theme),
    toggleTheme: () => themeManager.toggleTheme(),
    updateBrandColors: (primary: string, secondary: string) => themeManager.updateBrandColors(primary, secondary),
    resetBrandColors: () => themeManager.resetBrandColors(),
    isDark: () => themeManager.isDark(),
    isLight: () => themeManager.isLight(),
  };
}

export default defaultThemeConfig;
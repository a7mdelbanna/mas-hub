/**
 * RTL (Right-to-Left) Configuration for MAS Business OS
 * Supports Arabic and other RTL languages
 */

export interface RTLConfig {
  enabled: boolean;
  languages: string[];
  mirrorComponents: string[];
  excludeComponents: string[];
  logicalProperties: boolean;
}

export const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

/**
 * Components that should be mirrored in RTL
 */
export const mirroredComponents = [
  'Sidebar',
  'Navigation',
  'Breadcrumbs',
  'Pagination',
  'Stepper',
  'Timeline',
  'Progress',
  'Slider',
  'Tabs',
  'Carousel',
  'Drawer',
];

/**
 * Components that should NOT be mirrored in RTL
 */
export const nonMirroredComponents = [
  'Clock',
  'Calendar',
  'PhoneNumber',
  'ProgressCircle',
  'Logo',
  'MediaPlayer',
  'CodeEditor',
];

/**
 * Icon transformations for RTL
 */
export const iconTransformations = {
  'arrow-right': 'arrow-left',
  'arrow-left': 'arrow-right',
  'chevron-right': 'chevron-left',
  'chevron-left': 'chevron-right',
  'angle-right': 'angle-left',
  'angle-left': 'angle-right',
  'forward': 'backward',
  'backward': 'forward',
  'reply': 'reply-rtl',
  'share': 'share-rtl',
  'logout': 'login',
  'login': 'logout',
  'indent': 'outdent',
  'outdent': 'indent',
  'align-left': 'align-right',
  'align-right': 'align-left',
};

/**
 * CSS logical properties mapping
 */
export const logicalPropertiesMap = {
  // Margin
  'margin-left': 'margin-inline-start',
  'margin-right': 'margin-inline-end',
  'margin-top': 'margin-block-start',
  'margin-bottom': 'margin-block-end',

  // Padding
  'padding-left': 'padding-inline-start',
  'padding-right': 'padding-inline-end',
  'padding-top': 'padding-block-start',
  'padding-bottom': 'padding-block-end',

  // Position
  'left': 'inset-inline-start',
  'right': 'inset-inline-end',
  'top': 'inset-block-start',
  'bottom': 'inset-block-end',

  // Border
  'border-left': 'border-inline-start',
  'border-right': 'border-inline-end',
  'border-top': 'border-block-start',
  'border-bottom': 'border-block-end',

  // Border width
  'border-left-width': 'border-inline-start-width',
  'border-right-width': 'border-inline-end-width',
  'border-top-width': 'border-block-start-width',
  'border-bottom-width': 'border-block-end-width',

  // Border radius
  'border-top-left-radius': 'border-start-start-radius',
  'border-top-right-radius': 'border-start-end-radius',
  'border-bottom-left-radius': 'border-end-start-radius',
  'border-bottom-right-radius': 'border-end-end-radius',

  // Text
  'text-align: left': 'text-align: start',
  'text-align: right': 'text-align: end',

  // Float
  'float: left': 'float: inline-start',
  'float: right': 'float: inline-end',

  // Clear
  'clear: left': 'clear: inline-start',
  'clear: right': 'clear: inline-end',
};

/**
 * Default RTL configuration
 */
export const defaultRTLConfig: RTLConfig = {
  enabled: true,
  languages: rtlLanguages,
  mirrorComponents: mirroredComponents,
  excludeComponents: nonMirroredComponents,
  logicalProperties: true,
};

/**
 * RTL Manager class
 */
export class RTLManager {
  private config: RTLConfig;
  private currentDirection: 'ltr' | 'rtl';
  private currentLanguage: string;
  private rootElement: HTMLElement;

  constructor(config: RTLConfig = defaultRTLConfig) {
    this.config = config;
    this.currentLanguage = this.detectLanguage();
    this.currentDirection = this.getDirectionForLanguage(this.currentLanguage);
    this.rootElement = document.documentElement;
    this.applyDirection();
    this.setupLanguageObserver();
  }

  /**
   * Detect current language from various sources
   */
  private detectLanguage(): string {
    // Check localStorage
    const stored = localStorage.getItem('language');
    if (stored) return stored;

    // Check HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) return htmlLang.split('-')[0];

    // Check navigator language
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang) return browserLang;

    // Default to English
    return 'en';
  }

  /**
   * Get text direction for a language
   */
  private getDirectionForLanguage(lang: string): 'ltr' | 'rtl' {
    return this.config.languages.includes(lang) ? 'rtl' : 'ltr';
  }

  /**
   * Apply direction to the root element
   */
  private applyDirection(): void {
    // Set dir attribute
    this.rootElement.setAttribute('dir', this.currentDirection);
    this.rootElement.setAttribute('lang', this.currentLanguage);

    // Add direction class for Tailwind
    if (this.currentDirection === 'rtl') {
      this.rootElement.classList.add('rtl');
      this.rootElement.classList.remove('ltr');
    } else {
      this.rootElement.classList.add('ltr');
      this.rootElement.classList.remove('rtl');
    }

    // Apply language-specific fonts
    this.applyFonts();

    // Dispatch direction change event
    window.dispatchEvent(new CustomEvent('directionchange', {
      detail: {
        direction: this.currentDirection,
        language: this.currentLanguage
      }
    }));
  }

  /**
   * Apply language-specific fonts
   */
  private applyFonts(): void {
    let fontFamily = '';

    if (this.currentLanguage === 'ar') {
      fontFamily = '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Tajawal", system-ui, sans-serif';
    } else if (this.currentLanguage === 'ru') {
      fontFamily = 'Inter, Roboto, system-ui, sans-serif';
    } else {
      fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    }

    this.rootElement.style.setProperty('--font-family-sans', fontFamily);
  }

  /**
   * Setup MutationObserver to watch for language changes
   */
  private setupLanguageObserver(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          const newLang = this.rootElement.lang.split('-')[0];
          if (newLang !== this.currentLanguage) {
            this.setLanguage(newLang);
          }
        }
      });
    });

    observer.observe(this.rootElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  }

  /**
   * Set language and update direction
   */
  public setLanguage(lang: string): void {
    this.currentLanguage = lang;
    this.currentDirection = this.getDirectionForLanguage(lang);
    localStorage.setItem('language', lang);
    this.applyDirection();
  }

  /**
   * Set direction explicitly
   */
  public setDirection(dir: 'ltr' | 'rtl'): void {
    this.currentDirection = dir;
    this.rootElement.setAttribute('dir', dir);
  }

  /**
   * Get current direction
   */
  public getDirection(): 'ltr' | 'rtl' {
    return this.currentDirection;
  }

  /**
   * Get current language
   */
  public getLanguage(): string {
    return this.currentLanguage;
  }

  /**
   * Check if current direction is RTL
   */
  public isRTL(): boolean {
    return this.currentDirection === 'rtl';
  }

  /**
   * Check if current direction is LTR
   */
  public isLTR(): boolean {
    return this.currentDirection === 'ltr';
  }

  /**
   * Transform icon name for RTL
   */
  public transformIcon(iconName: string): string {
    if (!this.isRTL()) return iconName;
    return iconTransformations[iconName] || iconName;
  }

  /**
   * Check if component should be mirrored
   */
  public shouldMirrorComponent(componentName: string): boolean {
    if (!this.isRTL()) return false;
    if (this.config.excludeComponents.includes(componentName)) return false;
    return this.config.mirrorComponents.includes(componentName);
  }

  /**
   * Convert physical properties to logical properties
   */
  public toLogicalProperty(property: string): string {
    if (!this.config.logicalProperties) return property;
    return logicalPropertiesMap[property] || property;
  }

  /**
   * Get text alignment based on direction
   */
  public getTextAlign(align: 'left' | 'right' | 'center'): string {
    if (align === 'center') return 'center';
    if (this.isRTL()) {
      return align === 'left' ? 'right' : 'left';
    }
    return align;
  }

  /**
   * Get float direction based on current direction
   */
  public getFloat(float: 'left' | 'right'): string {
    if (this.isRTL()) {
      return float === 'left' ? 'right' : 'left';
    }
    return float;
  }

  /**
   * Mirror margin values for RTL
   */
  public mirrorMargin(margin: string): string {
    if (!this.isRTL()) return margin;

    const values = margin.split(' ');
    if (values.length === 4) {
      // top right bottom left -> top left bottom right
      return `${values[0]} ${values[3]} ${values[2]} ${values[1]}`;
    }
    return margin;
  }

  /**
   * Mirror padding values for RTL
   */
  public mirrorPadding(padding: string): string {
    return this.mirrorMargin(padding); // Same logic as margin
  }

  /**
   * Get start/end position based on direction
   */
  public getPosition(position: 'start' | 'end'): 'left' | 'right' {
    if (this.isRTL()) {
      return position === 'start' ? 'right' : 'left';
    }
    return position === 'start' ? 'left' : 'right';
  }
}

// Export singleton instance
export const rtlManager = new RTLManager();

// Export React hook for RTL management
export function useRTL() {
  const [direction, setDirectionState] = React.useState<'ltr' | 'rtl'>(rtlManager.getDirection());
  const [language, setLanguageState] = React.useState(rtlManager.getLanguage());

  React.useEffect(() => {
    const handleDirectionChange = (e: CustomEvent) => {
      setDirectionState(e.detail.direction);
      setLanguageState(e.detail.language);
    };

    window.addEventListener('directionchange', handleDirectionChange as EventListener);

    return () => {
      window.removeEventListener('directionchange', handleDirectionChange as EventListener);
    };
  }, []);

  return {
    direction,
    language,
    isRTL: () => rtlManager.isRTL(),
    isLTR: () => rtlManager.isLTR(),
    setLanguage: (lang: string) => rtlManager.setLanguage(lang),
    setDirection: (dir: 'ltr' | 'rtl') => rtlManager.setDirection(dir),
    transformIcon: (iconName: string) => rtlManager.transformIcon(iconName),
    shouldMirrorComponent: (componentName: string) => rtlManager.shouldMirrorComponent(componentName),
    getTextAlign: (align: 'left' | 'right' | 'center') => rtlManager.getTextAlign(align),
    getFloat: (float: 'left' | 'right') => rtlManager.getFloat(float),
    getPosition: (position: 'start' | 'end') => rtlManager.getPosition(position),
  };
}

export default defaultRTLConfig;
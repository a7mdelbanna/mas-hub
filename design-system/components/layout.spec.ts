/**
 * Layout Component Specifications
 * Core layout components for MAS Business OS
 */

export interface ComponentSpec {
  name: string;
  description: string;
  variants: Record<string, any>;
  props: Record<string, any>;
  accessibility: Record<string, any>;
  responsive: Record<string, any>;
  rtl: Record<string, any>;
}

/**
 * Header Component Specification
 */
export const HeaderSpec: ComponentSpec = {
  name: 'Header',
  description: 'Main application header with navigation, search, and user menu',
  variants: {
    default: {
      height: '64px',
      background: 'var(--color-bg-primary)',
      borderBottom: '1px solid var(--color-border-default)',
      shadow: 'var(--shadow-sm)',
    },
    compact: {
      height: '48px',
    },
    transparent: {
      background: 'transparent',
      borderBottom: 'none',
      shadow: 'none',
    },
    sticky: {
      position: 'sticky',
      top: 0,
      zIndex: 'var(--z-index-sticky)',
    },
  },
  props: {
    logo: {
      type: 'ReactNode',
      required: true,
      description: 'Company logo or brand mark',
    },
    navigation: {
      type: 'NavigationItem[]',
      required: false,
      description: 'Main navigation items',
    },
    actions: {
      type: 'ReactNode[]',
      required: false,
      description: 'Header action buttons (search, notifications, etc)',
    },
    user: {
      type: 'UserMenuProps',
      required: true,
      description: 'User menu configuration',
    },
    showSearch: {
      type: 'boolean',
      default: true,
      description: 'Show global search',
    },
    showNotifications: {
      type: 'boolean',
      default: true,
      description: 'Show notification bell',
    },
  },
  accessibility: {
    role: 'banner',
    landmark: 'header',
    ariaLabel: 'Main navigation',
    keyboardNavigation: true,
    skipLink: 'Skip to main content',
  },
  responsive: {
    mobile: {
      showHamburger: true,
      collapsedNavigation: true,
      searchInDrawer: true,
    },
    tablet: {
      showHamburger: false,
      collapsedNavigation: false,
      searchInHeader: true,
    },
    desktop: {
      fullNavigation: true,
      searchInHeader: true,
    },
  },
  rtl: {
    mirrored: true,
    logoPosition: 'end',
    menuDirection: 'rtl',
  },
};

/**
 * Sidebar Component Specification
 */
export const SidebarSpec: ComponentSpec = {
  name: 'Sidebar',
  description: 'Collapsible navigation sidebar for module and page navigation',
  variants: {
    default: {
      width: '280px',
      collapsedWidth: '64px',
      background: 'var(--color-surface-primary)',
      borderRight: '1px solid var(--color-border-default)',
    },
    compact: {
      width: '240px',
      collapsedWidth: '56px',
    },
    wide: {
      width: '320px',
      collapsedWidth: '72px',
    },
    overlay: {
      position: 'fixed',
      zIndex: 'var(--z-index-modal)',
      shadow: 'var(--shadow-xl)',
    },
  },
  props: {
    items: {
      type: 'SidebarItem[]',
      required: true,
      description: 'Navigation menu items',
    },
    collapsed: {
      type: 'boolean',
      default: false,
      description: 'Collapsed state',
    },
    collapsible: {
      type: 'boolean',
      default: true,
      description: 'Allow collapse/expand',
    },
    header: {
      type: 'ReactNode',
      required: false,
      description: 'Sidebar header content',
    },
    footer: {
      type: 'ReactNode',
      required: false,
      description: 'Sidebar footer content',
    },
    activeItem: {
      type: 'string',
      required: false,
      description: 'ID of active menu item',
    },
  },
  accessibility: {
    role: 'navigation',
    ariaLabel: 'Side navigation',
    ariaExpanded: 'dynamic',
    keyboardNavigation: 'arrow keys',
    focusManagement: true,
  },
  responsive: {
    mobile: {
      behavior: 'drawer',
      overlay: true,
      swipeToOpen: true,
    },
    tablet: {
      behavior: 'collapsible',
      overlay: false,
      persistent: true,
    },
    desktop: {
      behavior: 'static',
      persistent: true,
    },
  },
  rtl: {
    mirrored: true,
    borderSide: 'left',
    collapseDirection: 'right',
    iconAlignment: 'right',
  },
};

/**
 * Footer Component Specification
 */
export const FooterSpec: ComponentSpec = {
  name: 'Footer',
  description: 'Application footer with links, copyright, and version info',
  variants: {
    default: {
      minHeight: '80px',
      background: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--color-border-default)',
      padding: 'var(--spacing-6) var(--spacing-8)',
    },
    minimal: {
      minHeight: '48px',
      padding: 'var(--spacing-4) var(--spacing-6)',
    },
    expanded: {
      minHeight: '200px',
      multiColumn: true,
    },
  },
  props: {
    columns: {
      type: 'FooterColumn[]',
      required: false,
      description: 'Footer column configuration',
    },
    copyright: {
      type: 'string',
      required: true,
      description: 'Copyright text',
    },
    version: {
      type: 'string',
      required: false,
      description: 'Application version',
    },
    links: {
      type: 'FooterLink[]',
      required: false,
      description: 'Footer links',
    },
    social: {
      type: 'SocialLink[]',
      required: false,
      description: 'Social media links',
    },
  },
  accessibility: {
    role: 'contentinfo',
    landmark: 'footer',
    ariaLabel: 'Footer',
  },
  responsive: {
    mobile: {
      stackedColumns: true,
      centeredText: true,
    },
    tablet: {
      twoColumns: true,
    },
    desktop: {
      multiColumn: true,
      distributedLayout: true,
    },
  },
  rtl: {
    mirrored: true,
    textAlignment: 'start',
  },
};

/**
 * Page Layout Component Specification
 */
export const PageLayoutSpec: ComponentSpec = {
  name: 'PageLayout',
  description: 'Main page layout container with header, sidebar, and content areas',
  variants: {
    default: {
      display: 'grid',
      gridTemplate: 'header sidebar content',
      minHeight: '100vh',
    },
    fullWidth: {
      sidebar: false,
      maxWidth: 'none',
    },
    centered: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    dashboard: {
      padding: 0,
      background: 'var(--color-bg-secondary)',
    },
  },
  props: {
    header: {
      type: 'HeaderProps',
      required: true,
      description: 'Header configuration',
    },
    sidebar: {
      type: 'SidebarProps',
      required: false,
      description: 'Sidebar configuration',
    },
    footer: {
      type: 'FooterProps',
      required: false,
      description: 'Footer configuration',
    },
    children: {
      type: 'ReactNode',
      required: true,
      description: 'Page content',
    },
    breadcrumbs: {
      type: 'BreadcrumbItem[]',
      required: false,
      description: 'Breadcrumb navigation',
    },
    pageTitle: {
      type: 'string',
      required: false,
      description: 'Page title',
    },
    actions: {
      type: 'ReactNode',
      required: false,
      description: 'Page-level actions',
    },
  },
  accessibility: {
    mainLandmark: true,
    skipLinks: ['navigation', 'main', 'footer'],
    headingHierarchy: true,
    ariaLive: 'polite',
  },
  responsive: {
    mobile: {
      stackedLayout: true,
      hiddenSidebar: true,
      fullWidthContent: true,
    },
    tablet: {
      gridLayout: true,
      collapsibleSidebar: true,
    },
    desktop: {
      gridLayout: true,
      persistentSidebar: true,
      maxContentWidth: '1440px',
    },
  },
  rtl: {
    mirrored: true,
    gridDirection: 'rtl',
    contentAlignment: 'start',
  },
};

/**
 * Container Component Specification
 */
export const ContainerSpec: ComponentSpec = {
  name: 'Container',
  description: 'Content container with responsive max-width and padding',
  variants: {
    default: {
      width: '100%',
      maxWidth: 'var(--container-max-width)',
      margin: '0 auto',
      padding: 'var(--container-padding)',
    },
    fluid: {
      maxWidth: '100%',
      padding: 'var(--spacing-4)',
    },
    narrow: {
      maxWidth: '768px',
    },
    wide: {
      maxWidth: '1536px',
    },
  },
  props: {
    maxWidth: {
      type: 'string | number',
      default: '1280px',
      description: 'Maximum width of container',
    },
    padding: {
      type: 'string | object',
      default: 'responsive',
      description: 'Container padding',
    },
    centered: {
      type: 'boolean',
      default: true,
      description: 'Center container horizontally',
    },
    as: {
      type: 'ElementType',
      default: 'div',
      description: 'HTML element type',
    },
  },
  accessibility: {
    semanticHTML: true,
    landmarkRole: 'optional',
  },
  responsive: {
    mobile: {
      padding: '16px',
      maxWidth: '100%',
    },
    tablet: {
      padding: '24px',
      maxWidth: '768px',
    },
    desktop: {
      padding: '32px',
      maxWidth: '1280px',
    },
  },
  rtl: {
    mirrored: false,
    paddingLogical: true,
  },
};

/**
 * Grid Component Specification
 */
export const GridSpec: ComponentSpec = {
  name: 'Grid',
  description: 'Responsive grid layout system',
  variants: {
    default: {
      display: 'grid',
      gap: 'var(--spacing-4)',
      gridTemplateColumns: 'repeat(12, 1fr)',
    },
    autoFit: {
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    },
    autoFill: {
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    },
  },
  props: {
    columns: {
      type: 'number | object',
      default: 12,
      description: 'Number of columns',
    },
    gap: {
      type: 'string | number',
      default: 'var(--spacing-4)',
      description: 'Gap between grid items',
    },
    alignItems: {
      type: 'string',
      default: 'stretch',
      description: 'Vertical alignment',
    },
    justifyItems: {
      type: 'string',
      default: 'stretch',
      description: 'Horizontal alignment',
    },
  },
  accessibility: {
    semanticHTML: true,
    role: 'presentation',
  },
  responsive: {
    mobile: {
      columns: 1,
      gap: 'var(--spacing-3)',
    },
    tablet: {
      columns: 6,
      gap: 'var(--spacing-4)',
    },
    desktop: {
      columns: 12,
      gap: 'var(--spacing-6)',
    },
  },
  rtl: {
    mirrored: false,
    directionAgnostic: true,
  },
};

/**
 * Stack Component Specification
 */
export const StackSpec: ComponentSpec = {
  name: 'Stack',
  description: 'Vertical or horizontal stack layout',
  variants: {
    vertical: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-4)',
    },
    horizontal: {
      display: 'flex',
      flexDirection: 'row',
      gap: 'var(--spacing-4)',
    },
  },
  props: {
    direction: {
      type: "'vertical' | 'horizontal'",
      default: 'vertical',
      description: 'Stack direction',
    },
    gap: {
      type: 'string | number',
      default: 'var(--spacing-4)',
      description: 'Gap between items',
    },
    align: {
      type: 'string',
      default: 'stretch',
      description: 'Alignment of items',
    },
    justify: {
      type: 'string',
      default: 'flex-start',
      description: 'Justification of items',
    },
    wrap: {
      type: 'boolean',
      default: false,
      description: 'Allow items to wrap',
    },
  },
  accessibility: {
    semanticHTML: true,
    role: 'presentation',
  },
  responsive: {
    mobile: {
      gap: 'var(--spacing-3)',
      wrap: true,
    },
    tablet: {
      gap: 'var(--spacing-4)',
    },
    desktop: {
      gap: 'var(--spacing-6)',
    },
  },
  rtl: {
    mirrored: true,
    flexDirection: 'row-reverse | column',
  },
};
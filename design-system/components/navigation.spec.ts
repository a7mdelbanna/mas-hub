/**
 * Navigation Component Specifications
 * Navigation components for MAS Business OS
 */

import { ComponentSpec } from './layout.spec';

/**
 * Tabs Component Specification
 */
export const TabsSpec: ComponentSpec = {
  name: 'Tabs',
  description: 'Tabbed navigation for organizing content',
  variants: {
    default: {
      borderBottom: '2px solid var(--color-border-default)',
      indicator: 'underline',
      minHeight: '48px',
    },
    pills: {
      background: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-full)',
      padding: 'var(--spacing-1)',
    },
    vertical: {
      flexDirection: 'column',
      borderRight: '2px solid var(--color-border-default)',
      minWidth: '200px',
    },
    contained: {
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    },
  },
  props: {
    tabs: {
      type: 'TabItem[]',
      required: true,
      description: 'Tab items configuration',
    },
    activeTab: {
      type: 'string',
      required: true,
      description: 'Active tab key',
    },
    onChange: {
      type: '(key: string) => void',
      required: true,
      description: 'Tab change handler',
    },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      description: 'Tabs orientation',
    },
    variant: {
      type: "'default' | 'pills' | 'contained'",
      default: 'default',
      description: 'Visual variant',
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      description: 'Tab size',
    },
    fullWidth: {
      type: 'boolean',
      default: false,
      description: 'Stretch tabs to full width',
    },
  },
  accessibility: {
    role: 'tablist',
    tabRole: 'tab',
    panelRole: 'tabpanel',
    ariaOrientation: 'horizontal | vertical',
    keyboardNavigation: 'arrow keys',
    ariaSelected: true,
    focusManagement: true,
  },
  responsive: {
    mobile: {
      scrollable: true,
      showScrollButtons: false,
      compactSize: true,
    },
    tablet: {
      scrollable: 'auto',
      showScrollButtons: true,
    },
    desktop: {
      scrollable: false,
      fullTabs: true,
    },
  },
  rtl: {
    mirrored: true,
    scrollDirection: 'rtl',
    indicatorPosition: 'reversed',
  },
};

/**
 * Breadcrumbs Component Specification
 */
export const BreadcrumbsSpec: ComponentSpec = {
  name: 'Breadcrumbs',
  description: 'Hierarchical navigation showing current location',
  variants: {
    default: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-2)',
      fontSize: 'var(--text-sm)',
    },
    withBackground: {
      background: 'var(--color-bg-secondary)',
      padding: 'var(--spacing-2) var(--spacing-4)',
      borderRadius: 'var(--radius-md)',
    },
    withIcons: {
      showIcons: true,
      iconSize: '16px',
    },
  },
  props: {
    items: {
      type: 'BreadcrumbItem[]',
      required: true,
      description: 'Breadcrumb items',
    },
    separator: {
      type: 'string | ReactNode',
      default: '/',
      description: 'Separator between items',
    },
    maxItems: {
      type: 'number',
      default: 0,
      description: 'Maximum items to show (0 = unlimited)',
    },
    showHome: {
      type: 'boolean',
      default: true,
      description: 'Show home icon as first item',
    },
    className: {
      type: 'string',
      required: false,
      description: 'Additional CSS classes',
    },
  },
  accessibility: {
    role: 'navigation',
    ariaLabel: 'Breadcrumb navigation',
    currentPage: 'aria-current="page"',
    structuredData: true,
  },
  responsive: {
    mobile: {
      collapsed: true,
      showLast: 2,
      dropdownMenu: true,
    },
    tablet: {
      showLast: 3,
    },
    desktop: {
      showAll: true,
    },
  },
  rtl: {
    mirrored: true,
    separatorDirection: 'reversed',
    iconPosition: 'end',
  },
};

/**
 * Menu Component Specification
 */
export const MenuSpec: ComponentSpec = {
  name: 'Menu',
  description: 'Dropdown or context menu for actions and navigation',
  variants: {
    default: {
      background: 'var(--color-surface-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      shadow: 'var(--shadow-lg)',
      minWidth: '200px',
    },
    compact: {
      padding: 'var(--spacing-1)',
      fontSize: 'var(--text-sm)',
    },
    wide: {
      minWidth: '320px',
      padding: 'var(--spacing-2)',
    },
  },
  props: {
    items: {
      type: 'MenuItem[]',
      required: true,
      description: 'Menu items',
    },
    open: {
      type: 'boolean',
      required: true,
      description: 'Open state',
    },
    onClose: {
      type: '() => void',
      required: true,
      description: 'Close handler',
    },
    anchorEl: {
      type: 'HTMLElement | null',
      required: false,
      description: 'Anchor element for positioning',
    },
    placement: {
      type: 'Placement',
      default: 'bottom-start',
      description: 'Menu placement',
    },
    trigger: {
      type: "'click' | 'hover' | 'contextMenu'",
      default: 'click',
      description: 'Trigger type',
    },
  },
  accessibility: {
    role: 'menu',
    itemRole: 'menuitem',
    ariaExpanded: true,
    keyboardNavigation: 'arrow keys + enter/space',
    escapeKey: 'close',
    focusTrap: true,
  },
  responsive: {
    mobile: {
      fullScreen: 'optional',
      bottomSheet: true,
    },
    tablet: {
      dropdown: true,
      maxHeight: '400px',
    },
    desktop: {
      dropdown: true,
      maxHeight: '600px',
    },
  },
  rtl: {
    mirrored: true,
    placementFlip: true,
    iconAlignment: 'end',
  },
};

/**
 * Pagination Component Specification
 */
export const PaginationSpec: ComponentSpec = {
  name: 'Pagination',
  description: 'Navigation for paginated content',
  variants: {
    default: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-2)',
    },
    compact: {
      showPageNumbers: false,
      showSummary: false,
    },
    full: {
      showPageNumbers: true,
      showSummary: true,
      showSizeChanger: true,
      showQuickJumper: true,
    },
  },
  props: {
    current: {
      type: 'number',
      required: true,
      description: 'Current page number',
    },
    total: {
      type: 'number',
      required: true,
      description: 'Total number of items',
    },
    pageSize: {
      type: 'number',
      default: 10,
      description: 'Items per page',
    },
    onChange: {
      type: '(page: number, pageSize: number) => void',
      required: true,
      description: 'Page change handler',
    },
    showSizeChanger: {
      type: 'boolean',
      default: false,
      description: 'Show page size selector',
    },
    pageSizeOptions: {
      type: 'number[]',
      default: [10, 25, 50, 100],
      description: 'Page size options',
    },
    showQuickJumper: {
      type: 'boolean',
      default: false,
      description: 'Show quick jump input',
    },
    showTotal: {
      type: 'boolean | ((total: number, range: [number, number]) => string)',
      default: false,
      description: 'Show total count',
    },
  },
  accessibility: {
    role: 'navigation',
    ariaLabel: 'Pagination navigation',
    ariaCurrentPage: true,
    keyboardNavigation: true,
    screenReaderAnnouncements: true,
  },
  responsive: {
    mobile: {
      simplifiedView: true,
      hiddenPageNumbers: true,
      prevNextOnly: true,
    },
    tablet: {
      limitedPageNumbers: 5,
      showFirstLast: true,
    },
    desktop: {
      fullPageNumbers: true,
      allControls: true,
    },
  },
  rtl: {
    mirrored: true,
    arrowDirection: 'reversed',
    numberOrder: 'preserved',
  },
};

/**
 * Stepper Component Specification
 */
export const StepperSpec: ComponentSpec = {
  name: 'Stepper',
  description: 'Multi-step process navigation',
  variants: {
    default: {
      orientation: 'horizontal',
      connector: 'line',
    },
    vertical: {
      orientation: 'vertical',
      minHeight: 'auto',
      connectorHeight: '40px',
    },
    dot: {
      stepIndicator: 'dot',
      connectorStyle: 'dashed',
    },
    progress: {
      showProgress: true,
      progressBar: true,
    },
  },
  props: {
    steps: {
      type: 'StepItem[]',
      required: true,
      description: 'Step items configuration',
    },
    activeStep: {
      type: 'number',
      required: true,
      description: 'Current active step index',
    },
    orientation: {
      type: "'horizontal' | 'vertical'",
      default: 'horizontal',
      description: 'Stepper orientation',
    },
    variant: {
      type: "'default' | 'dot' | 'progress'",
      default: 'default',
      description: 'Visual variant',
    },
    nonLinear: {
      type: 'boolean',
      default: false,
      description: 'Allow jumping between steps',
    },
    alternativeLabel: {
      type: 'boolean',
      default: false,
      description: 'Place labels below step icons',
    },
  },
  accessibility: {
    role: 'navigation',
    ariaLabel: 'Progress steps',
    stepRole: 'listitem',
    ariaCurrentStep: true,
    keyboardNavigation: 'optional',
  },
  responsive: {
    mobile: {
      vertical: true,
      compactLabels: true,
      collapsibleContent: true,
    },
    tablet: {
      horizontal: 'optional',
      fullLabels: true,
    },
    desktop: {
      horizontal: true,
      detailedLabels: true,
    },
  },
  rtl: {
    mirrored: true,
    stepOrder: 'reversed',
    progressDirection: 'rtl',
  },
};

/**
 * Navigation Rail Component Specification
 */
export const NavigationRailSpec: ComponentSpec = {
  name: 'NavigationRail',
  description: 'Vertical navigation rail for primary app navigation',
  variants: {
    default: {
      width: '72px',
      background: 'var(--color-surface-primary)',
      borderRight: '1px solid var(--color-border-default)',
    },
    floating: {
      margin: 'var(--spacing-4)',
      borderRadius: 'var(--radius-xl)',
      shadow: 'var(--shadow-lg)',
    },
    extended: {
      width: '240px',
      showLabels: true,
    },
  },
  props: {
    items: {
      type: 'NavigationItem[]',
      required: true,
      description: 'Navigation items',
    },
    activeItem: {
      type: 'string',
      required: false,
      description: 'Active item key',
    },
    variant: {
      type: "'default' | 'floating' | 'extended'",
      default: 'default',
      description: 'Visual variant',
    },
    showLabels: {
      type: 'boolean',
      default: false,
      description: 'Show item labels',
    },
    header: {
      type: 'ReactNode',
      required: false,
      description: 'Rail header content',
    },
    footer: {
      type: 'ReactNode',
      required: false,
      description: 'Rail footer content',
    },
  },
  accessibility: {
    role: 'navigation',
    ariaLabel: 'Main navigation',
    ariaOrientation: 'vertical',
    keyboardNavigation: 'arrow keys',
    focusIndicator: true,
  },
  responsive: {
    mobile: {
      hidden: true,
      bottomNavigation: true,
    },
    tablet: {
      visible: true,
      iconsOnly: true,
    },
    desktop: {
      visible: true,
      withLabels: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    borderSide: 'left',
    iconAlignment: 'end',
  },
};
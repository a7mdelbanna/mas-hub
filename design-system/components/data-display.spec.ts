/**
 * Data Display Component Specifications
 * Components for displaying data in MAS Business OS
 */

import { ComponentSpec } from './layout.spec';

/**
 * Table Component Specification
 */
export const TableSpec: ComponentSpec = {
  name: 'Table',
  description: 'Data table with sorting, filtering, and pagination',
  variants: {
    default: {
      background: 'var(--color-surface-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      headerBackground: 'var(--color-bg-secondary)',
    },
    striped: {
      alternatingRows: true,
      stripeColor: 'var(--color-bg-secondary)',
    },
    compact: {
      cellPadding: 'var(--spacing-2)',
      fontSize: 'var(--text-sm)',
      rowHeight: '36px',
    },
    bordered: {
      cellBorders: true,
      borderColor: 'var(--color-border-default)',
    },
  },
  props: {
    columns: {
      type: 'TableColumn[]',
      required: true,
      description: 'Table column configuration',
    },
    data: {
      type: 'T[]',
      required: true,
      description: 'Table data',
    },
    loading: {
      type: 'boolean',
      default: false,
      description: 'Loading state',
    },
    sortable: {
      type: 'boolean',
      default: true,
      description: 'Enable column sorting',
    },
    selectable: {
      type: 'boolean | "single" | "multiple"',
      default: false,
      description: 'Row selection mode',
    },
    expandable: {
      type: 'boolean',
      default: false,
      description: 'Expandable rows',
    },
    pagination: {
      type: 'PaginationConfig',
      required: false,
      description: 'Pagination configuration',
    },
    onSort: {
      type: '(column: string, direction: "asc" | "desc") => void',
      required: false,
      description: 'Sort handler',
    },
    onSelect: {
      type: '(rows: T[]) => void',
      required: false,
      description: 'Selection handler',
    },
    sticky: {
      type: 'boolean | { header?: boolean; columns?: number[] }',
      default: false,
      description: 'Sticky header/columns',
    },
    virtualized: {
      type: 'boolean',
      default: false,
      description: 'Virtual scrolling for large datasets',
    },
  },
  accessibility: {
    role: 'table',
    ariaLabel: 'dynamic',
    ariaSort: 'on sortable columns',
    keyboardNavigation: 'arrow keys for cell navigation',
    screenReaderMode: true,
    captionRequired: true,
  },
  responsive: {
    mobile: {
      horizontalScroll: true,
      stackedView: 'optional',
      priorityColumns: true,
      collapsibleColumns: true,
    },
    tablet: {
      horizontalScroll: 'auto',
      minWidth: '600px',
    },
    desktop: {
      fullWidth: true,
      allColumns: true,
      resizableColumns: true,
    },
  },
  rtl: {
    mirrored: true,
    columnOrder: 'reversed',
    scrollDirection: 'rtl',
    sortIconPosition: 'start',
  },
};

/**
 * Card Component Specification
 */
export const CardSpec: ComponentSpec = {
  name: 'Card',
  description: 'Container component for grouped content',
  variants: {
    default: {
      background: 'var(--color-surface-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--spacing-4)',
      shadow: 'var(--shadow-sm)',
    },
    elevated: {
      border: 'none',
      shadow: 'var(--shadow-md)',
    },
    outlined: {
      border: '2px solid var(--color-border-strong)',
      shadow: 'none',
    },
    interactive: {
      cursor: 'pointer',
      transition: 'all 250ms ease',
      hoverShadow: 'var(--shadow-lg)',
    },
  },
  props: {
    title: {
      type: 'string | ReactNode',
      required: false,
      description: 'Card title',
    },
    subtitle: {
      type: 'string',
      required: false,
      description: 'Card subtitle',
    },
    header: {
      type: 'ReactNode',
      required: false,
      description: 'Card header content',
    },
    footer: {
      type: 'ReactNode',
      required: false,
      description: 'Card footer content',
    },
    media: {
      type: 'CardMedia',
      required: false,
      description: 'Media content (image/video)',
    },
    actions: {
      type: 'ReactNode[]',
      required: false,
      description: 'Action buttons',
    },
    onClick: {
      type: '() => void',
      required: false,
      description: 'Click handler',
    },
    loading: {
      type: 'boolean',
      default: false,
      description: 'Loading state',
    },
  },
  accessibility: {
    role: 'article | button',
    ariaLabel: 'from title',
    keyboardActivation: 'when interactive',
    focusIndicator: true,
  },
  responsive: {
    mobile: {
      fullWidth: true,
      stackedLayout: true,
      compactPadding: true,
    },
    tablet: {
      flexibleWidth: true,
      standardPadding: true,
    },
    desktop: {
      fixedWidth: 'optional',
      generousPadding: true,
    },
  },
  rtl: {
    mirrored: true,
    textAlignment: 'start',
    mediaPosition: 'flexible',
  },
};

/**
 * List Component Specification
 */
export const ListSpec: ComponentSpec = {
  name: 'List',
  description: 'Vertical list of items with various layouts',
  variants: {
    default: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
    },
    divided: {
      divider: '1px solid var(--color-border-default)',
    },
    spaced: {
      gap: 'var(--spacing-2)',
    },
    interactive: {
      itemHover: true,
      itemCursor: 'pointer',
      itemTransition: 'background 150ms ease',
    },
  },
  props: {
    items: {
      type: 'ListItem[]',
      required: true,
      description: 'List items',
    },
    renderItem: {
      type: '(item: T, index: number) => ReactNode',
      required: false,
      description: 'Custom item renderer',
    },
    divided: {
      type: 'boolean',
      default: false,
      description: 'Show dividers',
    },
    loading: {
      type: 'boolean',
      default: false,
      description: 'Loading state',
    },
    emptyMessage: {
      type: 'string | ReactNode',
      default: 'No items',
      description: 'Empty state message',
    },
    virtualized: {
      type: 'boolean',
      default: false,
      description: 'Virtual scrolling',
    },
    selectable: {
      type: 'boolean',
      default: false,
      description: 'Allow item selection',
    },
  },
  accessibility: {
    role: 'list',
    itemRole: 'listitem',
    ariaLabel: 'dynamic',
    keyboardNavigation: 'arrow keys',
    focusManagement: true,
  },
  responsive: {
    mobile: {
      fullWidth: true,
      touchFriendly: true,
      swipeActions: 'optional',
    },
    tablet: {
      standardWidth: true,
    },
    desktop: {
      standardWidth: true,
      hoverEffects: true,
    },
  },
  rtl: {
    mirrored: true,
    iconPosition: 'end',
    textAlignment: 'start',
  },
};

/**
 * Timeline Component Specification
 */
export const TimelineSpec: ComponentSpec = {
  name: 'Timeline',
  description: 'Chronological display of events or activities',
  variants: {
    default: {
      orientation: 'vertical',
      connectorStyle: 'solid',
      nodeSize: '12px',
    },
    horizontal: {
      orientation: 'horizontal',
      minHeight: '100px',
    },
    alternating: {
      alternatingLayout: true,
      centerLine: true,
    },
    compact: {
      nodeSize: '8px',
      spacing: 'var(--spacing-2)',
    },
  },
  props: {
    items: {
      type: 'TimelineItem[]',
      required: true,
      description: 'Timeline items',
    },
    orientation: {
      type: "'vertical' | 'horizontal'",
      default: 'vertical',
      description: 'Timeline orientation',
    },
    alternating: {
      type: 'boolean',
      default: false,
      description: 'Alternating layout',
    },
    showConnector: {
      type: 'boolean',
      default: true,
      description: 'Show connector lines',
    },
    activeItem: {
      type: 'number',
      required: false,
      description: 'Active item index',
    },
    nodeRenderer: {
      type: '(item: TimelineItem) => ReactNode',
      required: false,
      description: 'Custom node renderer',
    },
  },
  accessibility: {
    role: 'list',
    ariaLabel: 'Timeline',
    ariaCurrentItem: 'for active item',
    keyboardNavigation: 'optional',
  },
  responsive: {
    mobile: {
      vertical: true,
      compactNodes: true,
      singleColumn: true,
    },
    tablet: {
      flexibleOrientation: true,
      standardNodes: true,
    },
    desktop: {
      flexibleOrientation: true,
      detailedNodes: true,
      alternatingLayout: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    timeDirection: 'preserved',
    nodePosition: 'reversed',
  },
};

/**
 * Badge Component Specification
 */
export const BadgeSpec: ComponentSpec = {
  name: 'Badge',
  description: 'Small count or status indicator',
  variants: {
    default: {
      display: 'inline-flex',
      padding: '0 var(--spacing-2)',
      borderRadius: 'var(--radius-full)',
      fontSize: 'var(--text-xs)',
      minWidth: '20px',
      height: '20px',
    },
    dot: {
      width: '8px',
      height: '8px',
      padding: '0',
    },
    pill: {
      borderRadius: 'var(--radius-full)',
      padding: '2px var(--spacing-3)',
    },
    square: {
      borderRadius: 'var(--radius-sm)',
    },
  },
  props: {
    content: {
      type: 'string | number',
      required: false,
      description: 'Badge content',
    },
    variant: {
      type: "'default' | 'dot' | 'pill' | 'square'",
      default: 'default',
      description: 'Badge variant',
    },
    color: {
      type: 'string',
      default: 'primary',
      description: 'Badge color',
    },
    max: {
      type: 'number',
      default: 99,
      description: 'Maximum count to display',
    },
    showZero: {
      type: 'boolean',
      default: false,
      description: 'Show badge when count is 0',
    },
    position: {
      type: "'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'",
      default: 'top-end',
      description: 'Badge position',
    },
  },
  accessibility: {
    ariaLabel: 'dynamic based on content',
    screenReaderText: true,
  },
  responsive: {
    mobile: {
      standardSize: true,
    },
    tablet: {
      standardSize: true,
    },
    desktop: {
      standardSize: true,
    },
  },
  rtl: {
    mirrored: true,
    positionFlip: true,
  },
};

/**
 * Tooltip Component Specification
 */
export const TooltipSpec: ComponentSpec = {
  name: 'Tooltip',
  description: 'Contextual information on hover or focus',
  variants: {
    default: {
      background: 'var(--color-gray-900)',
      color: 'white',
      padding: 'var(--spacing-2) var(--spacing-3)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--text-sm)',
      maxWidth: '250px',
    },
    light: {
      background: 'var(--color-surface-primary)',
      color: 'var(--color-text-primary)',
      border: '1px solid var(--color-border-default)',
      shadow: 'var(--shadow-md)',
    },
    arrow: {
      showArrow: true,
      arrowSize: '8px',
    },
  },
  props: {
    content: {
      type: 'string | ReactNode',
      required: true,
      description: 'Tooltip content',
    },
    placement: {
      type: 'Placement',
      default: 'top',
      description: 'Tooltip placement',
    },
    trigger: {
      type: "'hover' | 'click' | 'focus' | ['hover', 'focus']",
      default: ['hover', 'focus'],
      description: 'Trigger events',
    },
    delay: {
      type: 'number | { show: number; hide: number }',
      default: { show: 500, hide: 0 },
      description: 'Show/hide delay',
    },
    arrow: {
      type: 'boolean',
      default: true,
      description: 'Show arrow',
    },
    interactive: {
      type: 'boolean',
      default: false,
      description: 'Allow interaction with tooltip',
    },
  },
  accessibility: {
    role: 'tooltip',
    ariaDescribedBy: true,
    keyboardTrigger: 'focus',
    escapeKey: 'hide',
  },
  responsive: {
    mobile: {
      touchTrigger: 'long press',
      autoPosition: true,
      maxWidth: '90vw',
    },
    tablet: {
      standardBehavior: true,
    },
    desktop: {
      standardBehavior: true,
      followCursor: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    placementFlip: true,
  },
};

/**
 * Avatar Component Specification
 */
export const AvatarSpec: ComponentSpec = {
  name: 'Avatar',
  description: 'User avatar or profile image',
  variants: {
    default: {
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-bg-tertiary)',
    },
    square: {
      borderRadius: 'var(--radius-md)',
    },
    group: {
      display: 'inline-flex',
      overlap: '-8px',
      maxDisplay: 5,
    },
  },
  props: {
    src: {
      type: 'string',
      required: false,
      description: 'Image source',
    },
    alt: {
      type: 'string',
      required: true,
      description: 'Alt text',
    },
    name: {
      type: 'string',
      required: false,
      description: 'User name for initials',
    },
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl' | number",
      default: 'md',
      description: 'Avatar size',
    },
    shape: {
      type: "'circle' | 'square'",
      default: 'circle',
      description: 'Avatar shape',
    },
    status: {
      type: "'online' | 'offline' | 'busy' | 'away'",
      required: false,
      description: 'Status indicator',
    },
  },
  accessibility: {
    role: 'img',
    ariaLabel: 'from name or alt',
    decorative: 'when appropriate',
  },
  responsive: {
    mobile: {
      standardSizes: true,
    },
    tablet: {
      standardSizes: true,
    },
    desktop: {
      standardSizes: true,
      hoverEffects: 'optional',
    },
  },
  rtl: {
    mirrored: false,
    statusPosition: 'flip',
  },
};
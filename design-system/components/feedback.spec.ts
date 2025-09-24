/**
 * Feedback Component Specifications
 * User feedback and notification components for MAS Business OS
 */

import { ComponentSpec } from './layout.spec';

/**
 * Alert Component Specification
 */
export const AlertSpec: ComponentSpec = {
  name: 'Alert',
  description: 'Inline notification for important messages',
  variants: {
    default: {
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid',
      display: 'flex',
      gap: 'var(--spacing-3)',
    },
    filled: {
      borderStyle: 'none',
      fontWeight: 'medium',
    },
    outlined: {
      background: 'transparent',
      borderWidth: '2px',
    },
    banner: {
      borderRadius: '0',
      width: '100%',
      borderLeft: '4px solid',
      borderTop: 'none',
      borderRight: 'none',
      borderBottom: 'none',
    },
  },
  props: {
    type: {
      type: "'success' | 'warning' | 'error' | 'info'",
      default: 'info',
      description: 'Alert type',
    },
    title: {
      type: 'string',
      required: false,
      description: 'Alert title',
    },
    message: {
      type: 'string | ReactNode',
      required: true,
      description: 'Alert message',
    },
    closable: {
      type: 'boolean',
      default: false,
      description: 'Show close button',
    },
    onClose: {
      type: '() => void',
      required: false,
      description: 'Close handler',
    },
    icon: {
      type: 'ReactNode | boolean',
      default: true,
      description: 'Alert icon',
    },
    action: {
      type: 'ReactNode',
      required: false,
      description: 'Action button',
    },
  },
  accessibility: {
    role: 'alert',
    ariaLive: 'polite',
    ariaAtomic: true,
    closeButtonLabel: 'Dismiss alert',
  },
  responsive: {
    mobile: {
      fullWidth: true,
      stackedLayout: true,
      compactPadding: true,
    },
    tablet: {
      flexibleWidth: true,
      inlineLayout: true,
    },
    desktop: {
      flexibleWidth: true,
      inlineLayout: true,
    },
  },
  rtl: {
    mirrored: true,
    iconPosition: 'end',
    closeButtonPosition: 'start',
  },
};

/**
 * Toast/Notification Component Specification
 */
export const ToastSpec: ComponentSpec = {
  name: 'Toast',
  description: 'Temporary notification message',
  variants: {
    default: {
      minWidth: '300px',
      maxWidth: '500px',
      padding: 'var(--spacing-4)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--color-surface-primary)',
      shadow: 'var(--shadow-xl)',
      border: '1px solid var(--color-border-default)',
    },
    compact: {
      padding: 'var(--spacing-3)',
      minWidth: '250px',
    },
    filled: {
      border: 'none',
      color: 'white',
    },
  },
  props: {
    message: {
      type: 'string | ReactNode',
      required: true,
      description: 'Toast message',
    },
    type: {
      type: "'success' | 'warning' | 'error' | 'info'",
      default: 'info',
      description: 'Toast type',
    },
    duration: {
      type: 'number',
      default: 5000,
      description: 'Auto-dismiss duration (ms)',
    },
    position: {
      type: "'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'",
      default: 'top-right',
      description: 'Toast position',
    },
    closable: {
      type: 'boolean',
      default: true,
      description: 'Show close button',
    },
    action: {
      type: 'ToastAction',
      required: false,
      description: 'Action button',
    },
    onClose: {
      type: '() => void',
      required: false,
      description: 'Close handler',
    },
  },
  accessibility: {
    role: 'status',
    ariaLive: 'polite',
    ariaAtomic: true,
    announceToScreenReader: true,
  },
  responsive: {
    mobile: {
      bottomPosition: 'preferred',
      fullWidth: true,
      stackedToasts: true,
      swipeToDismiss: true,
    },
    tablet: {
      cornerPosition: true,
      standardWidth: true,
    },
    desktop: {
      cornerPosition: true,
      standardWidth: true,
      multipleToasts: true,
    },
  },
  rtl: {
    mirrored: true,
    positionFlip: true,
    slideDirection: 'reversed',
  },
};

/**
 * Modal/Dialog Component Specification
 */
export const ModalSpec: ComponentSpec = {
  name: 'Modal',
  description: 'Overlay dialog for focused user interaction',
  variants: {
    default: {
      maxWidth: '600px',
      width: '90vw',
      maxHeight: '90vh',
      background: 'var(--color-surface-primary)',
      borderRadius: 'var(--radius-xl)',
      shadow: 'var(--shadow-2xl)',
      padding: 'var(--spacing-6)',
    },
    fullScreen: {
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: '0',
    },
    alert: {
      maxWidth: '400px',
      padding: 'var(--spacing-4)',
    },
    form: {
      maxWidth: '800px',
      overflow: 'visible',
    },
  },
  props: {
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
    title: {
      type: 'string | ReactNode',
      required: false,
      description: 'Modal title',
    },
    content: {
      type: 'ReactNode',
      required: true,
      description: 'Modal content',
    },
    actions: {
      type: 'ModalAction[]',
      required: false,
      description: 'Modal actions',
    },
    size: {
      type: "'sm' | 'md' | 'lg' | 'xl' | 'full'",
      default: 'md',
      description: 'Modal size',
    },
    closeOnOverlay: {
      type: 'boolean',
      default: true,
      description: 'Close on overlay click',
    },
    closeOnEscape: {
      type: 'boolean',
      default: true,
      description: 'Close on escape key',
    },
  },
  accessibility: {
    role: 'dialog',
    ariaModal: true,
    ariaLabelledBy: 'title id',
    ariaDescribedBy: 'content id',
    focusTrap: true,
    returnFocus: true,
    preventScroll: true,
  },
  responsive: {
    mobile: {
      fullScreen: 'common',
      bottomSheet: 'optional',
      maxHeight: '100vh',
    },
    tablet: {
      centered: true,
      responsiveWidth: true,
    },
    desktop: {
      centered: true,
      fixedWidth: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    closeButtonPosition: 'start',
    actionAlignment: 'start',
  },
};

/**
 * Drawer Component Specification
 */
export const DrawerSpec: ComponentSpec = {
  name: 'Drawer',
  description: 'Side panel overlay for additional content',
  variants: {
    default: {
      width: '400px',
      height: '100vh',
      background: 'var(--color-surface-primary)',
      shadow: 'var(--shadow-2xl)',
    },
    temporary: {
      position: 'fixed',
      zIndex: 'var(--z-index-modal)',
      overlay: true,
    },
    persistent: {
      position: 'relative',
      pushContent: true,
    },
    mini: {
      width: '280px',
    },
  },
  props: {
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
    anchor: {
      type: "'left' | 'right' | 'top' | 'bottom'",
      default: 'left',
      description: 'Anchor side',
    },
    variant: {
      type: "'temporary' | 'persistent' | 'permanent'",
      default: 'temporary',
      description: 'Drawer variant',
    },
    width: {
      type: 'string | number',
      default: '400px',
      description: 'Drawer width',
    },
    header: {
      type: 'ReactNode',
      required: false,
      description: 'Drawer header',
    },
    footer: {
      type: 'ReactNode',
      required: false,
      description: 'Drawer footer',
    },
  },
  accessibility: {
    role: 'dialog',
    ariaModal: true,
    focusTrap: 'when temporary',
    escapeKey: 'close',
    returnFocus: true,
  },
  responsive: {
    mobile: {
      fullWidth: 'common',
      swipeToClose: true,
      bottomDrawer: 'optional',
    },
    tablet: {
      partialWidth: true,
      standardBehavior: true,
    },
    desktop: {
      standardWidth: true,
      persistent: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    anchorFlip: true,
    slideDirection: 'reversed',
  },
};

/**
 * Progress Component Specification
 */
export const ProgressSpec: ComponentSpec = {
  name: 'Progress',
  description: 'Progress indicator for loading or completion states',
  variants: {
    linear: {
      height: '4px',
      width: '100%',
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-bg-tertiary)',
    },
    circular: {
      width: '40px',
      height: '40px',
      strokeWidth: '4px',
    },
    steps: {
      display: 'flex',
      gap: 'var(--spacing-2)',
    },
  },
  props: {
    value: {
      type: 'number',
      required: false,
      description: 'Progress value (0-100)',
    },
    variant: {
      type: "'linear' | 'circular' | 'steps'",
      default: 'linear',
      description: 'Progress variant',
    },
    indeterminate: {
      type: 'boolean',
      default: false,
      description: 'Indeterminate progress',
    },
    size: {
      type: "'sm' | 'md' | 'lg'",
      default: 'md',
      description: 'Progress size',
    },
    color: {
      type: 'string',
      default: 'primary',
      description: 'Progress color',
    },
    showLabel: {
      type: 'boolean',
      default: false,
      description: 'Show percentage label',
    },
    steps: {
      type: 'number',
      required: false,
      description: 'Number of steps (for steps variant)',
    },
  },
  accessibility: {
    role: 'progressbar',
    ariaValueMin: 0,
    ariaValueMax: 100,
    ariaValueNow: 'dynamic',
    ariaLabel: 'required',
  },
  responsive: {
    mobile: {
      fullWidth: true,
      simplifiedLabels: true,
    },
    tablet: {
      standardWidth: true,
    },
    desktop: {
      standardWidth: true,
      detailedLabels: 'optional',
    },
  },
  rtl: {
    mirrored: true,
    progressDirection: 'rtl',
  },
};

/**
 * Skeleton Component Specification
 */
export const SkeletonSpec: ComponentSpec = {
  name: 'Skeleton',
  description: 'Loading placeholder for content',
  variants: {
    default: {
      background: 'var(--color-bg-tertiary)',
      borderRadius: 'var(--radius-md)',
      animation: 'shimmer',
    },
    text: {
      height: '1em',
      width: '100%',
      borderRadius: 'var(--radius-sm)',
    },
    circular: {
      borderRadius: 'var(--radius-full)',
    },
    rectangular: {
      borderRadius: 'var(--radius-md)',
    },
  },
  props: {
    variant: {
      type: "'text' | 'circular' | 'rectangular'",
      default: 'text',
      description: 'Skeleton variant',
    },
    width: {
      type: 'string | number',
      required: false,
      description: 'Skeleton width',
    },
    height: {
      type: 'string | number',
      required: false,
      description: 'Skeleton height',
    },
    animation: {
      type: "'pulse' | 'wave' | 'shimmer' | false",
      default: 'pulse',
      description: 'Animation type',
    },
    count: {
      type: 'number',
      default: 1,
      description: 'Number of skeleton lines',
    },
  },
  accessibility: {
    ariaLabel: 'Loading',
    ariaHidden: 'when decorative',
    role: 'status',
  },
  responsive: {
    mobile: {
      standardBehavior: true,
    },
    tablet: {
      standardBehavior: true,
    },
    desktop: {
      standardBehavior: true,
    },
  },
  rtl: {
    mirrored: false,
    animationDirection: 'preserved',
  },
};

/**
 * Spinner Component Specification
 */
export const SpinnerSpec: ComponentSpec = {
  name: 'Spinner',
  description: 'Loading spinner indicator',
  variants: {
    default: {
      width: '24px',
      height: '24px',
      borderWidth: '2px',
      borderColor: 'var(--color-border-default)',
      borderTopColor: 'var(--color-brand-primary)',
      animation: 'spin 1s linear infinite',
    },
    dots: {
      display: 'flex',
      gap: 'var(--spacing-1)',
      animationType: 'bounce',
    },
    bars: {
      display: 'flex',
      gap: 'var(--spacing-1)',
      animationType: 'scale',
    },
  },
  props: {
    size: {
      type: "'xs' | 'sm' | 'md' | 'lg' | 'xl'",
      default: 'md',
      description: 'Spinner size',
    },
    color: {
      type: 'string',
      default: 'primary',
      description: 'Spinner color',
    },
    variant: {
      type: "'default' | 'dots' | 'bars'",
      default: 'default',
      description: 'Spinner variant',
    },
    speed: {
      type: 'number',
      default: 1,
      description: 'Animation speed multiplier',
    },
    label: {
      type: 'string',
      required: false,
      description: 'Loading label',
    },
  },
  accessibility: {
    role: 'status',
    ariaLabel: 'Loading',
    ariaLive: 'polite',
    screenReaderText: true,
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
    },
  },
  rtl: {
    mirrored: false,
    spinDirection: 'preserved',
  },
};

/**
 * Popover Component Specification
 */
export const PopoverSpec: ComponentSpec = {
  name: 'Popover',
  description: 'Floating container for additional content',
  variants: {
    default: {
      background: 'var(--color-surface-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      shadow: 'var(--shadow-lg)',
      padding: 'var(--spacing-4)',
      maxWidth: '320px',
    },
    menu: {
      padding: '0',
      overflow: 'hidden',
    },
    form: {
      minWidth: '280px',
      padding: 'var(--spacing-5)',
    },
  },
  props: {
    content: {
      type: 'ReactNode',
      required: true,
      description: 'Popover content',
    },
    trigger: {
      type: 'ReactNode',
      required: true,
      description: 'Trigger element',
    },
    placement: {
      type: 'Placement',
      default: 'bottom',
      description: 'Popover placement',
    },
    open: {
      type: 'boolean',
      required: false,
      description: 'Controlled open state',
    },
    onOpenChange: {
      type: '(open: boolean) => void',
      required: false,
      description: 'Open state change handler',
    },
    arrow: {
      type: 'boolean',
      default: true,
      description: 'Show arrow',
    },
  },
  accessibility: {
    role: 'dialog',
    ariaHasPopup: true,
    ariaExpanded: 'dynamic',
    focusManagement: true,
    escapeKey: 'close',
  },
  responsive: {
    mobile: {
      fullScreen: 'optional',
      bottomSheet: 'optional',
      autoPosition: true,
    },
    tablet: {
      floating: true,
      standardWidth: true,
    },
    desktop: {
      floating: true,
      standardWidth: true,
    },
  },
  rtl: {
    mirrored: true,
    placementFlip: true,
    arrowPosition: 'auto',
  },
};
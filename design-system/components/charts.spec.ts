/**
 * Charts & Dashboard Component Specifications
 * Data visualization and dashboard components for MAS Business OS
 */

import { ComponentSpec } from './layout.spec';

/**
 * KPI Card Component Specification
 */
export const KPICardSpec: ComponentSpec = {
  name: 'KPICard',
  description: 'Key Performance Indicator display card',
  variants: {
    default: {
      minHeight: '120px',
      padding: 'var(--spacing-4)',
      background: 'var(--color-surface-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
    },
    compact: {
      minHeight: '80px',
      padding: 'var(--spacing-3)',
    },
    detailed: {
      minHeight: '160px',
      showChart: true,
      showBreakdown: true,
    },
    highlighted: {
      borderWidth: '2px',
      borderColor: 'var(--color-brand-primary)',
      shadow: 'var(--shadow-md)',
    },
  },
  props: {
    title: {
      type: 'string',
      required: true,
      description: 'KPI title',
    },
    value: {
      type: 'string | number',
      required: true,
      description: 'Current value',
    },
    unit: {
      type: 'string',
      required: false,
      description: 'Value unit (%, $, etc)',
    },
    change: {
      type: 'number',
      required: false,
      description: 'Percentage change',
    },
    changeType: {
      type: "'increase' | 'decrease' | 'neutral'",
      required: false,
      description: 'Change direction',
    },
    target: {
      type: 'number',
      required: false,
      description: 'Target value',
    },
    sparkline: {
      type: 'number[]',
      required: false,
      description: 'Sparkline data',
    },
    icon: {
      type: 'ReactNode',
      required: false,
      description: 'KPI icon',
    },
    footer: {
      type: 'string | ReactNode',
      required: false,
      description: 'Footer text or content',
    },
  },
  accessibility: {
    role: 'article',
    ariaLabel: 'from title',
    ariaDescribedBy: 'value and change',
    screenReaderFormat: 'structured',
  },
  responsive: {
    mobile: {
      fullWidth: true,
      stackedLayout: true,
      simplifiedChart: true,
    },
    tablet: {
      gridLayout: true,
      standardChart: true,
    },
    desktop: {
      gridLayout: true,
      detailedChart: true,
      hoverEffects: true,
    },
  },
  rtl: {
    mirrored: true,
    valueAlignment: 'end',
    chartDirection: 'rtl',
  },
};

/**
 * Chart Component Specification (Base)
 */
export const ChartSpec: ComponentSpec = {
  name: 'Chart',
  description: 'Base chart component for data visualization',
  variants: {
    default: {
      minHeight: '300px',
      padding: 'var(--spacing-4)',
      background: 'var(--color-surface-primary)',
    },
    fullHeight: {
      height: '100%',
      minHeight: '400px',
    },
    transparent: {
      background: 'transparent',
      padding: '0',
    },
  },
  props: {
    type: {
      type: "'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'radar'",
      required: true,
      description: 'Chart type',
    },
    data: {
      type: 'ChartData',
      required: true,
      description: 'Chart data',
    },
    options: {
      type: 'ChartOptions',
      required: false,
      description: 'Chart configuration options',
    },
    title: {
      type: 'string',
      required: false,
      description: 'Chart title',
    },
    subtitle: {
      type: 'string',
      required: false,
      description: 'Chart subtitle',
    },
    legend: {
      type: 'boolean | LegendOptions',
      default: true,
      description: 'Legend configuration',
    },
    responsive: {
      type: 'boolean',
      default: true,
      description: 'Responsive sizing',
    },
    interactive: {
      type: 'boolean',
      default: true,
      description: 'Enable interactions',
    },
    theme: {
      type: "'light' | 'dark' | 'auto'",
      default: 'auto',
      description: 'Chart theme',
    },
  },
  accessibility: {
    role: 'img',
    ariaLabel: 'from title',
    altText: 'generated from data',
    keyboardNavigation: 'optional',
    screenReaderTable: true,
  },
  responsive: {
    mobile: {
      minHeight: '250px',
      simplifiedAxes: true,
      touchInteractions: true,
      horizontalScroll: 'for wide charts',
    },
    tablet: {
      minHeight: '300px',
      standardAxes: true,
    },
    desktop: {
      minHeight: '350px',
      fullInteractions: true,
      crosshair: true,
    },
  },
  rtl: {
    mirrored: true,
    axisDirection: 'rtl',
    legendPosition: 'reversed',
  },
};

/**
 * Dashboard Grid Component Specification
 */
export const DashboardGridSpec: ComponentSpec = {
  name: 'DashboardGrid',
  description: 'Responsive grid system for dashboard layouts',
  variants: {
    default: {
      display: 'grid',
      gap: 'var(--spacing-4)',
      gridAutoRows: 'minmax(100px, auto)',
    },
    compact: {
      gap: 'var(--spacing-2)',
    },
    masonry: {
      gridAutoFlow: 'dense',
      alignItems: 'start',
    },
  },
  props: {
    layout: {
      type: 'GridLayout[]',
      required: false,
      description: 'Grid layout configuration',
    },
    columns: {
      type: 'number | ResponsiveColumns',
      default: 12,
      description: 'Number of grid columns',
    },
    draggable: {
      type: 'boolean',
      default: false,
      description: 'Enable drag to reorder',
    },
    resizable: {
      type: 'boolean',
      default: false,
      description: 'Enable resize widgets',
    },
    gap: {
      type: 'string | number',
      default: 'var(--spacing-4)',
      description: 'Gap between items',
    },
    saveLayout: {
      type: 'boolean',
      default: false,
      description: 'Save layout to localStorage',
    },
  },
  accessibility: {
    role: 'presentation',
    landmarkWidgets: true,
    keyboardReorder: 'when draggable',
    announceChanges: true,
  },
  responsive: {
    mobile: {
      singleColumn: true,
      stackedWidgets: true,
      disableDrag: true,
    },
    tablet: {
      twoColumns: true,
      limitedDrag: true,
    },
    desktop: {
      multiColumn: true,
      fullDragDrop: true,
      resizeHandles: true,
    },
  },
  rtl: {
    mirrored: true,
    gridDirection: 'rtl',
    dragDirection: 'reversed',
  },
};

/**
 * Stat Component Specification
 */
export const StatSpec: ComponentSpec = {
  name: 'Stat',
  description: 'Statistical value display',
  variants: {
    default: {
      textAlign: 'start',
    },
    centered: {
      textAlign: 'center',
    },
    withIcon: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--spacing-3)',
    },
    colored: {
      colorCoded: true,
    },
  },
  props: {
    label: {
      type: 'string',
      required: true,
      description: 'Stat label',
    },
    value: {
      type: 'string | number',
      required: true,
      description: 'Stat value',
    },
    change: {
      type: 'number',
      required: false,
      description: 'Change percentage',
    },
    changeLabel: {
      type: 'string',
      required: false,
      description: 'Change description',
    },
    icon: {
      type: 'ReactNode',
      required: false,
      description: 'Stat icon',
    },
    helpText: {
      type: 'string',
      required: false,
      description: 'Additional help text',
    },
  },
  accessibility: {
    semanticHTML: true,
    ariaLabel: 'complete stat description',
  },
  responsive: {
    mobile: {
      compactDisplay: true,
      fontSize: 'responsive',
    },
    tablet: {
      standardDisplay: true,
    },
    desktop: {
      standardDisplay: true,
    },
  },
  rtl: {
    mirrored: true,
    textAlignment: 'end',
    iconPosition: 'end',
  },
};

/**
 * Progress Ring Component Specification
 */
export const ProgressRingSpec: ComponentSpec = {
  name: 'ProgressRing',
  description: 'Circular progress indicator',
  variants: {
    default: {
      size: '120px',
      strokeWidth: '8px',
      fontSize: 'var(--text-2xl)',
    },
    compact: {
      size: '60px',
      strokeWidth: '4px',
      fontSize: 'var(--text-sm)',
    },
    gradient: {
      strokeGradient: true,
    },
  },
  props: {
    value: {
      type: 'number',
      required: true,
      description: 'Progress value (0-100)',
    },
    size: {
      type: 'number',
      default: 120,
      description: 'Ring diameter',
    },
    strokeWidth: {
      type: 'number',
      default: 8,
      description: 'Stroke width',
    },
    color: {
      type: 'string',
      default: 'primary',
      description: 'Progress color',
    },
    trackColor: {
      type: 'string',
      default: 'var(--color-bg-tertiary)',
      description: 'Track color',
    },
    showValue: {
      type: 'boolean',
      default: true,
      description: 'Show percentage value',
    },
    label: {
      type: 'string',
      required: false,
      description: 'Center label',
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
      scaledSize: true,
    },
    tablet: {
      standardSize: true,
    },
    desktop: {
      standardSize: true,
    },
  },
  rtl: {
    mirrored: false,
    progressDirection: 'preserved',
  },
};

/**
 * Metric Card Component Specification
 */
export const MetricCardSpec: ComponentSpec = {
  name: 'MetricCard',
  description: 'Detailed metric display with trend',
  variants: {
    default: {
      padding: 'var(--spacing-4)',
      background: 'var(--color-surface-primary)',
      border: '1px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
    },
    filled: {
      background: 'var(--color-bg-secondary)',
      border: 'none',
    },
    outlined: {
      background: 'transparent',
      borderWidth: '2px',
    },
  },
  props: {
    title: {
      type: 'string',
      required: true,
      description: 'Metric title',
    },
    value: {
      type: 'string | number',
      required: true,
      description: 'Current value',
    },
    previousValue: {
      type: 'string | number',
      required: false,
      description: 'Previous period value',
    },
    trend: {
      type: "'up' | 'down' | 'stable'",
      required: false,
      description: 'Trend direction',
    },
    trendValue: {
      type: 'string | number',
      required: false,
      description: 'Trend change value',
    },
    period: {
      type: 'string',
      required: false,
      description: 'Time period',
    },
    chart: {
      type: 'ChartData',
      required: false,
      description: 'Mini chart data',
    },
    actions: {
      type: 'ReactNode',
      required: false,
      description: 'Card actions',
    },
  },
  accessibility: {
    role: 'article',
    headingHierarchy: true,
    ariaDescribedBy: 'trend and period',
  },
  responsive: {
    mobile: {
      stackedLayout: true,
      simplifiedChart: true,
    },
    tablet: {
      flexLayout: true,
    },
    desktop: {
      flexLayout: true,
      detailedChart: true,
    },
  },
  rtl: {
    mirrored: true,
    valueAlignment: 'end',
    trendIconFlip: true,
  },
};

/**
 * Activity Feed Component Specification
 */
export const ActivityFeedSpec: ComponentSpec = {
  name: 'ActivityFeed',
  description: 'Timeline of activities and events',
  variants: {
    default: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-3)',
    },
    compact: {
      gap: 'var(--spacing-1)',
      fontSize: 'var(--text-sm)',
    },
    detailed: {
      showAvatars: true,
      showTimestamps: true,
      showActions: true,
    },
  },
  props: {
    items: {
      type: 'ActivityItem[]',
      required: true,
      description: 'Activity items',
    },
    groupByDate: {
      type: 'boolean',
      default: false,
      description: 'Group items by date',
    },
    showAvatars: {
      type: 'boolean',
      default: true,
      description: 'Show user avatars',
    },
    maxItems: {
      type: 'number',
      required: false,
      description: 'Maximum items to display',
    },
    loading: {
      type: 'boolean',
      default: false,
      description: 'Loading state',
    },
    onLoadMore: {
      type: '() => void',
      required: false,
      description: 'Load more handler',
    },
  },
  accessibility: {
    role: 'feed',
    ariaLabel: 'Activity feed',
    ariaBusy: 'when loading',
    liveRegion: 'polite',
  },
  responsive: {
    mobile: {
      compactView: true,
      touchInteractions: true,
    },
    tablet: {
      standardView: true,
    },
    desktop: {
      detailedView: true,
      hoverActions: true,
    },
  },
  rtl: {
    mirrored: true,
    timelineDirection: 'rtl',
    timestampPosition: 'end',
  },
};

/**
 * Heatmap Component Specification
 */
export const HeatmapSpec: ComponentSpec = {
  name: 'Heatmap',
  description: 'Calendar heatmap visualization',
  variants: {
    default: {
      cellSize: '12px',
      cellGap: '2px',
      borderRadius: 'var(--radius-sm)',
    },
    contribution: {
      colorScheme: 'github',
      showMonthLabels: true,
      showWeekdayLabels: true,
    },
    calendar: {
      cellSize: '20px',
      showValues: true,
    },
  },
  props: {
    data: {
      type: 'HeatmapData[]',
      required: true,
      description: 'Heatmap data',
    },
    startDate: {
      type: 'Date',
      required: true,
      description: 'Start date',
    },
    endDate: {
      type: 'Date',
      required: true,
      description: 'End date',
    },
    colorScale: {
      type: 'ColorScale',
      required: false,
      description: 'Color scale configuration',
    },
    cellSize: {
      type: 'number',
      default: 12,
      description: 'Cell size in pixels',
    },
    onClick: {
      type: '(date: Date, value: number) => void',
      required: false,
      description: 'Cell click handler',
    },
    tooltip: {
      type: 'boolean | TooltipConfig',
      default: true,
      description: 'Tooltip configuration',
    },
  },
  accessibility: {
    role: 'img',
    ariaLabel: 'Calendar heatmap',
    keyboardNavigation: 'arrow keys',
    screenReaderDescription: true,
  },
  responsive: {
    mobile: {
      horizontalScroll: true,
      smallerCells: true,
    },
    tablet: {
      standardSize: true,
    },
    desktop: {
      fullSize: true,
      detailedTooltips: true,
    },
  },
  rtl: {
    mirrored: true,
    calendarDirection: 'rtl',
    weekStartDay: 'locale-specific',
  },
};
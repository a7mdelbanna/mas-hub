# MAS Business OS - Design System Documentation

## Table of Contents
1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Design Tokens](#design-tokens)
4. [Typography System](#typography-system)
5. [Color System](#color-system)
6. [Spacing & Layout](#spacing--layout)
7. [Component Architecture](#component-architecture)
8. [Accessibility Standards](#accessibility-standards)
9. [Responsive Design](#responsive-design)
10. [Multi-Language Support](#multi-language-support)
11. [Brand Customization](#brand-customization)
12. [Portal Presets](#portal-presets)
13. [Icon System](#icon-system)
14. [Animation Guidelines](#animation-guidelines)
15. [Implementation Guide](#implementation-guide)

## Overview

The MAS Business OS Design System is a comprehensive, enterprise-grade UI framework designed to support multiple portals, languages, and user roles. It provides a consistent, accessible, and performant user experience across all modules and interfaces.

### Key Features
- **Multi-portal Support**: Separate presets for Employee, Client, Candidate, and Admin portals
- **Internationalization**: Full support for English, Arabic, and Russian with RTL layouts
- **Accessibility**: WCAG 2.1 AA compliant components
- **Theme System**: Light/dark modes with runtime switching
- **Brand Customization**: Client-specific branding capabilities
- **Performance**: Optimized for enterprise-scale applications

## Design Principles

### 1. Clarity & Simplicity
- **Clear Information Hierarchy**: Use consistent heading levels and visual weight
- **Minimalist Approach**: Remove unnecessary elements that don't serve user goals
- **Progressive Disclosure**: Show advanced features only when needed

### 2. Consistency
- **Unified Experience**: Same patterns across all portals and modules
- **Predictable Interactions**: Users should know what to expect
- **Standardized Components**: Reusable components with consistent behavior

### 3. Efficiency
- **Task-Oriented Design**: Optimize for common workflows
- **Keyboard Navigation**: Full keyboard support for power users
- **Smart Defaults**: Reduce configuration needs with intelligent defaults

### 4. Accessibility First
- **Inclusive Design**: Usable by everyone, regardless of abilities
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Meeting WCAG AA standards minimum

### 5. Professional Aesthetic
- **Enterprise-Ready**: Serious, trustworthy appearance
- **Modern & Clean**: Contemporary design without being trendy
- **Data-Dense Capable**: Support for complex information displays

## Design Tokens

Design tokens are the atomic design decisions that power the entire system. Located in `/design-system/tokens.json`.

### Color Tokens

```json
{
  "colors": {
    "primitive": {
      // Base color palettes
      "blue": { "50": "#eff6ff", ... "950": "#172554" },
      "green": { "50": "#f0fdf4", ... "950": "#052e16" },
      // ... more color scales
    },
    "semantic": {
      "brand": {
        "primary": { "light": "#2563eb", "dark": "#60a5fa" },
        "secondary": { "light": "#9333ea", "dark": "#c084fc" }
      },
      "status": {
        "success": { ... },
        "warning": { ... },
        "error": { ... },
        "info": { ... }
      }
    }
  }
}
```

### Typography Tokens

```json
{
  "typography": {
    "fontFamily": {
      "latin": { "sans": "Inter, system-ui, ..." },
      "arabic": { "sans": "IBM Plex Sans Arabic, ..." },
      "cyrillic": { "sans": "Inter, Roboto, ..." }
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      // ... up to 9xl
    }
  }
}
```

### Spacing Tokens

Using a consistent 4px base unit:
- `spacing-1`: 0.25rem (4px)
- `spacing-2`: 0.5rem (8px)
- `spacing-4`: 1rem (16px)
- `spacing-8`: 2rem (32px)
- ... up to `spacing-96`: 24rem (384px)

## Typography System

### Font Families

#### Latin (English)
- **Primary**: Inter
- **Monospace**: JetBrains Mono
- **Fallbacks**: system-ui, -apple-system, sans-serif

#### Arabic
- **Primary**: IBM Plex Sans Arabic
- **Secondary**: Noto Sans Arabic
- **Fallbacks**: Tajawal, system-ui

#### Cyrillic (Russian)
- **Primary**: Inter
- **Secondary**: Roboto
- **Fallbacks**: system-ui, sans-serif

### Type Scale

| Level | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| Display Large | 3rem | 1.25 | Bold | Hero headings |
| Display Medium | 2.25rem | 1.25 | Bold | Page titles |
| H1 | 1.875rem | 1.25 | Bold | Section headers |
| H2 | 1.5rem | 1.25 | Semibold | Subsections |
| H3 | 1.25rem | 1.375 | Semibold | Card titles |
| H4 | 1.125rem | 1.375 | Medium | Widget headers |
| Body Large | 1.125rem | 1.625 | Regular | Lead text |
| Body Medium | 1rem | 1.5 | Regular | Default text |
| Body Small | 0.875rem | 1.5 | Regular | Secondary text |
| Caption | 0.75rem | 1.375 | Regular | Labels, hints |

## Color System

### Brand Colors

#### Primary Palette
- **Employee Portal**: Professional Blue (#2563eb)
- **Client Portal**: Customizable (default: Blue #2563eb)
- **Candidate Portal**: Positive Green (#10b981)
- **Admin Dashboard**: System Blue (#3b82f6)

#### Semantic Colors

| Purpose | Light Mode | Dark Mode | Usage |
|---------|------------|-----------|-------|
| Success | #16a34a | #4ade80 | Positive actions, confirmations |
| Warning | #d97706 | #fbbf24 | Caution, attention needed |
| Error | #dc2626 | #f87171 | Errors, destructive actions |
| Info | #0891b2 | #67e8f9 | Informational messages |

### Status Indicators

#### Project Status
- **Active**: Blue (#3b82f6)
- **Completed**: Green (#10b981)
- **On Hold**: Amber (#f59e0b)
- **Cancelled**: Red (#ef4444)
- **Overdue**: Dark Red (#991b1b)

#### Invoice Status
- **Paid**: Green (#10b981)
- **Pending**: Amber (#f59e0b)
- **Overdue**: Red (#ef4444)
- **Draft**: Gray (#6b7280)

## Spacing & Layout

### Grid System
- **Columns**: 12-column grid
- **Gutters**:
  - Mobile: 16px
  - Tablet: 24px
  - Desktop: 32px
- **Margins**:
  - Mobile: 16px
  - Tablet: 32px
  - Desktop: 48px

### Breakpoints

| Breakpoint | Min Width | Columns | Use Case |
|------------|-----------|---------|----------|
| xs | 480px | 4 | Small phones |
| sm | 640px | 4 | Phones |
| md | 768px | 8 | Tablets |
| lg | 1024px | 12 | Desktop |
| xl | 1280px | 12 | Wide desktop |
| 2xl | 1536px | 12 | Ultra-wide |

### Container Widths
- **Narrow**: 768px (Reading content)
- **Default**: 1280px (Standard layouts)
- **Wide**: 1536px (Data tables, dashboards)
- **Full**: 100% (Admin dashboards)

## Component Architecture

### Component Categories

#### Layout Components
- **PageLayout**: Main application wrapper
- **Header**: Top navigation bar
- **Sidebar**: Side navigation
- **Footer**: Bottom information
- **Container**: Content wrapper
- **Grid**: Responsive grid system
- **Stack**: Vertical/horizontal layouts

#### Navigation Components
- **Tabs**: Content organization
- **Breadcrumbs**: Hierarchical navigation
- **Menu**: Dropdown menus
- **Pagination**: Page navigation
- **Stepper**: Multi-step processes
- **NavigationRail**: Vertical primary nav

#### Form Components
- **Input**: Text input fields
- **Select**: Dropdown selection
- **DatePicker**: Date/time selection
- **FileUpload**: File upload interface
- **Checkbox**: Boolean selection
- **Radio**: Single selection
- **Switch**: On/off toggle

#### Data Display Components
- **Table**: Data tables with sorting/filtering
- **Card**: Content containers
- **List**: Vertical item lists
- **Timeline**: Chronological display
- **Badge**: Status indicators
- **Avatar**: User images
- **Tooltip**: Contextual information

#### Feedback Components
- **Alert**: Inline notifications
- **Toast**: Temporary notifications
- **Modal**: Overlay dialogs
- **Drawer**: Side panels
- **Progress**: Loading indicators
- **Skeleton**: Content placeholders
- **Spinner**: Loading animation

#### Chart Components
- **KPICard**: Metric displays
- **Chart**: Data visualizations
- **ProgressRing**: Circular progress
- **Heatmap**: Calendar visualization
- **ActivityFeed**: Event timeline

### Component States

All interactive components support:
- **Default**: Normal state
- **Hover**: Mouse over
- **Focus**: Keyboard focus
- **Active**: Being interacted with
- **Disabled**: Not interactive
- **Loading**: Processing
- **Error**: Invalid state
- **Success**: Valid/complete state

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal Text**: 4.5:1 minimum
- **Large Text**: 3:1 minimum
- **Interactive Elements**: 3:1 minimum
- **Focus Indicators**: 3:1 minimum

#### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Focus visible indicators
- Skip links for navigation
- Escape key closes overlays

#### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for updates
- Landmark roles
- Heading hierarchy

#### Touch Targets
- Minimum 44x44px touch targets
- Adequate spacing between targets
- Larger targets on mobile

### Accessibility Features
- **High Contrast Mode**: Enhanced contrast theme
- **Reduced Motion**: Respect prefers-reduced-motion
- **Font Scaling**: Support up to 200% zoom
- **Keyboard Shortcuts**: Customizable shortcuts
- **Screen Reader Announcements**: Context-aware

## Responsive Design

### Mobile-First Approach

#### Mobile (< 768px)
- Single column layouts
- Stacked components
- Bottom sheets for modals
- Hamburger navigation
- Touch-optimized controls
- Swipe gestures

#### Tablet (768px - 1024px)
- Two column layouts
- Collapsible sidebars
- Floating action buttons
- Mixed navigation patterns
- Standard modals

#### Desktop (> 1024px)
- Multi-column layouts
- Persistent sidebars
- Hover interactions
- Keyboard shortcuts
- Advanced features visible

### Responsive Components

Each component has responsive variants:
```typescript
{
  mobile: {
    layout: 'stacked',
    navigation: 'hamburger',
    modals: 'fullscreen'
  },
  tablet: {
    layout: 'two-column',
    navigation: 'collapsible',
    modals: 'centered'
  },
  desktop: {
    layout: 'multi-column',
    navigation: 'persistent',
    modals: 'standard'
  }
}
```

## Multi-Language Support

### Supported Languages

#### English (en)
- Default language
- LTR layout
- Latin script

#### Arabic (ar)
- Full RTL support
- Arabic numerals option
- Mirrored components
- Arabic fonts

#### Russian (ru)
- LTR layout
- Cyrillic script
- Localized formats

### RTL Support

#### Components with RTL Mirroring
- Navigation components
- Form layouts
- Data tables
- Charts and graphs
- Icons and arrows
- Progress indicators

#### Components without Mirroring
- Clocks
- Media players
- Code editors
- Logos
- Phone numbers

### Localization

#### Date Formats
- **English**: MM/DD/YYYY
- **Arabic**: DD/MM/YYYY with Arabic numerals
- **Russian**: DD.MM.YYYY

#### Number Formats
- **English**: 1,234.56
- **Arabic**: ١٬٢٣٤٫٥٦ (optional)
- **Russian**: 1 234,56

#### Currency Display
- Position varies by locale
- Symbol or code options
- Thousand separators

## Brand Customization

### Client Portal Branding

#### Customizable Elements
- Primary brand color
- Secondary brand color
- Logo upload
- Font selection (limited)
- Header styling
- Email templates

#### Brand Wizard Flow
1. Welcome & Introduction
2. Logo Upload
3. Primary Color Selection
4. Secondary Color Selection
5. Preview & Test
6. Apply Changes

#### Color Generation
- Automatic tint/shade generation
- Contrast validation
- Accessibility checking
- Dark mode variants

### Constraints
- Must maintain accessibility standards
- Core UI structure unchanged
- Limited to approved fonts
- No custom CSS injection

## Portal Presets

### Employee Portal
- **Theme**: Professional blue
- **Layout**: Sidebar navigation
- **Features**: Timesheet, tasks, training
- **Density**: Standard
- **Customization**: Limited

### Client Portal
- **Theme**: Brand customizable
- **Layout**: Top navigation
- **Features**: Projects, invoices, support
- **Density**: Comfortable
- **Customization**: Extensive

### Candidate Portal
- **Theme**: Welcoming green
- **Layout**: Simplified navigation
- **Features**: Application, training, documents
- **Density**: Spacious
- **Customization**: None

### Admin Dashboard
- **Theme**: Dark by default
- **Layout**: Dense sidebar
- **Features**: Full system access
- **Density**: Compact
- **Customization**: Personal preferences

## Icon System

### Icon Library
Using a combination of:
- **Material Icons**: Primary icon set
- **Custom Icons**: Business-specific icons
- **Brand Icons**: Payment methods, integrations

### Icon Sizes
- **xs**: 16px
- **sm**: 20px
- **md**: 24px (default)
- **lg**: 32px
- **xl**: 48px

### Icon Guidelines
- Consistent 2px stroke width
- Outlined style preferred
- RTL variants for directional icons
- Meaningful labels for accessibility

## Animation Guidelines

### Animation Principles
- **Purposeful**: Animations serve a function
- **Fast**: 150-350ms for most transitions
- **Smooth**: Ease-in-out timing functions
- **Subtle**: Avoid distracting movements

### Standard Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Fade | 150ms | ease | Appearing/disappearing |
| Slide | 250ms | ease-out | Panels, drawers |
| Scale | 200ms | ease-out | Modals, popovers |
| Rotate | 300ms | linear | Loading spinners |

### Performance
- Use CSS transitions when possible
- GPU-accelerated transforms
- Respect prefers-reduced-motion
- Avoid animating layout properties

## Implementation Guide

### Getting Started

#### 1. Install Dependencies
```bash
npm install @mas/design-system
npm install tailwindcss
```

#### 2. Import Design Tokens
```javascript
import tokens from '@mas/design-system/tokens.json';
import { ThemeManager } from '@mas/design-system/theme';
```

#### 3. Configure Tailwind
```javascript
// tailwind.config.js
module.exports = require('@mas/design-system/tailwind.config');
```

#### 4. Initialize Theme
```javascript
const theme = new ThemeManager();
theme.loadBrandColors();
theme.setTheme('light');
```

### Component Usage

#### Basic Component Import
```javascript
import { Button, Card, Input } from '@mas/design-system/components';
```

#### Using Portal Presets
```javascript
import { employeePortalPreset } from '@mas/design-system/presets';

function EmployeeApp() {
  return (
    <PortalProvider preset={employeePortalPreset}>
      {/* Your app */}
    </PortalProvider>
  );
}
```

#### RTL Support
```javascript
import { RTLManager } from '@mas/design-system/rtl';

const rtl = new RTLManager();
rtl.setLanguage('ar'); // Switches to Arabic RTL
```

### Best Practices

#### 1. Use Design Tokens
Always reference design tokens instead of hard-coded values:
```css
/* Good */
.card {
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}

/* Bad */
.card {
  padding: 16px;
  border-radius: 8px;
}
```

#### 2. Semantic HTML
Use proper HTML elements for better accessibility:
```html
<!-- Good -->
<nav role="navigation">
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<!-- Bad -->
<div class="navigation">
  <div class="nav-item" onclick="navigate()">Home</div>
</div>
```

#### 3. Component Composition
Build complex UIs from simple components:
```javascript
function ProjectCard({ project }) {
  return (
    <Card>
      <CardHeader>
        <Badge status={project.status} />
        <Heading level={3}>{project.name}</Heading>
      </CardHeader>
      <CardBody>
        <ProgressBar value={project.completion} />
        <Text variant="caption">
          Due: {formatDate(project.deadline)}
        </Text>
      </CardBody>
    </Card>
  );
}
```

### Testing

#### Accessibility Testing
```javascript
// Use @testing-library/react
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('button is accessible', () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
  expect(button).not.toBeDisabled();
});
```

#### Visual Regression Testing
```javascript
// Use Storybook + Chromatic
export default {
  title: 'Components/Button',
  component: Button,
};

export const Default = () => <Button>Default Button</Button>;
export const Primary = () => <Button variant="primary">Primary Button</Button>;
```

### Performance Optimization

#### 1. Code Splitting
```javascript
// Lazy load heavy components
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Dashboard />
    </Suspense>
  );
}
```

#### 2. Virtual Scrolling
```javascript
// Use for large lists
import { VirtualList } from '@mas/design-system/components';

<VirtualList
  items={largeDataset}
  itemHeight={60}
  renderItem={renderRow}
/>
```

#### 3. Memoization
```javascript
// Prevent unnecessary re-renders
const MemoizedCard = memo(Card, (prev, next) => {
  return prev.id === next.id && prev.status === next.status;
});
```

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-24 | Initial design system release |

## Support & Resources

- **Documentation**: `/docs/design-system.md`
- **Storybook**: `http://localhost:6006`
- **Design Tokens**: `/design-system/tokens.json`
- **Component Specs**: `/design-system/components/`
- **Portal Presets**: `/design-system/presets/`

## Contributing

To contribute to the design system:
1. Review design principles and guidelines
2. Ensure accessibility compliance
3. Test across all supported languages
4. Validate in all portal contexts
5. Update documentation

---

**MAS Business OS Design System** - Built for enterprise, designed for everyone.
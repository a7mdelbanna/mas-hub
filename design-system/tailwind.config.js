/**
 * Tailwind CSS Configuration for MAS Business OS
 * Supports light/dark themes and RTL layouts
 */

const designTokens = require('./tokens.json');

// Helper function to convert design tokens to CSS variables
function tokensToCSSVars(tokens, prefix = '') {
  let cssVars = {};

  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (value.light && value.dark) {
        // Handle theme-specific values
        cssVars[`${prefix}${key}`] = value.light;
      } else {
        // Recurse for nested objects
        Object.assign(cssVars, tokensToCSSVars(value, `${prefix}${key}-`));
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      cssVars[`${prefix}${key}`] = value;
    }
  });

  return cssVars;
}

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Brand colors (customizable via brand wizard)
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
        },
        // Semantic colors
        background: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
          elevated: 'var(--color-bg-elevated)',
          overlay: 'var(--color-bg-overlay)',
        },
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
          link: 'var(--color-text-link)',
        },
        border: {
          DEFAULT: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          strong: 'var(--color-border-strong)',
          focus: 'var(--color-border-focus)',
        },
        // Status colors
        success: {
          bg: 'var(--color-success-bg)',
          border: 'var(--color-success-border)',
          text: 'var(--color-success-text)',
          icon: 'var(--color-success-icon)',
        },
        warning: {
          bg: 'var(--color-warning-bg)',
          border: 'var(--color-warning-border)',
          text: 'var(--color-warning-text)',
          icon: 'var(--color-warning-icon)',
        },
        error: {
          bg: 'var(--color-error-bg)',
          border: 'var(--color-error-border)',
          text: 'var(--color-error-text)',
          icon: 'var(--color-error-icon)',
        },
        info: {
          bg: 'var(--color-info-bg)',
          border: 'var(--color-info-border)',
          text: 'var(--color-info-text)',
          icon: 'var(--color-info-icon)',
        },
      },
      fontFamily: {
        'sans': [
          'var(--font-family-sans)',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        'mono': [
          'var(--font-family-mono)',
          'monospace'
        ],
        // Language-specific fonts
        'arabic': [
          '"IBM Plex Sans Arabic"',
          '"Noto Sans Arabic"',
          '"Tajawal"',
          'system-ui',
          'sans-serif'
        ],
        'latin': [
          'Inter',
          'system-ui',
          '-apple-system',
          'sans-serif'
        ],
        'cyrillic': [
          'Inter',
          'Roboto',
          'system-ui',
          'sans-serif'
        ],
      },
      fontSize: {
        'xs': designTokens.typography.fontSize.xs,
        'sm': designTokens.typography.fontSize.sm,
        'base': designTokens.typography.fontSize.base,
        'lg': designTokens.typography.fontSize.lg,
        'xl': designTokens.typography.fontSize.xl,
        '2xl': designTokens.typography.fontSize['2xl'],
        '3xl': designTokens.typography.fontSize['3xl'],
        '4xl': designTokens.typography.fontSize['4xl'],
        '5xl': designTokens.typography.fontSize['5xl'],
        '6xl': designTokens.typography.fontSize['6xl'],
        '7xl': designTokens.typography.fontSize['7xl'],
        '8xl': designTokens.typography.fontSize['8xl'],
        '9xl': designTokens.typography.fontSize['9xl'],
      },
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.shadows,
      zIndex: designTokens.zIndex,
      opacity: designTokens.opacity,
      screens: {
        'xs': designTokens.breakpoints.xs,
        'sm': designTokens.breakpoints.sm,
        'md': designTokens.breakpoints.md,
        'lg': designTokens.breakpoints.lg,
        'xl': designTokens.breakpoints.xl,
        '2xl': designTokens.breakpoints['2xl'],
        '3xl': designTokens.breakpoints['3xl'],
      },
      animation: {
        'fade-in': 'fadeIn 250ms ease-in-out',
        'fade-out': 'fadeOut 250ms ease-in-out',
        'slide-in': 'slideIn 350ms cubic-bezier(0.215, 0.61, 0.355, 1)',
        'slide-out': 'slideOut 350ms cubic-bezier(0.215, 0.61, 0.355, 1)',
        'scale-in': 'scaleIn 200ms ease-out',
        'scale-out': 'scaleOut 200ms ease-in',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
      transitionDuration: designTokens.animation.duration,
      transitionTimingFunction: designTokens.animation.easing,
    },
  },
  plugins: [
    // RTL support plugin
    function({ addUtilities, addVariant, e }) {
      // Add RTL variant
      addVariant('rtl', ({ modifySelectors, separator }) => {
        return modifySelectors(({ className }) => {
          return `[dir="rtl"] .${e(`rtl${separator}${className}`)}`;
        });
      });

      // Add LTR variant
      addVariant('ltr', ({ modifySelectors, separator }) => {
        return modifySelectors(({ className }) => {
          return `[dir="ltr"] .${e(`ltr${separator}${className}`)}`;
        });
      });

      // Logical property utilities
      const logicalUtilities = {
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        '.ps-0': {
          'padding-inline-start': '0',
        },
        '.pe-0': {
          'padding-inline-end': '0',
        },
        '.bs-0': {
          'border-inline-start-width': '0',
        },
        '.be-0': {
          'border-inline-end-width': '0',
        },
        '.start-0': {
          'inset-inline-start': '0',
        },
        '.end-0': {
          'inset-inline-end': '0',
        },
      };

      // Generate logical spacing utilities
      Object.entries(designTokens.spacing).forEach(([key, value]) => {
        logicalUtilities[`.ms-${key}`] = { 'margin-inline-start': value };
        logicalUtilities[`.me-${key}`] = { 'margin-inline-end': value };
        logicalUtilities[`.ps-${key}`] = { 'padding-inline-start': value };
        logicalUtilities[`.pe-${key}`] = { 'padding-inline-end': value };
        logicalUtilities[`.start-${key}`] = { 'inset-inline-start': value };
        logicalUtilities[`.end-${key}`] = { 'inset-inline-end': value };
      });

      addUtilities(logicalUtilities);
    },
    // Focus visible plugin for accessibility
    function({ addUtilities }) {
      const focusUtilities = {
        '.focus-visible-ring': {
          '&:focus-visible': {
            'outline': '2px solid var(--color-border-focus)',
            'outline-offset': '2px',
            'border-radius': 'inherit',
          },
        },
        '.focus-within-ring': {
          '&:focus-within': {
            'outline': '2px solid var(--color-border-focus)',
            'outline-offset': '2px',
            'border-radius': 'inherit',
          },
        },
      };

      addUtilities(focusUtilities);
    },
  ],
}
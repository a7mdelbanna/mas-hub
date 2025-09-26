import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ColorScheme = {
  primary: string;
  secondary: string;
  accent: string;
};

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  applyPreset: (presetId: string) => void;
};

const defaultColorScheme: ColorScheme = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#ec4899'
};

const themePresets: Record<string, ColorScheme> = {
  default: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899'
  },
  ocean: {
    primary: '#0ea5e9',
    secondary: '#06b6d4',
    accent: '#22d3ee'
  },
  sunset: {
    primary: '#f97316',
    secondary: '#ec4899',
    accent: '#f43f5e'
  },
  forest: {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#14b8a6'
  },
  royal: {
    primary: '#7c3aed',
    secondary: '#6366f1',
    accent: '#f59e0b'
  },
  midnight: {
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#3b82f6'
  }
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
  colorScheme: defaultColorScheme,
  setColorScheme: () => null,
  applyPreset: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('mas-color-scheme');
    return saved ? JSON.parse(saved) : defaultColorScheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;

    // Apply CSS custom properties for color scheme
    root.style.setProperty('--color-primary', colorScheme.primary);
    root.style.setProperty('--color-secondary', colorScheme.secondary);
    root.style.setProperty('--color-accent', colorScheme.accent);

    // Save to localStorage
    localStorage.setItem('mas-color-scheme', JSON.stringify(colorScheme));
  }, [colorScheme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    colorScheme,
    setColorScheme: (scheme: ColorScheme) => {
      setColorScheme(scheme);
    },
    applyPreset: (presetId: string) => {
      const preset = themePresets[presetId];
      if (preset) {
        setColorScheme(preset);
        localStorage.setItem('mas-color-preset', presetId);
      }
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
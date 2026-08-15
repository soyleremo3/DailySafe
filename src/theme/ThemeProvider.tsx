import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { ColorScheme, ThemeColors, ThemeMode, fontSize, fontWeight, palettes, radius, spacing } from './tokens';

export interface Theme {
  mode: ThemeMode;
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
}

const ThemeContext = createContext<Theme | null>(null);

interface ThemeProviderProps {
  mode: ThemeMode;
  children: React.ReactNode;
}

export function ThemeProvider({ mode, children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();

  const theme = useMemo<Theme>(() => {
    const scheme: ColorScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    return {
      mode,
      scheme,
      colors: palettes[scheme],
      spacing,
      radius,
      fontSize,
      fontWeight,
    };
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

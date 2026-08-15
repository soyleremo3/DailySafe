export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 44,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  backgroundElevated: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryText: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
  accent: string;
  overlay: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  background: '#F5F7F6',
  backgroundElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F0',
  border: '#E1E6E3',
  text: '#0E1613',
  textMuted: '#5B6763',
  textFaint: '#8B9793',
  primary: '#0B6E4F',
  primaryText: '#0B6E4F',
  onPrimary: '#FFFFFF',
  success: '#1E8E5A',
  warning: '#B5760A',
  danger: '#C4432E',
  accent: '#116466',
  overlay: 'rgba(14,22,19,0.45)',
  shadow: 'rgba(14,22,19,0.12)',
};

const darkColors: ThemeColors = {
  background: '#0B1220',
  backgroundElevated: '#121B2C',
  surface: '#121B2C',
  surfaceAlt: '#1A2436',
  border: '#243046',
  text: '#EEF3F1',
  textMuted: '#A7B4C2',
  textFaint: '#6E7C8E',
  primary: '#3DDC97',
  primaryText: '#3DDC97',
  onPrimary: '#0B1220',
  success: '#3DDC97',
  warning: '#E3A83B',
  danger: '#F0715C',
  accent: '#5FD3D3',
  overlay: 'rgba(0,0,0,0.55)',
  shadow: 'rgba(0,0,0,0.4)',
};

export const palettes: Record<ColorScheme, ThemeColors> = {
  light: lightColors,
  dark: darkColors,
};

export type ThemeMode = 'light' | 'dark' | 'system';

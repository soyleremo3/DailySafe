import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from '@react-navigation/native';
import { Theme } from '../theme/ThemeProvider';

export function buildNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.backgroundElevated,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.danger,
    },
  };
}

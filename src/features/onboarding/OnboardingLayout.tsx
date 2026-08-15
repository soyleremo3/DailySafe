import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useTheme } from '../../theme/ThemeProvider';

interface OnboardingLayoutProps {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
}: OnboardingLayoutProps) {
  const theme = useTheme();

  return (
    <Screen scroll>
      <View style={styles.dots} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: totalSteps, now: step }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < step ? theme.colors.primary : theme.colors.surfaceAlt,
                width: i === step - 1 ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.colors.textMuted, fontSize: theme.fontSize.md }]}>{subtitle}</Text>
      ) : null}

      <View style={styles.content}>{children}</View>

      <View style={styles.footer}>
        <Button label={primaryLabel} onPress={onPrimary} disabled={primaryDisabled} />
        {secondaryLabel && onSecondary ? (
          <Button label={secondaryLabel} onPress={onSecondary} variant="ghost" style={styles.secondaryButton} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: 'row', gap: 6, marginBottom: 24, marginTop: 8 },
  dot: { height: 8, borderRadius: 4 },
  title: { marginBottom: 8 },
  subtitle: { marginBottom: 24, lineHeight: 22 },
  content: { flexGrow: 1, minHeight: 240 },
  footer: { marginTop: 24, gap: 4 },
  secondaryButton: { marginTop: 4 },
});

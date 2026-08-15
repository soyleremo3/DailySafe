import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'sparkles-outline', title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessible accessibilityRole="text" accessibilityLabel={`${title}. ${message ?? ''}`}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.full }]}>
        <Ionicons name={icon} size={28} color={theme.colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold as any }]}>
        {title}
      </Text>
      {message ? (
        <Text style={[styles.message, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>{message}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" fullWidth={false} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  iconWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { textAlign: 'center', marginBottom: 4 },
  message: { textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 16 },
});

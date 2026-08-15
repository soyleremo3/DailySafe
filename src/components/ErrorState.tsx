import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="alert" accessible>
      <Ionicons name="alert-circle-outline" size={32} color={theme.colors.danger} />
      <Text style={[styles.title, { color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.semibold as any }]}>
        {title}
      </Text>
      {message ? <Text style={[styles.message, { color: theme.colors.textMuted }]}>{message}</Text> : null}
      {onRetry ? <Button label="Try again" onPress={onRetry} variant="secondary" fullWidth={false} style={styles.action} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 16 },
  title: { marginTop: 12, textAlign: 'center' },
  message: { marginTop: 4, textAlign: 'center', lineHeight: 20 },
  action: { marginTop: 16 },
});

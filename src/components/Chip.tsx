import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface ChipProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, icon, selected, onPress }: ChipProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceAlt,
          borderRadius: theme.radius.full,
          paddingHorizontal: theme.spacing.sm + 2,
          paddingVertical: theme.spacing.xxs + 2,
        },
      ]}
    >
      {icon ? (
        <Ionicons name={icon} size={14} color={selected ? theme.colors.onPrimary : theme.colors.textMuted} style={styles.icon} />
      ) : null}
      <Text
        style={{
          color: selected ? theme.colors.onPrimary : theme.colors.text,
          fontSize: theme.fontSize.sm,
          fontWeight: theme.fontWeight.medium as any,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 4 },
});

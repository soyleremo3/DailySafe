import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';

interface Action {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  emphasis?: boolean;
}

export function QuickActionsRow({ actions }: { actions: Action[] }) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            action.onPress();
          }}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: action.emphasis ? theme.colors.primary : theme.colors.surface,
              borderColor: theme.colors.border,
              borderWidth: action.emphasis ? 0 : StyleSheet.hairlineWidth,
              borderRadius: theme.radius.lg,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name={action.icon} size={20} color={action.emphasis ? theme.colors.onPrimary : theme.colors.primary} />
          <Text
            style={[
              styles.label,
              { color: action.emphasis ? theme.colors.onPrimary : theme.colors.text, fontSize: theme.fontSize.xs },
            ]}
            numberOfLines={1}
          >
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  action: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 6 },
  label: { fontWeight: '600' },
});

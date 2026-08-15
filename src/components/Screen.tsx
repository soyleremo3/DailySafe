import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({ children, scroll = false, style, contentContainerStyle, edges = ['top', 'left', 'right'] }: ScreenProps) {
  const theme = useTheme();

  const containerStyle = [styles.flex, { backgroundColor: theme.colors.background }, style];

  if (scroll) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        <ScrollView
          contentContainerStyle={[{ padding: theme.spacing.md, paddingBottom: theme.spacing.xxl }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={edges}>
      <View style={[styles.flex, { padding: theme.spacing.md }, contentContainerStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});

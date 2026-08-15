import React from 'react';
import { KeyboardTypeOptions, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface TextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  prefix?: string;
  autoFocus?: boolean;
  maxLength?: number;
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  prefix,
  autoFocus,
  maxLength,
  returnKeyType,
  onSubmitEditing,
}: TextFieldProps) {
  const theme = useTheme();
  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>{label}</Text>
      <View
        style={[
          styles.field,
          { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.sm },
        ]}
      >
        {prefix ? (
          <Text style={[styles.prefix, { color: theme.colors.textMuted, fontSize: theme.fontSize.md }]}>{prefix}</Text>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textFaint}
          keyboardType={keyboardType}
          autoFocus={autoFocus}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[styles.input, { color: theme.colors.text, fontSize: theme.fontSize.md }]}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', height: 48 },
  prefix: { marginRight: 4 },
  input: { flex: 1, height: '100%' },
});

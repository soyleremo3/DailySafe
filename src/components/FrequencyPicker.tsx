import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RecurrenceFrequency } from '../domain/types';
import { useTheme } from '../theme/ThemeProvider';
import { Chip } from './Chip';

const OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'once', label: 'One-time' },
];

interface FrequencyPickerProps {
  label?: string;
  value: RecurrenceFrequency;
  onChange: (value: RecurrenceFrequency) => void;
  exclude?: RecurrenceFrequency[];
}

export function FrequencyPicker({ label = 'Repeats', value, onChange, exclude = [] }: FrequencyPickerProps) {
  const theme = useTheme();
  const options = OPTIONS.filter((o) => !exclude.includes(o.value));
  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => (
          <Chip key={option.value} label={option.label} selected={value === option.value} onPress={() => onChange(option.value)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

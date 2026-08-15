import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface DateFieldProps {
  label: string;
  valueISO: string;
  onChange: (isoDate: string) => void;
}

export function DateField({ label, valueISO, onChange }: DateFieldProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const dateValue = valueISO ? parseISO(valueISO) : new Date();

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'dismissed') return;
    if (selected) onChange(format(selected, 'yyyy-MM-dd'));
  };

  return (
    <View>
      <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${format(dateValue, 'MMMM d, yyyy')}`}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.md, paddingHorizontal: theme.spacing.sm },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
        <Text style={[styles.value, { color: theme.colors.text, fontSize: theme.fontSize.md }]}>{format(dateValue, 'MMM d, yyyy')}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
          {...(Platform.OS === 'ios' ? { themeVariant: theme.scheme } : {})}
        />
      ) : null}
      {Platform.OS === 'ios' && open ? (
        <Pressable onPress={() => setOpen(false)} style={styles.doneWrap}>
          <Text style={{ color: theme.colors.primaryText, fontWeight: theme.fontWeight.semibold as any }}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 6 },
  field: { flexDirection: 'row', alignItems: 'center', height: 48, gap: 8 },
  value: { marginLeft: 4 },
  doneWrap: { alignSelf: 'flex-end', padding: 8 },
});

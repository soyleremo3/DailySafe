import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_META } from '../../../constants/categories';
import { fromISODate, nextOccurrenceOnOrAfter } from '../../../domain/date';
import { formatMoney } from '../../../domain/money';
import { Bill } from '../../../domain/types';
import { useTheme } from '../../../theme/ThemeProvider';

interface BillListItemProps {
  bill: Bill;
  currency: string;
  onPress: () => void;
}

export function BillListItem({ bill, currency, onPress }: BillListItemProps) {
  const theme = useTheme();
  const meta = CATEGORY_META[bill.category];
  const nextDue = nextOccurrenceOnOrAfter(fromISODate(bill.anchorDate), bill.frequency, new Date());

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${bill.label}, ${formatMoney(bill.amount, currency)}, ${bill.frequency}`}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : bill.active ? 1 : 0.5 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.full }]}>
        <Ionicons name={meta.icon as any} size={18} color={theme.colors.textMuted} />
      </View>
      <View style={styles.textWrap}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium as any }} numberOfLines={1}>
          {bill.label}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>
          {nextDue ? format(nextDue, 'MMM d') : '—'} · {bill.frequency}
          {bill.remindersEnabled ? ' · reminder on' : ''}
        </Text>
      </View>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as any }}>
        {formatMoney(bill.amount, currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  iconWrap: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
});

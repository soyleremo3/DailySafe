import { format, parseISO } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { CATEGORY_META } from '../../../constants/categories';
import { formatMoney } from '../../../domain/money';
import { SafeToSpendResult } from '../../../domain/types';
import { useTheme } from '../../../theme/ThemeProvider';

interface UpcomingBillsCardProps {
  upcomingBills: SafeToSpendResult['upcomingBills'];
  currency: string;
  onSeeAll: () => void;
}

export function UpcomingBillsCard({ upcomingBills, currency, onSeeAll }: UpcomingBillsCardProps) {
  const theme = useTheme();
  const items = upcomingBills.slice(0, 3);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as any }}>
          Upcoming bills
        </Text>
        <Pressable onPress={onSeeAll} accessibilityRole="button" accessibilityLabel="See all bills">
          <Text style={{ color: theme.colors.primaryText, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium as any }}>
            See all
          </Text>
        </Pressable>
      </View>

      {items.length === 0 ? (
        <EmptyState icon="checkmark-circle-outline" title="Nothing due soon" message="You're clear until your next payday." />
      ) : (
        items.map((item, index) => (
          <View
            key={`${item.bill.id}-${item.date}`}
            style={[styles.row, index < items.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }]}
          >
            <View style={styles.rowText}>
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium as any }}>
                {item.bill.label}
              </Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>
                {format(parseISO(item.date), 'MMM d')} · {CATEGORY_META[item.bill.category].label}
              </Text>
            </View>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold as any }}>
              {formatMoney(item.amount, currency)}
            </Text>
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowText: { flex: 1, marginRight: 8 },
});

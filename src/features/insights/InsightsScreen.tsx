import { eachDayOfInterval, endOfMonth, endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { formatMoney } from '../../domain/money';
import { EntryCategory } from '../../domain/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { BarChart, BarChartDatum } from './components/BarChart';
import { CategoryBreakdownList, CategoryTotal } from './components/CategoryBreakdownList';

type Period = 'week' | 'month';

export function InsightsScreen() {
  const theme = useTheme();
  const transactions = useAppStore((s) => s.transactions);
  const currency = useAppStore((s) => s.settings.currency);
  const [period, setPeriod] = useState<Period>('week');

  const { start, end } = useMemo(() => {
    const now = new Date();
    return period === 'week'
      ? { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
      : { start: startOfMonth(now), end: endOfMonth(now) };
  }, [period]);

  const inRange = useMemo(
    () => transactions.filter((tx) => isWithinInterval(parseISO(tx.date), { start, end })),
    [transactions, start, end]
  );

  const totalSpent = inRange.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = inRange.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);

  const chartData: BarChartDatum[] = useMemo(() => {
    const days = eachDayOfInterval({ start, end });
    return days.map((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      const spent = inRange.filter((t) => t.type === 'expense' && t.date === dayKey).reduce((sum, t) => sum + t.amount, 0);
      return { label: format(day, period === 'week' ? 'EEEEE' : 'd'), value: spent };
    });
  }, [inRange, start, end, period]);

  const categoryTotals: CategoryTotal[] = useMemo(() => {
    const totals = new Map<EntryCategory, number>();
    for (const tx of inRange) {
      if (tx.type !== 'expense') continue;
      totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount);
    }
    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [inRange]);

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold as any, marginBottom: 16 }}>
        Insights
      </Text>

      <View style={styles.periodRow}>
        <Chip label="This week" selected={period === 'week'} onPress={() => setPeriod('week')} />
        <Chip label="This month" selected={period === 'month'} onPress={() => setPeriod('month')} />
      </View>

      {inRange.length === 0 ? (
        <EmptyState icon="bar-chart-outline" title="Nothing to show yet" message="Log a few expenses and your insights will appear here." />
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Card style={styles.summaryCard}>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>Spent</Text>
              <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any }}>
                {formatMoney(totalSpent, currency)}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>Income</Text>
              <Text style={{ color: theme.colors.success, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any }}>
                {formatMoney(totalIncome, currency)}
              </Text>
            </Card>
            <Card style={styles.summaryCard}>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>Net</Text>
              <Text
                style={{
                  color: totalIncome - totalSpent >= 0 ? theme.colors.success : theme.colors.danger,
                  fontSize: theme.fontSize.lg,
                  fontWeight: theme.fontWeight.bold as any,
                }}
              >
                {formatMoney(totalIncome - totalSpent, currency)}
              </Text>
            </Card>
          </View>

          <Card style={styles.section}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as any, marginBottom: 12 }}>
              Daily spending
            </Text>
            <BarChart data={chartData} />
          </Card>

          <Card style={styles.section}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as any, marginBottom: 14 }}>
              By category
            </Text>
            <CategoryBreakdownList totals={categoryTotals} currency={currency} />
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1 },
  section: { marginBottom: 16 },
});

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Fab } from '../../components/Fab';
import { Screen } from '../../components/Screen';
import { formatMoney } from '../../domain/money';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { BillListItem } from './components/BillListItem';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function BillsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const bills = useAppStore((s) => s.bills);
  const currency = useAppStore((s) => s.settings.currency);

  const { active, monthlyTotal } = useMemo(() => {
    const activeBills = bills.filter((b) => b.active);
    const total = activeBills.reduce((sum, b) => {
      const multiplier = { weekly: 4.33, biweekly: 2.17, monthly: 1, yearly: 1 / 12, once: 0 }[b.frequency];
      return sum + b.amount * multiplier;
    }, 0);
    return { active: activeBills, monthlyTotal: total };
  }, [bills]);

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold as any, marginBottom: 16 }}>
        Bills & subscriptions
      </Text>

      {bills.length > 0 ? (
        <Card style={styles.summaryCard}>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>Monthly total</Text>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any }}>
            {formatMoney(monthlyTotal, currency)}
          </Text>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs, marginTop: 2 }}>
            Across {active.length} active bill{active.length === 1 ? '' : 's'}
          </Text>
        </Card>
      ) : null}

      {bills.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No bills yet"
          message="Add rent, subscriptions or utilities so DailySafe can reserve for them automatically."
          actionLabel="Add a bill"
          onAction={() => navigation.navigate('BillForm', undefined)}
        />
      ) : (
        <Card>
          {bills.map((bill, index) => (
            <View key={bill.id} style={index < bills.length - 1 ? [styles.divider, { borderBottomColor: theme.colors.border }] : undefined}>
              <BillListItem bill={bill} currency={currency} onPress={() => navigation.navigate('BillForm', { billId: bill.id })} />
            </View>
          ))}
        </Card>
      )}

      <Fab accessibilityLabel="Add bill" onPress={() => navigation.navigate('BillForm', undefined)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryCard: { marginBottom: 16 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth },
});

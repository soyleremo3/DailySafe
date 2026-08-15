import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { TransactionRow } from '../../components/TransactionRow';
import { EmptyState } from '../../components/EmptyState';
import { RootStackParamList } from '../../navigation/types';
import { useSafeToSpend } from '../../store/selectors';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';
import { QuickActionsRow } from './components/QuickActionsRow';
import { SafeToSpendHero } from './components/SafeToSpendHero';
import { UpcomingBillsCard } from './components/UpcomingBillsCard';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const currency = useAppStore((s) => s.settings.currency);
  const transactions = useAppStore((s) => s.transactions);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const result = useSafeToSpend();

  const recent = transactions.slice(0, 6);

  const confirmDelete = (id: string, label: string) => {
    Alert.alert('Delete entry', `Remove "${label}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <View>
          <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>Today</Text>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xl, fontWeight: theme.fontWeight.bold as any }}>
            Your money
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <SafeToSpendHero result={result} currency={currency} />
      </View>

      <View style={styles.section}>
        <QuickActionsRow
          actions={[
            { key: 'expense', label: 'Add expense', icon: 'remove-circle-outline', emphasis: true, onPress: () => navigation.navigate('QuickEntry', { type: 'expense' }) },
            { key: 'income', label: 'Add income', icon: 'add-circle-outline', onPress: () => navigation.navigate('QuickEntry', { type: 'income' }) },
            { key: 'afford', label: 'Can I afford it?', icon: 'help-buoy-outline', onPress: () => navigation.navigate('Simulator') },
          ]}
        />
      </View>

      <View style={styles.section}>
        <UpcomingBillsCard
          upcomingBills={result.upcomingBills}
          currency={currency}
          onSeeAll={() => navigation.navigate('Main', { screen: 'Bills' })}
        />
      </View>

      <View style={styles.section}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as any, marginBottom: 8 }}>
          Recent activity
        </Text>
        {recent.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No entries yet"
            message="Log your first expense or income to get started."
            actionLabel="Add an entry"
            onAction={() => navigation.navigate('QuickEntry', { type: 'expense' })}
          />
        ) : (
          recent.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              currency={currency}
              onLongPress={() => confirmDelete(tx.id, tx.note || tx.category)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  section: { marginBottom: 20 },
});

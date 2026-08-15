import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_META } from '../constants/categories';
import { formatMoney } from '../domain/money';
import { Transaction } from '../domain/types';
import { useTheme } from '../theme/ThemeProvider';

interface TransactionRowProps {
  transaction: Transaction;
  currency: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TransactionRow({ transaction, currency, onPress, onLongPress }: TransactionRowProps) {
  const theme = useTheme();
  const meta = CATEGORY_META[transaction.category];
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label}, ${isIncome ? 'income' : 'expense'} of ${formatMoney(transaction.amount, currency)}`}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.full }]}>
        <Ionicons name={meta.icon as any} size={18} color={isIncome ? theme.colors.success : theme.colors.textMuted} />
      </View>
      <View style={styles.textWrap}>
        <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.medium as any }} numberOfLines={1}>
          {transaction.note || meta.label}
        </Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>
          {format(parseISO(transaction.date), 'MMM d')} · {meta.label}
        </Text>
      </View>
      <Text
        style={{
          color: isIncome ? theme.colors.success : theme.colors.text,
          fontSize: theme.fontSize.md,
          fontWeight: theme.fontWeight.semibold as any,
        }}
      >
        {isIncome ? '+' : '-'}
        {formatMoney(transaction.amount, currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  iconWrap: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1 },
});

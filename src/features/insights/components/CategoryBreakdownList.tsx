import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from '../../../components/ProgressBar';
import { CATEGORY_META } from '../../../constants/categories';
import { formatMoney } from '../../../domain/money';
import { EntryCategory } from '../../../domain/types';
import { useTheme } from '../../../theme/ThemeProvider';

export interface CategoryTotal {
  category: EntryCategory;
  total: number;
}

interface CategoryBreakdownListProps {
  totals: CategoryTotal[];
  currency: string;
}

export function CategoryBreakdownList({ totals, currency }: CategoryBreakdownListProps) {
  const theme = useTheme();
  const max = Math.max(1, ...totals.map((t) => t.total));

  return (
    <View>
      {totals.map((item) => {
        const meta = CATEGORY_META[item.category];
        return (
          <View key={item.category} style={styles.row}>
            <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.full }]}>
              <Ionicons name={meta.icon as any} size={16} color={theme.colors.textMuted} />
            </View>
            <View style={styles.content}>
              <View style={styles.labelRow}>
                <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.medium as any }}>
                  {meta.label}
                </Text>
                <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold as any }}>
                  {formatMoney(item.total, currency)}
                </Text>
              </View>
              <View style={styles.progressWrap}>
                <ProgressBar progress={item.total / max} height={6} />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconWrap: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  content: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressWrap: {},
});

import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/Card';
import { ProgressBar } from '../../../components/ProgressBar';
import { formatMoney } from '../../../domain/money';
import { GoalProjection } from '../../../domain/goalProjection';
import { useTheme } from '../../../theme/ThemeProvider';

interface GoalListItemProps {
  projection: GoalProjection;
  currency: string;
  onPress: () => void;
}

export function GoalListItem({ projection, currency, onPress }: GoalListItemProps) {
  const theme = useTheme();
  const { goal, remaining, monthlyContribution, isOverdue, progress } = projection;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${goal.label}, ${formatMoney(remaining, currency)} remaining`}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceAlt, borderRadius: theme.radius.full }]}>
            <Ionicons name={goal.kind === 'savings' ? 'wallet-outline' : 'gift-outline'} size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.md, fontWeight: theme.fontWeight.semibold as any }}>
              {goal.label}
            </Text>
            <Text style={{ color: isOverdue ? theme.colors.danger : theme.colors.textMuted, fontSize: theme.fontSize.xs }}>
              {isOverdue ? 'Overdue · ' : 'By '}
              {format(parseISO(goal.targetDate), 'MMM d, yyyy')}
            </Text>
          </View>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, fontWeight: theme.fontWeight.semibold as any }}>
            {formatMoney(remaining, currency)}
          </Text>
        </View>

        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} />
        </View>

        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs, marginTop: 8 }}>
          ~{formatMoney(monthlyContribution, currency)}/month to stay on track
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerText: { flex: 1 },
  progressWrap: { marginTop: 12 },
});

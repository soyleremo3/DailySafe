import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { AmountText } from '../../../components/AmountText';
import { formatMoney } from '../../../domain/money';
import { SafeToSpendResult } from '../../../domain/types';
import { useTheme } from '../../../theme/ThemeProvider';

interface SafeToSpendHeroProps {
  result: SafeToSpendResult;
  currency: string;
}

export function SafeToSpendHero({ result, currency }: SafeToSpendHeroProps) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    translateY.value = withTiming(0, { duration: 400 });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isOver = result.isOverBudget;
  const gradientColors = isOver ? [theme.colors.danger, '#7A241A'] : [theme.colors.primary, theme.colors.accent];

  return (
    <Animated.View style={animatedStyle}>
      <LinearGradient colors={gradientColors as [string, string]} style={[styles.card, { borderRadius: theme.radius.xl }]}>
        <Text style={styles.label}>{isOver ? "You're over budget" : 'Safe to spend today'}</Text>
        <AmountText
          amount={isOver ? -result.overBudgetAmount : result.dailySafeToSpend}
          currency={currency}
          size="display"
          color="#FFFFFF"
        />
        <Text style={styles.sub}>
          {formatMoney(result.weeklySafeToSpend, currency)} this week · {result.daysRemaining} day
          {result.daysRemaining === 1 ? '' : 's'} {result.periodLabel}
        </Text>

        <View style={styles.divider} />

        <View style={styles.breakdownRow}>
          <Breakdown label="Balance" value={formatMoney(result.currentBalance, currency, { compact: true })} />
          <Breakdown label="Bills" value={formatMoney(result.reservedForBills, currency, { compact: true })} />
          <Breakdown label="Goals" value={formatMoney(result.reservedForGoals, currency, { compact: true })} />
          <Breakdown label="Savings" value={formatMoney(result.reservedForSavings, currency, { compact: true })} />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

function Breakdown({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownValue}>{value}</Text>
      <Text style={styles.breakdownLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 24 },
  label: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  sub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.35)', marginVertical: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownItem: { alignItems: 'flex-start' },
  breakdownValue: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  breakdownLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },
});

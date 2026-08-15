import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AmountText } from '../../components/AmountText';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { getCurrencyInfo } from '../../domain/currencies';
import { formatMoney } from '../../domain/money';
import { simulatePurchase } from '../../domain/simulator';
import { AffordVerdict } from '../../domain/types';
import { RootStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/ThemeProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Simulator'>;

const VERDICT_COPY: Record<AffordVerdict, { title: string; icon: keyof typeof Ionicons.glyphMap }> = {
  safe: { title: 'Go for it', icon: 'checkmark-circle' },
  tight: { title: "It's tight", icon: 'alert-circle' },
  unsafe: { title: "Better to wait", icon: 'close-circle' },
};

export function SimulatorScreen({ navigation }: Props) {
  const theme = useTheme();
  const settings = useAppStore((s) => s.settings);
  const incomeSources = useAppStore((s) => s.incomeSources);
  const bills = useAppStore((s) => s.bills);
  const goals = useAppStore((s) => s.goals);
  const currency = getCurrencyInfo(settings.currency);

  const [amount, setAmount] = useState('');

  const result = useMemo(() => {
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) return null;
    return simulatePurchase(
      {
        asOf: new Date(),
        currentBalance: settings.currentBalance,
        incomeSources,
        bills,
        goals,
        savingsTarget: settings.savingsTarget,
      },
      numeric
    );
  }, [amount, settings, incomeSources, bills, goals]);

  const verdictColor = result
    ? { safe: theme.colors.success, tight: theme.colors.warning, unsafe: theme.colors.danger }[result.verdict]
    : theme.colors.textMuted;

  return (
    <Screen scroll>
      <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.xxl, fontWeight: theme.fontWeight.bold as any, marginBottom: 4 }}>
        Can I afford this?
      </Text>
      <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.md, marginBottom: 24 }}>
        Enter a price to see how it would affect your safe-to-spend for the rest of this period.
      </Text>

      <TextField label="Price" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" prefix={currency.symbol} autoFocus />

      {result ? (
        <Card style={StyleSheet.flatten([styles.resultCard, { borderColor: verdictColor }])}>
          <View style={styles.verdictRow}>
            <Ionicons name={VERDICT_COPY[result.verdict].icon} size={24} color={verdictColor} />
            <Text style={{ color: verdictColor, fontSize: theme.fontSize.lg, fontWeight: theme.fontWeight.bold as any, marginLeft: 8 }}>
              {VERDICT_COPY[result.verdict].title}
            </Text>
          </View>
          <Text style={{ color: theme.colors.text, fontSize: theme.fontSize.sm, marginTop: 8, lineHeight: 20 }}>{result.message}</Text>

          <View style={styles.compareRow}>
            <View style={styles.compareItem}>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>Before</Text>
              <AmountText amount={result.before.dailySafeToSpend} currency={currency.code} size="md" />
            </View>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.textFaint} />
            <View style={styles.compareItem}>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs }}>After</Text>
              <AmountText amount={result.after.dailySafeToSpend} currency={currency.code} size="md" color={verdictColor} />
            </View>
          </View>

          {result.dailyDrop > 0 ? (
            <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.xs, marginTop: 8 }}>
              -{formatMoney(result.dailyDrop, currency.code)}/day for the rest of {result.after.periodLabel === 'until payday' ? 'this pay period' : 'the next 30 days'}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <Button label="Close" onPress={() => navigation.goBack()} variant="secondary" style={styles.close} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  resultCard: { marginTop: 20, borderWidth: 2 },
  verdictRow: { flexDirection: 'row', alignItems: 'center' },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 16 },
  compareItem: { alignItems: 'center' },
  close: { marginTop: 24 },
});

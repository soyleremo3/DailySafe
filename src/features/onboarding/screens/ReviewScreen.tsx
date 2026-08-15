import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AmountText } from '../../../components/AmountText';
import { Card } from '../../../components/Card';
import { getCurrencyInfo } from '../../../domain/currencies';
import { calculateSafeToSpend } from '../../../domain/safeToSpend';
import { Bill, IncomeSource } from '../../../domain/types';
import { OnboardingStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/ThemeProvider';
import { useOnboarding } from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Review'>;

export function ReviewScreen(_props: Props) {
  const theme = useTheme();
  const { draft, commit } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const currency = getCurrencyInfo(draft.currency);

  const preview = useMemo(() => {
    const incomeSources: IncomeSource[] = draft.incomeSources.map((s, i) => ({
      id: `preview-income-${i}`,
      label: s.label,
      amount: Number(s.amount) || 0,
      frequency: s.frequency,
      anchorDate: s.anchorDate,
      active: true,
    }));
    const bills: Bill[] = draft.bills.map((b, i) => ({
      id: `preview-bill-${i}`,
      label: b.label,
      amount: Number(b.amount) || 0,
      frequency: b.frequency,
      anchorDate: b.anchorDate,
      category: b.category,
      reminderDaysBefore: 3,
      remindersEnabled: true,
      active: true,
    }));
    return calculateSafeToSpend({
      asOf: new Date(),
      currentBalance: Number(draft.currentBalance) || 0,
      incomeSources,
      bills,
      goals: [],
      savingsTarget:
        draft.savingsTargetType === 'monthly' ? { type: 'monthly', amount: Number(draft.savingsTargetAmount) || 0 } : { type: 'none' },
    });
  }, [draft]);

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await commit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      step={6}
      totalSteps={6}
      title="You're all set"
      subtitle="Here's what your safe-to-spend would look like today."
      primaryLabel="Finish setup"
      onPrimary={handleFinish}
      primaryDisabled={submitting}
    >
      <Card style={styles.previewCard}>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>
          {preview.isOverBudget ? "You're already over budget" : 'Safe to spend today'}
        </Text>
        <AmountText
          amount={preview.dailySafeToSpend}
          currency={currency.code}
          size="display"
          color={preview.isOverBudget ? theme.colors.danger : theme.colors.primary}
        />
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm, marginTop: 4 }}>
          Over the next {preview.daysRemaining} day{preview.daysRemaining === 1 ? '' : 's'} ({preview.periodLabel})
        </Text>
        {preview.isOverBudget ? (
          <Text style={{ color: theme.colors.danger, fontSize: theme.fontSize.xs, marginTop: 8, textAlign: 'center' }}>
            Your bills, goals and savings target add up to {currency.symbol}
            {preview.overBudgetAmount.toFixed(2)} more than your balance for this period. You can adjust any of these
            after setup.
          </Text>
        ) : null}
      </Card>

      <SummaryRow label="Balance" value={`${currency.symbol}${draft.currentBalance || '0'}`} />
      <SummaryRow label="Income sources" value={String(draft.incomeSources.length)} />
      <SummaryRow label="Recurring bills" value={String(draft.bills.length)} />
      <SummaryRow
        label="Savings target"
        value={draft.savingsTargetType === 'monthly' ? `${currency.symbol}${draft.savingsTargetAmount || '0'}/mo` : 'None'}
      />

      <View style={styles.note}>
        <Text style={{ color: theme.colors.textFaint, fontSize: theme.fontSize.xs, textAlign: 'center' }}>
          You can edit any of this later from Settings. Nothing here ever leaves your device.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={{ color: theme.colors.textMuted }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontWeight: theme.fontWeight.semibold as any }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  previewCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  note: { marginTop: 16 },
});

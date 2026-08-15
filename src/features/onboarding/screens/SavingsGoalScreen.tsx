import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '../../../components/Card';
import { TextField } from '../../../components/TextField';
import { getCurrencyInfo } from '../../../domain/currencies';
import { OnboardingStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/ThemeProvider';
import { useOnboarding } from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SavingsGoal'>;

export function SavingsGoalScreen({ navigation }: Props) {
  const theme = useTheme();
  const { draft, setSavingsTarget } = useOnboarding();
  const symbol = getCurrencyInfo(draft.currency).symbol;

  return (
    <OnboardingLayout
      step={6}
      totalSteps={6}
      title="Want to set aside savings?"
      subtitle="Optional. We'll reserve a slice of every pay period before showing what's safe to spend, so saving happens automatically."
      primaryLabel="Continue"
      onPrimary={() => navigation.navigate('Review')}
    >
      <Card
        style={StyleSheet.flatten([
          styles.option,
          { borderColor: draft.savingsTargetType === 'none' ? theme.colors.primary : theme.colors.border },
        ])}
      >
        <OptionRow
          selected={draft.savingsTargetType === 'none'}
          title="Not right now"
          subtitle="You can always add this later in Settings"
          onPress={() => setSavingsTarget('none', draft.savingsTargetAmount)}
        />
      </Card>

      <Card
        style={StyleSheet.flatten([
          styles.option,
          { borderColor: draft.savingsTargetType === 'monthly' ? theme.colors.primary : theme.colors.border },
        ])}
      >
        <OptionRow
          selected={draft.savingsTargetType === 'monthly'}
          title="Save a fixed amount monthly"
          subtitle="Spread evenly across each pay period"
          onPress={() => setSavingsTarget('monthly', draft.savingsTargetAmount || '')}
        />
        {draft.savingsTargetType === 'monthly' ? (
          <View style={styles.amountField}>
            <TextField
              label="Monthly savings target"
              value={draft.savingsTargetAmount}
              onChangeText={(text) => setSavingsTarget('monthly', text)}
              placeholder="0.00"
              keyboardType="decimal-pad"
              prefix={symbol}
            />
          </View>
        ) : null}
      </Card>
    </OnboardingLayout>
  );
}

function OptionRow({ selected, title, subtitle, onPress }: { selected: boolean; title: string; subtitle: string; onPress: () => void }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="radio" accessibilityState={{ selected }} onTouchEnd={onPress} style={styles.optionRow}>
      <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} /> : null}
      </View>
      <View style={styles.optionText}>
        <Text style={{ color: theme.colors.text, fontWeight: theme.fontWeight.semibold as any, fontSize: theme.fontSize.md }}>{title}</Text>
        <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  option: { marginBottom: 12, borderWidth: 2 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  optionText: { flex: 1 },
  amountField: { marginTop: 14 },
});

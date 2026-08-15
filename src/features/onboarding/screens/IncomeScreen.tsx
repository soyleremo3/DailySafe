import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { DateField } from '../../../components/DateField';
import { FrequencyPicker } from '../../../components/FrequencyPicker';
import { TextField } from '../../../components/TextField';
import { getCurrencyInfo } from '../../../domain/currencies';
import { RecurrenceFrequency } from '../../../domain/types';
import { OnboardingStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/ThemeProvider';
import { useOnboarding } from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Income'>;

export function IncomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { draft, addIncomeSource, removeIncomeSource } = useOnboarding();
  const symbol = getCurrencyInfo(draft.currency).symbol;

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [anchorDate, setAnchorDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const canAdd = label.trim().length > 0 && Number(amount) > 0;

  const handleAdd = () => {
    addIncomeSource({ label: label.trim(), amount, frequency, anchorDate });
    setLabel('');
    setAmount('');
  };

  return (
    <OnboardingLayout
      step={4}
      totalSteps={6}
      title="When does money come in?"
      subtitle="Add your paydays. DailySafe uses the soonest one to set your safe-to-spend window."
      primaryLabel="Continue"
      onPrimary={() => navigation.navigate('Bills')}
      secondaryLabel={draft.incomeSources.length === 0 ? 'Skip for now' : undefined}
      onSecondary={draft.incomeSources.length === 0 ? () => navigation.navigate('Bills') : undefined}
    >
      {draft.incomeSources.map((source, index) => (
        <Card key={`${source.label}-${index}`} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <View style={styles.itemText}>
              <Text style={{ color: theme.colors.text, fontWeight: theme.fontWeight.semibold as any }}>{source.label}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>
                {symbol}
                {source.amount} · {source.frequency}
              </Text>
            </View>
            <Pressable onPress={() => removeIncomeSource(index)} accessibilityLabel={`Remove ${source.label}`} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={theme.colors.textFaint} />
            </Pressable>
          </View>
        </Card>
      ))}

      <Card style={styles.form}>
        <TextField label="Source" value={label} onChangeText={setLabel} placeholder="e.g. Salary" />
        <View style={styles.spacer} />
        <TextField label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" prefix={symbol} />
        <View style={styles.spacer} />
        <FrequencyPicker value={frequency} onChange={setFrequency} exclude={['once']} />
        <View style={styles.spacer} />
        <DateField label="Next payday" valueISO={anchorDate} onChange={setAnchorDate} />
        <View style={styles.spacer} />
        <Button label="Add income source" onPress={handleAdd} disabled={!canAdd} variant="secondary" />
      </Card>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  itemCard: { marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemText: { flex: 1, marginRight: 8 },
  form: { marginTop: 4 },
  spacer: { height: 14 },
});

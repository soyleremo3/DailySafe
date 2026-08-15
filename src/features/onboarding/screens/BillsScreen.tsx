import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { Chip } from '../../../components/Chip';
import { DateField } from '../../../components/DateField';
import { FrequencyPicker } from '../../../components/FrequencyPicker';
import { TextField } from '../../../components/TextField';
import { CATEGORY_META, EXPENSE_CATEGORIES } from '../../../constants/categories';
import { getCurrencyInfo } from '../../../domain/currencies';
import { EntryCategory, RecurrenceFrequency } from '../../../domain/types';
import { OnboardingStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../theme/ThemeProvider';
import { useOnboarding } from '../OnboardingContext';
import { OnboardingLayout } from '../OnboardingLayout';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Bills'>;

export function BillsScreen({ navigation }: Props) {
  const theme = useTheme();
  const { draft, addBill, removeBill } = useOnboarding();
  const symbol = getCurrencyInfo(draft.currency).symbol;

  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('monthly');
  const [category, setCategory] = useState<EntryCategory>('utilities');
  const [anchorDate, setAnchorDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const canAdd = label.trim().length > 0 && Number(amount) > 0;

  const handleAdd = () => {
    addBill({ label: label.trim(), amount, frequency, category, anchorDate });
    setLabel('');
    setAmount('');
  };

  return (
    <OnboardingLayout
      step={5}
      totalSteps={6}
      title="Any recurring bills?"
      subtitle="Rent, subscriptions, utilities — anything that comes out automatically. We'll reserve for these before showing what's safe to spend."
      primaryLabel="Continue"
      onPrimary={() => navigation.navigate('SavingsGoal')}
      secondaryLabel={draft.bills.length === 0 ? 'Skip for now' : undefined}
      onSecondary={draft.bills.length === 0 ? () => navigation.navigate('SavingsGoal') : undefined}
    >
      {draft.bills.map((bill, index) => (
        <Card key={`${bill.label}-${index}`} style={styles.itemCard}>
          <View style={styles.itemRow}>
            <View style={styles.itemText}>
              <Text style={{ color: theme.colors.text, fontWeight: theme.fontWeight.semibold as any }}>{bill.label}</Text>
              <Text style={{ color: theme.colors.textMuted, fontSize: theme.fontSize.sm }}>
                {symbol}
                {bill.amount} · {bill.frequency}
              </Text>
            </View>
            <Pressable onPress={() => removeBill(index)} accessibilityLabel={`Remove ${bill.label}`} hitSlop={8}>
              <Ionicons name="close-circle" size={22} color={theme.colors.textFaint} />
            </Pressable>
          </View>
        </Card>
      ))}

      <Card style={styles.form}>
        <TextField label="Bill" value={label} onChangeText={setLabel} placeholder="e.g. Rent, Netflix" />
        <View style={styles.spacer} />
        <TextField label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="decimal-pad" prefix={symbol} />
        <View style={styles.spacer} />
        <Text style={[styles.label, { color: theme.colors.textMuted, fontSize: theme.fontSize.sm }]}>Category</Text>
        <View style={styles.chipRow}>
          {EXPENSE_CATEGORIES.map((c) => (
            <Chip key={c} label={CATEGORY_META[c].label} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>
        <View style={styles.spacer} />
        <FrequencyPicker value={frequency} onChange={setFrequency} exclude={['once']} />
        <View style={styles.spacer} />
        <DateField label="Next due date" valueISO={anchorDate} onChange={setAnchorDate} />
        <View style={styles.spacer} />
        <Button label="Add bill" onPress={handleAdd} disabled={!canAdd} variant="secondary" />
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
  label: { marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
